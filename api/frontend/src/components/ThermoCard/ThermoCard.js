import React, { useContext } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography'
import TuneIcon from '@mui/icons-material/Tune';
import { useNavigate } from "react-router-dom";
import blanknestthermostat from './blanknestthermo.jpg'
import blanknestthermostatdark from './blanknestthermodark.jpg'
import DarkModeSwitchContext from "../../Theming/DarkModeSwitchContext";
import './thermocard.css'

const ThermoCard = ({ deviceId, deviceName, mode, actualTempF, actualTempC, setPointTempF, humidity }) => {    
    const navigate = useNavigate()
    const { switched } = useContext(DarkModeSwitchContext)
    return (
        <Card sx={{ width: '25rem', borderRadius: '3rem', bgcolor: 'primary.main' }} elevation={15} key={deviceId}>
            <CardMedia sx={{ height: 300, borderRadius: '3rem', position: 'relative', border: '0.1rem solid #7BF1A8' }} image={(switched ? blanknestthermostatdark : blanknestthermostat)} title='Nest Device'>
                <Typography variant="h2" className="setpointtemp">{setPointTempF}</Typography>
                <Typography variant="body1" className="actualtemp">{actualTempF}</Typography>
                <Typography variant="body2" className="mode">{mode}</Typography>
            </CardMedia>
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
                            Current Temperature: {actualTempC}°C
                        </Typography>
                        <Typography mb={1}>
                            Humidity: {humidity}%
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default ThermoCard