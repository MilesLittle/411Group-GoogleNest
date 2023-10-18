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
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import DarkModeSwitchContext from "../components/NavBar/Dark Mode/DarkModeSwitchContext";

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

const ThermoDashboard = () => {
    document.title = 'Nest Thermostat Dashboard'
    const { nestTokens, project_id, googleAccountInfo } = useContext(AuthContext)
    const { switched } = useContext(DarkModeSwitchContext)
    const { deviceId } = useParams() 
    const [device, setDevice] = useState(null)
    const [temp, setTemp] = useState(0)
    const [refresh, setRefresh] = useState(false)
    const [jobs, setJobs] = useState(null)
    const [chartData, setChartData] = useState(null)
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

    useEffect(() => {
        axios.get(`/logjobs?googleId=${googleAccountInfo.id}&thermostatId=${deviceId}`)
        .then((res) => {
            if (res.status === 200) { 
                console.log(res.data)
                res.data.data.forEach((jobanditslogs) => {
                    jobanditslogs.JobLogs.forEach((joblog) => {
                        joblog.ActualTemp = Math.round(CtoF(joblog.ActualTemp))
                        joblog.SetPointTemp = Math.round(CtoF(joblog.SetPointTemp))
                    })
                })
                setJobs(res.data.data)
            } else {
                console.log(res)
            }
        }).catch((err) => {
            console.log(err)
        })
    }, [])

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

    return ( //work on formatting this page better later (put everything in a container)
        <>
        <Stack direction="column" textAlign={'center'} alignItems="center" spacing={4} m={6}>
            { device &&
            <>
            <Grow in={true}>
                <Typography fontSize={'3rem'} variant="h3">
                    {device.parentRelations[0].displayName.length === 0 ? 'No custom name set.' : device.parentRelations[0].displayName}
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
        { device &&
            <>
            <Stack direction="column" textAlign={'center'} mt={1} mb={3}>
                <Typography variant="h3">Your Jobs</Typography>
            </Stack>
            <Container>
                <Grid container direction="row" justifyContent="center" spacing={5} marginBottom="2rem">
                    {jobs ? (jobs.map((job) => {
                        return (
                            <Grid item>
                                <div onClick={() => setChartData(job.JobLogs)} style={{ cursor: 'pointer' }}>
                                    <Card sx={{ borderRadius: '2rem', bgcolor: 'primary.main', width: '15rem'}} elevation={(job.JobLogs === chartData ? 8 : 0)}>
                                        <CardContent>
                                            <Typography gutterBottom variant="h6" color='#000' component="div">{job.Id}</Typography>
                                            <Typography variant="body2" color='#000'>{job.Description}</Typography>
                                        </CardContent>
                                    </Card>
                                </div>
                            </Grid>
                        )
                    })) : (<Typography variant="h6" color={ switched ? 'primary.main' : 'secondary.main' } sx={{ mt: '2rem', mb: '1rem', ml: '1.7rem' }}>You have no jobs set on this thermostat.</Typography>)}
                </Grid>
            </Container>
            { chartData ? (
                <ResponsiveContainer height={400}>
                    <LineChart margin={{ bottom: 30, right: 100, left: 50 }} data={chartData}>
                        <CartesianGrid stroke={(switched ? '#7BF1A8' : '#000')} strokeDasharray="3 3" />
                        <XAxis dataKey="TimeLogged" stroke={(switched ? '#7BF1A8' : '#000')} />
                        <YAxis stroke={(switched ? '#7BF1A8' : '#000')}/>
                        <Tooltip />
                        <Legend wrapperStyle={{ right: 75 }}/>
                        <Line type="monotone" dataKey="ActualTemp" stroke="#ff3333" activeDot={{ r: 8 }} name="Actual Temp"/>
                        <Line type="monotone" dataKey="SetPointTemp" stroke="#3385ff" activeDot={{ r: 8 }} name="Set Point Temp"/>
                    </LineChart>
                </ResponsiveContainer> )
                : (<ResponsiveContainer height={400}>
                    <LineChart margin={{ bottom: 30, right: 100, left: 50 }}>
                        <CartesianGrid stroke={(switched ? '#7BF1A8' : '#000')} strokeDasharray="3 3" />
                        <XAxis />
                        <YAxis />
                        <Legend wrapperStyle={{ right: 75 }}/>
                        <Line stroke="#ff3333" name="Actual Temp"/>
                        <Line stroke="#3385ff" name="Set Point Temp"/>
                    </LineChart>
                   </ResponsiveContainer>
                )
            }
        </>
        }
        </>
    )
}

export default ThermoDashboard