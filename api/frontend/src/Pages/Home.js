import React, { useContext } from "react";
import AuthContext from '../Login/AuthContext';
import '../App.css';

const Home = () => {
    const { currentUser, setCurrentUser, profile, setProfile, authenticated, setAuthenticated } = useContext(AuthContext)
    return (
        <div className="App">
            <h1>Home</h1>
            <div style={{fontSize: 50, margin: '50px' }}>Welcome to TempWise Assistant</div>
            {authenticated && profile ? (
               <div>
                <img src={profile.picture} alt="user image" />
                <h3>User Logged in</h3>
                <p>Name: {profile.name}</p>
                <p>Email Address: {profile.email}</p>
                <br />
                <br />
              </div>
          ) : (null)}
        </div>
    )
}

export default Home