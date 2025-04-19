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
        `/posts/${postId}/comment`,
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

      <h2>📸 Latest Posts</h2>

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
          <p style={{ color: "#777", fontSize: "0.8rem" }}>
            Posted on: {new Date(post.createdAt).toLocaleString()}
          </p>

          <div style={styles.actions}>
            <button onClick={() => handleLike(post._id)}>
              ❤️ {post.likes.length}
            </button>
            <button onClick={() => toggleComments(post._id)}>
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
                    <div style={{ color: "#888", fontSize: "0.75rem" }}>
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
    backgroundColor: "#f3f4f6", // Light gray background for the whole feed
    minHeight: "100vh",
    borderRadius: "10px",
  },
  header: {
    display: "flex",
    justifyContent: "flex-end",
    marginBottom: "10px",
  },
  profileBtn: {
    background: "#4f46e5", // Indigo
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "0.9rem",
  },
  post: {
    backgroundColor: "#ffffff", // White for posts
    border: "1px solid #e5e7eb", // Light border
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
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
    color: "#1f2937", // Darker text
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
    color: "#dc2626", // Red
    border: "none",
    cursor: "pointer",
    marginLeft: "auto",
  },
  comments: {
    marginTop: "10px",
    borderTop: "1px solid #e5e7eb",
    paddingTop: "10px",
    backgroundColor: "#f9fafb", // Lightest gray for comments section
    borderRadius: "6px",
  },
  comment: {
    marginBottom: "8px",
    padding: "5px 10px",
    backgroundColor: "#f3f4f6", // Light gray for each comment
    borderRadius: "4px",
  },
  commentInputWrapper: {
    display: "flex",
    justifyContent: "flex-start",
    gap: "10px",
  },
  commentInput: {
    width: "calc(100% - 120px)",
    padding: "10px",
    marginTop: "10px",
    borderRadius: "6px",
    border: "1px solid #d1d5db",
    backgroundColor: "#ffffff",
  },
  commentButton: {
    background: "#4f46e5", // Indigo
    color: "white",
    border: "none",
    borderRadius: "5px",
    padding: "8px 12px",
    cursor: "pointer",
    fontSize: "1rem",
    marginTop: "10px",
  },
};


export default Feed;
