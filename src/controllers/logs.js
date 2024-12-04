const Log = require('../models/log');
const elasticClient = require('../config/elasticsearch');
const { parseLogEntry } = require('../utils/parser');

// Batch size for ingestion optimization
const BATCH_SIZE = 1000;

// Helper function for error handling
const handleError = (res, error, statusCode = 500, details = null) => {
  console.error('Error:', error.message, details || '');
  res.status(statusCode).json({
    status: 'error',
    message: error.message || 'Internal server error',
    details,
  });
};

const ingestLogs = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return handleError(res, new Error('No files uploaded'), 400);
    }

    for (const file of req.files) {
      const format = file.mimetype === 'application/json' ? 'json' :
        file.mimetype === 'text/csv' ? 'csv' :
        file.mimetype === 'text/plain' ? 'text' : null;

      if (!format) {
        return handleError(
          res,
          new Error(`Unsupported file format: ${file.mimetype}`),
          400
        );
      }

      const fileContent = file.buffer.toString('utf-8');
      let entries;

      try {
        if (format === 'json') {
          // Parse the entire JSON array
          entries = JSON.parse(fileContent);
          if (!Array.isArray(entries)) {
            throw new Error('Invalid JSON format. Expected an array of log entries.');
          }
        } else {
          // For CSV and text, split into lines
          entries = fileContent.split('\n').filter((entry) => entry.trim());
        }
      } catch (parsingError) {
        return handleError(res, new Error('Failed to parse file'), 400, parsingError.message);
      }

      for (let i = 0; i < entries.length; i += BATCH_SIZE) {
        const batch = entries.slice(i, i + BATCH_SIZE);
        const parsedLogs = [];

        for (const entry of batch) {
          try {
            console.log(`Processing entry: ${entry}`);
            const parsedLog = format === 'json' ? entry : parseLogEntry(entry, format);
            if (!parsedLog) {
              console.warn(`Skipped unparseable entry: ${entry}`);
              continue;
            }
            parsedLogs.push(parsedLog);
          } catch (parsingError) {
            console.warn('Error parsing log entry:', parsingError.message, { entry });
            continue;
          }
        }

        try {
          // Save batch to MongoDB
          if (parsedLogs.length > 0) {
            await Log.insertMany(parsedLogs);
          }

          // Index batch to Elasticsearch
          const body = parsedLogs.flatMap((doc) => [{ index: { _index: 'logs' } }, doc]);
          if (body.length > 0) {
            await elasticClient.bulk({ refresh: true, body });
          }
        } catch (dbError) {
          console.error('Error saving logs:', dbError.message, {
            batchSize: parsedLogs.length,
          });
        }
      }
    }

    res.status(200).json({ status: 'success', message: 'Logs ingested successfully' });
  } catch (error) {
    handleError(res, error);
  }
};

const searchLogs = async (req, res) => {
    try {
        const { query, from, to, level, source, sortField, sortOrder, page, pageSize } = req.query;
        const must = [];
        const filter = [];

        if (query) must.push({ match: { message: { query, fuzziness: 'AUTO' } } });
        if (from || to) {
            filter.push({
                range: {
                    timestamp: {
                        gte: from || 'now-1y',
                        lte: to || 'now',
                    },
                },
            });
        }
        if (level) must.push({ match: { logLevel: level } });
        if (source) must.push({ match: { source } });

        // Parse and calculate pagination parameters
        const defaultPage = parseInt(page, 10) || 1;
        const defaultPageSize = parseInt(pageSize, 10) || 10;
        const startFrom = (defaultPage - 1) * defaultPageSize;

        console.log(`Fetching logs: page=${defaultPage}, pageSize=${defaultPageSize}, from=${startFrom}`);

        const results = await elasticClient.search({
            index: 'logs',
            body: {
                query: { bool: { must, filter } },
                sort: [{ [sortField || 'timestamp']: { order: sortOrder || 'asc' } }],
                highlight: {
                    fields: {
                        message: {}, // Highlight matches in the "message" field
                    },
                    pre_tags: ['<>'], // HTML tag to wrap the highlighted text
                    post_tags: ['</>'], // Closing HTML tag
                },
            },
            from: startFrom,
            size: defaultPageSize,
        });

        res.status(200).json({
            total: results.hits.total.value,
            page: defaultPage,
            pageSize: defaultPageSize,
            results: results.hits.hits.map((hit) => {
                const source = hit._source;
                const highlight = hit.highlight?.message || [];
                return { ...source, highlight };
            }),
        });
    } catch (error) {
        console.error('Unexpected error during log search:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};



  

module.exports = { ingestLogs, searchLogs };
