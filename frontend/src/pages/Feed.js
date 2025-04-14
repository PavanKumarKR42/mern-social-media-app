import React, { useEffect, useState } from "react";
import api from "../utils/api.js";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import CreatePost from "./CreatePost.js";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar.js"; // Import the SearchBar component

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const decoded = jwtDecode(token);
    setCurrentUserId(decoded.id);

    fetchPosts(token);
  }, []);

  const fetchPosts = async (token) => {
    try {
      const { data } = await api.get("/posts", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPosts(data);
    } catch (err) {
      toast.error("Failed to load posts");
    }
  };

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(`/posts/like/${postId}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchPosts(token);
    } catch (err) {
      toast.error("Could not like post");
    }
  };

  const handleDelete = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Post deleted");
      fetchPosts(token);
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    }
  };

  const handleUserClick = (userId) => {
    navigate(`/users/${userId}`);
  };

  return (
    <div style={styles.container}>
      {/* ✅ Add the Search Bar Here */}
      <SearchBar />

      {/* 👤 My Profile button */}
      <div style={styles.header}>
        <button onClick={() => navigate("/profile")} style={styles.profileBtn}>
          👤 My Profile
        </button>
      </div>

      <h2>📸 Latest Posts</h2>

      {/* CreatePost Component */}
      <CreatePost onPostCreated={() => fetchPosts(localStorage.getItem("token"))} />

      {/* Posts Loop */}
      {posts.map((post) => (
        <div key={post._id} style={styles.post}>
          <div style={styles.userInfo} onClick={() => handleUserClick(post.user._id)}>
            <img
              src={post.user.profilePicture}
              alt="profile"
              style={styles.avatar}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/150";
              }}
            />
            <strong style={styles.username}>{post.user.username}</strong>
          </div>

          {/* ✅ Ensure post.image is a full Cloudinary URL */}
          {post.image && (
            <img
              src={post.image}
              alt="post"
              style={styles.postImage}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300"; // Default placeholder
              }}
            />
          )}

          <p>{post.text}</p>

          <div style={styles.actions}>
            <button onClick={() => handleLike(post._id)}>
              ❤️ {post.likes.length}
            </button>
            {currentUserId === post.user._id && (
              <button onClick={() => handleDelete(post._id)} style={styles.delete}>
                🗑️
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: { padding: "20px", maxWidth: "600px", margin: "auto" },
  header: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "10px",
  },
  profileBtn: {
    background: "#667eea",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  post: {
    border: "1px solid #ccc",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    marginBottom: "10px",
    cursor: "pointer",
  },
  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  username: {
    color: "#333",
  },
  postImage: {
    maxWidth: "100%",
    borderRadius: "6px",
    marginTop: "10px",
  },
  actions: {
    marginTop: "10px",
    display: "flex",
    gap: "10px",
  },
  delete: {
    background: "transparent",
    color: "red",
    border: "none",
    cursor: "pointer",
  },
};

export default Feed;
