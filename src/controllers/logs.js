const Log = require('../models/log');
const elasticClient = require('../config/elasticsearch');
const { parseLogEntry } = require('../utils/parser');


//Add batch size for ingestion optimization
const BATCH_SIZE = 1000;

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

            for (let i = 0; i < entries.length; i += BATCH_SIZE) {
              const batch = entries.slice(i, i + BATCH_SIZE);
              const parsedLogs = [];

              

              for (const entry of batch) {
                  console.log(`Processing entry: ${entry}`);
                  const parsedLog = format === 'json' ? entry : parseLogEntry(entry, format);
                  if (!parsedLog) {
                      console.error('Error parsing log entry: Unsupported format or invalid entry');

                      continue;
                  }
                  parsedLogs.push(parsedLog);
              }

              // Save batch to MongoDB
              await Log.insertMany(parsedLogs);

               

              // Index batch to Elasticsearch
              const body = parsedLogs.flatMap(doc => [{ index: { _index: 'logs' } }, doc]);
              await elasticClient.bulk({ refresh: true, body });
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
