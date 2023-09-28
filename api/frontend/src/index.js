import React from 'react';
import ReactDOM from 'react-dom/client';
import { GoogleOAuthProvider } from '@react-oauth/google';
//import App from './components/App
import App from './App'
//import './css/index.css'
import AuthProvider from './Login/AuthProvider';
import CustomTheme from './Theming/CustomTheme';
import DarkModeSwitchProvider from './components/NavBar/Dark Mode/DarkModeSwitchProvider';
import { BrowserRouter } from 'react-router-dom';
import './index.css'

// @ts-ignore
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
<GoogleOAuthProvider clientId='589825515650-ej6sq8icgc3itevo7b731oes8q1tqk4u.apps.googleusercontent.com'>
  <React.StrictMode>
    <BrowserRouter>
    <AuthProvider>
      <DarkModeSwitchProvider>
        <CustomTheme>
            <App />
        </CustomTheme>
      </DarkModeSwitchProvider>
    </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
</GoogleOAuthProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals

