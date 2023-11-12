import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import { googleLogout } from "@react-oauth/google";
import Modal from "@mui/material/Modal";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Fade from "@mui/material/Fade";
import Box from "@mui/material/Box";

const AuthProvider = ({ children }) => {
  const [authTokenDetails, setAuthTokenDetails] = useState(null)
  const [googleAccountInfo, setGoogleAccountInfo] = useState(null)
  const [nestTokens, setNestTokens] = useState(null)
  const [hasAuth, setHasAuth] = useState(false) //using this just to stop an endless loop
  const navigate = useNavigate()

  const project_id = 'f4f5bdc3-964c-466b-bf80-9508f2709ad5'
  const client_id = '589825515650-ej6sq8icgc3itevo7b731oes8q1tqk4u.apps.googleusercontent.com'
  const client_secret = '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'
  const redirect_uri = 'http://localhost:3000'
  const [code, setCode] = useState(null)
  const [sessionModalOpen, setSessionModalOpen] = useState(false)
  const [startSessionTimer, setStartSessionTimer] = useState(false)

  const logOut = () => {
    try {
        googleLogout()
        setAuthTokenDetails(null)
        setGoogleAccountInfo(null)
        setNestTokens(null)
        setHasAuth(false)
        setCode(null)
        localStorage.clear()
        setStartSessionTimer(false)
        navigate("/")
    } catch(err) {
        console.log(err)
    }
  } 

  const getNestTokens = async () => {
    try {
      const param = new URLSearchParams()
      param.append('client_id', client_id)
      param.append('client_secret', client_secret)
      param.append('code', code)
      param.append('grant_type', 'authorization_code')
      param.append('redirect_uri', redirect_uri)
      await axios.post('https://www.googleapis.com/oauth2/v4/token', param)
      .then((res) => {
        if (res.status === 200) {
          console.log('Got the Google Nest access and refresh tokens')
          console.log(res.data)
          setNestTokens(res.data) //nest access token and refresh token are set here
        } else {
          console.log('Not OK')
        }
      })
    } catch(err) {
      console.log(err)
    }
  }
  //need to define func to refresh nest token. useEffect that runs every hour?
  useEffect(() => //#1
    {if (hasAuth) {
      axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${authTokenDetails.access_token}`, { //await it?
        headers: {
          Authorization: `Bearer ${authTokenDetails.access_token}`,
          Accept: 'application/json'
        }
      }).then((res) => {
        if (res.status === 200) {
          console.log('Got Google account data')
          setGoogleAccountInfo(res.data)
          console.log(res.data)
          localStorage.setItem("googleAccountInfo", JSON.stringify(res.data))
          localStorage.setItem("authTokenDetails", JSON.stringify(authTokenDetails))
          window.location.href = `https://nestservices.google.com/u/${authTokenDetails.authuser}/partnerconnections/f4f5bdc3-964c-466b-bf80-9508f2709ad5/auth?redirect_uri=http://localhost:3000&access_type=offline&prompt=consent&client_id=589825515650-ej6sq8icgc3itevo7b731oes8q1tqk4u.apps.googleusercontent.com&response_type=code&scope=https://www.googleapis.com/auth/sdm.service`;
        } else {
          console.log('Not OK')
        }
      }).catch((err) => 
        console.log(err)
      )
    }}, [hasAuth]) 

    var popup
    const setPopupTimer = () => {
      popup = setTimeout(() => {
        setSessionModalOpen(true)
      }, 30000)
    }

    // need function to log out after timeout reached
    const resetPopupTimer = () => { //some token refresh stuff can go here
      clearTimeout(popup)
      setPopupTimer()
    }
    useEffect(() => {
      if (startSessionTimer) {
        console.log('Timer started')
        localStorage.clear() //for security after pushing to localStorage to persist state past redirects
        setPopupTimer()
      }
    }, [startSessionTimer])

  return (
    <> 
      <Modal open={sessionModalOpen} onClose={() => setSessionModalOpen(false)}>
        <Fade in={sessionModalOpen}>
          <Box sx={{ bgcolor: '#7BF1A8', position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', p: 4, borderRadius: '1rem' }}>
            <Grid container direction="column" spacing={2}>
              <Grid item>
                <Typography variant="h4" sx={{ fontFamily: 'Google Sans' }}>Session About To Expire</Typography>
              </Grid>
              <Grid item>
                <Typography sx={{ fontFamily: 'Google Sans' }}>Your session is going to expire in 5 minutes. Would you like to stay signed in?</Typography>
              </Grid>
              <Grid item>
                <Grid container direction="row" alignItems="center" justifyContent="center" spacing={2} mt={0.5}>
                  <Grid item>
                    <Button variant="contained" color="success" sx={{ fontFamily: 'Google Sans' }} onClick={() => { resetPopupTimer(); setSessionModalOpen(false); }}>Stay Signed In</Button>
                  </Grid>
                  <Grid item>
                    <Button variant="contained" color="error" sx={{ fontFamily: 'Google Sans' }} onClick={() => { logOut(); setSessionModalOpen(false); }}>Log Out</Button>
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Box>
        </Fade>
      </Modal>
      <AuthContext.Provider value={{authTokenDetails, setAuthTokenDetails, googleAccountInfo, setGoogleAccountInfo, nestTokens, setNestTokens, project_id, client_id, client_secret, redirect_uri, code, setCode, getNestTokens, hasAuth, setHasAuth, logOut, setStartSessionTimer }}>
        {children}
      </AuthContext.Provider>
    </>
  )
}

export default AuthProvider