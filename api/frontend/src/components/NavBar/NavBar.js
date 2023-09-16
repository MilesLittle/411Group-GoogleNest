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
        onSuccess: (codeResponse) => { console.log(codeResponse); setCurrentUser(codeResponse); setAuthenticated(true);}, //token stuff
        //or set access token in state from here later
        onError: (error) => console.log('Login Failed:', error)
    });
  return (
    <Box sx={{ flexGrow: 1, marginTop: '1rem', marginBottom: '1rem', marginLeft: '4rem', marginRight: '4rem', position: 'sticky', top: '0' }}>
      <AppBar position="sticky" sx={{ borderRadius: '30px' }} elevation={10}> 
        <Toolbar>
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          <Grid item width="214px"> 
          {/*Dark mode switch item is matching width of profile card item so the 2nd item is centered using 
           justifyContent='space-between'. Could also do marginRight: 'auto' on the 1st flex item and marginLeft: 'auto'
           on the 3rd flex item.*/}
            <DarkModeSwitch /> 
          </Grid>
           <Card sx={{ padding: '8px', backgroundColor: '#000000'}}>
            <Grid item>
              <div onClick={() => navigate("/")} style={{ cursor: 'pointer'}}>
              <Typography fontSize={'1.3rem'} sx={{ textDecoration: 'none', color: '#FFFFFF' }}>
                No logo (yet)
              </Typography>
              </div>
            </Grid>
           </Card>
          <Grid item>
            { authenticated && profile ? 
              (<Link to="/profile" style={{ textDecoration: 'none' }}>
                <Card sx={{ padding: '3px', borderRadius: '30px', backgroundColor: '#000000', width: '13rem'}}>
                  <Grid container direction="row" alignItems="center">
                    <Grid item>
                      <Avatar alt="profile pic" src={profile.picture} /> 
                    </Grid>
                    <Grid item> {/*How will this look with longer names? Truncate (...) longer ones? */}
                      <Typography sx={{ color: '#FFFFFF', marginLeft: '25px' }}>{ profile.name }</Typography> 
                    </Grid> 
                  </Grid>
                </Card>
              </Link>) : 
            (<div onClick={() => login()} style={{ cursor: 'pointer'}}>
              <Card sx={{ padding: '3px', borderRadius: '30px', backgroundColor: '#000000', width: '13rem'}}>
                <Grid container direction="row" alignItems="center">
                  <Grid item>
                    <Avatar alt="google" sx={{ bgcolor: '#000000' }}><GoogleIcon /></Avatar>
                  </Grid>
                  <Grid item>
                    <Typography sx={{ color: '#FFFFFF', marginLeft: '15px' }}>Sign in to Google</Typography> 
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