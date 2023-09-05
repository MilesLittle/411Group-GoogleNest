import React from 'react';
import './App.css';
import axios from 'axios';
import { GoogleLogin } from '@react-oauth/google';

function App() {
  const responseMessage = (response) => {
    console.log(response);
  }
  const errorMessage = (error) => {
    console.log(error);
  }

  return (
    <div className="App">
     <h2>Welcome to TempWise Assistant</h2>
     <GoogleLogin onSuccess={responseMessage} onError={errorMessage}/>
    </div>
  );
}

export default App;
