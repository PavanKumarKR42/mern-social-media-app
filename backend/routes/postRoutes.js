const express = require("express");
const {
  createPost,
  getAllPosts,
  getPostById,
  likePost,
  deletePost,
} = require("../controllers/postController");
const Post = require("../models/Post"); // ✅ Important
const authMiddleware = require("../middleware/authMiddleware");
const { uploadPostImage } = require("../middleware/uploadMiddleware");

const router = express.Router();

// ✅ This route MUST go BEFORE the one below!
router.get("/user/:userId", authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId;
    const userPosts = await Post.find({ user: userId });
    if (!userPosts || userPosts.length === 0) {
      return res.status(404).json({ message: "No posts found for this user." });
    }
    res.json(userPosts);
  } catch (error) {
    console.error("Error fetching user posts:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

// 👇 Put this AFTER the user route or it'll intercept it
router.get("/:postId", authMiddleware, getPostById);

// Create post
router.post("/", authMiddleware, uploadPostImage.single("image"), createPost);

// All posts
router.get("/", authMiddleware, getAllPosts);

// Like a post
router.put("/like/:postId", authMiddleware, likePost);

// Delete post
router.delete("/:postId", authMiddleware, deletePost);

module.exports = router;
