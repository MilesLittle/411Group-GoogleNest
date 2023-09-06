import React, { useState, useEffect } from 'react';
import './App.css';
import AuthContext from './Login/AuthContext';
import TestingContext from './TestingContext';
import axios from 'axios';

function App() {
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
    <AuthContext.Provider value={{currentUser, setCurrentUser, authenticated, setAuthenticated, profile, setProfile}}>
      <TestingContext />
    </AuthContext.Provider>
  );
}

export default App;
