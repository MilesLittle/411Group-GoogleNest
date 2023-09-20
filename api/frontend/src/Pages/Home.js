import React, { useContext } from "react";
import AuthContext from '../Login/AuthContext';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import GoogleIcon from '@mui/icons-material/Google'
import Grow from "@mui/material/Grow";
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import { redirect, useNavigate } from "react-router-dom";
import ThermoCard from "../components/ThermoCard/ThermoCard";
import DarkModeSwitchContext from "../components/NavBar/Dark Mode/DarkModeSwitchContext";
import axios from 'axios';
import { useEffect, useState } from "react";


const Home = () => {
    const [user, setUser] = useState([]);

    const { profile, setProfile, authenticated, setAuthenticated, setCurrentUser } = useContext(AuthContext)
    const { switched, setSwitched } = useContext(DarkModeSwitchContext)

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

    const navigate = useNavigate()
    const login = useGoogleLogin({
        onSuccess: (codeResponse) => { console.log(codeResponse); setCurrentUser(codeResponse); setAuthenticated(true);}, //token stuff
        //or set access token in state from here later
        onError: (error) => console.log('Login Failed:', error)
    });
    const logOut = () => {
        try {
            googleLogout()
            setProfile(null)
            setAuthenticated(false)

        } catch(err) {
            console.log(err)
        }
    } 

    const loginNest = () => {
      try {
        window.location.href = 'https://nestservices.google.com/u/0/partnerconnections/f4f5bdc3-964c-466b-bf80-9508f2709ad5/auth?redirect_uri=http://localhost:3000&access_type=offline&prompt=consent&client_id=589825515650-ej6sq8icgc3itevo7b731oes8q1tqk4u.apps.googleusercontent.com&response_type=code&scope=https://www.googleapis.com/auth/sdm.service';
      } catch (e){
        console.log(e);
      }
    }

    const getSearchParams = () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
    }

    useEffect(() => 
{
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');
      console.log(code);
      
      const param = new URLSearchParams();
      param.append('client_id', '589825515650-ej6sq8icgc3itevo7b731oes8q1tqk4u.apps.googleusercontent.com');
      param.append('client_secret', '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');
      param.append('code', `${code}`);
      param.append('grant_type', 'authorization_code');
      param.append('redirect_uri', 'http://localhost:3000');
      if (user) {
      axios.post('https://www.googleapis.com/oauth2/v4/token', param
      ).then((res) => {
        setUser(res.data)
        console.log(res.data)
      }).catch((err) => console.log(err))
    }
  }catch(e) { console.log(e);}
} , [user])



    return (
      <>
         {authenticated && profile ? (
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
                <Button size="large" startIcon={<GoogleIcon />} color="secondary" variant="contained" onClick={() => loginNest()}>Sign in to Google</Button>
                
              </div>
            </Stack> 
          )} 
      </>
    )
}

export default Home