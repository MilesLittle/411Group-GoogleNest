import React, { useContext, useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import Grow from "@mui/material/Grow";
import Typography from '@mui/material/Typography';
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Grid from '@mui/material/Grid'
import TextField from '@mui/material/TextField'
import AuthContext from "../../Login/AuthContext";
import axios from 'axios'
import Button from "@mui/material/Button";
import Container from '@mui/material/Container'
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ToolTip from '@mui/material/Tooltip'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts'
import DarkModeSwitchContext from "../../components/NavBar/Dark Mode/DarkModeSwitchContext";
import moment from 'moment'
import DeleteIcon from '@mui/icons-material/Delete';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';
import Snackbar from "@mui/material/Snackbar";
import SnackbarContent from "@mui/material/SnackbarContent";
import AddCircleIcon from '@mui/icons-material/AddCircle';
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Slider from '@mui/material/Slider';
import Stack from '@mui/material/Stack';
import _debounce from 'lodash/debounce';
import Paper from '@mui/material/Paper'; 

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
//axios.defaults.withCredentials = true //somehow this messes with the Google login?

const ThermoDashboard = () => {
    document.title = 'Nest Thermostat Dashboard'
    const { nestTokens, project_id, googleAccountInfo } = useContext(AuthContext)
    const { switched } = useContext(DarkModeSwitchContext)
    const { deviceId } = useParams() 
    const [device, setDevice] = useState(null)
    const [temp, setTemp] = useState(0)
    const [deviceRefresh, setDeviceRefresh] = useState(false)
    const [jobRefresh, setJobRefresh] = useState(false)
    const [jobs, setJobs] = useState(null)
    const [chartData, setChartData] = useState(null)
    const [alertOpen, setAlertOpen] = useState(false)
    const [deleteConfOpen, setDeleteConfOpen] = useState(false)
    const [jobToDeleteId, setJobToDeleteId] = useState('')
    const [responseMessage, setResponseMessage] = useState('')

    const tempRef = useRef(temp);
    const handleChangeCommitted = (event, newValue) => {
        if (typeof newValue === 'number') {
          setTemp(parseInt(newValue));
          tempRef.current = parseInt(newValue); // Update the ref when the slider value changes
          tempHandler();
        }
      };

function valuetext(value) {
    return `${value}°C`;
  }
  
    const CtoF = (cTemp) => {
        return (cTemp * 9/5) + 32
    }

    const FtoC = (fTemp) => {
        return (fTemp - 32) * 5/9
    }

    const getSetPointTemp = (thermostat) => {
        var setPointTemp
        if (thermostat.traits["sdm.devices.traits.ThermostatMode"].mode === 'HEAT') {
          setPointTemp = Math.round(CtoF(thermostat.traits["sdm.devices.traits.ThermostatTemperatureSetpoint"].heatCelsius))
        } else if (thermostat.traits["sdm.devices.traits.ThermostatMode"].mode === 'COOL') {
          setPointTemp = Math.round(CtoF(thermostat.traits["sdm.devices.traits.ThermostatTemperatureSetpoint"].coolCelsius))
        } else if (thermostat.traits["sdm.devices.traits.ThermostatMode"].mode === 'HEATCOOL') {
          setPointTemp = 'Range - H: ' + Math.round(CtoF(thermostat.traits["sdm.devices.traits.ThermostatTemperatureSetpoint"].heatCelsius)) + ', C: ' + Math.round(CtoF(thermostat.traits["sdm.devices.traits.ThermostatTemperatureSetpoint"].coolCelsius))
        } else if (thermostat.traits["sdm.devices.traits.ThermostatEco"].mode === 'MANUAL_ECO') {
          setPointTemp = 'Range - H: ' + Math.round(CtoF(thermostat.traits["sdm.devices.traits.ThermostatEco"].heatCelsius)) + ', C: ' + Math.round(CtoF(thermostat.traits["sdm.devices.traits.ThermostatEco"].coolCelsius))
        } else { //OFF
          setPointTemp = 'Thermostat is off.'
        }
        return setPointTemp
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
    }, [deviceRefresh])

    useEffect(() => {
        axios.get(`/logjobs?googleId=${googleAccountInfo.id}&thermostatId=${deviceId}`)
        .then((res) => {
            if (res.status === 200) { 
                console.log(res.data) //raw data from Django, temp unconverted (How are the temps already converted in the console before the forEach functions run below?)
                var convertedData = []
                convertedData = res.data.data
                convertedData.forEach((jobanditslogs) => { //but when I comment out this block it somehow changes the res.data log even though its before this even runs
                    jobanditslogs.JobLogs.forEach((joblog) => {
                        var formattedDate = moment(`${joblog.TimeLogged}`).format('llll') 
                        joblog.ActualTemp = Math.round(CtoF(joblog.ActualTemp))
                        joblog.SetPointTemp = Math.round(CtoF(joblog.SetPointTemp))
                        joblog.TimeLogged = formattedDate
                    })
                })
                console.log(convertedData) //temperatures changed from C to F, date changed (but somehow they are already changed above?)
                setJobs(convertedData)
            } else {
                console.log(res)
            }
        }).catch((err) => {
            console.log(err)
        })
    }, [jobRefresh])

    const tempHandler = async () => {
        const currentTemp = tempRef.current;
        if (device.traits["sdm.devices.traits.ThermostatMode"].mode === "COOL") {
            console.log("hicool" + currentTemp)
            await axios.post(`https://smartdevicemanagement.googleapis.com/v1/enterprises/${project_id}/devices/${deviceId}:executeCommand`, {
                command: "sdm.devices.commands.ThermostatTemperatureSetpoint.SetCool",
                params: {
                    "coolCelsius": FtoC(currentTemp)
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${nestTokens.access_token}`
                }
            }
            ).then((res) => {
                if (res.status === 200) {
                    console.log(res)
                    setDeviceRefresh(!deviceRefresh) //something stupid to call the single device endpoint again and let the user see the new temp that they set
                    setResponseMessage('Temperature successfully set.')
                    setTimeout(() => {
                        setAlertOpen(false)
                        setResponseMessage('')
                    }, 5000)
                } else {
                    console.log(res)
                    setResponseMessage('Something went wrong.')
                    setTimeout(() => {
                        setAlertOpen(false)
                        setResponseMessage('')
                    }, 5000)
                }
            }).catch((err) => {
                console.log(err)
            })
        } else if (device.traits["sdm.devices.traits.ThermostatMode"].mode === "HEAT") {
            console.log("hiheat" + currentTemp)
            await axios.post(`https://smartdevicemanagement.googleapis.com/v1/enterprises/${project_id}/devices/${deviceId}:executeCommand`, {
                command: "sdm.devices.commands.ThermostatTemperatureSetpoint.SetHeat",
                params: {
                    "heatCelsius": FtoC(currentTemp)
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${nestTokens.access_token}`
                }
            }
            ).then((res) => {
                if (res.status === 200) {
                    console.log(res)
                    setDeviceRefresh(!deviceRefresh)
                    setResponseMessage('Temperature successfully set.')
                    setTimeout(() => {
                        setAlertOpen(false)
                        setResponseMessage('')
                    }, 5000)
                } else {
                    console.log(res)
                    setResponseMessage('Something went wrong.')
                    setTimeout(() => {
                        setAlertOpen(false)
                        setResponseMessage('')
                    }, 5000)
                }
            }).catch((err) => {
                console.log(err)
            })
        } else { //do cases for heatcool, eco, and off
            console.log('Thermostat is in heatcool mode or off')
        }
    }

    const deleteJob = async (id) => {
        await axios.delete(`/logjob/${id}/delete`)
        .then((res) => {
            if (res.status === 200) { //needs confirmation window before deletion
                console.log('Successfully deleted the job')
                console.log(res.data)
                setResponseMessage(res.data.message)
                setJobRefresh(!jobRefresh)
                setDeleteConfOpen(false)
                setJobToDeleteId('')
                setTimeout(() => {
                    setAlertOpen(false)
                    setResponseMessage('')
                }, 5000)
            } else if (res.status === 404) {
                console.log('The job was not found')
                console.log(res.data)
                setResponseMessage(res.data.message)
                setTimeout(() => {
                    setAlertOpen(false)
                    setResponseMessage('')
                }, 5000)
            }
        }).catch((err) => {
            console.log(err)
        })
       //alert(`The id passed is ${id}`)
    }

    useEffect(() => {
        if (responseMessage.length > 0) {
            setAlertOpen(true)
        }
    }, [responseMessage])

    useEffect(() => {
        if (jobToDeleteId.length > 0) {
            setDeleteConfOpen(true)
        }
    }, [jobToDeleteId])

    return (
        <>
            <Snackbar open={alertOpen} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
                <SnackbarContent message={responseMessage} sx={{ backgroundColor: '#7BF1A8', color: '#000' }}/>
            </Snackbar>
            <Modal open={deleteConfOpen} onClose={() => setDeleteConfOpen(false)}>
                <Fade in={deleteConfOpen}>
                <Box sx={{ bgcolor: '#7BF1A8', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', p: 4, borderRadius: '1rem' }}>
                    <Grid container direction="column" spacing={2}>
                        <Grid item>
                            <Typography variant="h4">Delete job</Typography>
                        </Grid>
                        <Grid item>
                            <Typography>Are you sure you want to delete the job {jobToDeleteId}?</Typography>
                        </Grid>
                        <Grid item>
                            <Grid container direction="row" alignItems="center" justifyContent="center" spacing={2} mt={0.5}>
                                <Grid item>
                                    <Button variant="contained" color="secondary" onClick={() => { setDeleteConfOpen(false); setJobToDeleteId(''); }}>Cancel</Button>
                                </Grid>
                                <Grid item>
                                    <Button variant="contained" color="error" onClick={() => deleteJob(jobToDeleteId)}>Yes, Delete</Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
                </Fade>
            </Modal>
            <Grid container direction="column" justifyContent="center" alignItems="center" mt={1} mb={3} spacing={3}>
                <Grid item>
                    { device &&
                        <Grow in={true}>
                            <Typography fontSize={'3rem'} variant="h3" textAlign="center">
                                {device.parentRelations[0].displayName.length === 0 ? 'No custom name set.' : device.parentRelations[0].displayName}
                            </Typography>
                        </Grow>
                    }
                </Grid>
                <Grid item>
                    { device && 
                        <>
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
                                            primary={`Target Temperature: ${getSetPointTemp(device)} F`}
                                            primaryTypographyProps={{ fontSize: '2rem' }}
                                            />
                                        </ListItem>
                                    </List>
                                </Box>
                            </Grow>
                        </>
                    }
                </Grid>
                <Grid item>
                    { device &&
                        <Grow in={true}>
                            <Box component="form" sx={{ backgroundColor: '#7BF1A8', borderRadius: '2rem', padding: '1rem', marginBottom: '2rem', marginLeft: '20rem', marginRight: '20rem' }}>
                                <Container>
                                    <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
                                        <Grid item>
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
                                        <Stack sx={{ height: 100 }} spacing={2} direction="row">
                                        <Slider
                                        sx={{color: '#000000'}}
                                        aria-label="Temperature"
                                        orientation="vertical"
                                        defaultValue={getSetPointTemp(device)}
                                        getAriaValueText={valuetext}
                                        valueLabelDisplay="auto"
                                        step={1}
                                        onChangeCommitted={handleChangeCommitted}
                                       min={50} 
                                        max={90}
                                                 /> </Stack>
                                            <TextField variant="outlined" color="secondary" label="Set temperature in F" onChange={(e) => setTemp(parseInt(e.target.value))} />
                                        </Grid> 
                                        <Grid item>
                                            <Button variant="contained" color="secondary" onClick={() => tempHandler()}>Set Temperature</Button>
                                        </Grid>
                                    </Grid>   
                                </Container>
                            </Box>
                        </Grow>
                    }
                </Grid>
                <Grid item>
                    { device && 
                        <Grow in={true}>
                            <Typography variant="h3">Your Jobs</Typography>
                        </Grow>
                    }
                </Grid>
                <Grid item>
                    { device &&
                        <Container>
                            <Grid container direction="row" justifyContent="center" spacing={5} marginBottom="2rem">
                                {jobs ? (jobs.map((job) => {
                                    return (
                                        <Grow in={true}>
                                            <Grid item>
                                                <ToolTip title={<>Job Name: {job.Id}<br/>Job Description: {job.Description}</>} arrow>
                                                    <Card sx={{ borderRadius: '2rem', bgcolor: (job.JobLogs === chartData ? 'primary.dark' : 'primary.main'), width: '15rem' }} elevation={(job.JobLogs === chartData ? 8 : 0)} key={job.Id}>
                                                        <CardContent>
                                                            <Grid container direction="row" justifyContent="space-between">
                                                                <Grid item>
                                                                    <Typography gutterBottom variant="h6" color='#000' component="div">
                                                                        <div onClick={() => setChartData(job.JobLogs)} style={{ cursor: 'pointer' }}>
                                                                            {(job.Id.length > 17 ? `${job.Id.substr(0, 13)}...` : job.Id)}
                                                                        </div>
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item>
                                                                    <Grid container justifyContent="flex-end">
                                                                        <Grid item>
                                                                            <div onClick={() => alert(`Pause job ${job.Id}`)} style={{ cursor: 'pointer' }}>
                                                                                <ToolTip title="Pause Job">
                                                                                    <PauseCircleIcon />
                                                                                </ToolTip>
                                                                            </div>
                                                                        </Grid>
                                                                        <Grid item>
                                                                            <div onClick={() => setJobToDeleteId(job.Id)} style={{ cursor: 'pointer' }}>
                                                                                <ToolTip title="Delete Job">
                                                                                    <DeleteIcon />
                                                                                </ToolTip>
                                                                            </div>
                                                                        </Grid>
                                                                    </Grid>
                                                                </Grid>
                                                            </Grid>
                                                            <Grid container direction="column">
                                                                <Grid item>
                                                                    <Typography variant="body2" color='#000'>
                                                                        <div onClick={() => setChartData(job.JobLogs)} style={{ cursor: 'pointer' }}>
                                                                            {(job.Description.length > 36 ? `${job.Description.substr(0, 32)}...` : job.Description)}
                                                                        </div>
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>
                                                        </CardContent>
                                                    </Card>
                                                </ToolTip>
                                            </Grid>
                                        </Grow>
                                    )
                                })) : (<Typography variant="h6" color={ switched ? 'primary.main' : 'secondary.main' } sx={{ mt: '3rem', mb: '1rem', ml: '1.7rem' }}>You have no jobs set on this thermostat.</Typography>)}
                            </Grid>
                        </Container>
                    }
                </Grid>
                    { device && 
                        <>
                            { chartData ? //charts don't show up when in a grid item for some reason
                                (<ResponsiveContainer height={525}>
                                    <LineChart margin={{ bottom: 30, right: 100, left: 75 }} data={chartData}>
                                        <CartesianGrid stroke={(switched ? '#7BF1A8' : '#000')} strokeDasharray="3 3" />
                                        <XAxis dataKey="TimeLogged" stroke={(switched ? '#7BF1A8' : '#000')} angle={-55} height={170} dx={-50} dy={75}>
                                            <Label value="Dates Logged" position="bottom" style={{ fill: (switched ? '#7BF1A8' : '#000')}}/>
                                        </XAxis>
                                        <YAxis stroke={(switched ? '#7BF1A8' : '#000')}>
                                            <Label value='Temperature in Fahrenheit' angle={-90} position="left" dy={-90} dx={10} style={{ fill: (switched ? '#7BF1A8' : '#000')}}/>
                                        </YAxis>
                                        <Tooltip contentStyle={{ backgroundColor: (switched ? '#000' : '#fff'), borderColor: (switched ? '#000' : '#fff'), borderRadius: '1rem' }} labelStyle={{ color: (switched ? '#7BF1A8' : '#000')}}/>
                                        <Legend wrapperStyle={{ right: 75 }} verticalAlign="top" height={40}/>
                                        <Line type="monotone" dataKey="ActualTemp" stroke="#ff3333" activeDot={{ r: 8 }} name="Actual Temp"/>
                                        <Line type="monotone" dataKey="SetPointTemp" stroke="#3385ff" activeDot={{ r: 8 }} name="Set Point Temp"/>
                                    </LineChart>
                                </ResponsiveContainer>)
                                : 
                                (<ResponsiveContainer height={375}>
                                    <LineChart margin={{ bottom: 30, right: 100, left: 75 }}>
                                        <CartesianGrid stroke={(switched ? '#7BF1A8' : '#000')} strokeDasharray="3 3" />
                                        <XAxis>
                                            <Label value="Dates Logged" position="bottom" />
                                        </XAxis>
                                        <YAxis>
                                            <Label value='Temperature in Fahrenheit' angle={-90} position='left' dy={-90} dx={10}/>
                                        </YAxis>
                                        <Legend wrapperStyle={{ right: 75 }} verticalAlign="top" height={40}/>
                                        <Line stroke="#ff3333" name="Actual Temp"/>
                                        <Line stroke="#3385ff" name="Set Point Temp"/>
                                    </LineChart>
                                </ResponsiveContainer>)
                            }
                        </>
                    }
                    <Grid item>
                        { device &&
                            <Container>
                                <Grid container direction="row" justifyContent="space-around" alignItems="center" spacing={2}>
                                    <Grid item>
                                        { switched ?
                                            <Button variant="outlined" color="primary" size="large" startIcon={<AddCircleIcon/>}>Add Logging Job</Button>
                                            :
                                            <Button variant="contained" color="secondary" size="large" startIcon={<AddCircleIcon/>}>Add Logging Job</Button>
                                        }
                                    </Grid>
                                    <Grid item>
                                        { switched ?
                                            <Button variant="outlined" color="primary" size="large" startIcon={<AddCircleIcon/>}>Add Setting Job</Button>
                                            :
                                            <Button variant="contained" color="secondary" size="large" startIcon={<AddCircleIcon/>}>Add Setting Job</Button>
                                        }
                                    </Grid>
                                </Grid> 
                            </Container>
                        }
                    </Grid>
            </Grid>
        </>
    )
}

export default ThermoDashboard