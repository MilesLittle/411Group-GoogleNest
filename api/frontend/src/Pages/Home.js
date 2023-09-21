import React, { useContext } from "react";
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

const Home = () => {
    const { setAuthTokenDetails, googleAccountInfo } = useContext(AuthContext)

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

    const login = useGoogleLogin({
        onSuccess: (codeResponse) => { console.log(codeResponse); setAuthTokenDetails(codeResponse);}, 
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