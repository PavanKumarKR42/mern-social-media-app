const User = require("../models/User");

// Update User Profile
exports.updateProfile = async (req, res) => {
    try {
      console.log("Received file:", req.file); // ✅ Debugging log
  
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
  
      const { username, bio } = req.body;
      const user = await User.findById(req.user.id);
      
      if (!user) return res.status(404).json({ message: "User not found" });
  
      if (username) user.username = username;
      if (bio) user.bio = bio;
  
      user.profilePicture = `/uploads/${req.file.filename}`;
      await user.save();
  
      res.json({ message: "Profile updated successfully", user });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Server Error" });
    }
  };

// Follow a User
exports.followUser = async (req, res) => {
    try {
      const loggedInUserId = req.user.id; // ✅ Get logged-in user from token
      const targetUserId = req.params.userId; // ✅ Get the user to be followed from URL param
  
      if (loggedInUserId === targetUserId) {
        return res.status(400).json({ message: "You can't follow yourself." });
      }
  
      const userToFollow = await User.findById(targetUserId);
      const currentUser = await User.findById(loggedInUserId);
  
      if (!userToFollow || !currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // ✅ Check if already following
      if (currentUser.following.includes(targetUserId)) {
        return res.status(400).json({ message: "Already following this user." });
      }
  
      // ✅ Use `$addToSet` to prevent duplicates
      await User.findByIdAndUpdate(loggedInUserId, { $addToSet: { following: targetUserId } });
      await User.findByIdAndUpdate(targetUserId, { $addToSet: { followers: loggedInUserId } });
  
      res.json({ message: "Followed successfully" });
    } catch (error) {
      console.error("Follow error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
// Unfollow a User
exports.unfollowUser = async (req, res) => {
    try {
      const loggedInUserId = req.user.id;
      const targetUserId = req.params.userId;
  
      const userToUnfollow = await User.findById(targetUserId);
      const currentUser = await User.findById(loggedInUserId);
  
      if (!userToUnfollow || !currentUser) {
        return res.status(404).json({ message: "User not found" });
      }
  
      // ✅ Check if the user is actually following before trying to unfollow
      if (!currentUser.following.includes(targetUserId)) {
        return res.status(400).json({ message: "You are not following this user" });
      }
  
      // ✅ Remove the target user from following list
      await User.findByIdAndUpdate(loggedInUserId, { $pull: { following: targetUserId } });
      await User.findByIdAndUpdate(targetUserId, { $pull: { followers: loggedInUserId } });
  
      res.json({ message: "Unfollowed successfully" });
    } catch (error) {
      console.error("Unfollow error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
// Get User Profile
exports.getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .select("-password")
            .populate("followers following", "username");

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        console.error("Error in getUserProfile:", error.stack);
        res.status(500).json({ message: "Server error", error: error.message || "Unknown error" });
    }
};
