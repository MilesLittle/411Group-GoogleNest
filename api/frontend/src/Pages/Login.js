import React, { useContext } from 'react';
import '../App.css';
import { googleLogout, useGoogleLogin } from "@react-oauth/google";
import AuthContext from '../Login/AuthContext';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const navigate = useNavigate()
    const { currentUser, setCurrentUser, profile, setProfile, authenticated, setAuthenticated } = useContext(AuthContext)
    
    const login = useGoogleLogin({
        onSuccess: (codeResponse) => { console.log(codeResponse); setCurrentUser(codeResponse); setAuthenticated(true);}, //token stuff
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
    )
}

export default Login