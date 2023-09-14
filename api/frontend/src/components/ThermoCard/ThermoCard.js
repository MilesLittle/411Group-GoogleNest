import React from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from '@mui/material/CardMedia';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography'
import TuneIcon from '@mui/icons-material/Tune';

const ThermoCard = ({ id, deviceName, type, location }) => { //later, pass in some thermostat details from Google API as props instead of static data
    return (
        <Card sx={{ maxWidth: 400, borderRadius: '2rem', bgcolor: 'primary.main' }} elevation={15} key={id}>
            <CardMedia sx={{ height: 300, borderRadius: '2rem' }} image={'https://consumersenergystore.com/dw/image/v2/BDDP_PRD/on/demandware.static/-/Sites-masterCatalog/default/dw435871c9/Products/I-NSTTSTATX-01-BLCK-XXXX-V1.jpg?sw=800&sh=800'} title='Nest Device' />
            <CardContent sx={{ margin: '0.5rem' }}>
                <Grid container direction="row" justifyContent="space-between">
                    <Grid item>
                        <Typography variant="h5" mb={1}>
                            {deviceName}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <TuneIcon />
                    </Grid>
                </Grid>
                <Grid container direction="column" justifyContent="flex-start">
                    <Grid item>
                        <Typography mb={1}>{type}</Typography>
                    </Grid>
                    <Grid item>
                        <Typography mb={1}>{location}</Typography>
                    </Grid>
                    <Grid item>
                        <Typography mb={1}>
                            None of this is actual data being mapped from a thermostat of the logged in user. Just an example.
                        </Typography>
                    </Grid>
                </Grid>
            </CardContent>
        </Card>
    )
}

export default ThermoCard