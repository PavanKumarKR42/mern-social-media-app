import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api.js"; // Axios instance
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode"; // ✅ Fixed import

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
        setFormData({ username: data.username, bio: data.bio || "", profilePicture: data.profilePicture });

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

  if (loading) return <h2>Loading...</h2>;

  return (
    <div style={styles.container}>
      <h2>{user.username}'s Profile</h2>
      <p>Email: {user.email}</p>
      <p>Followers: {stats.followersCount}</p>
      <p>Following: {stats.followingCount}</p>
      {user.profilePicture ? (
        <img 
          src={`http://localhost:5000/${user.profilePicture}`} 
          alt="Profile" 
          style={styles.profileImage} 
          onError={(e) => (e.target.src = "http://localhost:5000/uploads/default-profile.png")} 
        />
      ) : (
        <p>No profile picture</p>
      )}

      <p>Bio: {user.bio || "No bio available"}</p>

      <button onClick={() => setEditMode(true)} style={styles.button}>
        Edit Profile
      </button>

      <button onClick={handleLogout} style={styles.logoutButton}>
        Logout
      </button>

      {editMode && (
        <div style={styles.modal}>
          <h3>Edit Profile</h3>
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

          <button onClick={handleUpdate} style={styles.saveButton}>Save</button>
          <button onClick={() => setEditMode(false)} style={styles.cancelButton}>Cancel</button>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: { textAlign: "center", padding: "20px" },
  profileImage: { width: "100px", height: "100px", borderRadius: "50%", objectFit: "cover", marginBottom: "10px" },
  button: { padding: "10px", margin: "10px", background: "#007bff", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
  logoutButton: { padding: "10px", margin: "10px", background: "red", color: "#fff", border: "none", borderRadius: "5px", cursor: "pointer" },
  modal: { background: "#fff", padding: "20px", borderRadius: "8px", boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)", display: "inline-block" },
  input: { display: "block", margin: "10px 0", padding: "10px", width: "100%" },
  saveButton: { background: "green", color: "white", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer" },
  cancelButton: { background: "gray", color: "white", padding: "10px", border: "none", borderRadius: "5px", cursor: "pointer", marginLeft: "10px" },
};

export default Profile;