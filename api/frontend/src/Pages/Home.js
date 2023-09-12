import React, { useContext } from "react";
import AuthContext from '../Login/AuthContext';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from "@mui/material/Button";
import { Link } from 'react-router-dom';

const Home = () => {
    const { currentUser, setCurrentUser, profile, setProfile, authenticated, setAuthenticated } = useContext(AuthContext)
    return (
        <>
        <Stack direction="column" textAlign={'center'} spacing={4} m={5}>
        <Typography fontSize={'3rem'}>Home</Typography>
         {authenticated && profile ? (
            <Card sx={{ bgcolor: 'secondary.light', width: '200'}}>
                <CardContent>
                <center><Avatar src={profile.picture} alt="User Image" sx={{ width: 60, height: 60, margin: '10px' }}/></center>
                    {/*How tf does <center> even work here, it's not text lmao*/}
                    <Typography fontSize={'1.5rem'}> {profile.name} </Typography>
                    <Typography> {profile.email} </Typography>
                </CardContent>
            </Card>
          ) : (<div>You're not logged in.</div>)}
          <Link to="/profile"><Button color="secondary" variant="contained">Link test</Button></Link>
      </Stack>
      </>
    )
}

export default Home