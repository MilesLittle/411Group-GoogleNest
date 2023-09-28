import React, { useContext, useEffect, useState } from "react";
import AuthContext from '../Login/AuthContext';
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
  //This is used by googleNest Login to store access token
  //  const [accessToken, setaccessToken] = useState(null);
  //  const [devices, setDevices] = useState(null);
    const [thermostats, setThermostats] = useState(null)
    const [thermInfo, setThermInfo] = useState(null);

    const { setAuthTokenDetails, googleAccountInfo, setGoogleAccountInfo, nestTokens, code, setCode, getNestTokens, setHasAuth, project_id } = useContext(AuthContext)
    const location = useLocation()
    const navigate = useNavigate()
    const [searchParams, setSearchParams] = useSearchParams()

    useEffect(() => { //#2
      if (location.search.includes('?code=')) {
        console.log(location.search)
        setGoogleAccountInfo(JSON.parse(localStorage.getItem("googleAccountInfo")))
        setAuthTokenDetails(JSON.parse(localStorage.getItem("authTokenDetails"))) //endless loop back to authcontext useEffect?
        //localStorage.clear()  //the problem, but need to clear localstorage for safety (clearing in logout func for now)
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
/*
useEffect(() => 
{
  const NestLoginAsync = async () => 
  {
  

    if(!accessToken)
    {

        try 
        {
          const params = new URLSearchParams(window.location.search);
          const code = params.get('code');

          const param = new URLSearchParams();
          param.append('client_id', '589825515650-ej6sq8icgc3itevo7b731oes8q1tqk4u.apps.googleusercontent.com');
          param.append('client_secret', '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');
          param.append('code', `${code}`);
          param.append('grant_type', 'authorization_code');
          param.append('redirect_uri', 'http://localhost:3000');

            await axios.post('https://www.googleapis.com/oauth2/v4/token', param
            ).then((res) => 
              {
                setaccessToken(res.data['token_type'] + ' ' + res.data['access_token']);
                console.log(res.data['token_type'] + res.data['access_token']);
              }).catch((err) => console.log(err))
        }
        catch(e) 
        { 
          console.log(e);
        }
      }


        if(accessToken) 
        {

        try 
        {
          await axios.get('https://smartdevicemanagement.googleapis.com/v1/enterprises/f4f5bdc3-964c-466b-bf80-9508f2709ad5/devices',
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': accessToken
            }
          })
          .then((res) => {
            setDevices(res.data)
          })
        }
        catch(e) 
        {
          console.log(e);
        }

        console.log("DEVICES")
        console.log(devices);

        try 
        {
          await axios.get('https://smartdevicemanagement.googleapis.com/v1/' + devices.devices[0].name,
          {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': accessToken
            }
          
          })
          .then((res) => {
            console.log(res.data);
            setThermInfo(res.data);
          })
        }
        catch (e) 
        {
          console.log(e);
        }
        console.log("Its doing something")
      }
      else 
      {
        console.log("Its not doing anything")
      }
  }

NestLoginAsync()
console.log(thermInfo);
}, [accessToken]);

*/




    return (
      <>
         {googleAccountInfo && thermostats ? (
            <>
              <Stack direction="column" textAlign={'center'} spacing={4} m={8}>
                <Grow in={true}><Typography variant="h3">Your Nest Thermostats</Typography></Grow>
              </Stack>
              <Container sx={{ marginBottom: '2rem' }}>
                <Grid container direction="row" justifyContent="space-around">
                  { thermostats ? (thermostats.map((thermostat) => {
                    return (
                      <Grid item>
                        <ThermoCard 
                          id={thermostat.name} 
                          deviceName={'Set this later'} 
                          roomName={thermostat.parentRelations[0].displayName}
                         />
                      </Grid>
                    )
                  })) : (<>You have no Nest thermostats associated with your account.</>) }
                </Grid>
              </Container>
            </>
          ) : (
            
          
            <Stack direction="column" textAlign={'center'} spacing={4} m={8}>
              <Grow in={true}><Typography variant="h3">Welcome to TempWise Assistant</Typography></Grow>
              <div>
                <Grow in={true}>
                    <Button size="large" startIcon={<GoogleIcon />} color="secondary" variant="contained" onClick={() => login()}>Sign in to Google</Button>
                </Grow>
              </div>
            </Stack> 
          )} 
      </>
    )
}

export default Home