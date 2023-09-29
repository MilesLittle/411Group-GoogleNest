import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography'
import TuneIcon from '@mui/icons-material/Tune';
import { useNavigate } from "react-router-dom";
import nestthermostat from './NestThermostat.jpg'

const ThermoCard = ({ deviceId, deviceName, roomName }) => {
    const navigate = useNavigate()
    return (
        <Card sx={{ width: '25rem', borderRadius: '2rem', bgcolor: 'primary.main' }} elevation={15} key={deviceId}>
            <CardMedia sx={{ height: 300, borderRadius: '2rem' }} image={nestthermostat} title='Nest Device' />
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
                        <Typography mb={1}>
                            Room: {roomName}
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default ThermoCard