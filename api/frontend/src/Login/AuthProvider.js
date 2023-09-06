import React, { useState, useEffect } from "react";
import AuthContext from "./AuthContext";
import axios from 'axios';

const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authenticated, setAuthenticated] = useState(false)
  useEffect(() => 
    {if (currentUser) {
      axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${currentUser.access_token}`, {
        headers: {
          Authorization: `Bearer ${currentUser.access_token}`,
          Accept: 'application/json'
        }
      }).then((res) => {
        setProfile(res.data) //account stuff
        console.log(res.data)
      }).catch((err) => console.log(err))
    }}, [currentUser])

  return (
    <AuthContext.Provider value={{currentUser, setCurrentUser, profile, setProfile, authenticated, setAuthenticated}}>
        {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider