const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  rawEntry: { type: String, required: true },
  format: { type: String, required: true },
  error: { type: String, required: true },
  fileName: { type: String, required: true }
});

module.exports = mongoose.model('ErrorLog', errorLogSchema);