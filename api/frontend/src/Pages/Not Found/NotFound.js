import React from "react";
import Stack from "@mui/material/Stack";
import Typography from '@mui/material/Typography'
import ourmascot from './ourmascottransparent.png'

const NotFound = () => {
    document.title = 'Not Found'
    return (
        <Stack direction="column" textAlign="center" m={5}>
            <Typography fontSize={'3rem'} variant="h3">Not Found</Typography>
            <center>
                <img src={ourmascot} width='360vw' height='360vh' alt="Clodsire" />
            </center>
        </Stack>
    )
}

export default NotFound