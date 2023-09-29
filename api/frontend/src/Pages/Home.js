import React, { useContext, useEffect, useState } from "react";
import AuthContext from '../Login/AuthContext';
import DarkModeSwitchContext from '../components/NavBar/Dark Mode/DarkModeSwitchContext'
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { useGoogleLogin } from "@react-oauth/google";
import GoogleIcon from '@mui/icons-material/Google'
import Grow from "@mui/material/Grow";
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import ThermoCard from "../components/ThermoCard/ThermoCard";
import axios from 'axios';
import { useLocation, useSearchParams, useNavigate } from "react-router-dom";

const Home = () => {
    document.title = 'Welcome to TempWise Assistant'
    const [thermostats, setThermostats] = useState(null)
    const { setAuthTokenDetails, googleAccountInfo, setGoogleAccountInfo, nestTokens, code, setCode, getNestTokens, setHasAuth, project_id } = useContext(AuthContext)
    const { switched } = useContext(DarkModeSwitchContext)
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    function getDeviceId(id) { //grab the actual device-id out the name property
      console.log(id)
      const regex = new RegExp('(?<=\/devices\/).*$');
      const found = id.match(regex);
      console.log('String to send back')
      console.log(found)
      let returnFound = found[0].replace('/', '')
      return returnFound;
    }

    //somewhere in this useEffect things are being called more than they need to? Fix sometime
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
    }, []) //need to make sure user can't go back to the url with the query string (location/history.replace instead of navigate?)

    useEffect(() => { //#3
      if (code) { //make sure getNestTokens doesn't run when logging out and setting code to null
        console.log(code)
        getNestTokens()
      }
    }, [code])

    useEffect(() => { //#4
      if (nestTokens) {
        axios.get(`https://smartdevicemanagement.googleapis.com/v1/enterprises/${project_id}/devices`, { //await it?
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${nestTokens.access_token}`
          }
        }).then((res) => {
          if (res.status === 200) {
            console.log('Got list of devices')
            console.log(res.data)
            const thermos = res.data.devices.filter((device) => device.type == 'sdm.devices.types.THERMOSTAT')
            setThermostats(thermos)
          } else {
            console.log('Not OK')
          }
        }).catch((err) => 
          console.log(err)
        )
      }
    }, [nestTokens])

    useEffect(() => {
      if (thermostats) {
        console.log('Set the thermostats')
        console.log(thermostats)
      }
    }, [thermostats])

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => { console.log('Got Login Auth token'); console.log(codeResponse); setAuthTokenDetails(codeResponse); setHasAuth(true);}, //this sets off the useEffect chain
        onError: (error) => console.log('Login Failed:', error)
    });

    return (
      <>
         {googleAccountInfo ? (
            <>
              <Stack direction="column" textAlign={'center'} spacing={4} m={8}>
                <Grow in={true}><Typography variant="h3">Your Nest Thermostats</Typography></Grow>
              </Stack>
              <Container sx={{ marginBottom: '2rem' }}>
                <Grid container direction="row" justifyContent="space-around">
                  { thermostats ? (thermostats.map((thermostat) => {
                    return (
                      <Grow in={true}>
                      <Grid item>
                        <ThermoCard 
                          deviceId={getDeviceId(thermostat.name)} 
                          deviceName={thermostat.traits["sdm.devices.traits.Info"].customName.length === 0 ? 'No custom name set.' : thermostat.traits["sdm.devices.traits.Info"].customName} 
                          roomName={thermostat.parentRelations[0].displayName}
                         />
                      </Grid>
                      </Grow>
                    )
                  })) : (<Typography variant="h6" color={ switched ? 'primary.main' : 'secondary.main' }>You have no Nest thermostats associated with your account.</Typography>) }
                </Grid>
              </Container>
            </>
          ) : (
            <Stack direction="column" textAlign={'center'} spacing={4} m={8}>
              <Grow in={true}><Typography variant="h3">Welcome to TempWise Assistant</Typography></Grow>
              <div>
                <Grow in={true}>
                  { switched ? 
                    <Button size="large" startIcon={<GoogleIcon />} color="primary" variant="outlined" onClick={() => login()}>Sign in to Google</Button> : 
                    <Button size="large" startIcon={<GoogleIcon />} color="secondary" variant="contained" onClick={() => login()}>Sign in to Google</Button>
                  }
                </Grow>
              </div>
            </Stack> 
          )} 
      </>
    )
}

export default Home