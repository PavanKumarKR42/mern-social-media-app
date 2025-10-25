const express = require('express');
const connectDB = require('../config/db');
const postRoutes = require('../routes/postRoutes');
const cors = require('cors');

const app = express();
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Main Route
app.use('/', postRoutes);

// Export the app instance for Vercel
module.exports = app;