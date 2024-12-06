const express = require('express');
const { getErrorLogs } = require('../controllers/errorLogsController'); // Import the error logs controller

const router = express.Router();

// Define the route for fetching error logs
router.get('/', getErrorLogs);

module.exports = router;