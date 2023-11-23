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
import DarkModeSwitchContext from "../../Theming/DarkModeSwitchContext";
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
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import MenuItem from '@mui/material/MenuItem';
import RefreshIcon from '@mui/icons-material/Refresh';

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'
//axios.defaults.withCredentials = true //somehow this messes with the Google login?

const ThermoDashboard = () => {
    document.title = 'Nest Thermostat Dashboard'
    const { nestTokens, project_id, googleAccountInfo } = useContext(AuthContext)
    const { switched } = useContext(DarkModeSwitchContext)
    const { deviceId } = useParams() 
    const [device, setDevice] = useState(null)
    const [setPointTemp, setSetPointTemp] = useState(0)
    const [cool, setCool] = useState(0) //put cool and heat into one piece of state?
    const [heat, setHeat] = useState(0)
    const [deviceRefresh, setDeviceRefresh] = useState(false)
    const [jobRefresh, setJobRefresh] = useState(false)
    const [jobs, setJobs] = useState(null)
    const [chartData, setChartData] = useState(null) 
    const [alertOpen, setAlertOpen] = useState(false)
    const [deleteConfOpen, setDeleteConfOpen] = useState(false)
    const [addLogJobOpen, setAddLogJobOpen] = useState(false)
    const [jobToDeleteId, setJobToDeleteId] = useState(null)
    const [responseMessage, setResponseMessage] = useState('')
    const sliderValue = useRef(0)

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
        } else { //OFF
          setPointTemp = 0
        }
        return setPointTemp
    }

    const getRangeTemps = (thermostat) => {
        var coolTemp
        var heatTemp
        if (thermostat.traits["sdm.devices.traits.ThermostatMode"].mode === 'HEATCOOL') {
            coolTemp = Math.round(CtoF(thermostat.traits["sdm.devices.traits.ThermostatTemperatureSetpoint"].coolCelsius))
            heatTemp = Math.round(CtoF(thermostat.traits["sdm.devices.traits.ThermostatTemperatureSetpoint"].heatCelsius))
        } else if (thermostat.traits["sdm.devices.traits.ThermostatEco"].mode === 'MANUAL_ECO') {
           coolTemp = Math.round(CtoF(thermostat.traits["sdm.devices.traits.ThermostatEco"].coolCelsius))
           heatTemp = Math.round(CtoF(thermostat.traits["sdm.devices.traits.ThermostatEco"].heatCelsius))
        } else { //OFF
           coolTemp = 0
           heatTemp = 0
        }
        return [coolTemp, heatTemp]
    }

    const getMode = (thermostat) => {
        var mode
        if (thermostat.traits["sdm.devices.traits.ThermostatMode"].mode === 'HEAT' || 
            thermostat.traits["sdm.devices.traits.ThermostatMode"].mode === 'COOL' ||
            thermostat.traits["sdm.devices.traits.ThermostatMode"].mode === 'HEATCOOL') {
            mode = thermostat.traits["sdm.devices.traits.ThermostatMode"].mode
        } else if (thermostat.traits["sdm.devices.traits.ThermostatEco"].mode === 'MANUAL_ECO') {
            mode = thermostat.traits["sdm.devices.traits.ThermostatEco"].mode
        } else { //off
            mode = 'OFF'
        }
        return mode
    }

    const raiseResponseToast = (message) => {
        setResponseMessage(message)
        setTimeout(() => { 
            setAlertOpen(false)
            setResponseMessage('')
        }, 5000)
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
                setDevice(res.data) //#1 would be loop, #5 would be loop back here
            }
        }).catch((err) => {
            console.log(err)
        })
    }, [deviceRefresh])

    useEffect(() => { 
        if (device != null) {
            if (device.traits["sdm.devices.traits.ThermostatMode"].mode === "COOL" || device.traits["sdm.devices.traits.ThermostatMode"].mode === "HEAT") {
                //setSetPointTemp(getSetPointTemp(device)) //#2 would be loop
                console.log('Setting slider useRef')
                sliderValue.current = getSetPointTemp(device)
            } else if (device.traits["sdm.devices.traits.ThermostatMode"].mode === 'HEATCOOL' || device.traits["sdm.devices.traits.ThermostatEco"].mode === 'MANUAL_ECO') {
                console.log('Setting temp range')
                var temps = getRangeTemps()
                setCool(temps[0])
                setHeat(temps[1])
            } else { //OFF
                console.log('Thermostat is probably off.')
            }
        }
    }, [device])

    useEffect(() => {

        axios.get(`/logjobs?googleId=${googleAccountInfo.id}&thermostatId=${deviceId}`)
        .then((res) => {
            if (res.status === 200) { 
                console.log(res.data) //raw data from Django, temp unconverted (How are the temps already converted in the console before the forEach functions run below?)
                var convertedData = []
                convertedData = res.data.data
                convertedData.forEach((jobanditslogs) => { //but when I comment out this block it somehow changes the res.data log even though its before this even runs
                    jobanditslogs.JobLogs.forEach((joblog) => { //change this when the schema changes
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
            if (err.status === 404) {
                console.log('No jobs exist, Not Found')
                console.log(err.data)
            } else if (err.status === 500) {
                console.log("Server probably isn't started, Internal Server Error")
                console.log(err.data)
            } else {
                console.log(err)
            }
        })

    }, [jobRefresh])

    const sliderTempHandler = async () => {
        if (device.traits["sdm.devices.traits.ThermostatMode"].mode === "COOL") {
            await axios.post(`https://smartdevicemanagement.googleapis.com/v1/enterprises/${project_id}/devices/${deviceId}:executeCommand`, {
                command: "sdm.devices.commands.ThermostatTemperatureSetpoint.SetCool",
                params: {
                    "coolCelsius": FtoC(setPointTemp)
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${nestTokens.access_token}`
                }
            }
            ).then((res) => {
                if (res.status === 200) {
                    console.log('Cool setpoint temp changed')
                    console.log(res) 
                    raiseResponseToast('Temperature successfully set.')
                    setDeviceRefresh(!deviceRefresh) //#4 would be loop
                }
            }).catch((err) => {
                console.log(err)
                raiseResponseToast(err.response.data.error.message)
            })
        } else if (device.traits["sdm.devices.traits.ThermostatMode"].mode === "HEAT") {
            await axios.post(`https://smartdevicemanagement.googleapis.com/v1/enterprises/${project_id}/devices/${deviceId}:executeCommand`, {
                command: "sdm.devices.commands.ThermostatTemperatureSetpoint.SetHeat",
                params: {
                    "heatCelsius": FtoC(setPointTemp)
                }
            }, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${nestTokens.access_token}`
                }
            }
            ).then((res) => {
                if (res.status === 200) {
                    console.log('Heat setpoint temp changed')
                    console.log(res)
                    raiseResponseToast('Temperature successfully set.')
                    setDeviceRefresh(!deviceRefresh) //#4 would be loop
                }
            }).catch((err) => {
                console.log(err)
                raiseResponseToast(err.response.data.error.message)
            })
        } else {
            console.log('Thermostat is probably off.')
        }
    }

    useEffect(() => {
        if (device) {
            const delay = setTimeout(() => {
                sliderTempHandler() //#3 would be loop
            }, 2000)
            return () => clearTimeout(delay)
        }
    }, [setPointTemp])

    const rangeTempHandler = () => {
        alert(`Cool: ${Math.round(cool)}, Heat: ${Math.round(heat)}`) //convert to C
    }

    const deleteJob = async (id) => {
        await axios.delete(`/logjob/${id}/delete`)
        .then((res) => {
            if (res.status === 200) {
                console.log('Successfully deleted the job')
                console.log(res.data)
                setJobRefresh(!jobRefresh)
                setDeleteConfOpen(false)
                setJobToDeleteId(null)
                raiseResponseToast(res.data.message)
            }

            // reset chartData so chart isn't showing deleted logs
            setChartData(null)

        }).catch((err) => {
           if (err.status === 404) {
                console.log('The job was not found')
                console.log(err.data)
                raiseResponseToast(err.data.message) //modal still up, will toast be seen?
                //catch 500?
           } else {
                console.log(err)
           }
        })
    }

    useEffect(() => {
        if (responseMessage.length > 0) {
            setAlertOpen(true)
        }
    }, [responseMessage])

    useEffect(() => {
        if (jobToDeleteId != null) {
            setDeleteConfOpen(true)
        }
    }, [jobToDeleteId])

    // states for modal form submission
    const [modalInput, setModalInput] = React.useState(60);
    const [timeType, setTimeType] = React.useState(null);


    useEffect(() => {
        console.log("modalInput = " + modalInput);
        console.log("timeType = " + timeType);
    },[modalInput, timeType])


    useEffect(() => {
        console.log("jobs");
        console.log(jobs);

        // for refresh
        if (chartData !== undefined && chartData != null && jobs !== undefined && jobs != null) {
            for (const job of jobs) {
                if (chartData[0].JobId === job.Id) {
                    setChartData(job.JobLogs)
                }
            }
        }

    }, [jobs])


    // auto refresh collection of logs every minute for "real-time" graphs
    useEffect(() => {

        const jobRefreshInterval = setInterval(() => {

            console.log("ping!")
            setJobRefresh(refresh => !refresh)

        }, 60000)

        return () => {
            clearInterval(jobRefreshInterval)
        }

    }, [])

    useEffect(() => {
        console.log(chartData)
    }, [chartData])

    // restrict modal input
    const handleInput = (input) => {
        // find way to forbid ., e, +, - characters? input is a string, and TextField with type="number" allows those chars
        // Should display error message if user tries to type those and non-integers
        input = Number(input) | 0   // cast so the number actually shows up in modal form. Bitwise OR to force integer
        // limit input. Somehow disallow user to submit log every 1 minute? That would be an excessive amount of logs
        if (input < 1) {
            input = null    // make sure null is not submitted in post request, or maybe make the modalInput state's purpose only for display, submit actual form value?
        } else if (input > 60) {
            input = 60
        }
        setModalInput(input)
    }

    const submitAddJob = async (data) => { //if blah blah blah wrong stuff, return; make sure nothing is empty. Render error text in modal? Trim whitespace
        const reqbody = {
            name: data.target.name.value,
            description: data.target.description.value,
            number: data.target.number.value,
            timeType: data.target.timeType.value,
            refresh_token: nestTokens.refresh_token,
            deviceId: deviceId,
            googleId: googleAccountInfo.id,
        }
        await axios.post(`/logjob`, reqbody)
        .then((res) => {
            if (res.status === 201) {
                console.log('Successfully added the job')
                console.log(res.data)
                setJobRefresh(!jobRefresh)
                setAddLogJobOpen(false)
                raiseResponseToast(res.data.message)
            }
        })
        .catch((err) => {
            if (err.status === 400) {
                console.log('Bad request')
                console.log(err.data)
                raiseResponseToast(err.data.message) //modal still up, will toast be seen?
            } else if (err.status === 500) {
                console.log('Internal Server Error')
                console.log(err.data)
                raiseResponseToast(err.data.message) //modal still up, will toast be seen?
            } else {
                console.log(err)
            }
        })
    }
     
    const timeValues = [ // Time options 
        {
            value: "minutes", 
            label: "minutes", 
        }, 
        {
            value: "hours",  
            label: "hours"
        }, 
        {
            value: "days", 
            label: "days",
        }
    ]

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
                                    <Button variant="contained" color="secondary" onClick={() => { setDeleteConfOpen(false); setJobToDeleteId(null); }}>Cancel</Button>
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
            {/* changeLog dialogue*/}
            <div style={{textAlign: 'center'}}>
                <Dialog open={addLogJobOpen} onClose={() => setAddLogJobOpen(false)}>
                    <DialogTitle> Thermostat 1 Log Setting </DialogTitle>
                        <form onSubmit={(e) => {e.preventDefault(); submitAddJob(e);}}>
                            <DialogContent>  
                                <DialogContentText> Set the Log: </DialogContentText>
                                <TextField
                                    id="job-name"
                                    name="name"
                                    label="Job Name"
                                    type="text"
                                    margin="dense"
                                    fullWidth
                                    defaultValue={"Job name"}
                                    InputLabelProps={{shrink: true}}
                                    inputProps={{ max:200 }}
                                />
                                <TextField
                                    id="job-description"
                                    name="description"
                                    label="Description"
                                    type="text"
                                    margin="dense"
                                    fullWidth
                                    InputLabelProps={{shrink: true}}
                                    inputProps={{ max:200 }}
                                />
                                <TextField
                                    id="outlined-number"
                                    name="number"
                                    label="Number"
                                    type="number"
                                    margin="dense"
                                    fullWidth
                                    value={modalInput}
                                    onChange={(e) => handleInput(e.target.value)}
                                    InputLabelProps={{shrink: true,}}
                                    inputProps={{ min: 1, max: 60 }}
                                />
                                <TextField
                                    id="select-time"
                                    name="timeType"
                                    select
                                    label = "Select"
                                    defaultValue="days"
                                    helperText="Please Select a time"
                                    margin="dense"
                                >
                                    {timeValues.map((option) => (
                                        <MenuItem key={option.value} value={option.value}>
                                            {option.label}
                                        </MenuItem>
                                    ))}
                                </TextField>
                            </DialogContent>
                            <DialogActions> 
                                <Button onClick={() => setAddLogJobOpen(false)} color="secondary"> Cancel </Button>
                                <Button type="submit" onClick={() => setAddLogJobOpen(false)} color="primary"> Save </Button>
                            </DialogActions>
                        </form>
                </Dialog>
            </div>
            <Grid container direction="column" justifyContent="center" alignItems="center" mt={1} mb={3} spacing={3}>
                <Grid item>
                    { device &&
                        <Grow in={true}>
                            <Typography fontSize={'3rem'} variant="h3" textAlign="center" mb={2}>
                                {device.parentRelations[0].displayName.length === 0 ? 'No custom name set.' : device.parentRelations[0].displayName}
                            </Typography>
                        </Grow>
                    }
                </Grid>
                <Grid item>
                    { device && ( //device in cool mode or heat mode
                    device.traits["sdm.devices.traits.ThermostatMode"].mode === 'COOL' || device.traits["sdm.devices.traits.ThermostatMode"].mode === 'HEAT' ? ( 
                        <Grow in={true}>
                            <Grid container direction="row" justifyContent="center" alignItems="center" spacing={5} mb={5}>
                                <Grid item>
                                    <Stack sx={{ height: '20rem' }}>
                                        <Slider sx={{ color: (switched ? "#7BF1A8" : "#000")}} 
                                        orientation="vertical" 
                                        defaultValue={getSetPointTemp(device)} 
                                        step={1} 
                                        min={50} 
                                        max={90} 
                                        valueLabelDisplay="auto" 
                                        onChange={(e) => { setSetPointTemp(parseInt(e.target.value)); sliderValue.current = parseInt(e.target.value); }}
                                        /> 
                                    </Stack>
                                </Grid>
                                <Grid item>
                                    <ToolTip title={
                                        <>
                                            <Typography>
                                                Set Point Temperature: {sliderValue.current}°F
                                            </Typography><br/>
                                            <Typography>
                                                Actual Temperature: {Math.round(CtoF(device.traits["sdm.devices.traits.Temperature"].ambientTemperatureCelsius))}°F
                                            </Typography><br/>
                                            <Typography>
                                                Humidity: {device.traits["sdm.devices.traits.Humidity"].ambientHumidityPercent}%
                                            </Typography><br/>
                                            <Typography>
                                                Mode: {getMode(device)}
                                            </Typography>
                                        </>
                                    } placement="right-start">
                                        <Paper sx={{ width: '20rem', height: '20rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: (switched ? "#7BF1A8" : "#000")}}>
                                            <Typography variant="h1" color={switched ? "#000" : "#fff"}>{`${sliderValue.current}°`}</Typography>
                                        </Paper>
                                    </ToolTip>
                                </Grid>
                            </Grid>
                        </Grow>
                    ) : ( //heatcool or eco mode
                        <>
                        <center> {/*lol, lmao even */}
                            <Grow in={true}>
                                <Box sx={{ backgroundColor: '#7BF1A8', borderRadius: '2rem', width: '40rem' }} mb={3}>
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
                                            primary={`Current Temperature: ${Math.round(CtoF(device.traits["sdm.devices.traits.Temperature"].ambientTemperatureCelsius))}°F`}
                                            primaryTypographyProps={{ fontSize: '2rem'}}
                                            />
                                        </ListItem>
                                        <Divider variant="middle" />
                                        <ListItem>
                                            <ListItemText 
                                            primary={`Mode: ${getMode(device)}`}
                                            primaryTypographyProps={{ fontSize: '2rem' }}
                                            />
                                        </ListItem> {/*Add list items for heat and cool, show eco mode leaf somewhere */}
                                    </List>
                                </Box>
                            </Grow>
                            </center>
                            <Grow in={true}>
                                <Box component="form" sx={{ backgroundColor: '#7BF1A8', borderRadius: '2rem', padding: '1rem', marginBottom: '2rem', marginLeft: '20rem', marginRight: '20rem' }}>
                                    <Container>
                                        <Grid container direction="column" justifyContent="center" alignItems="center" spacing={2}>
                                            <Grid item>
                                                <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
                                                    <Grid item>
                                                        <TextField type="number" variant="outlined" color="secondary" label="Set cool in F" onChange={(e) => setCool(parseInt(e.target.value))}/>
                                                    </Grid>
                                                    <Grid item>
                                                        <TextField type="number" variant="outlined" color="secondary" label="Set heat in F" onChange={(e) => setHeat(parseInt(e.target.value))}/>
                                                    </Grid>
                                                </Grid>
                                            </Grid> 
                                            <Grid item>
                                                <Button variant="contained" color="secondary" onClick={() => rangeTempHandler()}>Set Temperature</Button>
                                            </Grid>
                                        </Grid>   
                                    </Container>
                                </Box>
                            </Grow>
                        </>
                        )
                    )
                    }
                </Grid>
                <Grid item>
                    { device && 
                        <ToolTip title="Refresh jobs" placement="right">
                            <div style={{ cursor: 'pointer' }} onClick={() => { console.log('Refreshing jobs'); setJobRefresh(!jobRefresh); }}>
                                <Typography variant="h3">Your Jobs</Typography>
                            </div>
                        </ToolTip>
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
                                                <ToolTip title={<>Job Name: {job.name}<br/>Job Description: {job.Description}</>} arrow>
                                                    <Card sx={{ borderRadius: '2rem', bgcolor: (job.JobLogs === chartData ? 'primary.dark' : 'primary.main'), width: '15rem' }} elevation={(job.JobLogs === chartData ? 8 : 0)} key={job.Id}>
                                                        <CardContent>
                                                            <Grid container direction="row" justifyContent="space-between">
                                                                <Grid item>
                                                                    <Typography gutterBottom variant="h6" color='#000' component="div">
                                                                        <div onClick={() => setChartData(job.JobLogs)} style={{ cursor: 'pointer' }}>
                                                                            {(job.name.length > 17 ? `${job.name.substr(0, 13)}...` : job.name)}
                                                                        </div>
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item>
                                                                    <Grid container justifyContent="flex-end">
                                                                        <Grid item>
                                                                            <div onClick={() => alert(`Pause job ${job.name}`)} style={{ cursor: 'pointer' }}>
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
                                        <Line type="monotone" dataKey="ActualTemp" stroke="#9900ff" activeDot={{ r: 8 }} name="Actual Temp"/>
                                        <Line type="monotone" dataKey="SetPointTemp" stroke="#ff8000" activeDot={{ r: 8 }} name="Set Point Temp"/>
                                        <Line type="monotone" dataKey="Heat" stroke="#ff3333" activeDot={{ r: 8 }} name="Heat"/>
                                        <Line type="monotone" dataKey="Cool" stroke="#3385ff" activeDot={{ r: 8 }} name="Cool"/>
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
                                        <Line stroke="#9900ff" name="Actual Temp"/>
                                        <Line stroke="#ff8000" name="Set Point Temp"/>
                                        <Line stroke="#ff3333" name="Heat"/>
                                        <Line stroke="#3385ff" name="Cool"/>
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
                                        <Button variant={switched ? "outlined" : "contained"} color={switched ? "primary" : "secondary"} size="large" startIcon={<AddCircleIcon/>} onClick={() => setAddLogJobOpen(true)}>Add Logging Job</Button>
                                    </Grid>
                                    <Grid item>
                                        <Button variant={switched ? "outlined" : "contained"} color={switched ? "primary" : "secondary"} size="large" startIcon={<AddCircleIcon/>}>Add Setting Job</Button>
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