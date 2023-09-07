import React from "react";
import { Route, RouterProvider, createBrowserRouter, createRoutesFromElements } from "react-router-dom";
import Home from "./Pages/Home";
import Login from "./Pages/Login";
import NotFound from "./Pages/NotFound";

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
    <RouterProvider router={router} />
  );
}

export default App;
