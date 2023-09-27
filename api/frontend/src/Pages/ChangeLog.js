import * as React from 'react'; 
import { styled, alpha } from '@mui/system';
import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';

// Style the Drop Down Menu 
  const StyledMenu = styled((props) => (
      <Menu
        elevation={0}
        anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right',
      }}
        transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      {...props}

    />

// Style the menu-drop-down button 
    ))(({ theme }) => ({
      '& .MuiPaper-root': {
      borderRadius: 6,
      marginTop: theme.spacing(1),
      minWidth: 180,
      color:
      theme.palette.mode === 'light' ? 'rgb(55, 65, 81)' : theme.palette.grey[300],
      boxShadow:
      'rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px',
      '& .MuiMenu-list': {
      padding: '4px 0',
      },
    '& .MuiMenuItem-root': {
      '& .MuiSvgIcon-root': {
        fontSize: 18,
        color: theme.palette.text.secondary,
        marginRight: theme.spacing(1.5),
      },
      '&:active': {
        backgroundColor: alpha(
          theme.palette.primary.main,
          theme.palette.action.selectedOpacity,
        ),
      },
    },
  },
}));

const ChangeLog = () =>  {
    
// Style the Items 
    const Item = styled('div')(({ theme }) => ({
        backgroundColor: theme.palette.mode === 'dark' ? '#262B32' : '#fff',
        padding: theme.spacing(1),
        textAlign: 'center',
        borderRadius: 4,
      }));

    
// Opening/closing drop down button 
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
      };
    const handleClose = () => {
        setAnchorEl(null);
      };

// React Stuff 
    return (
    <> 
        <Box sx={{ 
            backgroundColor: 'primary.light', 
             height: 700,
             width: 800 ,  
             flexGrow:1 }}>
                
            <Grid container spacing={1}>

        `       <Grid item xs={12}>
                    <Typography align="center" > Name of Thermostat </Typography> 
                </Grid> 

                <Grid item xs={5}>
                     <Item> Log The Temperature every </Item> 
                 </Grid>    

                <Grid item xs={2}>
                      <TextField label="6" variant="outlined">  </TextField> 
                </Grid>
                     
               {/* Time Menu */}      
                <Grid item xs={2}>
                        <Button 
                          id="drop-down-button"
                          alignItems = "flex-end"
                          component= "span"
                          aria-controls={open ? 'drop-down-menu' : undefined}
                          aria-haspopup="true"
                          aria-expanded={open ? 'true' : undefined}
                          variant="contained"
                          disableElevation
                          onClick={handleClick}
                          endIcon={<KeyboardArrowDownIcon />}>
                        </Button> 
                    
                        <StyledMenu
                          id="drop-down-menu"
                          MenuListProps={{
                          'aria-labelledby': 'drop-down-button',
                          }}
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                          >
                    
                      <MenuItem onClick={handleClose} disableRipple> Minutes </MenuItem>
                      <MenuItem onClick={handleClose} disableRipple> Hours </MenuItem>
                      <MenuItem onClick={handleClose} disableRipple> Days </MenuItem>
                  </StyledMenu> 
                  
                </Grid> 
                
                <Grid item xs={2}>
                  <Item> in the </Item> 
                </Grid>

                {/* Room Menu */} 
                <Grid item xs={1}>
                     <Button
                          id="drop-down-button"
                          aria-controls={open ? 'drop-down-menu' : undefined}
                          aria-haspopup="true"
                          aria-expanded={open ? 'true' : undefined}
                          variant="contained"
                          disableElevation
                          onClick={handleClick}
                          endIcon={<KeyboardArrowDownIcon />}>
                        </Button> 
                    
                        <StyledMenu
                          id="drop-down-menu"
                          MenuListProps={{
                          'aria-labelledby': 'drop-down-button',
                          }}
                        anchorEl={anchorEl}
                        open={open}
                        onClose={handleClose}
                        >
                    
                      <MenuItem onClick={handleClose} disableRipple> Living Room </MenuItem>
                      <MenuItem onClick={handleClose} disableRipple> Kitchen </MenuItem>
                      <MenuItem onClick={handleClose} disableRipple> Hallway </MenuItem>
                      
                  </StyledMenu>  

                </Grid>  

                <Grid item xs={5}>
                  <Item> Starting at </Item>
                </Grid>

                <Grid item>
                          
                        </Grid>
            
            </Grid>    

          <Typography align="center">
          <Button variant="contained"> Save </Button>
          </Typography>
        </Box>
    </>
    );}

export default ChangeLog 