import React, { useContext } from "react";
import { googleLogout } from "@react-oauth/google";
import AuthContext from '../Login/AuthContext';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from "@mui/material/Button";
import { useNavigate } from 'react-router-dom';
import Grid from "@mui/material/Grid";

const Profile = () => {
    const navigate = useNavigate()
    const { profile, setProfile, authenticated, setAuthenticated } = useContext(AuthContext)

    const logOut = () => {
        try {
            googleLogout()
            setProfile(null)
            setAuthenticated(false)
            navigate("/")
        } catch(err) {
            console.log(err)
        }
    } 

    return (
        <Grid container direction="column" justifyContent="center" alignItems="center" mt={4} spacing={0.5}>
            { authenticated && profile ? (
                <>
                    <Grid item>
                        <Avatar src={profile.picture} alt="User Image" sx={{ width: 150, height: 150 }}/>
                    </Grid>
                    <Grid item>
                        <Typography fontSize={'3rem'}>Hi, {profile.name} </Typography>
                    </Grid>
                    <Grid item>
                        <Typography fontSize={'1.2rem'}> {profile.email} </Typography>
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