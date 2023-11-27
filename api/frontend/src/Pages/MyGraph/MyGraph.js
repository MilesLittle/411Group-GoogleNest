import React, { useContext, useState, useEffect } from "react"
import Typography from "@mui/material/Typography"
import Grid from "@mui/material/Grid"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Label } from 'recharts'
import DarkModeSwitchContext from "../../Theming/DarkModeSwitchContext";
import Snackbar from "@mui/material/Snackbar";
import SnackbarContent from "@mui/material/SnackbarContent";
import Button from '@mui/material/Button'
import UploadFileIcon from '@mui/icons-material/UploadFile';

const MyGraph = () => {
    document.title = 'Custom Data Graph'
    const { switched } = useContext(DarkModeSwitchContext)
    const [chartData, setChartData] = useState(null)
    const [alertOpen, setAlertOpen] = useState(false)
    const [responseMessage, setResponseMessage] = useState('')

    const readFileOnUpload = (uploadedFile) =>{
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
           try {
              setChartData(JSON.parse(fileReader.result));
           } catch(e) {
              setResponseMessage('JSON files only, pretty please uwu')
              setTimeout(() => { 
                setAlertOpen(false)
                setResponseMessage('')
            }, 5000)
           }
        }
        if (uploadedFile!== undefined)
            fileReader.readAsText(uploadedFile);
    }
    useEffect(() => {
        if (responseMessage.length > 0) {
            setAlertOpen(true)
        }
    }, [responseMessage])

    const getMinYBound = (data) => {
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
    }

    const getMaxYBound = (data) => {
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
    }

    return (
        <>
            <Snackbar open={alertOpen} anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}>
                <SnackbarContent message={responseMessage} sx={{ backgroundColor: '#7BF1A8', color: '#000' }}/>
            </Snackbar>
            <Grid container direction="column" justifyContent="center" alignItems="center" mt={1} mb={3} spacing={3}>
                <Grid item>
                    <Typography variant="h3" textAlign="center" fontSize={'3rem'} mb={4}>
                        Upload Your Data
                    </Typography>
                </Grid>
                { chartData ? //charts don't show up when in a grid item for some reason
                    (<ResponsiveContainer height={570}>
                        <LineChart margin={{ bottom: 30, right: 125, left: 83 }} data={chartData}>
                            <CartesianGrid stroke={(switched ? '#7BF1A8' : '#000')} strokeDasharray="3 3" />
                            <XAxis dataKey="TimeLogged" stroke={(switched ? '#7BF1A8' : '#000')} angle={-55} height={200} dx={-50} dy={75}>
                                <Label value="Log Dates" position="bottom" style={{ fill: (switched ? '#7BF1A8' : '#000')}}/>
                            </XAxis>
                            <YAxis stroke={(switched ? '#7BF1A8' : '#000')} domain={[getMinYBound(chartData), getMaxYBound(chartData)]}>
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
                    (<ResponsiveContainer height={400}>
                        <LineChart margin={{ bottom: 30, right: 125, left: 83 }}>
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
                <Grid item>
                <label htmlFor="upload-file">
                    <input style={{ display: 'none' }} id="upload-file" name="upload-file" type="file" onChange={(e)=>readFileOnUpload(e.target.files[0])}/>
                    <Button variant={switched ? "outlined" : "contained"} component="span" color={switched ? "primary" : "secondary"} size="large" startIcon={<UploadFileIcon />}>Upload File</Button>
                    </label>
                </Grid>
            </Grid>
        </>
    )
}

export default MyGraph