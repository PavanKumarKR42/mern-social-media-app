const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

dotenv.config();
const app = express();

// Middleware
app.use(express.json());

// CORS Configuration
app.use(
  cors({
    origin: ["http://localhost:3000", "http://54.167.85.71:3000"], // Add the allowed origins here
    credentials: true, // Allow cookies and credentials to be sent
  })
);

// Connect to MongoDB
const connectDB = require("./config/db");
connectDB();

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/posts", require("./routes/postRoutes"));
app.use("/api/users", require("./routes/userRoutes"));


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
