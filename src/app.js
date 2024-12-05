const express = require('express'); // Express for creating the server
const bodyParser = require('body-parser'); // Middleware for parsing request bodies
const dotenv = require('dotenv'); // Load environment variables
const connectDB = require('./config/database'); // MongoDB connection
const logRoutes = require('./routes/logs'); // Log routes
const errorLogRoutes = require('./routes/errorLogs'); // Error log routes


dotenv.config(); // Load .env variables
connectDB(); // Connect to MongoDB

const app = express(); // Initialize Express app

app.use(bodyParser.json()); // Parse JSON request bodies

app.use('/api/logs', logRoutes); // Mount log routes at `/api/logs`
app.use('/api/errors', errorLogRoutes); // Mount error log routes at `/api/errors`


module.exports = app; // Export app for server or testing
