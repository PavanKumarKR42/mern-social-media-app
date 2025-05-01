import React, { useEffect, useState } from "react";
import api from "../utils/api.js";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import CreatePost from "./CreatePost.js";
import { useNavigate } from "react-router-dom";
import SearchBar from "./SearchBar.js";

const Feed = () => {
  const [posts, setPosts] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [commentsMap, setCommentsMap] = useState({});
  const [visibleComments, setVisibleComments] = useState({});
  const [commentText, setCommentText] = useState("");
  const [selectedPostId, setSelectedPostId] = useState(null);

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

  const fetchComments = async (postId, token) => {
    try {
      const { data } = await api.get(`/posts/${postId}/comments`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCommentsMap((prev) => ({
        ...prev,
        [postId]: data,
      }));
    } catch (err) {
      toast.error("Could not load comments");
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

  const toggleComments = async (postId) => {
    if (selectedPostId && selectedPostId !== postId) {
      setVisibleComments({});
    }

    setSelectedPostId(postId);

    setVisibleComments((prev) => ({
      ...prev,
      [postId]: !prev[postId],
    }));

    if (!commentsMap[postId]) {
      const token = localStorage.getItem("token");
      fetchComments(postId, token);
    }
  };

  const handleCommentChange = (event) => {
    setCommentText(event.target.value);
  };

  const handlePostComment = async (postId) => {
    if (!commentText.trim()) {
      toast.error("Comment cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      await api.post(
        `/posts/${postId}/comments`,
        { text: commentText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success("Comment added");
      setCommentText("");
      fetchComments(postId, token);
    } catch (err) {
      toast.error("Failed to post comment");
    }
  };

  return (
    <div style={styles.container}>
      <SearchBar />

      <div style={styles.header}>
        <button onClick={() => navigate("/profile")} style={styles.profileBtn}>
          👤 My Profile
        </button>
      </div>

      <h2 style={styles.heading}>📸 Home Posts</h2>

      <CreatePost onPostCreated={() => fetchPosts(localStorage.getItem("token"))} />

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

          {post.image && (
            <img
              src={post.image}
              alt="post"
              style={styles.postImage}
              onError={(e) => {
                e.target.src = "https://via.placeholder.com/300";
              }}
            />
          )}

          <p>{post.text}</p>
          <p style={styles.timestamp}>
            Posted on: {new Date(post.createdAt).toLocaleString()}
          </p>

          <div style={styles.actions}>
            <button onClick={() => handleLike(post._id)} style={styles.likeBtn}>
              ❤️ {post.likes.length}
            </button>
            <button onClick={() => toggleComments(post._id)} style={styles.commentToggle}>
              💬 {visibleComments[post._id] ? "Hide" : "View"} Comments
            </button>
            {currentUserId === post.user._id && (
              <button onClick={() => handleDelete(post._id)} style={styles.delete}>
                🗑️
              </button>
            )}
          </div>

          {visibleComments[post._id] && (
            <div style={styles.comments}>
              {commentsMap[post._id]?.length > 0 ? (
                commentsMap[post._id].map((comment) => (
                  <div key={comment._id} style={styles.comment}>
                    <div>
                      <strong>{comment.user?.username || "User"}:</strong> {comment.text}
                    </div>
                    <div style={styles.commentTimestamp}>
                      {new Date(comment.createdAt).toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ fontStyle: "italic" }}>No comments yet.</p>
              )}

              <div style={styles.commentInputWrapper}>
                <textarea
                  value={commentText}
                  onChange={handleCommentChange}
                  placeholder="Write a comment..."
                  rows="3"
                  style={styles.commentInput}
                />
                <button
                  onClick={() => handlePostComment(post._id)}
                  style={styles.commentButton}
                >
                  Post Comment
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const styles = {
  container: {
    padding: "20px",
    maxWidth: "600px",
    margin: "auto",
    backgroundColor: "#F5F5DC", // Light Beige
    minHeight: "100vh",
    borderRadius: "10px",
  },
  header: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "10px",
  },
  profileBtn: {
    background: "#E2725B", // Terracotta Red
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  heading: {
    color: "#5E8B7E", // Muted Teal
  },
  post: {
    backgroundColor: "#ffffff",
    border: "1px solid #ddd",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
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
  timestamp: {
    color: "#777",
    fontSize: "0.8rem",
  },
  actions: {
    marginTop: "10px",
    display: "flex",
    gap: "10px",
  },
  likeBtn: {
    background: "#E2725B",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "6px 10px",
    cursor: "pointer",
  },
  commentToggle: {
    background: "#5E8B7E",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "6px 10px",
    cursor: "pointer",
  },
  delete: {
    background: "transparent",
    color: "#E2725B",
    border: "1px solid #E2725B",
    borderRadius: "5px",
    padding: "6px 10px",
    marginLeft: "auto",
    cursor: "pointer",
  },
  comments: {
    marginTop: "10px",
    borderTop: "1px solid #ccc",
    paddingTop: "10px",
    backgroundColor: "#f9f9f9",
    borderRadius: "6px",
  },
  comment: {
    marginBottom: "8px",
    padding: "8px 10px",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
  },
  commentTimestamp: {
    color: "#888",
    fontSize: "0.75rem",
  },
  commentInputWrapper: {
    display: "flex",
    justifyContent: "flex-start",
    gap: "10px",
    marginTop: "10px",
  },
  commentInput: {
    width: "calc(100% - 120px)",
    padding: "10px",
    borderRadius: "6px",
    border: "1px solid #ccc",
    backgroundColor: "#fff",
  },
  commentButton: {
    background: "#5E8B7E",
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "1rem",
  },
};

export default Feed;
