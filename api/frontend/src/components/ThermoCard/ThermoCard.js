import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography'
import TuneIcon from '@mui/icons-material/Tune';
import { useNavigate } from "react-router-dom";

const ThermoCard = ({ id, deviceName, roomName }) => { //later, pass in some thermostat details from Google API as props instead of static data
    const navigate = useNavigate()
    return (
        <Card sx={{ width: '25rem', borderRadius: '2rem', bgcolor: 'primary.main' }} elevation={15} key={id}>
            <CardMedia sx={{ height: 300, borderRadius: '2rem' }} image={'https://consumersenergystore.com/dw/image/v2/BDDP_PRD/on/demandware.static/-/Sites-masterCatalog/default/dw435871c9/Products/I-NSTTSTATX-01-BLCK-XXXX-V1.jpg?sw=800&sh=800'} title='Nest Device' />
            <CardContent sx={{ margin: '0.5rem' }}>
                <Grid container direction="row" justifyContent="space-between">
                    <Grid item>
                        <Typography variant="h5" mb={1}>
                            {deviceName}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <div onClick={() => navigate(`/thermo/${id}`)} style={{ cursor: 'pointer'}}>
                            <TuneIcon />
                        </div>
                    </Grid>
                </Grid>
                <Grid container direction="column" justifyContent="flex-start">
                    <Grid item>
                        <Typography mb={1}>
                            House: {roomName}
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default ThermoCard