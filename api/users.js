const express = require('express');
const connectDB = require('../config/db');
const userRoutes = require('../routes/userRoutes');
const cors = require('cors');

const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Main Route
app.use('/', userRoutes);

// Export the app instance for Vercel
module.exports = app;