import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import DarkModeSwitch from './DarkModeSwitch';

const NavBar = () => {
  return (
    <Box sx={{ flexGrow: 1, marginTop: '1rem', marginBottom: '1rem', marginLeft: '4rem', marginRight: '4rem', position: 'sticky', top: '0' }}>
      <AppBar position="sticky" sx={{ borderRadius: '30px' }}> 
        <Toolbar>
        <Grid container direction="row" justifyContent="space-between" alignItems="center">
          <Grid item>
            <DarkModeSwitch />
          </Grid>
          <Grid item>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              TempWise
            </Typography>
          </Grid>
          <Grid item>
            <Button color="inherit">Login</Button>
          </Grid>
        </Grid>
        </Toolbar>
      </AppBar>
    </Box>
  )
}

export default NavBar