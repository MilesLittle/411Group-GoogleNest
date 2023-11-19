import React from "react";
import Home from "./Pages/Home/Home";
import NotFound from "./Pages/Not Found/NotFound";
import NavBar from "./components/NavBar/NavBar";
import Profile from "./Pages/Profile/Profile";
import ThermoDashboard from "./Pages/ThermoDashboard/ThermoDashboard";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <>
      {/* Stuff we want on all pages can go here in App.js*/}
      <NavBar />
      <Routes>
        <Route path="/profile" element={<Profile />}/>
        <Route path="/thermo/:deviceId" element={<ThermoDashboard />}/> {/*protect this route later */}
        <Route path="/" element={<Home />}/>
        <Route path="*" element={<NotFound />}/>
      </Routes>
    </>
  );
}

export default App;
