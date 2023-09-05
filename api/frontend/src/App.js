import React from 'react';
import { useState, useEffect } from 'react';
import './App.css';
//import { GoogleLogin } from '@react-oauth/google';
import { googleLogout, useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';

function App() {
/*  const responseMessage = (response) => {
    console.log('Success');
    console.log(response);
  }*/
/*  const errorMessage = (error) => {
    console.log('Error');
    console.log(error);
  } */
  
  
  //This is to redirect us to the google login to get the code we need
  //It redirects us back to localhost for now with the proper code in the url
  const redirect = () => {
    window.location.replace('https://nestservices.google.com/partnerconnections/f4f5bdc3-964c-466b-bf80-9508f2709ad5/auth?redirect_uri=http://localhost:3000&access_type=offline&prompt=consent&client_id=589825515650-ej6sq8icgc3itevo7b731oes8q1tqk4u.apps.googleusercontent.com&response_type=code&scope=https://www.googleapis.com/auth/sdm.service')
  }

  const getSearchParams = () => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
  }

  const [user, setUser] = useState([]);
  const [profile, setProfile] = useState([]);
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
      //  console.log(res.data)
      }).catch((err) => console.log(err))
    }}, [user])


  return (
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
          <div>
          <button onClick={() => login()}>Sign in with Google 🚀 </button>
          <button onClick={() => redirect()}>Sign into Google Nest</button>

          
          </div>
        )}
    </div>
  );
}

export default App;
