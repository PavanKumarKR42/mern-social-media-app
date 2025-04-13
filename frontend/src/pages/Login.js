import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../utils/api.js"; // Axios instance
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; 

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault(); // ✅ Prevent form from refreshing the page

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    try {
      const { data } = await api.post("/auth/login", { email, password });
      
      localStorage.setItem("token", data.token);
      toast.success("Login successful! Redirecting...");
      
      navigate("/feed"); // ✅ redirect to feed
    } catch (error) {
      console.error("Login error:", error);
      toast.error(error.response?.data?.message || "Invalid credentials");
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "100vh", background: "linear-gradient(135deg, #667eea, #764ba2)" }}>
      <div className="card p-4 shadow" style={{ width: "300px" }}>
        <h2 className="text-center mb-4">Login</h2>
        
        <form onSubmit={handleLogin}>
          <div className="mb-3">
            <input 
              type="email" 
              className="form-control" 
              placeholder="Email" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>

          <div className="mb-3">
            <input 
              type="password" 
              className="form-control" 
              placeholder="Password" 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">Login</button>
        </form>

        <p className="mt-3 text-center">
          Don't have an account? <Link to="/signup" className="text-primary fw-bold">Sign up</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
