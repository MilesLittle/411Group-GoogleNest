import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Grow from "@mui/material/Grow";
import Typography from '@mui/material/Typography';
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import AuthContext from "../Login/AuthContext";
import axios from 'axios'

const ThermoDashboard = () => {
    document.title = 'Nest Thermostat Dashboard'
    const { nestTokens, project_id } = useContext(AuthContext)
    const { deviceId } = useParams() 
    console.log(deviceId)
    const [device, setDevice] = useState(null)
    const CtoF = (cTemp) => {
        return (cTemp * 9/5) + 32
    }
    useEffect(() => {
        axios.get(`https://smartdevicemanagement.googleapis.com/v1/enterprises/${project_id}/devices/${deviceId}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${nestTokens.access_token}`
            }
        }).then((res) => {
            if (res.status === 200) {
                console.log('Got the device')
                console.log(res.data)
                setDevice(res.data)
            } else {
                console.log('Not OK')
            }
        }).catch((err) => {
            console.log(err)
        })
    }, [])

    return (
        <Stack direction="column" textAlign={'center'} alignItems="center" spacing={4} m={8}>
            <Grow in={true}><Typography fontSize={'3rem'} variant="h3">Thermostat Dashboard</Typography></Grow>
            { device &&
            <Grow in={true}>
            <Box sx={{ backgroundColor: '#7BF1A8', borderRadius: '2rem', width: '40rem' }}>
                <List>
                    <ListItem>
                        <ListItemText 
                        primary={`Humidity Percent: ${device.traits["sdm.devices.traits.Humidity"].ambientHumidityPercent}%`}
                        primaryTypographyProps={{ fontSize: '2rem' }}
                        />
                    </ListItem>
                    <Divider variant="middle" />
                    <ListItem>
                        <ListItemText 
                        primary={`Current Temperature: ${Math.round(CtoF(device.traits["sdm.devices.traits.Temperature"].ambientTemperatureCelsius))} F`}
                        primaryTypographyProps={{ fontSize: '2rem'}}
                        />
                    </ListItem>
                    <Divider variant="middle"/>
                    <ListItem>
                        <ListItemText primary={`Target Temperature: ${Math.round(CtoF(device.traits["sdm.devices.traits.ThermostatTemperatureSetpoint"].coolCelsius))} F`}
                        primaryTypographyProps={{ fontSize: '2rem' }}
                        />
                    </ListItem>
                </List>
            </Box>
            </Grow>
            }
        </Stack>
    )
}

export default ThermoDashboard