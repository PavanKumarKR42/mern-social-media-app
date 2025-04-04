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
        const userToFollow = await User.findById(req.params.userId);
        const currentUser = await User.findById(req.user.id);

        if (!userToFollow) return res.status(404).json({ message: "User not found" });

        if (!currentUser.following.includes(userToFollow._id)) {
            currentUser.following.push(userToFollow._id);
            userToFollow.followers.push(currentUser._id);

            await currentUser.save();
            await userToFollow.save();

            res.json({ message: "User followed", user: userToFollow });
        } else {
            res.status(400).json({ message: "Already following this user" });
        }
    } catch (error) {
        console.error("Error in followUser:", error.stack);
        res.status(500).json({ message: "Server error", error: error.message || "Unknown error" });
    }
};

// Unfollow a User
exports.unfollowUser = async (req, res) => {
    try {
        const userToUnfollow = await User.findById(req.params.userId);
        const currentUser = await User.findById(req.user.id);

        if (!userToUnfollow) return res.status(404).json({ message: "User not found" });

        if (currentUser.following.includes(userToUnfollow._id)) {
            currentUser.following = currentUser.following.filter(id => id.toString() !== userToUnfollow._id.toString());
            userToUnfollow.followers = userToUnfollow.followers.filter(id => id.toString() !== currentUser._id.toString());

            await currentUser.save();
            await userToUnfollow.save();

            res.json({ message: "User unfollowed", user: userToUnfollow });
        } else {
            res.status(400).json({ message: "You are not following this user" });
        }
    } catch (error) {
        console.error("Error in unfollowUser:", error.stack);
        res.status(500).json({ message: "Server error", error: error.message || "Unknown error" });
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