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
import { useNavigate } from "react-router-dom";
import ThermoCard from "../components/ThermoCard/ThermoCard";
import DarkModeSwitchContext from "../components/NavBar/Dark Mode/DarkModeSwitchContext";

const Home = () => {
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
              </div>
            </Stack> 
          )} 
      </>
    )
}

export default Home