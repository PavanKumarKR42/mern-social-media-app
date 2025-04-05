import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api.js";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

const UserProfile = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showFollowers, setShowFollowers] = useState(false);
  const [showFollowing, setShowFollowing] = useState(false);

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

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchFollowStats();
    }
  }, [userId, currentUserId]);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      const userRes = await api.get(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const postsRes = await api.get(`/posts/user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setUser(userRes.data);
      setPosts(postsRes.data);
      setIsFollowing(userRes.data.followers.includes(currentUserId));
    } catch (err) {
      console.error("Error fetching user profile:", err.response?.data || err.message);
      toast.error("Failed to load profile");
    }
  };

  const fetchFollowStats = async () => {
    if (!userId) {
      console.error("Error: Invalid or missing User ID");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      const followersRes = await api.get(`/users/${userId}/followers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const followingRes = await api.get(`/users/${userId}/following`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFollowers(followersRes.data);
      setFollowing(followingRes.data);
    } catch (error) {
      console.error("Error fetching follow stats:", error);
    }
  };

  const handleFollowToggle = async () => {
    if (!currentUserId || currentUserId === userId) {
      toast.error("You can't follow yourself!");
      return;
    }

    setIsProcessing(true);
    try {
      const token = localStorage.getItem("token");
      const endpoint = isFollowing ? `/users/unfollow/${userId}` : `/users/follow/${userId}`;
      await api.put(endpoint, {}, { headers: { Authorization: `Bearer ${token}` } });

      setIsFollowing(!isFollowing);
      toast.success(isFollowing ? "Unfollowed" : "Followed");
      fetchFollowStats();
    } catch (error) {
      console.error("Error in follow/unfollow:", error);
      toast.error(error.response?.data?.message || "Something went wrong.");
    } finally {
      setIsProcessing(false);
    }
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.profileHeader}>
        <img
          src={user.profilePicture || "https://via.placeholder.com/150"}
          alt="profile"
          style={styles.avatar}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/150";
          }}
        />
        <h2>{user.username}</h2>
        <p>{user.email}</p>

        {currentUserId !== user._id && (
          <button
            onClick={handleFollowToggle}
            disabled={isProcessing}
            style={{
              ...styles.followBtn,
              background: isFollowing ? "#ddd" : "#007bff",
              color: isFollowing ? "#333" : "#fff",
            }}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}

        <div style={styles.followStats}>
          <button onClick={() => setShowFollowers(!showFollowers)}>
            Followers ({followers.length})
          </button>
          <button onClick={() => setShowFollowing(!showFollowing)} style={{ marginLeft: "10px" }}>
            Following ({following.length})
          </button>
        </div>

        {showFollowers && (
          <div>
            <h4>Followers</h4>
            {followers.length > 0 ? followers.map((follower) => (
              <p key={follower._id}>{follower.username}</p>
            )) : <p>No followers yet.</p>}
          </div>
        )}

        {showFollowing && (
          <div>
            <h4>Following</h4>
            {following.length > 0 ? following.map((followee) => (
              <p key={followee._id}>{followee.username}</p>
            )) : <p>Not following anyone yet.</p>}
          </div>
        )}
      </div>

      <h3>Posts</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post._id} style={styles.post}>
            {/* Show image only if it exists */}
            {post.image && (
              <img
                src={post.image}
                alt="post"
                style={styles.postImage}
                onError={(e) => {
                  e.target.style.display = "none"; // Hide broken images
                }}
              />
            )}
            <p>{post.text}</p>
          </div>
        ))
      ) : (
        <p>No posts yet.</p>
      )}
    </div>
  );
};

const styles = {
  container: { padding: "20px", maxWidth: "600px", margin: "auto" },
  profileHeader: { textAlign: "center", marginBottom: "20px" },
  avatar: {
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  followBtn: {
    marginTop: "10px",
    padding: "8px 16px",
    borderRadius: "20px",
    border: "none",
    cursor: "pointer",
  },
  followStats: { marginTop: "15px" },
  post: {
    border: "1px solid #ccc",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
  },
  postImage: {
    maxWidth: "100%",
    borderRadius: "6px",
    marginTop: "10px",
  },
};

export default UserProfile;
