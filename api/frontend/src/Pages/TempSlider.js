import * as React from 'react'; 
//import Switch from '@mui/material/Switch';
import { useState } from 'react';
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import Typography  from '@mui/material/Typography';
import Paper from '@mui/material/Paper'; 


// gives the marker text 
const TempSlider = () => {

function valuetext(value) {
        return `${value}°`;
      }

// set the temperature
const [temp, SetTemp] = useState(0); 

// display value change 
const handleChange = (event, newValue) => 
{
    if (typeof newValue === 'number') {
        SetTemp(newValue);
      }}; 

return (
    <>
        <div style={{textAlign: 'center'}} >
            <h1> DeviceName 1 </h1> {/* temp hardcoded in */}

        <Paper
            style= {{
            width: '100px', 
            height: '100px',
            borderRadius: '50%', // This creates a circular shape
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            }}>

            <Typography variant="h6">{valuetext(temp)}</Typography>

        </Paper>

        <Stack sx={{ height: 300 }} spacing={1} direction="row">
            <Slider
                sx={{color: '#000000'}}

                value= {temp}
                aria-label="Temperature"
                orientation="vertical"
                getAriaValueText={valuetext}
                valueLabelDisplay="auto"
                min = {0}
                step = {5}
                max = {100}
                defaultValue={[70, 80]}
                onChange= {handleChange}
             /> 
            </Stack>
        </div>    
    </>

)} 


export default TempSlider