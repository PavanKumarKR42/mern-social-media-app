import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const Navbar = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate("/login");
  };

  return (
    <nav style={styles.navbar}>
      <Link to="/" style={styles.link}>Home</Link>
      {token ? (
        <>
          <Link to="/profile" style={styles.link}>👤 Profile</Link>
          <button onClick={handleLogout} style={styles.logoutButton}>Logout</button>
        </>
      ) : (
        <Link to="/login" style={styles.link}>Login</Link>
      )}
    </nav>
  );
};

const styles = {
  navbar: {
    display: "flex",
    justifyContent: "space-between",
    padding: "10px 20px",
    background: "#007bff",
  },
  link: {
    color: "white",
    textDecoration: "none",
    marginRight: "15px",
  },
  logoutButton: {
    background: "red",
    color: "white",
    border: "none",
    padding: "8px",
    cursor: "pointer",
  },
};

export default Navbar;