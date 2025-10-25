const express = require('express');
const connectDB = require('../config/db');
const authRoutes = require('../routes/authRoutes');
const cors = require('cors');

const app = express();
connectDB(); // Ensure DB is connected on every request

// Middleware
app.use(cors());
app.use(express.json());

// Main Route
app.use('/', authRoutes);

// Export the app instance for Vercel
module.exports = app;