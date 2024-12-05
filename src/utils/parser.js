const moment = require('moment');

const validateLogEntry = (parsedLog, format) => {
  const requiredFields = ['timestamp', 'logLevel', 'message', 'source'];
  const missingFields = requiredFields.filter(field => !parsedLog[field]);
  
  if (missingFields.length > 0) {
    throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
  }
  
  if (!moment(parsedLog.timestamp).isValid()) {
    throw new Error('Invalid timestamp format');
  }
  
  return parsedLog;
};
const parseLogEntry = (entry, format) => {
    try {
        // Handle JSON log format
        if (format === 'json' && entry.trim().startsWith('{')) {
            return JSON.parse(entry);
        }

        // Handle CSV log format
        if (format === 'csv') {
            const [timestamp, logLevel, source, ...messageParts] = entry.split(',');
            if (!timestamp || !logLevel || !source) return null;

            const parsedTimestamp = moment(timestamp.trim());
            if (!parsedTimestamp.isValid()) return null;

            return {
                timestamp: parsedTimestamp.toISOString(),
                logLevel: logLevel.trim(),
                source: source.trim(),
                message: messageParts.join(',').trim(),
            };
        }

        // Handle Nginx log format
        const nginxLogRegex = /(?<ip>\S+) - - \[(?<datetime>[^\]]+)] "(?<method>\S+) (?<endpoint>[^\s?]+)(?:\?[^\s"]*)? HTTP\/\d\.\d" (?<status>\d+) (?<size>\d+) "(?<referrer>[^"]*)" "(?<userAgent>[^"]*)"/;
        const nginxMatch = nginxLogRegex.exec(entry);

        if (nginxMatch) {
            const status = parseInt(nginxMatch.groups.status, 10);
            let logLevel = 'INFO'; // Default log level
            if (status >= 400 && status < 500) logLevel = 'WARN';
            if (status >= 500) logLevel = 'ERROR';

            return {
                timestamp: moment(nginxMatch.groups.datetime, 'DD/MMM/YYYY:HH:mm:ss Z').toISOString(),
                logLevel: logLevel,
                message: `${nginxMatch.groups.method} ${nginxMatch.groups.endpoint} ${nginxMatch.groups.status}`,
                source: 'nginx',
                ip: nginxMatch.groups.ip,
                method: nginxMatch.groups.method,
                endpoint: nginxMatch.groups.endpoint,
                status: status,
                size: parseInt(nginxMatch.groups.size, 10),
                referrer: nginxMatch.groups.referrer,
                userAgent: nginxMatch.groups.userAgent,
            };
        }

         // Handle Apache log format
         const apacheLogRegex = /(?<ip>\S+) - - \[(?<datetime>[^\]]+)] "(?<method>\S+) (?<endpoint>[^\s?]+)(?:\?[^\s"]*)? HTTP\/\d\.\d" (?<status>\d+) (?<size>\d+) "(?<referrer>[^"]*)" "(?<userAgent>[^"]*)"/;
         const apacheMatch = apacheLogRegex.exec(entry);
 
         if (apacheMatch) {
             const status = parseInt(apacheMatch.groups.status, 10);
             let logLevel = 'INFO'; // Default log level
             if (status >= 400 && status < 500) logLevel = 'WARN';
             if (status >= 500) logLevel = 'ERROR';
 
             return {
                 timestamp: moment(apacheMatch.groups.datetime, 'DD/MMM/YYYY:HH:mm:ss Z').toISOString(),
                 logLevel: logLevel,
                 message: `${apacheMatch.groups.method} ${apacheMatch.groups.endpoint} ${apacheMatch.groups.status}`,
                 source: 'apache',
                 ip: apacheMatch.groups.ip,
                 method: apacheMatch.groups.method,
                 endpoint: apacheMatch.groups.endpoint,
                 status: status,
                 size: parseInt(apacheMatch.groups.size, 10),
                 referrer: apacheMatch.groups.referrer,
                 userAgent: apacheMatch.groups.userAgent,
             };
         }

        // Handle plain text log format
        if (format === 'text') {
            const [timestamp, logLevel, ...messageParts] = entry.split(' ');
            if (timestamp && logLevel) {
                return {
                    timestamp: new Date(timestamp).toISOString(),
                    logLevel,
                    source: 'unknown',
                    message: messageParts.join(' ').trim(),
                };
            }
        }

        if (parsedLog) {
            return validateLogEntry(parsedLog, format);
          }
          
          throw new Error('Unsupported or invalid log format');
        } catch (error) {
          error.rawEntry = entry;
          throw error;
        }
      };
module.exports = { parseLogEntry }; // Export the log parser function
