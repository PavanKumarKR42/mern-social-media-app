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

  // ✅ Get current user ID from token
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

  // ✅ Fetch user profile and follow stats
  useEffect(() => {
    if (userId) {
      fetchUserProfile();
      fetchFollowStats();
    }
  }, [userId, currentUserId]);

  // ✅ Fetch User Profile
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

  // ✅ Fetch Followers & Following Count
  const fetchFollowStats = async () => {
    console.log("User ID in fetch function:", userId); // Debugging

    if (!userId) {
      console.error("Error: Invalid or missing User ID");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // Fetch Followers
      const followersRes = await api.get(`/users/${userId}/followers`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Fetch Following
      const followingRes = await api.get(`/users/${userId}/following`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setFollowers(followersRes.data);
      setFollowing(followingRes.data);
    } catch (error) {
      console.error("Error fetching follow stats:", error);
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

        {/* Follow Button */}
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

        {/* Followers & Following */}
        <div style={{ marginTop: "15px" }}>
          <button onClick={() => setShowFollowers(!showFollowers)}>
            Followers ({followers.length})
          </button>
          <button onClick={() => setShowFollowing(!showFollowing)} style={{ marginLeft: "10px" }}>
            Following ({following.length})
          </button>
        </div>

        {/* Followers List */}
        {showFollowers && (
          <div>
            <h4>Followers</h4>
            {followers.length > 0 ? followers.map((follower) => (
              <p key={follower._id}>{follower.username}</p>
            )) : <p>No followers yet.</p>}
          </div>
        )}

        {/* Following List */}
        {showFollowing && (
          <div>
            <h4>Following</h4>
            {following.length > 0 ? following.map((followee) => (
              <p key={followee._id}>{followee.username}</p>
            )) : <p>Not following anyone yet.</p>}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
