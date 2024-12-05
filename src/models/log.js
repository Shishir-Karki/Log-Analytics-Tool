const mongoose = require('mongoose'); // Mongoose for MongoDB interaction

const logSchema = new mongoose.Schema({
  timestamp: { type: Date, required: true }, // Log creation time
  logLevel: { type: String, required: true }, // Severity level (e.g., INFO, ERROR)
  message: { type: String, required: true }, // Log message
  source: { type: String, required: true }, // Log source (application/service)
  ip: { type: String }, // Client IP address
  method: { type: String }, // HTTP method (e.g., GET, POST)
  endpoint: { type: String }, // Accessed API endpoint
  status: { type: Number }, // HTTP response status
  size: { type: Number }, // Response size in bytes
  referrer: { type: String }, // Referrer URL
  userAgent: { type: String }, // Client browser/device details
});

// Export the Log model
module.exports = mongoose.model('Log', logSchema);
