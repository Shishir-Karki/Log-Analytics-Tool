const express = require('express');
const multer = require('multer');
const { ingestLogs, searchLogs } = require('../controllers/logs');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.post('/ingest',upload.any()
, ingestLogs);
router.get('/search', searchLogs);

module.exports = router;
