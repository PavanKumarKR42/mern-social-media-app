const express = require("express");
const { createPost, getAllPosts, likePost, deletePost } = require("../controllers/postController");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const router = express.Router();
const { getPostById } = require("../controllers/postController"); // ✅ Import function

// Create a post
router.post("/", authMiddleware, createPost);

// Get all posts
router.get("/", getAllPosts);

router.post("/create", authMiddleware, upload.single("image"), createPost);

router.get("/:postId", authMiddleware, getPostById);

// Like a post
router.put("/like/:postId", authMiddleware, likePost);

// Delete a post
router.delete("/:postId", authMiddleware, deletePost);

module.exports = router;
