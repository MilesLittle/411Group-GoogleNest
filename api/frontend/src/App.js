import React from "react";
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import NotFound from "./Pages/NotFound";
import NavBar from "./components/NavBar/NavBar";

const router = createBrowserRouter(
  createRoutesFromElements (
    <>
      <Route path="/login" element={<Login/>}/>
      <Route path="/" element={<Home />}/>
      <Route path="*" element={<NotFound />}/>
    </>
  )
)
function App() {
  return (
    <>
      {/*<h1>From App.js</h1>  Stuff we want on all pages can go here in App.js*/}
      <NavBar/>
      <RouterProvider router={router} />
    </>
  );
}

export default App;
