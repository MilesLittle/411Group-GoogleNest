import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import axios from 'axios';
import { useNavigate } from 'react-router-dom'

const AuthProvider = ({ children }) => {
  const [authTokenDetails, setAuthTokenDetails] = useState(null)
  const [hasAuth, setHasAuth] = useState(false)
  const [googleAccountInfo, setGoogleAccountInfo] = useState(null)
  const navigate = useNavigate()

  useEffect(() => 
    {if (hasAuth) {
      axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${authTokenDetails.access_token}`, {
        headers: {
          Authorization: `Bearer ${authTokenDetails.access_token}`,
          Accept: 'application/json'
        }
      }).then((res) => {
        setGoogleAccountInfo(res.data)
        console.log(res.data)
        console.log(res.status)
        localStorage.setItem("googleAccountInfo", JSON.stringify(res.data))
        console.log(JSON.parse(localStorage.getItem("googleAccountInfo")))
        localStorage.setItem("authTokenDetails", JSON.stringify(authTokenDetails))
        console.log(JSON.parse(localStorage.getItem("authTokenDetails")))
        window.location.href = `https://nestservices.google.com/u/${authTokenDetails.authuser}/partnerconnections/f4f5bdc3-964c-466b-bf80-9508f2709ad5/auth?redirect_uri=http://localhost:3000&access_type=offline&prompt=consent&client_id=589825515650-ej6sq8icgc3itevo7b731oes8q1tqk4u.apps.googleusercontent.com&response_type=code&scope=https://www.googleapis.com/auth/sdm.service`;
        //the problem is that window.location stuff causes page refreshes and react rerenders - logged in user is lost. 
        //localStorage? open in smaller window like the login?
      }).catch((err) => console.log(err))
    }}, [hasAuth]) //putting authTokenDetails in useeffect and also setting it from localStorage in useeffect causes endless
    //loop. Avoiding it using hasAuth

  return (
    <AuthContext.Provider value={{authTokenDetails, setAuthTokenDetails, googleAccountInfo, setGoogleAccountInfo, hasAuth, setHasAuth }}>
        {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider