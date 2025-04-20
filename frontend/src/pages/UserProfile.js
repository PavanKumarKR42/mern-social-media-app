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
  const [showModal, setShowModal] = useState(false);

  const colors = {
    terracotta: "#E2725B",
    beige: "#F5F5DC",
    teal: "#5E8B7E",
  };

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
    if (!userId) return;

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

  const handleGoToFeed = () => {
    navigate("/feed");
  };

  if (!user) return <p style={{ textAlign: "center", marginTop: "2rem" }}>Loading...</p>;

  return (
    <div style={{ backgroundColor: colors.beige, minHeight: "100vh", padding: "2rem" }}>
      <button
        className="btn"
        style={{
          backgroundColor: colors.teal,
          color: "#fff",
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 1000,
        }}
        onClick={handleGoToFeed}
      >
        Go to Feed
      </button>

      <div className="text-center mb-4">
        <img
          src={user.profilePicture || "https://via.placeholder.com/150"}
          alt="profile"
          className="rounded-circle"
          style={{
            width: "150px",
            height: "150px",
            objectFit: "cover",
            cursor: "pointer",
            border: `4px solid ${colors.teal}`,
          }}
          onClick={() => setShowModal(true)}
          onError={(e) => {
            e.target.src = "https://via.placeholder.com/150";
          }}
        />
        <h2 style={{ color: colors.terracotta }}>{user.username}</h2>
        <p style={{ color: colors.teal }}>{user.email}</p>

        {currentUserId !== user._id && (
          <button
            onClick={handleFollowToggle}
            disabled={isProcessing}
            className="btn mt-2"
            style={{
              backgroundColor: isFollowing ? "#aaa" : colors.terracotta,
              color: "#fff",
              border: "none",
            }}
          >
            {isFollowing ? "Unfollow" : "Follow"}
          </button>
        )}

        <div className="mt-3">
          <button
            className="btn btn-link"
            style={{ color: colors.terracotta }}
            onClick={() => setShowFollowers(!showFollowers)}
          >
            Followers ({followers.length})
          </button>
          <button
            className="btn btn-link"
            style={{ color: colors.teal }}
            onClick={() => setShowFollowing(!showFollowing)}
          >
            Following ({following.length})
          </button>
        </div>

        {/* Followers */}
        {showFollowers && (
          <div className="mt-3">
            <h4 style={{ color: colors.terracotta }}>Followers</h4>
            {followers.length > 0 ? (
              <div className="d-flex flex-column align-items-center gap-3">
                {followers.map((f) => (
                  <div
                    key={f._id}
                    className="card p-2 d-flex flex-row align-items-center"
                    style={{
                      width: "300px",
                      borderRadius: "10px",
                      gap: "15px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <img
                      src={f.profilePicture || "https://via.placeholder.com/50"}
                      alt="Follower"
                      className="rounded-circle"
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                    <p className="mb-0">{f.username}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>No followers yet.</p>
            )}
          </div>
        )}

        {/* Following */}
        {showFollowing && (
          <div className="mt-3">
            <h4 style={{ color: colors.teal }}>Following</h4>
            {following.length > 0 ? (
              <div className="d-flex flex-column align-items-center gap-3">
                {following.map((f) => (
                  <div
                    key={f._id}
                    className="card p-2 d-flex flex-row align-items-center"
                    style={{
                      width: "300px",
                      borderRadius: "10px",
                      gap: "15px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <img
                      src={f.profilePicture || "https://via.placeholder.com/50"}
                      alt="Following"
                      className="rounded-circle"
                      style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                    <p className="mb-0">{f.username}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p>Not following anyone yet.</p>
            )}
          </div>
        )}
      </div>

      {/* Posts */}
      <div className="text-center mb-3">
        <h3 style={{ color: colors.terracotta }}>Posts</h3>
      </div>

      {posts.length > 0 ? (
        posts.map((post) => (
          <div
            key={post._id}
            className="card mb-3"
            style={{ maxWidth: "500px", margin: "auto", backgroundColor: "#fff" }}
          >
            {post.image && (
              <img
                src={post.image}
                alt="post"
                className="card-img-top"
                style={{ maxHeight: "300px", objectFit: "cover" }}
              />
            )}
            <div className="card-body">
              <p>{post.text}</p>
            </div>
          </div>
        ))
      ) : (
        <p className="text-center">No posts yet.</p>
      )}

      {/* Modal Full-Size Profile Picture */}
      {showModal && (
        <div
          className="modal-backdrop"
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            zIndex: 2000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={() => setShowModal(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: "10px",
              borderRadius: "10px",
              maxWidth: "90vw",
              maxHeight: "90vh",
            }}
          >
            <button
              onClick={() => setShowModal(false)}
              style={{
                position: "absolute",
                top: "5px",
                right: "10px",
                fontSize: "1.5rem",
                background: "transparent",
                border: "none",
                color: "#000",
                cursor: "pointer",
              }}
            >
              &times;
            </button>
            <img
              src={user.profilePicture || "https://via.placeholder.com/500"}
              alt="Full Size"
              style={{
                width: "100%",
                height: "auto",
                maxHeight: "80vh",
                objectFit: "contain",
                borderRadius: "10px",
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
