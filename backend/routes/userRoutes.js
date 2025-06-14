const express = require("express");
const {
  followUser,
  unfollowUser,
  getUserProfile,
  updateProfile
} = require("../controllers/userController");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const {uploadProfilePicture} = require("../middleware/uploadMiddleware"); // ✅ Import upload middleware
// You no longer need to import cloudinary here as the middleware handles it all
// const cloudinary = require("../utils/cloudinary"); 

const router = express.Router();

// ✅ Get Logged-in User's Profile
router.get("/me", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error", error });
  }
});

// ✅ Update Profile with Profile Picture
router.put("/update", authMiddleware, uploadProfilePicture.single("profilePicture"), async (req, res) => {
  try {
      const { username, bio } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      if (username) user.username = username;
      if (bio) user.bio = bio;

      // --- CORRECTED SECTION ---
      // The `uploadProfilePicture` middleware has already uploaded the file.
      // The secure Cloudinary URL is now available directly on `req.file.path`.
      if (req.file) {
          user.profilePicture = req.file.path; // Assign the URL directly
      }

      await user.save();
      res.json({ message: "Profile updated successfully", user });
  } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Server Error" });
  }
});

// ✅ Follow a user
router.put("/follow/:userId", authMiddleware, followUser);

// ✅ Unfollow a user
router.put("/unfollow/:userId", authMiddleware, unfollowUser);

router.get("/search", async (req, res) => {
  try {
      const { username } = req.query; 
      if (!username) {
          return res.status(400).json({ message: "Search query is required" });
      }

      // Case-insensitive search
      const users = await User.find({
          username: { $regex: username, $options: "i" },
      }).select("_id username profilePicture");

      res.json(users);
  } catch (error) {
      console.error("Error searching users:", error);
      res.status(500).json({ message: "Server error" });
  }
});

router.get("/:userId/followers", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("followers", "username profilePicture")
      .select("followers");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.followers);
  } catch (error) {
    console.error("Error fetching followers:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:userId/following", authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .populate("following", "username profilePicture")
      .select("following");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.following);
  } catch (error) {
    console.error("Error fetching following:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:userId/follow-stats", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select("followers following");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ followersCount: user.followers.length, followingCount: user.following.length });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/:userId", authMiddleware, async (req, res) => {
  try {
    console.log("Fetching user with ID:", req.params.userId); // Debugging
    const user = await User.findById(req.params.userId).select("-password");

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server Error" });
  }
});

module.exports = router;