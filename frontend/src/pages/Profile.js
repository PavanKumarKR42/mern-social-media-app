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
    <div className="container mt-5 text-center">
      <div className="card p-4 shadow">
        <h2>{user.username}'s Profile</h2>
        <p className="text-muted">Email: {user.email}</p>
        <p>Followers: {stats.followersCount}</p>
        <p>Following: {stats.followingCount}</p>

        {user.profilePicture ? (
          <img
            src={user.profilePicture}
            alt="Profile"
            className="rounded-circle mb-3 mx-auto d-block"
            style={{ width: "150px", height: "150px", objectFit: "cover" }}
            onError={(e) => (e.target.src = "https://via.placeholder.com/150")}
          />
        ) : (
          <p>No profile picture</p>
        )}

        <p className="mb-3">Bio: {user.bio || "No bio available"}</p>

        <div className="d-flex justify-content-center gap-3 flex-wrap">
          <button className="btn btn-primary" onClick={() => setEditMode(true)}>
            Edit Profile
          </button>
          <button className="btn btn-danger" onClick={handleLogout}>
            Logout
          </button>
          <button className="btn btn-secondary" onClick={handleGoToFeed}>
            Go to Home
          </button>
        </div>
      </div>

      {editMode && (
        <div className="modal-dialog mt-4">
          <div className="modal-content p-4 shadow-sm">
            <h4>Edit Profile</h4>
            <input
              type="text"
              name="username"
              value={formData.username}
              onChange={handleChange}
              placeholder="Username"
              className="form-control my-2"
            />
            <input
              type="text"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              placeholder="Bio"
              className="form-control my-2"
            />
            <input
              type="file"
              name="profilePicture"
              accept="image/*"
              onChange={handleFileChange}
              className="form-control my-2"
            />

            <div className="d-flex justify-content-end gap-2">
              <button className="btn btn-success" onClick={handleUpdate}>
                Save
              </button>
              <button className="btn btn-secondary" onClick={() => setEditMode(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
