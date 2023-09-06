import React from 'react';
import { useContext, useEffect, useState } from 'react';
import './App.css';
import AuthContext from './Login/AuthContext';
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import axios from 'axios';

function App() {
//  const { currentUser, setCurrentUser, authenticated, setAuthenticated } = useContext(AuthContext) why can't i do this?
/*  const currentUser = useContext(AuthContext)
  const setCurrentUser = useContext(AuthContext)
  const authenticated = useContext(AuthContext)
  const setAuthenticated = useContext(AuthContext)*/ //these don't work from useContext for some reason

  const [currentUser, setCurrentUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [authenticated, setAuthenticated] = useState(false)

  const login = useGoogleLogin({
    onSuccess: (codeResponse) => { console.log(codeResponse); setCurrentUser(codeResponse); setAuthenticated(true)}, //token stuff
    onError: (error) => console.log('Login Failed:', error)
  });

  const logOut = () => {
    try {
        googleLogout()
        setProfile(null)
        setAuthenticated(false)
    } catch(err) {
        console.log(err)
    }
  }
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
    <div className="App">
     <h2>Welcome to TempWise Assistant</h2>
     {authenticated && profile ? (
        <div>
          <img src={profile.picture} alt="user image" />
          <h3>User Logged in</h3>
          <p>Name: {profile.name}</p>
          <p>Email Address: {profile.email}</p>
          <br />
          <br />
          <button onClick={logOut}>Log out</button>
        </div>
        ) : (
          <button onClick={() => login() }>Sign in with Google 🚀 </button>
        )}
    </div>
  );
}

export default App;
