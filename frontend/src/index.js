import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import App from "./App.js";
import { AuthProvider } from "./context/AuthContext.js";
import "react-toastify/dist/ReactToastify.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <BrowserRouter>
    <AuthProvider>
      <ToastContainer position="top-right" autoClose={3000} />
      <App />
    </AuthProvider>
  </BrowserRouter>
);