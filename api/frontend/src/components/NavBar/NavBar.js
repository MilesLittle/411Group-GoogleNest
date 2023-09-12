import React, { useContext } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import DarkModeSwitch from './DarkModeSwitch';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';
import AuthContext from '../../Login/AuthContext';
import { Link } from 'react-router-dom';

const NavBar = () => {
  const { currentUser, setCurrentUser, profile, setProfile, authenticated, setAuthenticated } = useContext(AuthContext)
  return (
    <Box sx={{ flexGrow: 1, marginTop: '1rem', marginBottom: '1rem', marginLeft: '4rem', marginRight: '4rem', position: 'sticky', top: '0' }}>
      <AppBar position="sticky" sx={{ borderRadius: '30px' }} elevation={10}> 
        <Toolbar>
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          <Grid item>
            <DarkModeSwitch />
          </Grid>
          <Grid item>
            <Typography variant="h6">
              No logo yet, and yes, I know this isn't centered
            </Typography>
          </Grid>
          <Grid item>
            <Card sx={{ padding: '3px', borderRadius: '30px', backgroundColor: 'secondary.main', width: '13rem'}}>
              <Grid container direction="row" alignItems="center">
                {authenticated && profile ? 
                  (<>
                    <Grid item>
                      <Avatar 
                      alt="profile pic"
                      src={profile.picture}
                      /> 
                    </Grid>
                    <Grid item>
                      <Typography sx={{ color: 'secondary.light' }}>
                      { profile.name }
                      </Typography> 
                    </Grid>
                  </>) : 
                  (<>
                    <Grid item>
                      <Avatar alt="profile pic" sx={{ bgcolor: 'primary.main' }}>?</Avatar>
                    </Grid>
                    <Grid item>
                      <Typography sx={{ color: 'secondary.light' }}>
                        Sign In
                      </Typography> 
                    </Grid>
                  </>)}
                </Grid>
              </Card>
          </Grid>
        </Grid>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default NavBar