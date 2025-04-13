import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login.js";
import Signup from "./pages/Signup.js";
import Home from "./pages/Home.js";
import Profile from "./pages/Profile.js";
import Feed from "./pages/Feed.js";
import UserProfile from "./pages/UserProfile.js";
import PrivateRoute from "./utils/PrivateRoute.js";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const App = () => {
  const token = localStorage.getItem("token");

  return (
    <>
      <ToastContainer position="top-right" autoClose={3000} />
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Redirect root to feed if logged in, else to login */}
        <Route
          path="/"
          element={<Navigate to={token ? "/feed" : "/login"} />}
        />

        {/* Private Routes */}
        <Route element={<PrivateRoute />}>
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/feed" element={<Feed />} />
          <Route path="/users/:userId" element={<UserProfile />} />
        </Route>

        {/* Handle 404 - Not Found */}
        <Route path="*" element={<h2>404 Not Found</h2>} />
      </Routes>
    </>
  );
};

export default App;
