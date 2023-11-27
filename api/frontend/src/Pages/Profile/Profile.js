import React, { useContext, useState } from "react";
import AuthContext from '../../Login/AuthContext';
import Typography from '@mui/material/Typography';
import Avatar from '@mui/material/Avatar';
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import DarkModeSwitchContext from "../../Theming/DarkModeSwitchContext";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Box from "@mui/material/Box";
import { Link, useNavigate } from "react-router-dom";

const Profile = () => {
    document.title = 'Your Google Profile'
    const { googleAccountInfo, logOut, authTokenDetails } = useContext(AuthContext)
    const { switched } = useContext(DarkModeSwitchContext)
    const navigate = useNavigate()
    const [revokeAccessModalOpen, setRevokeAccessModalOpen] = useState(false)

    return (
        <>
            <Modal open={revokeAccessModalOpen} onClose={() => setRevokeAccessModalOpen(false)}>
                <Fade in={revokeAccessModalOpen}>
                    <Box sx={{ bgcolor: '#7BF1A8', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', p: 4, borderRadius: '1rem' }}>
                        <Grid container direction="column" spacing={2}>
                            <Grid item>
                                <Typography variant="h4">Revoke Access</Typography>
                            </Grid>
                            <Grid item>
                                <Typography><b>Before you go, please be sure to delete any jobs that you have created.</b> Also, you will need to go to <Link to={`https://myaccount.google.com/u/${authTokenDetails.authuser}/connections`} target="_blank">{googleAccountInfo.name}'s third party permissions</Link> to remove Team Empty Nest's access. If you ever change your mind, you can always log back in and give us access again.</Typography>
                            </Grid>
                            <Grid item>
                                <Grid container direction="row" alignItems="center" justifyContent="center" spacing={2} mt={0.5}>
                                    <Grid item>
                                        <Button variant="contained" color="secondary" onClick={() => { setRevokeAccessModalOpen(false); logOut(); }}>Agree and Log out</Button>
                                    </Grid>
                                    <Grid item>
                                        <Button variant="contained" color="secondary" onClick={() => { setRevokeAccessModalOpen(false); navigate("/"); }}>Back to my Thermostats</Button>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                     </Box>
                </Fade>
            </Modal>
            <Grid container direction="column" justifyContent="center" alignItems="center" mt={4} spacing={0.5}>
                { googleAccountInfo ? (
                    <>
                        <Grid item>
                            <div onClick={() => navigate('/mygraph')} style={{ cursor: 'pointer' }}>
                                <Avatar src={googleAccountInfo.picture} alt="User Image" sx={{ width: 150, height: 150 }}/>
                            </div>
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
                                    <Button size="large" color="error" variant="contained" onClick={() => setRevokeAccessModalOpen(true)}>Revoke Access</Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </>
                ) : (<>You're not logged in.</>)}
            </Grid>
        </>
    )
}

export default Profile