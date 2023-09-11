import React, { useContext } from 'react';
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import AuthContext from '../Login/AuthContext';
import { useNavigate } from 'react-router-dom';
import Button from '@mui/material/Button';
import GoogleIcon from '@mui/icons-material/Google';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grow from "@mui/material/Grow";
import '../css/Login.css'

const Login = () => {
    const navigate = useNavigate()
    const { currentUser, setCurrentUser, profile, setProfile, authenticated, setAuthenticated } = useContext(AuthContext)
    
    const login = useGoogleLogin({
        onSuccess: (codeResponse) => { console.log(codeResponse); setCurrentUser(codeResponse); setAuthenticated(true); navigate("/")}, //token stuff
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
      <Stack direction="column" textAlign={'center'} spacing={4} m={8}>
        <Grow in={true}><Typography fontSize={'3rem'}>Welcome to TempWise Assistant</Typography></Grow>
         {authenticated && profile ? (
            <Card sx={{ bgcolor: 'secondary.light', width: '200'}}>
                <CardContent>
                 <center><Avatar src={profile.picture} alt="User Image" sx={{ width: 60, height: 60, margin: '10px' }}/></center>
                    <Typography fontSize={'1.5rem'}> {profile.name} </Typography>
                    <Typography mb={2}> {profile.email} </Typography>
                    <Button size="large" color="secondary" variant="contained" onClick={logOut}>Log out</Button>
                </CardContent>
            </Card>
          ) : (<div><Grow in={true}><Button size="large" startIcon={<GoogleIcon />} color="secondary" variant="contained" onClick={() => login()}>Sign in to Google</Button></Grow></div>)}
      </Stack>
    )
}

export default Login