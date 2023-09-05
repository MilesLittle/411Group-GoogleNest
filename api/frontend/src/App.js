import React from 'react';
import { useState, useEffect } from 'react';
import './App.css';
//import { GoogleLogin } from '@react-oauth/google';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import AuthContext from './Login/AuthContext';

function App() {
/*  const responseMessage = (response) => {
    console.log('Success');
    console.log(response);
  }*/
/*  const errorMessage = (error) => {
    console.log('Error');
    console.log(error);
  } */

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const login = useGoogleLogin({onSuccess: (codeResponse) => setUser(codeResponse), 
    onError: (error) => console.log('Login failed', error)});
  const logOut = () => {
      googleLogout();
      setProfile(null);
  };
  useEffect(() => 
    {if (user) {
      axios.get(`https://www.googleapis.com/oauth2/v1/userinfo?access_token=${user.access_token}`, {
        headers: {
          Authorization: `Bearer ${user.access_token}`,
          Accept: 'application/json'
        }
      }).then((res) => {
        setProfile(res.data)
        console.log(res.data)
      }).catch((err) => console.log(err))
    }}, [user])


  return (
    <AuthContext>
    <div className="App">
     <h2>Welcome to TempWise Assistant</h2>
     {profile ? (
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
          <button onClick={() => login()}>Sign in with Google 🚀 </button>
        )}
    </div>
    </AuthContext>
  );
}

export default App;
