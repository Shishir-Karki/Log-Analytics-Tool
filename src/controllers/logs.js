const Log = require('../models/log');
const elasticClient = require('../config/elasticsearch');
const { parseLogEntry } = require('../utils/parser');

const ingestLogs = async (req, res) => {
    try {
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ message: 'No files uploaded' });
        }

        for (const file of req.files) {
            const format = file.mimetype === 'application/json' ? 'json' :
                           file.mimetype === 'text/csv' ? 'csv' :
                           file.mimetype === 'text/plain' ? 'text' : null;

            if (!format) {
                console.error(`Unsupported file format: ${file.mimetype}`);
                return res.status(400).json({ message: `Unsupported file format: ${file.mimetype}` });
            }

            const fileContent = file.buffer.toString('utf-8');
            let entries;

            if (format === 'json') {
                // Parse the entire JSON array
                try {
                    entries = JSON.parse(fileContent); 
                    if (!Array.isArray(entries)) {
                        console.error('Expected JSON array');
                        return res.status(400).json({ message: 'Invalid JSON format. Expected an array of log entries.' });
                    }
                } catch (error) {
                    console.error('Invalid JSON file:', error.message);
                    return res.status(400).json({ message: 'Invalid JSON file.' });
                }
            } else {
                // For CSV and text, split into lines
                entries = fileContent.split('\n').filter((entry) => entry.trim());
            }

            for (const entry of entries) {
                console.log(`Processing entry: ${entry}`); // Log the entry being processed

                const parsedLog = format === 'json' ? entry : parseLogEntry(entry, format);
                if (!parsedLog) {
                    console.error('Error parsing log entry: Unsupported format or invalid entry');
                    continue;
                }

                const log = new Log(parsedLog);
                await log.save();

                await elasticClient.index({
                    index: 'logs',
                    body: parsedLog,
                });
            }
        }

        res.status(200).json({ message: 'Logs ingested successfully' });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};


const searchLogs = async (req, res) => {
  try {
    const { query, from, to, level, source } = req.query;
    const must = [];
    const filter = [];

    if (query) must.push({ match: { message: query } });
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

    const results = await elasticClient.search({
      index: 'logs',
      body: {
        query: { bool: { must, filter } },
      },
    });

    res.status(200).json(results.hits.hits.map((hit) => hit._source));
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { ingestLogs, searchLogs };
