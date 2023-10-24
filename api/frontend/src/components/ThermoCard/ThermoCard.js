import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography'
import TuneIcon from '@mui/icons-material/Tune';
import { useNavigate } from "react-router-dom";
import nestthermostat from './NestThermostat.jpg'
import ThermostatIcon from '@mui/icons-material/Thermostat';
import { brown } from '@mui/material/colors';






const ThermoCard = ({ deviceId, deviceName, mode, tempf, tempc ,humidity }) => {
    
    const navigate = useNavigate()
    return (
        <Card sx={{ width: '20rem', borderRadius: '5rem', bgcolor: 'primary.main' }} elevation={15} key={deviceId}>
            <div style ={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '20vh' }}> 
            <ThermostatIcon
            sx={{ fontSize: 150,
            color: brown [500] }} >
             
            </ThermostatIcon>
           

              </div>
            
            <CardContent sx={{ margin: '0.5rem' }}>
                <Grid container direction="row" justifyContent="space-between">
                    <Grid item>
                        <Typography variant="h5" mb={1}>
                            {deviceName}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <div onClick={() => navigate(`/thermo/${deviceId}`)} style={{ cursor: 'pointer'}}>
                            <TuneIcon />
                        </div>
                    </Grid>
                </Grid>
                <Grid container direction="column" justifyContent="flex-start">
                    <Grid item>
                        <Typography mb={1}>
                            Nest Thermostat
                        </Typography>
                        <Typography > 
                            Temperature: {tempf} F / {tempc} C

                           

                        </Typography>
                        <Typography mb = {1}>
                        Humidity: {humidity}%
                        </Typography>
                        <Typography mb={1}>
                            Mode: {mode}
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default ThermoCard