import React, { useContext, useEffect, useState } from "react";
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
import MenuItem from '@mui/material/MenuItem';
import DownloadIcon from '@mui/icons-material/Download';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import ButtonGroup from "@mui/material/ButtonGroup";
import AcUnitIcon from '@mui/icons-material/AcUnit';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import EnergySavingsLeafIcon from '@mui/icons-material/EnergySavingsLeaf';

axios.defaults.xsrfCookieName = 'csrftoken'
axios.defaults.xsrfHeaderName = 'X-CSRFToken'

const ThermoDashboard = () => {
    document.title = 'Nest Thermostat Dashboard'
    const { nestTokens, project_id, googleAccountInfo } = useContext(AuthContext)
    const { switched } = useContext(DarkModeSwitchContext)
    const { deviceId } = useParams() 
    const [device, setDevice] = useState(null)
    const [setPointTemp, setSetPointTemp] = useState(0)
    const [tempRange, setTempRange] = useState({ Cool: 0, Heat: 0 })
    const [deviceRefresh, setDeviceRefresh] = useState(false)
    const [jobRefresh, setJobRefresh] = useState(false)
    const [jobs, setJobs] = useState(null)
    const [chartData, setChartData] = useState(null) 
    const [alertOpen, setAlertOpen] = useState(false)
    const [deleteConfOpen, setDeleteConfOpen] = useState(false)
    const [addLogJobOpen, setAddLogJobOpen] = useState(false)
    const [addSetJobOpen, setAddSetJobOpen] = useState(false)
    const [jobToDeleteInfo, setJobToDeleteInfo] = useState({ Id: null, Name: null })
    const [responseMessage, setResponseMessage] = useState('')
    const [errors, setErrors] = useState(null)
    const [sliderDisplayValue, setSliderDisplayValue] = useState(0)
    const [sliderRefresh, setSliderRefresh] = useState(false)

    const CtoF = (cTemp) => {
        return (cTemp * 9/5) + 32
    }

    const FtoC = (fTemp) => {
        return (fTemp - 32) * 5/9
    }

    const getSetPointTemp = (thermostat) => { //safe
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
        if (thermostat.traits["sdm.devices.traits.ThermostatEco"].mode === 'MANUAL_ECO') { //eco has priority, first precedence
            coolTemp = Math.round(CtoF(thermostat.traits["sdm.devices.traits.ThermostatEco"].coolCelsius))
            heatTemp = Math.round(CtoF(thermostat.traits["sdm.devices.traits.ThermostatEco"].heatCelsius))
        } else if (thermostat.traits["sdm.devices.traits.ThermostatMode"].mode === 'HEATCOOL') {
            coolTemp = Math.round(CtoF(thermostat.traits["sdm.devices.traits.ThermostatTemperatureSetpoint"].coolCelsius))
            heatTemp = Math.round(CtoF(thermostat.traits["sdm.devices.traits.ThermostatTemperatureSetpoint"].heatCelsius))
        } else { //OFF
           coolTemp = 0
           heatTemp = 0
        }
        return { coolTemp, heatTemp }
    }

    const getMode = (thermostat) => {
        var mode
        if (thermostat.traits["sdm.devices.traits.ThermostatEco"].mode === 'MANUAL_ECO') { //eco has priority
            mode = thermostat.traits["sdm.devices.traits.ThermostatEco"].mode
        } else if (thermostat.traits["sdm.devices.traits.ThermostatMode"].mode === 'HEAT' || 
            thermostat.traits["sdm.devices.traits.ThermostatMode"].mode === 'COOL' ||
            thermostat.traits["sdm.devices.traits.ThermostatMode"].mode === 'HEATCOOL') {
            mode = thermostat.traits["sdm.devices.traits.ThermostatMode"].mode
        } else { //OFF
            mode = 'OFF'
        }
        return mode
    }

    const getFormattedModeName = (rawMode) => {
        if (rawMode === 'MANUAL_ECO') {
            return 'Eco'
        } else if (rawMode === 'HEAT') {
            return 'Heat'
        } else if (rawMode === 'COOL') {
            return 'Cool'
        } else if (rawMode === 'HEATCOOL') {
            return 'Heat • Cool'
        } else {
            return 'Off'
        }
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
                setDevice(null) //so conditional rendering can reset?
                setTimeout(() => {
                    setDevice(res.data)
                }, 500)
            }
        }).catch((err) => {
            console.log(err)
        })
    }, [deviceRefresh]) 

    useEffect(() => {
        if (device) {
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
                }
            }).catch((err) => {
                console.log(err)
            })
        }
    }, [sliderRefresh]) //same call as above but the slider component doesn't have to pop out and back in from moving it

    useEffect(() => { 
        if (device) {
            if (getMode(device) === 'MANUAL_ECO') { //don't waste time setting anything that doesn't need to be set
                return
            } else if (getMode(device) === "COOL" || getMode(device) === "HEAT") {
                console.log('Setting slider value')
                setSliderDisplayValue(getSetPointTemp(device)) //state that doesn't live in any dependency array so there's no side effect issues
                console.log(`sliderValue: ${sliderDisplayValue}`) 
            } else if (getMode(device) === 'HEATCOOL') {
                console.log('Setting temp range')
                setTempRange({ Cool: getRangeTemps(device).coolTemp, Heat: getRangeTemps(device).heatTemp })
            } else { //OFF
                console.log('Thermostat is probably off.')
            }
        }
    }, [device])

    useEffect(() => {
        axios.get(`/jobs?googleId=${googleAccountInfo.id}&thermostatId=${deviceId}`)
        .then((res) => {
            if (res.status === 200) { 
                console.log(res.data) //raw data from Django, temp unconverted (How are the temps already converted in the console before the forEach functions run below?)
                var convertedData = []
                convertedData = res.data.data
                //if statement here to not do conversions if the job is a setting job?
                convertedData.forEach((jobanditslogs) => { //but when I comment out this block it somehow changes the res.data log even though its before this even runs
                    jobanditslogs.JobLogs.forEach((joblog) => { //some are null in db, if the conversion is applied to null, it becomes 0, 0 C is 32 F, so the if statements make sure nulls aren't being converted
                        if (joblog.ActualTemp !== null) {
                            joblog.ActualTemp = Math.round(CtoF(joblog.ActualTemp))
                        }
                        if (joblog.SetPointTemp !== null) {
                            joblog.SetPointTemp = Math.round(CtoF(joblog.SetPointTemp))
                        }
                        if (joblog.HeatTemp !== null) {
                            joblog.HeatTemp = Math.round(CtoF(joblog.HeatTemp))
                        }
                        if (joblog.CoolTemp !== null) {
                            joblog.CoolTemp = Math.round(CtoF(joblog.CoolTemp))
                        }
                        joblog.TimeLogged = moment(`${joblog.TimeLogged}`).format('llll')
                    })
                    jobanditslogs.DateCreated = moment(`${jobanditslogs.DateCreated}`).format('llll')
                })
                console.log(convertedData) //temperatures changed from C to F, date changed (but somehow they are already changed above?)
                setJobs(convertedData)
            } else {
                console.log(res)
            }
        }).catch((err) => {
            if (err.response.data.status === 404) {
                console.log('No jobs exist, Not Found')
                console.log(err.response.data)
            } else if (err.response.status === 500) { //not from api view response
                console.log("Server probably isn't started, Internal Server Error")
                console.log(err.response)
            } else {
                console.log(err)
            }
        })

    }, [jobRefresh])

    const changeMode = async (mode) => {
        if (getMode(device) === mode) { //if the mode of the device in state is the same as the mode from the button (could make another device call here to ensure device JSON in state's mode is the same as the device from Google API's mode (refresh button to recall device like the one with jobs?))
            if (mode === 'MANUAL_ECO') { //eco has priority
                raiseResponseToast('The thermostat is already in eco mode.')
            } else if (mode === 'COOL') {
                raiseResponseToast('The thermostat is already in cool mode.')
            } else if (mode === 'HEATCOOL') {
                raiseResponseToast('The thermostat is already in heatcool mode.')
            } else if (mode === 'HEAT') {
                raiseResponseToast('The thermostat is already in heat mode.')
            } else { //off
                raiseResponseToast('The thermostat is off.') //There is no button to turn thermo off, add one?
            }
        } else {
            if (mode === 'MANUAL_ECO') { //eco has priority
                await axios.post(`https://smartdevicemanagement.googleapis.com/v1/enterprises/${project_id}/devices/${deviceId}:executeCommand`, {
                    command: "sdm.devices.commands.ThermostatEco.SetMode",
                    params: {
                        mode: "MANUAL_ECO"
                    }
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${nestTokens.access_token}`
                    }
                }).then((res) => {
                    if (res.status === 200) {
                        console.log('Successfully set to eco mode')
                        console.log(res)
                        raiseResponseToast('Successfully set to eco mode.')
                        setDeviceRefresh(!deviceRefresh)
                    }
                }).catch((err) => {
                    console.log(err)
                    raiseResponseToast(err.response.data.error.message)
                })
            } else if (mode === 'COOL') {
                await axios.post(`https://smartdevicemanagement.googleapis.com/v1/enterprises/${project_id}/devices/${deviceId}:executeCommand`, {
                    command: "sdm.devices.commands.ThermostatMode.SetMode",
                    params: {
                        mode: "COOL"
                    }
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${nestTokens.access_token}`
                    }
                }).then((res) => {
                    if (res.status === 200) {
                        console.log('Successfully set to cool mode')
                        console.log(res)
                        raiseResponseToast('Successfully set to cool mode.')
                        setDeviceRefresh(!deviceRefresh)
                    }
                }).catch((err) => {
                    console.log(err)
                    raiseResponseToast(err.response.data.error.message)
                })
            } else if (mode === 'HEATCOOL') {
                await axios.post(`https://smartdevicemanagement.googleapis.com/v1/enterprises/${project_id}/devices/${deviceId}:executeCommand`, {
                    command: "sdm.devices.commands.ThermostatMode.SetMode",
                    params: {
                        mode: "HEATCOOL"
                    }
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${nestTokens.access_token}`
                    }
                }).then((res) => {
                    if (res.status === 200) {
                        console.log('Successfully set to heatcool mode')
                        console.log(res)
                        raiseResponseToast('Successfully set to heatcool mode.')
                        setDeviceRefresh(!deviceRefresh)
                    }
                }).catch((err) => {
                    console.log(err)
                    raiseResponseToast(err.response.data.error.message)
                })
            } else { //HEAT (do we need to catch if thermostat is off? but OFF isn't a provided button)
                await axios.post(`https://smartdevicemanagement.googleapis.com/v1/enterprises/${project_id}/devices/${deviceId}:executeCommand`, {
                    command: "sdm.devices.commands.ThermostatMode.SetMode",
                    params: {
                        mode: "HEAT"
                    }
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${nestTokens.access_token}`
                    }
                }).then((res) => {
                    if (res.status === 200) {
                        console.log('Successfully set to heat mode')
                        console.log(res)
                        raiseResponseToast('Successfully set to heat mode.')
                        setDeviceRefresh(!deviceRefresh)
                    }
                }).catch((err) => {
                    console.log(err)
                    raiseResponseToast(err.response.data.error.message)
                })
            }
        }
    }

    const sliderTempHandler = async () => { //safe
        if (getMode(device) === "COOL") {
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
                    //setDeviceRefresh(!deviceRefresh) 
                    setSliderRefresh(!sliderRefresh)
                }
            }).catch((err) => {
                console.log(err)
                raiseResponseToast(err.response.data.error.message)
            })
        } else if (getMode(device) === "HEAT") {
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
                    //setDeviceRefresh(!deviceRefresh)
                    setSliderRefresh(!sliderRefresh)
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
                sliderTempHandler() 
            }, 2000)
            return () => clearTimeout(delay)
        }
    }, [setPointTemp])

    const rangeTempHandler = async () => { //Apparently only for heatcool mode, API has no command to set range in eco mode
        setErrors(null)
        var errorlist = []
        if (tempRange.Cool < tempRange.Heat) {
            errorlist.push('Cool temperature must be higher than heat temperature.')
        }
        if (tempRange.Cool <= 0 || tempRange.Heat <= 0) {
            errorlist.push('The temperatures cannot be negative, empty, or 0.')
        }
        if (tempRange.Cool < 50 || tempRange.Cool > 90 || tempRange.Heat < 50 || tempRange.Heat > 90) {
            errorlist.push('The temperatures need to be within 50 to 90 °F.')
        }
        if (tempRange.Cool === getRangeTemps(device).coolTemp && tempRange.Heat === getRangeTemps(device).heatTemp) {
            errorlist.push('The thermostat already has these temperatures for the range.')
        }

        if (errorlist.length > 0) {
            console.log('Range temp: there are errors')
            setErrors(errorlist)
        } else {
            console.log('Range temp: there are no errors')
            setErrors(null)
            if (getMode(device) === 'HEATCOOL') {
                console.log('Thermostat is in heatcool mode')
                await axios.post(`https://smartdevicemanagement.googleapis.com/v1/enterprises/${project_id}/devices/${deviceId}:executeCommand`, {
                    command: "sdm.devices.commands.ThermostatTemperatureSetpoint.SetRange",
                    params: {
                        "heatCelsius": FtoC(tempRange.Heat),
                        "coolCelsius": FtoC(tempRange.Cool)
                    }
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${nestTokens.access_token}`
                    }
                }).then((res) => {
                    if (res.status === 200) {
                        console.log('Heatcool range successfully set')
                        console.log(res)
                        raiseResponseToast('Temperature range successfully set.')
                        setDeviceRefresh(!deviceRefresh)
                    }
                }).catch((err) => {
                    console.log(err)
                    raiseResponseToast(err.response.data.error.message)
                })
            } else { //OFF
                console.log('Thermostat is probably off')
            }
        }
    }

    const deleteJob = async (id) => {
        await axios.delete(`/job/${id}/delete`)
        .then((res) => {
            if (res.status === 200) {
                console.log('Successfully deleted the job')
                console.log(res.data)
                setJobs(jobs.filter((job) => (job.Id !== id)))
                setDeleteConfOpen(false)
                setJobToDeleteInfo({ Id: null, Name: null })
                raiseResponseToast(res.data.message)
                setChartData(null)  // reset chartData so chart isn't showing deleted logs
            }
        }).catch((err) => {
           if (err.response.data.status === 404) {
                console.log('The job was not found')
                console.log(err.response.data)
                setDeleteConfOpen(false)
                setJobToDeleteInfo({ Id: null, Name: null })
                raiseResponseToast(err.response.data.message)
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
        if (jobToDeleteInfo.Id !== null || jobToDeleteInfo.Name !== null) {
            setDeleteConfOpen(true)
        }
    }, [jobToDeleteInfo])

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
            setJobRefresh(refresh => !refresh)
        }, 30000)
        return () => {
            clearInterval(jobRefreshInterval)
        }
    }, [])

    /*const getMinYBound = (data) => {
        var bound = data.reduce((min, i) => {
                if (i.ActualTemp < min) {
                    return i.ActualTemp

                } else if (i.SetPointTemp < min) {
                    return i.SetPointTemp
                } else {
                    return min
                }
            },
            data[0].ActualTemp)
        bound -= 10
        bound = Math.round(bound/5) * 5 // make graph nice, round values by 5's
        return bound
    }*/

    /*const getMaxYBound = (data) => {
        var bound = data.reduce((max, i) => {
            if (i.ActualTemp > max) {
                return i.ActualTemp
            } else if (i.SetPointTemp > max) {
                return i.SetPointTemp
            } else {
                return max
            }
        },
        data[0].ActualTemp)
        bound += 10
        bound = Math.round(bound/5) * 5 // make graph nice, round values by 5's
        return bound
    }*/

    const submitAddLogJob = async (data) => { 
        const reqbody = {
            name: data.target.name.value.trim(),
            number: data.target.number.value,
            timeType: data.target.timeType.value,
            refresh_token: nestTokens.refresh_token,
            deviceId: deviceId,
            googleId: googleAccountInfo.id,
        }

        var errorlist = []
        if (reqbody.name == '' || reqbody.name == null) {
            errorlist.push('The job needs to have a name.')
        }
        if (reqbody.name.length > 50) {
            errorlist.push('The name needs to be less than 50 characters.')
        }
        if (reqbody.number < 20 && reqbody.timeType == 'minutes') {
            errorlist.push('The interval needs to be larger if the unit of time is minutes.')
        }
        if (reqbody.number <= 0) {
            errorlist.push('The interval cannot be negative, empty, or 0.')
        }
        if (reqbody.number.toString().length > 3) {
            errorlist.push('The interval can be 3 digits at most.')
        }

        if (errorlist.length > 0) { 
            console.log('Logging job: There are errors')
            setErrors(errorlist)
        } else {
            console.log('Logging job: There are no errors')
            setErrors(null)
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
                if (err.response.data.status === 400) {
                    console.log('Bad request')
                    console.log(err.response.data)
                    setAddLogJobOpen(false)
                    raiseResponseToast(err.response.data.message) 
                } else if (err.response.data.status === 500) { //500 from API view (createLogJob()) Email emptynestgroup automatically here?
                    console.log('Internal Server Error')
                    console.log(err.response.data)
                    setAddLogJobOpen(false)
                    raiseResponseToast(err.response.data.message) 
                } else if (err.response.status === 500) { //500 not from API view, from Axios only (If server isn't running)
                    console.log("Server probably isn't started, Internal Server Error")
                    console.log(err.response)
                    setAddLogJobOpen(false)
                    raiseResponseToast(err.response.data)
                } else {
                    console.log(err)
                }
            })
        }
    }

    const submitAddSetJob = async (data) => {
        const reqbody = {
            name: data.target.name.value.trim(),
            setTemp: data.target.setTemp.value,
            number: data.target.number.value,
            timeType: data.target.timeType.value,
            refresh_token: nestTokens.refresh_token,
            deviceId: deviceId,
            googleId: googleAccountInfo.id
        }
        //TextField type number already makes sure only whole numbers are entered, and 
        //if its '60.' for example, the '.' is left out according to the alert() call further down
        var errorlist = []
        if (reqbody.name == '' || reqbody.name == null) {
            errorlist.push('The job needs to have a name.')
        }
        if (reqbody.name.length > 50) {
            errorlist.push('The name needs to be less than 50 characters.')
        }
        if (reqbody.setTemp > 90 || reqbody.setTemp < 50) {
            errorlist.push('The temperature needs to be within 50 to 90 °F.')
        }
        if (reqbody.number < 20 && reqbody.timeType == 'minutes') {
            errorlist.push('The interval needs to be larger if the unit of time is minutes.')
        }
        if (reqbody.number.toString().length > 3) {
            errorlist.push('The interval can be 3 digits at most.')
        }
        if (reqbody.number <= 0) {
            errorlist.push('The interval cannot be negative, empty, or 0.')
        }
        //e, +, -, and . are allowed to be inputted because they are used in scientific notation. JS is smart
        //enough to compare the scientific number to the allowed temperature range (50 to 90)
        //e.g, 10e+1 is 100, and when submitted the correct error message for the temp not being in range of 50 to 90 comes up
        //9e+1 is 90, so its in the range, so it is allowed to be submitted
        //But will the API/DB recieve a scientific number correctly?
        //e, +, -, and . being used on their own aren't allowed by the text field
        if (errorlist.length > 0) { 
            console.log('Setting job: There are errors')
            setErrors(errorlist)
        } else {
            console.log('Setting job: There are no errors')
            setErrors(null)
            await axios.post(`/setjob`, reqbody)
            .then((res) => {
                if (res.status === 201) {
                    console.log('Successfully added the job')
                    console.log(res.data)
                    setJobRefresh(!jobRefresh)
                    setAddSetJobOpen(false)
                    raiseResponseToast(res.data.message)
                }
            })
            .catch((err) => {
                if (err.response.data.status === 400) {
                    console.log('Bad request')
                    console.log(err.response.data)
                    setAddSetJobOpen(false)
                    raiseResponseToast(err.response.data.message) 
                } else if (err.response.data.status === 500) { //500 from API view (createLogJob()) Email emptynestgroup automatically here?
                    console.log('Internal Server Error')
                    console.log(err.response.data)
                    setAddSetJobOpen(false)
                    raiseResponseToast(err.response.data.message) 
                } else if (err.response.status === 500) { //500 not from API view, from Axios only (If server isn't running)
                    console.log("Server probably isn't started, Internal Server Error")
                    console.log(err.response)
                    setAddSetJobOpen(false)
                    raiseResponseToast(err.response.data)
                } else {
                    console.log(err)
                }
            })
        }
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

    const exportLogs = (data, name) => {
        const jobJSON = `data:text/json;chatset=utf-8,${encodeURIComponent(JSON.stringify(data, null, "     "))}`
        const link = document.createElement("a");
        link.href = jobJSON;
        link.download = `${name}.json`;
        link.click();
    }

    const readFileOnUpload = (uploadedFile) =>{
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
           try {
              setChartData(JSON.parse(fileReader.result));
           } catch(e) {
              raiseResponseToast('JSON files only, pretty please uwu')
           }
        }
        if (uploadedFile!== undefined)
            fileReader.readAsText(uploadedFile);
    }

    return (
        <>
            <Snackbar open={alertOpen} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
                <SnackbarContent message={responseMessage} sx={{ backgroundColor: '#7BF1A8', color: '#000' }}/>
            </Snackbar>
            <Modal open={deleteConfOpen} onClose={() => { setDeleteConfOpen(false); setJobToDeleteInfo({ Id: null, Name: null}); }}>
                <Fade in={deleteConfOpen}>
                <Box sx={{ bgcolor: '#7BF1A8', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', p: 4, borderRadius: '1rem' }}>
                    <Grid container direction="column" spacing={2}>
                        <Grid item>
                            <Typography variant="h4">Delete Job</Typography>
                        </Grid>
                        <Grid item>
                            <Typography>Are you sure you want to delete the job {jobToDeleteInfo.Name}?</Typography>
                        </Grid>
                        <Grid item>
                            <Grid container direction="row" alignItems="center" justifyContent="center" spacing={2} mt={0.5}>
                                <Grid item>
                                    <Button variant="contained" color="secondary" onClick={() => { setDeleteConfOpen(false); setJobToDeleteInfo({ Id: null, Name: null}); }}>Cancel</Button>
                                </Grid>
                                <Grid item>
                                    <Button variant="contained" color="error" onClick={() => deleteJob(jobToDeleteInfo.Id)}>Yes, Delete</Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </Box>
                </Fade>
            </Modal>
            <Modal open={addLogJobOpen} onClose={() => { setAddLogJobOpen(false); setErrors(null); }}>
                <Fade in={addLogJobOpen}>
                <Box sx={{ bgcolor: '#7BF1A8', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', p: 4, borderRadius: '1rem', width: '28rem' }}>
                    <Grid container direction="column" spacing={2} pl={1}>
                        <Grid item>
                            <Typography variant="h4" mb={2}>Add Logging Job</Typography>
                        </Grid>
                        <form onSubmit={(e) => {e.preventDefault(); submitAddLogJob(e);}}>
                            <Grid item>
                                <Grid container direction="row" spacing={2} mb={1} alignItems="center">
                                    <Grid item>
                                        <Typography>Name:</Typography>
                                    </Grid>
                                    <Grid item>
                                        <TextField
                                        size="small"
                                        color="secondary"
                                        id="job-name"
                                        name="name"
                                        type="text"
                                        margin="dense"
                                        fullWidth
                                        InputLabelProps={{shrink: true}}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item>
                                <Grid container direction="row" spacing={2} mb={2} alignItems="center">
                                    <Grid item>
                                        <Typography>Log the temperature every</Typography>
                                    </Grid>
                                    <Grid item>
                                        <TextField
                                        size="small"
                                        color="secondary"
                                        id="outlined-number"
                                        name="number"
                                        type="number"
                                        margin="dense"
                                        fullWidth
                                        defaultValue={60}
                                        sx={{ width: '5rem' }}
                                        InputLabelProps={{shrink: true,}}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <TextField
                                        size="small"
                                        color="secondary"
                                        id="select-time"
                                        name="timeType"
                                        select
                                        defaultValue="minutes"
                                        margin="dense"
                                        >
                                        {timeValues.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item>
                                <ul style={{ color: '#d32f2f' }}>
                                    { errors && (
                                        errors.map((error) => (
                                            <li>{error}</li>
                                        ))
                                    )}
                                </ul>
                            </Grid>
                            <Grid item>
                                <Grid container direction="row" alignItems="center" justifyContent="center" spacing={2} mt={0.5}>
                                    <Grid item>
                                        <Button variant="contained" color="error" onClick={() => { setAddLogJobOpen(false); setErrors(null); }}>Cancel</Button>
                                    </Grid>
                                    <Grid item>
                                        <Button variant="contained" color="success" type="submit">Add Job</Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </form>
                    </Grid>
                </Box>
                </Fade>
            </Modal>
            <Modal open={addSetJobOpen} onClose={() => { setAddSetJobOpen(false); setErrors(null); }}>
                <Fade in={addSetJobOpen}>
                <Box sx={{ bgcolor: '#7BF1A8', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', p: 4, borderRadius: '1rem', width: '42rem' }}>
                    <Grid container direction="column" spacing={2} pl={1}>
                        <Grid item>
                            <Typography variant="h4">Add Setting Job</Typography>
                        </Grid>
                        <Grid item>
                            <Typography variant="body1" color="#ff6f00" mb="1rem">
                                This will set the thermostat to a set point temperature at an interval, so it won't work if the thermostat isn't in heat mode or cool mode.
                            </Typography>
                        </Grid>
                        <form onSubmit={(e) => {e.preventDefault(); submitAddSetJob(e);}}>
                            <Grid item>
                                <Grid container direction="row" spacing={2} mb={1} alignItems="center">
                                    <Grid item>
                                        <Typography>Name:</Typography>
                                    </Grid>
                                    <Grid item>
                                        <TextField
                                        size="small"
                                        color="secondary"
                                        id="job-name"
                                        name="name"
                                        type="text"
                                        margin="dense"
                                        fullWidth
                                        InputLabelProps={{shrink: true}}
                                        />
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item>
                                <Grid container direction="row" spacing={2} mb={2} alignItems="center">
                                    <Grid item>
                                        <Typography>Set the temperature to</Typography>
                                    </Grid>
                                    <Grid item>
                                        <TextField
                                        size="small"
                                        color="secondary"
                                        id="outlined-number"
                                        name="setTemp"
                                        type="number"
                                        margin="dense"
                                        fullWidth
                                        defaultValue={70}
                                        InputLabelProps={{shrink: true}}
                                        sx={{ width: '5rem' }}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <Typography>degrees Fahrenheit every</Typography>
                                    </Grid>
                                    <Grid item>
                                        <TextField
                                        size="small"
                                        color="secondary"
                                        id="outlined-number"
                                        name="number"
                                        type="number"
                                        margin="dense"
                                        fullWidth
                                        defaultValue={60}
                                        InputLabelProps={{shrink: true}}
                                        sx={{ width: '5rem' }}
                                        />
                                    </Grid>
                                    <Grid item>
                                        <TextField
                                        size="small"
                                        color="secondary"
                                        id="select-time"
                                        name="timeType"
                                        select
                                        defaultValue="minutes"
                                        margin="dense"
                                        >
                                        {timeValues.map((option) => (
                                            <MenuItem key={option.value} value={option.value}>
                                                {option.label}
                                            </MenuItem>
                                        ))}
                                        </TextField>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid item>
                                <ul style={{ color: '#d32f2f' }}>
                                    { errors && (
                                        errors.map((error) => (
                                            <li>{error}</li>
                                        ))
                                    )}
                                </ul>
                            </Grid>
                            <Grid item>
                                <Grid container direction="row" alignItems="center" justifyContent="center" spacing={2} mt={0.5}>
                                    <Grid item>
                                        <Button variant="contained" color="error" onClick={() => { setAddSetJobOpen(false); setErrors(null); }}>Cancel</Button>
                                    </Grid>
                                    <Grid item>
                                        <Button variant="contained" color="success" type="submit">Add Job</Button> 
                                    </Grid>
                                </Grid>
                            </Grid>
                        </form>
                    </Grid>
                </Box>
                </Fade>
            </Modal>
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
                    { device && ( //evaluate eco mode first 
                        getMode(device) === 'MANUAL_ECO' ? (
                            <Grow in={true}>
                                <Box sx={{ backgroundColor: '#7BF1A8', borderRadius: '2rem', width: '33rem' }} mb={3}>
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
                                            primary={`Mode: ${getFormattedModeName(getMode(device))}`}
                                            primaryTypographyProps={{ fontSize: '2rem' }}
                                            />
                                        </ListItem> {/*show eco mode leaf somewhere */}
                                        <Divider variant="middle"/>
                                        <ListItem>
                                            <ListItemText
                                            primary={`Heat: ${getRangeTemps(device).heatTemp}, Cool: ${getRangeTemps(device).coolTemp}`}
                                            primaryTypographyProps={{ fontSize: '2rem' }}
                                            />
                                        </ListItem>
                                    </List>
                                </Box>
                            </Grow>
                        ) : ( //other modes besides eco
                            getMode(device) === 'HEATCOOL' ? (
                                <>
                                    <Grow in={true}>
                                        <Box sx={{ backgroundColor: '#7BF1A8', borderRadius: '2rem', marginLeft: '14.5rem', marginRight: '14.5rem' }} mb={3}>
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
                                                    primary={`Mode: ${getFormattedModeName(getMode(device))}`}
                                                    primaryTypographyProps={{ fontSize: '2rem' }}
                                                    />
                                                </ListItem> {/*show eco mode leaf somewhere */}
                                                <Divider variant="middle"/>
                                                <ListItem>
                                                    <ListItemText
                                                    primary={`Heat: ${getRangeTemps(device).heatTemp}, Cool: ${getRangeTemps(device).coolTemp}`}
                                                    primaryTypographyProps={{ fontSize: '2rem' }}
                                                    />
                                                </ListItem>
                                            </List>
                                        </Box>
                                    </Grow>
                                    <Grow in={true}>
                                        <Box component="form" sx={{ backgroundColor: '#7BF1A8', borderRadius: '2rem', padding: '1rem', marginBottom: '2rem', marginLeft: '20rem', marginRight: '20rem' }}>
                                            <Container>
                                                <Grid container direction="column" justifyContent="center" alignItems="center" spacing={2}>
                                                    <Grid item>
                                                        <Grid container direction="row" justifyContent="center" alignItems="center" spacing={2}>
                                                            <Grid item>
                                                                <ToolTip placement="left" title={
                                                                    <Typography variant="body2">
                                                                        The heat temperature is the lowest/coolest it can get before the thermostat begins automatically heating.
                                                                    </Typography>
                                                                }>
                                                                    <TextField 
                                                                    type="number" 
                                                                    variant="outlined" 
                                                                    color="secondary" 
                                                                    label="Set heat in F"
                                                                    sx={{ width: '8rem' }}
                                                                    defaultValue={getRangeTemps(device).heatTemp} 
                                                                    onChange={(e) => setTempRange({...tempRange, Heat: parseInt(e.target.value)})}/>
                                                                </ToolTip>
                                                            </Grid>
                                                            <Grid item>
                                                                <ToolTip placement="right" title={
                                                                    <Typography variant="body2">
                                                                        The cool temperature is the highest/hottest it can get before the thermostat begins automatically cooling.
                                                                    </Typography>
                                                                }>
                                                                    <TextField 
                                                                    type="number" 
                                                                    variant="outlined" 
                                                                    color="secondary" 
                                                                    label="Set cool in F"
                                                                    sx={{ width: '8rem' }} 
                                                                    defaultValue={getRangeTemps(device).coolTemp}
                                                                    onChange={(e) => setTempRange({...tempRange, Cool: parseInt(e.target.value)})}/>
                                                                </ToolTip>
                                                            </Grid>
                                                        </Grid>
                                                    </Grid> 
                                                    <Grid item>
                                                        <Button variant="contained" color="secondary" onClick={() => rangeTempHandler()}>Set HeatCool Range</Button>
                                                    </Grid>
                                                </Grid>   
                                            </Container>
                                        </Box>
                                    </Grow>
                                    <center>
                                        <div style={{ color: '#d32f2f' }}>
                                            { errors && (
                                                errors.map((error) => (
                                                    <>{error}<br/></>
                                                ))
                                            )}
                                        </div>
                                    </center>
                                </>
                            ) : ( //heat mode or cool mode
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
                                                onChange={(e) => { setSetPointTemp(parseInt(e.target.value)); setSliderDisplayValue(parseInt(e.target.value)); }}
                                                /> 
                                            </Stack>
                                        </Grid>
                                        <Grid item>
                                            <ToolTip title={
                                                <>
                                                    <Typography>
                                                        Set Point Temperature: {sliderDisplayValue}°F
                                                    </Typography><br/>
                                                    <Typography>
                                                        Actual Temperature: {Math.round(CtoF(device.traits["sdm.devices.traits.Temperature"].ambientTemperatureCelsius))}°F
                                                    </Typography><br/>
                                                    <Typography>
                                                        Humidity: {device.traits["sdm.devices.traits.Humidity"].ambientHumidityPercent}%
                                                    </Typography><br/>
                                                    <Typography>
                                                        Mode: {getFormattedModeName(getMode(device))}
                                                    </Typography>
                                                </>
                                            } placement="right-start">
                                                <Paper sx={{ width: '20rem', height: '20rem', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: (switched ? "#7BF1A8" : "#000")}}>
                                                    <Typography variant="h1" color={switched ? "#000" : "#fff"}>{`${sliderDisplayValue}°`}</Typography>
                                                </Paper>
                                            </ToolTip>
                                        </Grid>
                                    </Grid>
                                </Grow>
                            )
                        )
                    )
                }
                </Grid>
                <Grid item>
                    { device && //make the current mode button disabled?
                        <ButtonGroup size="large" color={switched ? "primary" : "secondary"} variant={switched ? "outlined" : "contained"} sx={{ marginBottom: '2rem' }}>
                            <ToolTip title="Cool Mode">
                                <Button onClick={() => changeMode('COOL')}>
                                    <AcUnitIcon sx={{ color: '#2196f3'}}/>
                                </Button>
                            </ToolTip>
                            <Divider orientation="vertical" />
                            <ToolTip title="Heat Mode">
                                <Button onClick={() => changeMode('HEAT')} >
                                    <LocalFireDepartmentIcon sx={{ color: '#f4511e'}}/>
                                </Button>
                            </ToolTip>
                            <Divider orientation="vertical" />
                            <ToolTip title="Heat/Cool Mode">
                                <Button onClick={() => changeMode('HEATCOOL')}>
                                    <LocalFireDepartmentIcon sx={{ color: '#f4511e'}}/>
                                    <AcUnitIcon sx={{ color: '#2196f3'}}/>
                                </Button>
                            </ToolTip>
                            <Divider orientation="vertical" />
                            <ToolTip title="Eco Mode">
                                <Button onClick={() => changeMode('MANUAL_ECO')}>
                                    <EnergySavingsLeafIcon sx={{ color: '#00e676'}}/>
                                </Button>
                            </ToolTip>
                        </ButtonGroup>
                    }
                </Grid>
                <Grid item>
                    { device && 
                        <ToolTip title="Refresh jobs" placement="right">
                            <div style={{ cursor: 'pointer' }} onClick={() => { console.log('Refreshing jobs'); setJobRefresh(!jobRefresh); }}>
                                <Typography variant="h3">Your Logging Jobs</Typography>
                            </div>
                        </ToolTip>
                    }
                </Grid>
                <Grid item>
                    { device &&
                        <Container>
                            <Grid container direction="row" justifyContent="center" spacing={5} marginBottom="1rem">
                                {jobs ? (jobs.map((job) => { //Logging and setting jobs are set in the same state so differentiate where they are mapped in UI with the JobTypeId (make 'jobs ?' more specific for logging lobs so the 'no jobs' message appears correctly)
                                    if (job.JobTypeId.Id === 1) { //Logging job
                                    return (
                                        <Grow in={true}>
                                            <Grid item>
                                                <ToolTip title={<>Job Name: {job.Name}<br/>Job Description: {job.Description}</>} arrow>
                                                    <Card sx={{ borderRadius: '2rem', bgcolor: (job.JobLogs === chartData ? 'primary.dark' : 'primary.main'), width: '18rem' }} elevation={(job.JobLogs === chartData ? 8 : 0)} key={job.Id}>
                                                        <CardContent>
                                                            <Grid container direction="row" justifyContent="space-between">
                                                                <Grid item>
                                                                    <Typography gutterBottom variant="h6" color='#000' component="div">
                                                                        <div onClick={() => setChartData(job.JobLogs)} style={{ cursor: 'pointer' }}>
                                                                            {(job.Name.length > 11 ? `${job.Name.substr(0, 9)}...` : job.Name)} {/*11 characters max to not interfere with (possibly) 4 buttons */}
                                                                        </div>
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item>
                                                                    <Grid container justifyContent="flex-end">
                                                                        <Grid item>
                                                                            <div onClick={() => exportLogs(job.JobLogs, job.Name)} style={{ cursor: 'pointer' }}> 
                                                                                <ToolTip title="Download Job Logs">
                                                                                    <DownloadIcon />
                                                                                </ToolTip>
                                                                            </div>
                                                                        </Grid>
                                                                        <Grid item>
                                                                            <div onClick={() => setJobToDeleteInfo({ Id: job.Id, Name: job.Name })} style={{ cursor: 'pointer' }}>
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
                                                                            {(job.Description)}
                                                                        </div>
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid item>
                                                                    <Typography variant="body2" color="#000">
                                                                        Created {job.DateCreated}
                                                                    </Typography>
                                                                </Grid>
                                                                <Grid>
                                                                    <Typography variant="body2" color="#000">
                                                                        Expires {`${moment(job.DateCreated).add(7, 'days').format('llll')}`}
                                                                    </Typography>
                                                                </Grid>
                                                            </Grid>
                                                        </CardContent>
                                                    </Card>
                                                </ToolTip>
                                            </Grid>
                                        </Grow>
                                    )}
                                })) : (<Typography variant="h6" color={ switched ? 'primary.main' : 'secondary.main' } sx={{ mt: '3rem', ml: '1.7rem' }}>{(device.parentRelations[0].displayName.length === 0 ? 'You have no logging jobs for this thermostat.' : `You have no logging jobs for ${device.parentRelations[0].displayName}.`)}</Typography>)}
                            </Grid>
                        </Container>
                    }
                </Grid>
                <Grid item mb={'2rem'}>
                    { device &&
                        <Button variant={switched ? "outlined" : "contained"} color={switched ? "primary" : "secondary"} size="large" startIcon={<AddCircleIcon/>} onClick={() => setAddLogJobOpen(true)}>Add Logging Job</Button> 
                    }
                </Grid>
                    { device && 
                        <>
                            { chartData ? //charts don't show up when in a grid item for some reason
                                (<ResponsiveContainer height={570}>
                                    <LineChart margin={{ bottom: 30, right: 125, left: 83 }} data={chartData}>
                                        <CartesianGrid stroke={(switched ? '#7BF1A8' : '#000')} strokeDasharray="3 3" />
                                        <XAxis dataKey="TimeLogged" stroke={(switched ? '#7BF1A8' : '#000')} angle={-55} height={200} dx={-50} dy={75}>
                                            <Label value="Log Dates" position="bottom" style={{ fill: (switched ? '#7BF1A8' : '#000')}}/>
                                        </XAxis>
                                        <YAxis stroke={(switched ? '#7BF1A8' : '#000')}> {/*domain={[getMinYBound(chartData), getMaxYBound(chartData)]} */}
                                            <Label value='Temperature in Fahrenheit' angle={-90} position="left" dy={-90} dx={10} style={{ fill: (switched ? '#7BF1A8' : '#000')}}/>
                                        </YAxis>
                                        <Tooltip contentStyle={{ backgroundColor: (switched ? '#000' : '#fff'), borderColor: (switched ? '#000' : '#fff'), borderRadius: '1rem' }} labelStyle={{ color: (switched ? '#7BF1A8' : '#000')}}/>
                                        <Legend wrapperStyle={{ right: 84 }} verticalAlign="top" height={40}/>
                                        <Line type="monotone" dataKey="ActualTemp" stroke="#9900ff" activeDot={{ r: 8 }} name="Actual Temp"/>
                                        <Line type="monotone" dataKey="SetPointTemp" stroke="#ff8000" activeDot={{ r: 8 }} name="Set Point Temp"/>
                                        <Line type="monotone" dataKey="HeatTemp" stroke="#ff3333" activeDot={{ r: 8 }} name="Heat Temp"/>
                                        <Line type="monotone" dataKey="CoolTemp" stroke="#3385ff" activeDot={{ r: 8 }} name="Cool Temp"/>
                                        <Line type="monotone" dataKey="Mode" legendType='none' stroke={(switched ? '#7BF1A8' : '#000')} />
                                    </LineChart>
                                </ResponsiveContainer>)
                                : 
                                (<ResponsiveContainer height={375}>
                                    <LineChart margin={{ right: 125, left: 83 }}>
                                        <CartesianGrid stroke={(switched ? '#7BF1A8' : '#000')} strokeDasharray="3 3" />
                                        <XAxis>
                                            <Label value="Log Dates" position="bottom" style={{ fill: (switched ? '#7BF1A8' : '#000')}}/>
                                        </XAxis>
                                        <YAxis>
                                            <Label value='Temperatures in Fahrenheit' angle={-90} position='left' dy={-92} dx={10} style={{ fill: (switched ? '#7BF1A8' : '#000')}}/>
                                        </YAxis>
                                        <Legend wrapperStyle={{ right: 84 }} verticalAlign="top" height={40}/>
                                        <Line stroke="#9900ff" name="Actual Temp"/>
                                        <Line stroke="#ff8000" name="Set Point Temp"/>
                                        <Line stroke="#ff3333" name="Heat Temp"/>
                                        <Line stroke="#3385ff" name="Cool Temp"/>
                                        <Line legendType='none' stroke={(switched ? '#7BF1A8' : '#000')} />
                                    </LineChart>
                                </ResponsiveContainer>)
                            }
                        </>
                    }
                    <Grid item>
                        { device &&
                            <label htmlFor="upload-file">
                                <input style={{ display: 'none' }} id="upload-file" name="upload-file" type="file" onChange={(e)=>readFileOnUpload(e.target.files[0])}/>
                                <Button variant={switched ? "outlined" : "contained"} component="span" color={switched ? "primary" : "secondary"} size="large" startIcon={<UploadFileIcon />}>Upload File</Button>
                            </label>
                        }
                    </Grid>
                    <Grid item>
                        { device &&
                            <Typography variant="h3" mt={4}>Your Setting Jobs</Typography>
                        }
                    </Grid>
                    <Grid item>
                        { device &&
                            <Container>
                                <Grid container direction="row" justifyContent="center" spacing={5} marginBottom="1rem">
                                    {jobs ? (jobs.map((job) => { //make 'jobs ?' more specific for setting lobs so the 'no jobs' message appears correctly
                                        if (job.JobTypeId.Id === 2) { //setting jobs
                                        return (
                                            <Grow in={true}>
                                                <Grid item>
                                                    <ToolTip title={<>Job Name: {job.Name}<br/>Job Description: {job.Description}</>} arrow>
                                                        <Card sx={{ borderRadius: '2rem', bgcolor: 'primary.main', width: '18rem' }} elevation={0} key={job.Id}>
                                                            <CardContent>
                                                                <Grid container direction="row" justifyContent="space-between">
                                                                    <Grid item>
                                                                        <Typography gutterBottom variant="h6" color='#000' component="div">
                                                                            {(job.Name.length > 11 ? `${job.Name.substr(0, 9)}...` : job.Name)}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item>
                                                                        <Grid container justifyContent="flex-end">
                                                                            <Grid item>
                                                                                <div onClick={() => setJobToDeleteInfo({ Id: job.Id, Name: job.Name })} style={{ cursor: 'pointer' }}>
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
                                                                            {(job.Description)}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid item>
                                                                        <Typography variant="body2">
                                                                            Created {job.DateCreated}
                                                                        </Typography>
                                                                    </Grid>
                                                                    <Grid>
                                                                        <Typography variant="body2" color="#000">
                                                                            Expires {`${moment(job.DateCreated).add(7, 'days').format('llll')}`}
                                                                        </Typography>
                                                                    </Grid>
                                                                </Grid>
                                                            </CardContent>
                                                        </Card>
                                                    </ToolTip>
                                                </Grid>
                                            </Grow>
                                        )}
                                    })) : (<Typography variant="h6" color={ switched ? 'primary.main' : 'secondary.main' } sx={{ mt: '3rem', ml: '1.7rem' }}>{(device.parentRelations[0].displayName.length === 0 ? 'You have no logging jobs for this thermostat.' : `You have no setting jobs for ${device.parentRelations[0].displayName}.`)}</Typography>)}
                            </Grid>
                        </Container>
                        }
                    </Grid>
                    <Grid item mb={'2rem'}>
                        { device &&
                            <Button variant={switched ? "outlined" : "contained"} color={switched ? "primary" : "secondary"} size="large" startIcon={<AddCircleIcon/>} onClick={() => setAddSetJobOpen(true)}>Add Setting Job</Button>
                        }
                    </Grid>
            </Grid>
        </>
    )
}

export default ThermoDashboard