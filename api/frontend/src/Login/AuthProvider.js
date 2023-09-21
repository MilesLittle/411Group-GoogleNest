import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import axios from 'axios';

const AuthProvider = ({ children }) => {
  const [authTokenDetails, setAuthTokenDetails] = useState(null)
  const [googleAccountInfo, setGoogleAccountInfo] = useState(null)
  useEffect(() => 
    {if (authTokenDetails) {
      axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${authTokenDetails.access_token}`, {
        headers: {
          Authorization: `Bearer ${authTokenDetails.access_token}`,
          Accept: 'application/json'
        }
      }).then((res) => {
        setGoogleAccountInfo(res.data)
        console.log(res.data)
        console.log(res.status)
      }).catch((err) => console.log(err))
    }}, [authTokenDetails])

  return (
    <AuthContext.Provider value={{authTokenDetails, setAuthTokenDetails, googleAccountInfo, setGoogleAccountInfo }}>
        {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider