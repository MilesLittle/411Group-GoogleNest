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
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import AuthContext from "../Login/AuthContext";
import axios from 'axios'
import Button from "@mui/material/Button";
import Container from '@mui/material/Container'

const ThermoDashboard = () => {
    document.title = 'Nest Thermostat Dashboard'
    const { nestTokens, project_id } = useContext(AuthContext)
    const { deviceId } = useParams() 
    const [device, setDevice] = useState(null)
    const [temp, setTemp] = useState(0)
    const [refresh, setRefresh] = useState(false)
    const CtoF = (cTemp) => {
        return (cTemp * 9/5) + 32
    }
    const FtoC = (fTemp) => {
        return (fTemp - 32) * 5/9
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
                if (res.data.traits["sdm.devices.traits.ThermostatMode"].mode === "COOL" || "HEATCOOL") {
                    console.log('Nest in cool or heatcool mode')
                    setTemp(Math.round(CtoF(res.data.traits["sdm.devices.traits.ThermostatTemperatureSetpoint"].coolCelsius)))
                } else if (res.data.traits["sdm.devices.traits.ThermostatMode"].mode === "HEAT" || "HEATCOOL") {
                    console.log('Nest in heat or heatcool mode ')
                    setTemp(Math.round(CtoF(res.data.traits["sdm.devices.traits.ThermostatTemperatureSetpoint"].heatCelsius)))
                } else {
                    console.log('The thermostat is most likely off')
                }
            } else {
                console.log('Not OK')
            }
        }).catch((err) => {
            console.log(err)
        })
    }, [refresh])

    const tempHandler = async () => {
        if (device.traits["sdm.devices.traits.ThermostatMode"].mode === "COOL") {
            await axios.post(`https://smartdevicemanagement.googleapis.com/v1/enterprises/${project_id}/devices/${deviceId}:executeCommand`, {
                command: "sdm.devices.commands.ThermostatTemperatureSetpoint.SetCool",
                params: {
                    "coolCelsius": FtoC(temp)
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${nestTokens.access_token}`
                }
            }
            ).then((res) => {
                if (res.status === 200) {
                    console.log('Successfully set temperature')
                    console.log(res.data)
                    setRefresh(!refresh) //something stupid to call the single device endpoint again and let the user see the new temp that they set
                }
            }).catch((err) => {
                console.log(err)
            })
        } else if (device.traits["sdm.devices.traits.ThermostatMode"].mode === "HEAT") {
            await axios.post(`https://smartdevicemanagement.googleapis.com/v1/enterprises/${project_id}/devices/${deviceId}:executeCommand`, {
                command: "sdm.devices.commands.ThermostatTemperatureSetpoint.SetHeat",
                params: {
                    "heatCelsius": FtoC(temp)
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${nestTokens.access_token}`
                }
            }
            ).then((res) => {
                if (res.status === 200) {
                    console.log('Successfully set temperature')
                    console.log(res.data)
                    setRefresh(!refresh)
                }
            }).catch((err) => {
                console.log(err)
            })
        } else {
            console.log('Thermostat is in heatcool mode or off')
        }
    }

    return (
        <>
        <Stack direction="column" textAlign={'center'} alignItems="center" spacing={4} m={6}>
            { device &&
            <>
            <Grow in={true}>
                <Typography fontSize={'3rem'} variant="h3">
                    {device.traits["sdm.devices.traits.Info"].customName.length === 0 ? 'No custom name set.' : device.traits["sdm.devices.traits.Info"].customName}
                </Typography>
            </Grow>
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
                        <ListItemText 
                        primary={`Target Temperature: ${Math.round(CtoF(device.traits["sdm.devices.traits.ThermostatTemperatureSetpoint"].coolCelsius))} F`}
                        primaryTypographyProps={{ fontSize: '2rem' }}
                        />
                    </ListItem>
                </List>
            </Box>
            </Grow>
            <Grow in={true}>
            <Box component="form" sx={{ backgroundColor: '#7BF1A8', borderRadius: '2rem', padding: '1rem', marginBottom: '2rem', marginLeft: '20rem', marginRight: '20rem' }}>
                <Container>
                    <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
                        <Grid item>
                            <TextField variant="outlined" color="secondary" label="Set temperature in F" onChange={(e) => setTemp(parseInt(e.target.value))} />
                        </Grid> 
                        <Grid item>
                            <Button variant="contained" color="secondary" onClick={() => tempHandler()}>Set Temperature</Button>
                        </Grid>
                    </Grid>   
                </Container>
            </Box>
            </Grow>
            </>
            }
        </Stack>
        </>
    )
}

export default ThermoDashboard