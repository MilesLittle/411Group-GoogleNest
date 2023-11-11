import React, { useContext } from "react";
import AuthContext from '../Login/AuthContext';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import DarkModeSwitchContext from "../components/NavBar/Dark Mode/DarkModeSwitchContext";

const Profile = () => {
    document.title = 'Your Google Profile'
    const { googleAccountInfo, logOut } = useContext(AuthContext)
    const { switched } = useContext(DarkModeSwitchContext)

    return (
        <Grid container direction="column" justifyContent="center" alignItems="center" mt={4} spacing={0.5}>
            { googleAccountInfo ? (
                <>
                    <Grid item>
                        <Avatar src={googleAccountInfo.picture} alt="User Image" sx={{ width: 150, height: 150 }}/>
                    </Grid>
                    <Grid item>
                        <Typography fontSize={'3rem'} color={ switched && '#7BF1A8' }>Hi, {googleAccountInfo.name} </Typography>
                    </Grid>
                    <Grid item>
                        <Typography fontSize={'1.2rem'} color={ switched && '#7BF1A8' }> {googleAccountInfo.email} </Typography>
                    </Grid>
                    <Grid item>
                        <Grid container direction="row" justifyContent="space-around" alignItems="center" spacing={3} mt={1}>
                            <Grid item>
                                <Button size="large" color="error" variant="contained" onClick={logOut}>Log out</Button>
                            </Grid>
                            <Grid item>
                                <Button size="large" color="error" variant="contained">Revoke Access</Button>
                            </Grid>
                        </Grid>
                    </Grid>
                </>
            ) : (<>You're not logged in.</>)}
        </Grid>
    )
}

export default Profile