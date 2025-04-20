import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import backgroundImage from "../images/image.png"; // ✅ Import background image

const Signup = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(
        "/auth/register",
        { username, email, password },
        { headers: { "Content-Type": "application/json" } }
      );
      localStorage.setItem("token", data.token);
      toast.success("Signup successful! Redirecting...");
      setTimeout(() => navigate("/profile"), 1500);
    } catch (error) {
      console.error("Signup Error:", error.response?.data);
      toast.error(error.response?.data?.message || "Signup failed");
    }
  };

  return (
    <div
      style={{
        ...styles.container,
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        color: darkMode ? "#fff" : "#333",
      }}
    >
      <div style={{ ...styles.overlay, backgroundColor: darkMode ? "rgba(0, 0, 0, 0.6)" : "rgba(255, 255, 255, 0.7)" }}>
        <button style={styles.toggleButton} onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? "☀ Light Mode" : "🌙 Dark Mode"}
        </button>

        <h2 style={styles.heading}>Sign Up</h2>

        <form onSubmit={handleSignup} style={styles.form}>
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            style={styles.input}
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={styles.input}
          />

          <div style={styles.passwordContainer}>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.passwordInput}
            />
            <span onClick={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
              {showPassword ? "👁️" : "🙈"}
            </span>
          </div>

          <button type="submit" style={styles.button}>Sign Up</button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: "100vh",
    position: "relative",
  },
  overlay: {
    padding: "40px",
    borderRadius: "12px",
    boxShadow: "0 0 20px rgba(0,0,0,0.3)",
    backdropFilter: "blur(5px)",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  heading: {
    fontSize: "28px",
    marginBottom: "20px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    width: "300px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    outline: "none",
  },
  passwordContainer: {
    display: "flex",
    alignItems: "center",
    position: "relative",
  },
  passwordInput: {
    flex: 1,
    padding: "10px",
    fontSize: "16px",
    border: "1px solid #ccc",
    borderRadius: "5px",
    outline: "none",
    width: "100%",
  },
  eyeIcon: {
    position: "absolute",
    right: "10px",
    cursor: "pointer",
    fontSize: "18px",
  },
  button: {
    padding: "10px",
    fontSize: "18px",
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background 0.3s",
  },
  toggleButton: {
    position: "absolute",
    top: "20px",
    right: "20px",
    padding: "8px 12px",
    fontSize: "14px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    transition: "background 0.3s",
  },
};

export default Signup;
