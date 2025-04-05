import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // ✅ Import useNavigate
import api from "../utils/api.js";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode"; // ✅ Import jwtDecode

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate(); // ✅ Initialize navigate
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false); // Track API calls

  // ✅ Get logged-in user's ID from token
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setCurrentUserId(decoded.id);
      } catch (error) {
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        navigate("/login");
      }
    }
  }, [navigate]);

  // ✅ Fetch user profile & posts when userId or currentUserId changes
  useEffect(() => {
    if (currentUserId) {
      fetchUserProfile();
    }
  }, [userId, currentUserId]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");

      // Fetch user details
      const userRes = await api.get(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch posts
      const postsRes = await api.get(`/posts/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(userRes.data);
      setPosts(postsRes.data);

      // Ensure currentUserId is available before checking followers
      if (currentUserId && userRes.data.followers) {
        setIsFollowing(userRes.data.followers.includes(currentUserId));
      }
    } catch (err) {
      console.error("Error fetching user profile:", err.response?.data || err.message);
      toast.error("Failed to load profile");
    }
  };

  // ✅ Follow/Unfollow User
  const handleFollowToggle = async () => {
    if (!currentUserId || currentUserId === userId) {
      toast.error("You can't follow yourself!");
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = isFollowing ? `/users/unfollow/${userId}` : `/users/follow/${userId}`;
      
      // ✅ Changed to PUT request (matches backend)
      const { data } = await api.put(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });

      setIsFollowing(!isFollowing);
      toast.success(data.message);
    } catch (error) {
      console.error("Error in follow/unfollow:", error);
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "auto" }}>
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

        {currentUserId !== user._id && (
          <button
            onClick={handleFollowToggle}
            disabled={isProcessing}
            style={{
              marginTop: "10px",
              padding: "8px 16px",
              borderRadius: "20px",
              background: isFollowing ? "#eee" : "#007bff",
              color: isFollowing ? "#333" : "#fff",
              border: "none",
              cursor: isProcessing ? "not-allowed" : "pointer",
              opacity: isProcessing ? 0.6 : 1,
            }}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}
      </div>

      <hr style={{ marginBottom: "20px" }} />

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
