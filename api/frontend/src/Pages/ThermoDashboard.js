import React from "react";
import { useParams } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Grow from "@mui/material/Grow";
import Typography from '@mui/material/Typography';

const ThermoDashboard = () => {
    const { id } = useParams() 
    //Google might not even have ids for every thermostat but at least the routing is set up. Look more into their API. 
    return (
        <Stack direction="column" textAlign={'center'} spacing={4} m={8}>
            <Grow in={true}><Typography fontSize={'3rem'}>Thermostat Dashboard</Typography></Grow>
            <Typography fontSize={'1.5rem'}>Dashboard for thermostat with id {id}.</Typography>
            <Typography fontSize={'1.5rem'}>Things will be here. Later. </Typography>
        </Stack>
    )
}

export default ThermoDashboard