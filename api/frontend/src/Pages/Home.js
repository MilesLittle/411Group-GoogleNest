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
import { useLocation } from "react-router-dom";


const Home = () => {
  //This is used by googleNest Login to store access token
    const [accessToken, setaccessToken] = useState(null);
    const [devices, setDevices] = useState(null);
    const [thermInfo, setThermInfo] = useState(null);

    const { setAuthTokenDetails, googleAccountInfo, setGoogleAccountInfo, setHasAuth } = useContext(AuthContext)
    const location = useLocation()

    const nests = [  //mock data
      {
        id: 1,
        deviceName: "DeviceName1",
        type: "Nest Thermostat",
        location: "Home1 - Hallway"
      }, 
      {
        id: 2,
        deviceName: "DeviceName2",
        type: "Nest Learning Thermostat",
        location: "Home2 - LivingRoom"
      }
    ];

    useEffect(() => {
      if (location.search.includes('?')) {
        console.log(location.search)
        console.log('There is a question mark so there must be a query string with the code')
        console.log(JSON.parse(localStorage.getItem("googleAccountInfo")))
        setGoogleAccountInfo(JSON.parse(localStorage.getItem("googleAccountInfo")))
        console.log(JSON.parse(localStorage.getItem("authTokenDetails")))
        setAuthTokenDetails(JSON.parse(localStorage.getItem("authTokenDetails")))
        //localStorage.clear()  //the problem, but need to clear localstorage for safety (clearing in logout func for now)
        //might rerun if query string isn't removed from URL after code is gotten and u navigate to home again
      } else {
        console.log('The URL does not have the code')
      }
    }, [])

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => { console.log(codeResponse); setAuthTokenDetails(codeResponse); setHasAuth(true);},
        onError: (error) => console.log('Login Failed:', error)
    });

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






    return (
      <>
         {googleAccountInfo ? (
            <>
              <Stack direction="column" textAlign={'center'} spacing={4} m={8}>
                <Grow in={true}><Typography variant="h3">Your Nest Thermostats</Typography></Grow>
              </Stack>
              <Container sx={{ marginBottom: '2rem' }}>
                <Grid container direction="row" justifyContent="space-around">
                  { nests ? (nests.map((nest) => {
                    return (
                      <Grid item>
                        <ThermoCard id={nest.id} deviceName={nest.deviceName} type={nest.type} location={nest.location} />
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