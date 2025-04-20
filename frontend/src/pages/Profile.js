import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

const Profile = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [stats, setStats] = useState({ followersCount: 0, followingCount: 0 });
  const [formData, setFormData] = useState({ username: "", bio: "", profilePicture: null });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Session expired, please log in again.");
          navigate("/login");
          return;
        }

        let decodedToken;
        try {
          decodedToken = jwtDecode(token);
        } catch (error) {
          toast.error("Invalid session, please log in again.");
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }

        const userId = decodedToken.id;
        const { data } = await api.get(`/users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(data);
        setFormData({
          username: data.username,
          bio: data.bio || "",
          profilePicture: data.profilePicture,
        });

        const followStats = await api.get(`/users/${userId}/follow-stats`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setStats(followStats.data);
      } catch (error) {
        toast.error("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, profilePicture: e.target.files[0] });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      const formDataToSend = new FormData();
      formDataToSend.append("username", formData.username);
      formDataToSend.append("bio", formData.bio);
      if (formData.profilePicture) {
        formDataToSend.append("profilePicture", formData.profilePicture);
      }

      const { data } = await api.put("/users/update", formDataToSend, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setUser(data.user);
      toast.success("Profile updated successfully!");
      setEditMode(false);
    } catch (error) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleGoToFeed = () => {
    navigate("/feed");
  };

  if (loading) return <h2 className="text-center mt-4">Loading...</h2>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.heading}>{user.username}'s Profile</h2>
        <p style={styles.subText}>Email: {user.email}</p>
        <p>Followers: {stats.followersCount}</p>
        <p>Following: {stats.followingCount}</p>

        {user.profilePicture ? (
          <img
            src={user.profilePicture}
            alt="Profile"
            style={styles.profileImage}
            onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
          />
        ) : (
          <p>No profile picture</p>
        )}

        <p className="mb-3">Bio: {user.bio || "No bio available"}</p>

        <div style={styles.buttonGroup}>
          <button style={{ ...styles.button, ...styles.primary }} onClick={() => setEditMode(true)}>
            Edit Profile
          </button>
          <button style={{ ...styles.button, ...styles.danger }} onClick={handleLogout}>
            Logout
          </button>
          <button style={{ ...styles.button, ...styles.secondary }} onClick={handleGoToFeed}>
            Go to Home
          </button>
        </div>
      </div>

      {editMode && (
        <div style={styles.modal}>
          <div style={styles.modalContent}>
            <h4 style={styles.heading}>Edit Profile</h4>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              style={styles.input}
            />
            <input
              type="text"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Bio"
              style={styles.input}
            />
            <input
              type="file"
              name="profilePicture"
              accept="image/*"
              onChange={handleFileChange}
              style={styles.input}
            />

            <div style={styles.buttonGroup}>
              <button style={{ ...styles.button, ...styles.success }} onClick={handleUpdate}>
                Save
              </button>
              <button style={{ ...styles.button, ...styles.secondary }} onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: "#F5F5DC", // Light Beige
    padding: "30px",
    minHeight: "100vh",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    maxWidth: "600px",
    margin: "0 auto",
    textAlign: "center",
  },
  heading: {
    color: "#5E8B7E", // Muted Teal
  },
  subText: {
    color: "#555",
    marginBottom: "10px",
  },
  profileImage: {
    width: "150px",
    height: "150px",
    borderRadius: "50%",
    objectFit: "cover",
    marginBottom: "15px",
  },
  buttonGroup: {
    display: "flex",
    justifyContent: "center",
    flexWrap: "wrap",
    gap: "10px",
    marginTop: "20px",
  },
  button: {
    padding: "10px 16px",
    border: "none",
    borderRadius: "6px",
    fontSize: "1rem",
    cursor: "pointer",
  },
  primary: {
    backgroundColor: "#5E8B7E",
    color: "white",
  },
  secondary: {
    backgroundColor: "#ccc",
    color: "#333",
  },
  danger: {
    backgroundColor: "#E2725B", // Terracotta Red
    color: "white",
  },
  success: {
    backgroundColor: "#5E8B7E", // Reusing teal for save
    color: "white",
  },
  modal: {
    marginTop: "30px",
    display: "flex",
    justifyContent: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: "20px",
    borderRadius: "8px",
    width: "100%",
    maxWidth: "500px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
  },
  input: {
    margin: "10px 0",
    padding: "10px",
    width: "100%",
    borderRadius: "6px",
    border: "1px solid #ccc",
  },
};

export default Profile;
