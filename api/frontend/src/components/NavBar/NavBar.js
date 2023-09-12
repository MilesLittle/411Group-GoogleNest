import React from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import DarkModeSwitch from './DarkModeSwitch';
import Card from '@mui/material/Card';
import Avatar from '@mui/material/Avatar';

const NavBar = () => {
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
              We don't have a logo yet
            </Typography>
          </Grid>
          <Grid item>
            <Card sx={{ padding: '3px', borderRadius: '30px', backgroundColor: 'secondary.main', width: '13rem'}}>
              <Grid container direction="row" alignItems="center">
                <Grid item>
                  <Avatar 
                    alt="profile pic" 
                    src='https://wickedhorror.com/wp-content/uploads/2022/08/terminator-teeth-864x467.jpg' 
                  />
                </Grid>
                <Grid item>
                  <Typography sx={{ color: 'secondary.light' }}>Terminator</Typography>
                </Grid>
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