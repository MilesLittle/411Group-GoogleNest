import React, { useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import DarkModeSwitch from './DarkModeSwitch';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import GoogleIcon from '@mui/icons-material/Google';
import AuthContext from '../../Login/AuthContext';
import { Link } from 'react-router-dom';
import { useGoogleLogin } from "@react-oauth/google";
import { useNavigate } from 'react-router-dom';

const NavBar = () => {
  const { setCurrentUser, profile, authenticated, setAuthenticated } = useContext(AuthContext)
    const navigate = useNavigate()
    const login = useGoogleLogin({
        onSuccess: (codeResponse) => { console.log(codeResponse); setCurrentUser(codeResponse); setAuthenticated(true); navigate("/profile");}, //token stuff
        //or set access token in state from here later
        onError: (error) => console.log('Login Failed:', error)
    });
  return (
    <Box sx={{ flexGrow: 1, marginTop: '1rem', marginBottom: '1rem', marginLeft: '4rem', marginRight: '4rem', position: 'sticky', top: '0' }}>
      <AppBar position="sticky" sx={{ borderRadius: '30px' }} elevation={10}> 
        <Toolbar>
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          <Grid item>
            <DarkModeSwitch />
          </Grid>
            <Grid item>
              <Typography variant="h6" style={{ textDecoration: 'none' }}>
                No logo yet, and yes, I know this isn't centered
              </Typography>
            </Grid>
          <Grid item>
            { authenticated && profile ? 
              (<Link to="/profile" style={{ textDecoration: 'none' }}>
                <Card sx={{ padding: '3px', borderRadius: '30px', backgroundColor: 'secondary.main', width: '13rem'}}>
                  <Grid container direction="row" alignItems="center">
                    <Grid item>
                      <Avatar alt="profile pic" src={profile.picture} /> 
                    </Grid>
                    <Grid item>
                      <Typography sx={{ color: 'secondary.light' }}>{ profile.name }</Typography> 
                    </Grid> 
                  </Grid>
                </Card>
              </Link>) : 
            (<div onClick={() => login()} style={{ cursor: 'pointer'}}>
              <Card sx={{ padding: '3px', borderRadius: '30px', backgroundColor: 'secondary.main', width: '13rem'}}>
                <Grid container direction="row" alignItems="center">
                  <Grid item>
                    <Avatar alt="google" sx={{ bgcolor: 'secondary.main' }}><GoogleIcon /></Avatar>
                  </Grid>
                  <Grid item>
                    <Typography sx={{ color: 'secondary.light' }}>Sign in to Google</Typography> 
                  </Grid> 
                </Grid>
              </Card>
             </div>)}
          </Grid>
        </Grid>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default NavBar