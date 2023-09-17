import React from "react";
//import Home from "./Pages/Home";
//import NotFound from "./Pages/NotFound";
import NavBar from "./components/NavBar/NavBar";
import ChangeLog from "./Pages/ChangeLog";
//import Profile from "./Pages/Profile";
//import { Routes, Route } from "react-router-dom";
function App() {
  return (
    <>
      {/* Stuff we want on all pages can go here in App.js*/}
      <NavBar />

      <ChangeLog />

      {/*
      <Routes>
        <Route path="/profile" element={<Profile />}/>
        <Route path="/" element={<Home />}/>
        <Route path="*" element={<NotFound />}/>




      </Routes>

  */}


    </>
  );
}

export default App;
