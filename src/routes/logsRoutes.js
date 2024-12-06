const express = require('express'); // Express router for handling routes
const multer = require('multer'); // Multer for file uploads
const { ingestLogs, searchLogs } = require('../controllers/logsController'); // Log controller functions

const upload = multer({ storage: multer.memoryStorage() }); // Use memory storage for uploads
const router = express.Router(); // Create router instance

// Log ingestion route: handles file uploads and processes logs
router.post('/ingest', upload.any(), ingestLogs);

// Log search route: queries logs with filters
router.get('/search', searchLogs);

module.exports = router; // Export the router
