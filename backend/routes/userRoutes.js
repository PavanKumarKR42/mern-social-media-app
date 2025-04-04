const express = require("express");
const {
  followUser,
  unfollowUser,
  getUserProfile,
  updateProfile
} = require("../controllers/userController");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware"); // ✅ Import upload middleware

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
router.put("/update", authMiddleware, upload.single("profilePicture"), async (req, res) => {
  console.log("Received Data:", req.body);

  try {
      const { username, bio } = req.body;
      const user = await User.findById(req.user.id);

      if (!user) {
          return res.status(404).json({ message: "User not found" });
      }

      if (username) user.username = username;
      if (bio) user.bio = bio;
      
      // Check if a file was uploaded and update profile picture
      if (req.file) {
        user.profilePicture = `/uploads/${req.file.filename}`; // Ensure correct path
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