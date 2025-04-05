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
const cloudinary = require("../utils/cloudinary"); // ✅ Import Cloudinary

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

      // ✅ Correct Cloudinary URL assignment
      if (req.file) {
          const result = await cloudinary.uploader.upload(req.file.path); // Upload to Cloudinary
          user.profilePicture = result.secure_url; // Store the secure Cloudinary URL
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
      const { username } = req.query; // ✅ Fix this
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

// ✅ Fetch Following List (Place it here)
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
// ✅ Get a specific user's profile
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