import React from "react";
import Stack from "@mui/material/Stack";
import Typography from '@mui/material/Typography'
import ourmascot from './ourmascot.jpg'

const NotFound = () => {
    document.title = 'Not Found'
    return (
        <Stack direction="column" textAlign="center" m={5} spacing={2}>
            <Typography fontSize={'3rem'} variant="h3">Not Found</Typography>
            <center>
                <img src={ourmascot} width='350vw' height='350vh' style={{ borderRadius: 30 }} alt="Mascot" />
            </center>
        </Stack>
    )
}

export default NotFound