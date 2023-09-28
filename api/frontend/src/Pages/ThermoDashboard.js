import React, { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Stack from "@mui/material/Stack";
import Grow from "@mui/material/Grow";
import Typography from '@mui/material/Typography';
import AuthContext from "../Login/AuthContext";
import axios from 'axios'

const ThermoDashboard = () => {
    const { nestTokens, project_id } = useContext(AuthContext)
    const { deviceId } = useParams() 
    console.log(deviceId)
    const [device, setDevice] = useState(null)
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
        <Stack direction="column" textAlign={'center'} spacing={4} m={8}>
            <Grow in={true}><Typography fontSize={'3rem'} variant="h3">Thermostat Dashboard</Typography></Grow>
            <Typography fontSize={'1.5rem'} variant="h3">Dashboard for thermostat with id {deviceId}.</Typography>
            <Typography fontSize={'1.5rem'} variant="h3">{JSON.stringify(device)}</Typography>
        </Stack>
    )
}

export default ThermoDashboard