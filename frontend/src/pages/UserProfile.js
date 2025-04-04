import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../utils/api.js";
import { toast } from "react-toastify";

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      // ✅ Fetch user details
      const userRes = await api.get(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // ✅ Fetch posts by this user
      const postsRes = await api.get(`/posts/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(userRes.data);
      setPosts(postsRes.data);
    } catch (err) {
      toast.error("Failed to load profile");
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
      {/* ✅ Profile Section */}
      <div style={{ textAlign: "center", marginBottom: "20px" }}>
        <img
          src={`http://localhost:5000/${user.profilePicture}`}
          alt="profile"
          style={{ width: "80px", height: "80px", borderRadius: "50%", objectFit: "cover" }}
          onError={(e) => {
            e.target.src = "http://localhost:5000/uploads/default-profile.png";
          }}
        />
        <h2>{user.username}</h2>
        <p>{user.email}</p>
      </div>

      <hr style={{ marginBottom: "20px" }} />

      {/* ✅ User Posts */}
      <h3>📸 Posts</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div
            key={post._id}
            style={{
              border: "1px solid #ccc",
              padding: "10px",
              marginTop: "10px",
              borderRadius: "8px",
            }}
          >
            {post.image && (
              <img
                src={post.image}
                alt="post"
                style={{ maxWidth: "100%", borderRadius: "6px", marginBottom: "10px" }}
              />
            )}
            <p>{post.text}</p>
          </div>
        ))
      ) : (
        <p>This user has not posted anything yet.</p>
      )}
    </div>
  );
};

export default UserProfile;
