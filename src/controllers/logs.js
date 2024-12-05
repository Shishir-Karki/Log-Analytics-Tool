const Log = require('../models/log'); // MongoDB log model
const ErrorLog = require('../models/errorLog');

const elasticClient = require('../config/elasticsearch'); // Elasticsearch client
const { parseLogEntry } = require('../utils/parser'); // Log entry parser utility

const BATCH_SIZE = 1000; // Number of logs processed per batch

// Handle and respond to errors
const handleError = (res, error, statusCode = 500, details = null) => {
  console.error('Error:', error.message, details || '');
  res.status(statusCode).json({
    status: 'error',
    message: error.message || 'Internal server error',
    details,
  });
};

// Ingest log files: Parse, save to MongoDB, and index in Elasticsearch
const ingestLogs = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return handleError(res, new Error('No files uploaded'), 400);
    }

    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };

    for (const file of req.files) {
      const format = file.mimetype === 'application/json' ? 'json' :
                    file.mimetype === 'text/csv' ? 'csv' :
                    file.mimetype === 'text/plain' ? 'text' : null;

      if (!format) {
        const error = `Unsupported file format: ${file.mimetype}`;
        await ErrorLog.create({
          rawEntry: file.originalname,
          format: file.mimetype,
          error,
          fileName: file.originalname
        });
        results.failed++;
        results.errors.push({ fileName: file.originalname, error });
        continue;
      }

      const fileContent = file.buffer.toString('utf-8');
      let entries;

      try {
        entries = format === 'json' ? 
          JSON.parse(fileContent) : 
          fileContent.split('\n').filter(entry => entry.trim());
          
        if (format === 'json' && !Array.isArray(entries)) {
          throw new Error('Expected an array of log entries');
        }
      } catch (error) {
        const errorMessage = `Failed to parse file: ${error.message}`;
        await ErrorLog.create({
          rawEntry: fileContent,
          format,
          error: errorMessage,
          fileName: file.originalname
        });
        results.failed++;
        results.errors.push({ fileName: file.originalname, error: errorMessage });
        continue;
      }

    

  

      for (let i = 0; i < entries.length; i += BATCH_SIZE) {
        const batch = entries.slice(i, i + BATCH_SIZE);
        const parsedLogs = [];
        
        for (const entry of batch) {
          try {
            const parsedLog = format === 'json' ? entry : parseLogEntry(entry, format);
            if (parsedLog) {
              parsedLogs.push(parsedLog);
              results.successful++;
            }
          } catch (error) {
            results.failed++;
            await ErrorLog.create({
              rawEntry: error.rawEntry || entry,
              format,
              error: error.message,
              fileName: file.originalname
            });
          }
        }

        if (parsedLogs.length > 0) {
          try {
            await Log.insertMany(parsedLogs);
            const body = parsedLogs.flatMap(doc => [
              { index: { _index: 'logs' } },
              doc
            ]);
            await elasticClient.bulk({ refresh: true, body });
          } catch (error) {
            results.errors.push({
              fileName: file.originalname,
              error: `Batch save error: ${error.message}`
            });
          }
        }
      }
    }

    res.status(200).json({
      status: 'success',
      message: 'Log ingestion completed',
      results
    });
  } catch (error) {
    handleError(res, error);
  }
};

// Search logs in Elasticsearch with filters and pagination
const searchLogs = async (req, res) => {
  try {
    const { query, from, to, level, source, sortField, sortOrder, page, pageSize } = req.query;
    const must = [];
    const filter = [];

    if (query) must.push({ match: { message: { query, fuzziness: 'AUTO' } } });
    if (from || to) {
      filter.push({
        range: {
          timestamp: { gte: from || 'now-1y', lte: to || 'now' },
        },
      });
    }
    if (level) must.push({ match: { logLevel: level } });
    if (source) must.push({ match: { source } });

    const defaultPage = parseInt(page, 10) || 1;
    const defaultPageSize = parseInt(pageSize, 10) || 10;
    const startFrom = (defaultPage - 1) * defaultPageSize;

    const results = await elasticClient.search({
      index: 'logs',
      body: {
        query: { bool: { must, filter } },
        sort: [{ [sortField || 'timestamp']: { order: sortOrder || 'asc' } }],
        highlight: { fields: { message: {} }, pre_tags: ['<>'], post_tags: ['</>'] },
      },
      from: startFrom,
      size: defaultPageSize,
    });

    res.status(200).json({
      total: results.hits.total.value,
      page: defaultPage,
      pageSize: defaultPageSize,
      results: results.hits.hits.map((hit) => ({
        ...hit._source,
        highlight: hit.highlight?.message || [],
      })),
    });
  } catch (error) {
    console.error('Error during log search:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { ingestLogs, searchLogs };
