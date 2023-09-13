import React, { useContext } from "react";
import AuthContext from '../Login/AuthContext';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import GoogleIcon from '@mui/icons-material/Google'
import Grow from "@mui/material/Grow";
import '../css/Login.css'
import { useNavigate } from "react-router-dom";

const Home = () => {
    const { profile, setProfile, authenticated, setAuthenticated, setCurrentUser } = useContext(AuthContext)
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
      <Stack direction="column" textAlign={'center'} spacing={4} m={8}>
         {authenticated && profile ? (
            <>
            <Grow in={true}><Typography fontSize={'3rem'}>Your Nest Thermostats</Typography></Grow>
            </>
          ) : (
            <>
              <Grow in={true}><Typography fontSize={'3rem'}>Welcome to TempWise Assistant</Typography></Grow>
              <div>
                <Grow in={true}>
                    <Button size="large" startIcon={<GoogleIcon />} color="secondary" variant="contained" onClick={() => login()}>Sign in to Google</Button>
                </Grow>
              </div>
            </>
          )} 
        </Stack> 
      </>
    )
}

export default Home