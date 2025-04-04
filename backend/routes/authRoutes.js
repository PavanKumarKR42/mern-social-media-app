const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// ✅ REGISTER - Create New User
router.post("/register", async (req, res) => {
    try {
      console.log("Received Register Request:", req.body);  // ✅ Debugging
  
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
        return res.status(400).json({ message: "All fields are required" });
      }
  
      let user = await User.findOne({ email });
      if (user) return res.status(400).json({ message: "User already exists" });
  
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
  
      user = new User({ username, email, password: hashedPassword });
      await user.save();
  
      const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  
      console.log("User Registered Successfully:", user); // ✅ Debugging
      res.status(201).json({ message: "User registered successfully", token });
  
    } catch (error) {
      console.error("❌ Error in /register:", error); // ✅ Debugging
      res.status(500).json({ message: "Server Error", error: error.message });
    }
});
  
// ✅ LOGIN - Authenticate User
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    // Validate password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Generate JWT Token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });

    res.json({ message: "Login successful", token });

  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  }
});

// ✅ LOGOUT - Clear token on frontend
router.post("/logout", (req, res) => {
  res.json({ message: "Logout successful" });
});

// ✅ PROTECTED ROUTE - For authentication testing
router.get("/protected", authMiddleware, (req, res) => {
  res.json({ message: "Auth Protected Route", user: req.user });
});

module.exports = router;
