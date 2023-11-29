import React, { useContext, useEffect, useState, useRef } from "react";
import AuthContext from '../../Login/AuthContext';
import DarkModeSwitchContext from '../../Theming/DarkModeSwitchContext'
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useGoogleLogin } from "@react-oauth/google";
import GoogleIcon from '@mui/icons-material/Google'
import Grow from "@mui/material/Grow";
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import ThermoCard from "../../components/ThermoCard/ThermoCard";
import axios from 'axios';
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";
import CircularProgress from "@mui/material/CircularProgress";

const Home = () => {
    document.title = 'Welcome to TempWise Assistant'
    const [thermostats, setThermostats] = useState(null)
    const { setAuthTokenDetails, googleAccountInfo, setGoogleAccountInfo, nestTokens, code, setCode, getNestTokens, setHasAuth, project_id } = useContext(AuthContext)
    const { switched } = useContext(DarkModeSwitchContext)
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()
    const endRef = useRef(null)
    
    const CtoF = (cTemp) => {
      return (cTemp * 9/5) + 32
    }

    const getDisplayTemp = (thermostat) => {
      var displayTemp
      if (thermostat.traits["sdm.devices.traits.ThermostatEco"].mode === 'MANUAL_ECO') { //eco mode priority
        displayTemp = Math.round(CtoF(thermostat.traits["sdm.devices.traits.ThermostatEco"].heatCelsius)) + ' • ' + Math.round(CtoF(thermostat.traits["sdm.devices.traits.ThermostatEco"].coolCelsius))
      } else if (thermostat.traits["sdm.devices.traits.ThermostatMode"].mode === 'HEAT') {
        displayTemp = Math.round(CtoF(thermostat.traits["sdm.devices.traits.ThermostatTemperatureSetpoint"].heatCelsius))
      } else if (thermostat.traits["sdm.devices.traits.ThermostatMode"].mode === 'COOL') {
        displayTemp = Math.round(CtoF(thermostat.traits["sdm.devices.traits.ThermostatTemperatureSetpoint"].coolCelsius))
      } else if (thermostat.traits["sdm.devices.traits.ThermostatMode"].mode === 'HEATCOOL') {
        displayTemp = Math.round(CtoF(thermostat.traits["sdm.devices.traits.ThermostatTemperatureSetpoint"].heatCelsius)) + ' • ' + Math.round(CtoF(thermostat.traits["sdm.devices.traits.ThermostatTemperatureSetpoint"].coolCelsius))
      } else { //OFF
        displayTemp = 'Thermostat is off.'
      }
      return displayTemp
    }

    const getMode = (thermostat) => {
      var mode
      if (thermostat.traits["sdm.devices.traits.ThermostatEco"].mode === 'MANUAL_ECO') { //eco has priority
          mode = thermostat.traits["sdm.devices.traits.ThermostatEco"].mode
      } else if (thermostat.traits["sdm.devices.traits.ThermostatMode"].mode === 'HEAT' || 
          thermostat.traits["sdm.devices.traits.ThermostatMode"].mode === 'COOL' ||
          thermostat.traits["sdm.devices.traits.ThermostatMode"].mode === 'HEATCOOL') {
          mode = thermostat.traits["sdm.devices.traits.ThermostatMode"].mode
      } else { //off
          mode = 'OFF'
      }
      return mode
    }

    const scrollToBottom = () => {
      endRef.current?.scrollIntoView({ behavior: "smooth" })
    }

    useEffect(() => {
      scrollToBottom()
    }, [thermostats])

    function getDeviceId(id) { //grab the actual device-id out the name property
      const regex = new RegExp('(?<=\/devices\/).*$');
      const found = id.match(regex);
      let returnFound = found[0].replace('/', '')
      return returnFound;
    }

    useEffect(() => { //#2
      if (location.search.includes('?code=')) {
        console.log(location.search)
        setGoogleAccountInfo(JSON.parse(localStorage.getItem("googleAccountInfo")))
        setAuthTokenDetails(JSON.parse(localStorage.getItem("authTokenDetails")))
        setCode(searchParams.get('code'))
        navigate("/")
      } else {
        console.log('The URL does not have the code')
      }
    }, []) //Make sure user can't go back to the url with the query string (location/history.replace instead of navigate?)

    useEffect(() => { //#3
      if (code) {
        console.log(code)
        localStorage.clear()
        getNestTokens()
      }
    }, [code])

    useEffect(() => { //#4
      if (nestTokens) {
        axios.get(`https://smartdevicemanagement.googleapis.com/v1/enterprises/${project_id}/devices`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${nestTokens.access_token}`
          }
        }).then((res) => {
          if (res.status === 200) {
            console.log('Got list of devices')
            console.log(res.data)
            const thermos = res.data.devices.filter((device) => device.type === 'sdm.devices.types.THERMOSTAT')
            setThermostats(thermos)
          } else {
            console.log('Not OK')
          }
        }).catch((err) => 
          console.log(err)
        )
      }
    }, [nestTokens])

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => { console.log('Got Login Auth token'); console.log(codeResponse); setAuthTokenDetails(codeResponse); setHasAuth(true);}, //this sets off the useEffect chain
        onError: (error) => console.log('Login Failed:', error)
    });

    return (
      <>
         {googleAccountInfo ? (
            <>
              <Stack direction="column" textAlign={'center'} spacing={4} m={6}>
                <Grow in={true}><Typography variant="h3">Your Nest Thermostats</Typography></Grow>
              </Stack>
              <Container sx={{ marginBottom: '2rem' }}>
                <Grid container direction="row" justifyContent="space-around" ref={endRef}>
                  { thermostats ? (thermostats.map((thermostat) => {
                    return (
                      <Grow in={true}>
                      <Grid item>
                        <ThermoCard 
                          deviceId={getDeviceId(thermostat.name)} 
                          deviceName={thermostat.parentRelations[0].displayName.length === 0 ? 'No custom name set.' : thermostat.parentRelations[0].displayName} 
                          mode={getMode(thermostat)}
                          actualTempF={Math.round(CtoF(thermostat.traits["sdm.devices.traits.Temperature"].ambientTemperatureCelsius))} 
                          actualTempC={Math.round(thermostat.traits["sdm.devices.traits.Temperature"].ambientTemperatureCelsius)}
                          setPointTempF={getDisplayTemp(thermostat)}
                          humidity={thermostat.traits["sdm.devices.traits.Humidity"].ambientHumidityPercent}
                         />
                      </Grid>
                      </Grow>
                    )
                  })) : (<CircularProgress color={switched ? 'primary' : 'secondary'} />) }
                </Grid>
              </Container>
            </>
          ) : (
            <Stack direction="column" textAlign={'center'} spacing={4} m={5}>
              <Grow in={true}><Typography variant="h3">Welcome to TempWise Assistant</Typography></Grow>
              <center>
              <iframe 
                src='https://www.youtube.com/embed/-tagcWAI_D0?si=VdInvAuabRpMKNjd' 
                width='500vw' 
                height='250vh'
                style={{ borderStyle: 'solid', borderRadius: '1rem', borderColor: '#7BF1A8', borderWidth: '0.1rem' }}/>
              </center>
              <div>
                <Grow in={true}>
                    <Button size="large" startIcon={<GoogleIcon />} color={switched ? "primary" : "secondary"} variant={switched? "outlined" : "contained"} onClick={() => login()}>Sign in to Google</Button>
                </Grow>
              </div>
            </Stack> 
          )} 
      </>
    )
}

export default Home