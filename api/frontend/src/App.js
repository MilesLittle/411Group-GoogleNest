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
    const param = new URLSearchParams(window.location.search);
    const code = param.get('code');
    console.log(code);
    return code;
  }

  const getNestTokens = () => {
    const code = getSearchParams();
    const params = {
      client_id: '589825515650-ej6sq8icgc3itevo7b731oes8q1tqk4u.apps.googleusercontent.com',
      client_secret: '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',
      code: code,
      grant_type: 'authorization_code',
      redirect_uri: 'http://localhost:3000'
    };
    axios.post('https://www.googleapis.com/oauth2/v4/token', params)
    .then(function (response) {
      setAccess_token(response.access_token);
      console.log(access_token);
    })
  }

  const getNestDevices = () => {
    console.log(access_token);
    axios.get('https://smartdevicemanagement.googleapis.com/v1/enterprises/f4f5bdc3-964c-466b-bf80-9508f2709ad5/devices', {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`
        }
      }).then(function (response) {
          console.log(response);
          const device_info = response;
          setDevice_info(device_info.data.devices[0]);
          console.log(device_info.data.devices[0])
        });

  }

  const getNestTemp = () => {
    axios.get('https://smartdevicemanagement.googleapis.com/v1/' + device_info.name, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${user.access_token}`
    }
  }).then(function (response) {
    console.log(response);
  });
  }

  const [user, setUser] = useState([]);
  const [profile, setProfile] = useState([]);
  const [access_token, setAccess_token] = useState([]);
  const [device_info, setDevice_info] = useState([]);


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
          <button onClick={() => getNestDevices()}>Get Nest Devices</button>
          <button onClick={() => getNestTemp()}>Get House Temp</button>
          <br />
          
          <br />
          <button onClick={logOut}>Log out</button>
        </div>
        ) : (
          <div>
          <button onClick={() => login()}>Sign in with Google 🚀 </button>
          <button onClick={() => redirect()}>Sign into Google Nest</button>
          <button onClick={() => getNestTokens()}>Get Nest Token</button>
          

          
          </div>
        )}
    </div>
  );
}

export default App;
