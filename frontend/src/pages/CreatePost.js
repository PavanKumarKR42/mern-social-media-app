import React, { useState } from "react";
import api from "../utils/api.js";
import { toast } from "react-toastify";

const CreatePost = ({ onPostCreated }) => {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!text && !image) {
      toast.error("Text or image is required");
      return;
    }

    const formData = new FormData();
    formData.append("text", text);
    if (image) formData.append("image", image);

    try {
      const token = localStorage.getItem("token");
      await api.post("/posts", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      toast.success("Post created!");
      setText("");
      setImage(null);
      onPostCreated(); // Refresh feed
    } catch (error) {
      toast.error("Failed to create post");
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <textarea
        placeholder="What's on your mind?"
        value={text}
        onChange={(e) => setText(e.target.value)}
        style={styles.textarea}
      />
      <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
      <button type="submit" style={styles.button}>Post</button>
    </form>
  );
};

const styles = {
  form: {
    marginBottom: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    padding: "10px",
  },
  textarea: {
    width: "100%",
    resize: "none",
    padding: "8px",
    borderRadius: "6px",
    marginBottom: "10px",
  },
  button: {
    padding: "8px 16px",
    backgroundColor: "#007bff",
    color: "#fff",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
  },
};

export default CreatePost;
