const mongoose = require('mongoose');

const failedLogSchema = new mongoose.Schema({
  originalEntry: { type: String, required: true },
  error: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model('FailedLog', failedLogSchema);