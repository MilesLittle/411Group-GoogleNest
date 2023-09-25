import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import axios from 'axios';

const AuthProvider = ({ children }) => {
  const [authTokenDetails, setAuthTokenDetails] = useState(null)
  const [googleAccountInfo, setGoogleAccountInfo] = useState(null)
  const [nestTokens, setNestTokens] = useState(null)
  const [hasAuth, setHasAuth] = useState(false) //using this just to stop an endless loop

  const project_id = 'f4f5bdc3-964c-466b-bf80-9508f2709ad5'
  const client_id = '589825515650-ej6sq8icgc3itevo7b731oes8q1tqk4u.apps.googleusercontent.com'
  const client_secret = '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'
  const redirect_uri = 'http://localhost:3000'
  const [code, setCode] = useState(null)

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
          console.log(res.status)
          console.log(res.data)
          setNestTokens(res.data) //nest access token and refresh token are set here
      })
    } catch(err) {
      console.log(err)
    }
  }
  //need to define func to refresh nest token. useEffect that runs every hour?
  useEffect(() => 
    {if (hasAuth) {
      axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${authTokenDetails.access_token}`, {
        headers: {
          Authorization: `Bearer ${authTokenDetails.access_token}`,
          Accept: 'application/json'
        }
      }).then((res) => {
        setGoogleAccountInfo(res.data) //if statement for only if 200 ok
        console.log(res.data)
        console.log(res.status)
        localStorage.setItem("googleAccountInfo", JSON.stringify(res.data))
        localStorage.setItem("authTokenDetails", JSON.stringify(authTokenDetails))
        window.location.href = `https://nestservices.google.com/u/${authTokenDetails.authuser}/partnerconnections/f4f5bdc3-964c-466b-bf80-9508f2709ad5/auth?redirect_uri=http://localhost:3000&access_type=offline&prompt=consent&client_id=589825515650-ej6sq8icgc3itevo7b731oes8q1tqk4u.apps.googleusercontent.com&response_type=code&scope=https://www.googleapis.com/auth/sdm.service`;
      }).catch((err) => 
        console.log(err)
      )
    }}, [hasAuth]) 

  return (
    <AuthContext.Provider value={{authTokenDetails, setAuthTokenDetails, googleAccountInfo, setGoogleAccountInfo, nestTokens, setNestTokens, project_id, client_id, client_secret, redirect_uri, code, setCode, getNestTokens, hasAuth, setHasAuth }}>
        {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider