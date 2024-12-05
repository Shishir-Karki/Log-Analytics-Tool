const ErrorLog = require('../models/errorLog'); // Import the ErrorLog model

// Controller to get error logs with pagination
const getErrorLogs = async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const skip = (page - 1) * pageSize;

    const [errors, total] = await Promise.all([
      ErrorLog.find()
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(parseInt(pageSize)),
      ErrorLog.countDocuments()
    ]);

    res.json({
      status: 'success in fetching error logs',
      data: {
        errors,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

module.exports = { getErrorLogs };