const moment = require('moment');

const parseLogEntry = (entry, format) => {
    try {
        if (format === 'json' && entry.trim().startsWith('{')) {
            return JSON.parse(entry);
        }

        if (format === 'csv') {
            const [timestamp, logLevel, source, ...messageParts] = entry.split(',');
            if (!timestamp || !logLevel || !source) return null;
            return {
                timestamp: moment(timestamp, moment.ISO_8601, true).isValid() ? moment(timestamp).toISOString() : null,
                logLevel,
                source,
                message: messageParts.join(',').trim(),
            };
        }

        if (format === 'text') {
            // Apache log format
            const apacheLogRegex = /(?<ip>\S+) - - \[(?<datetime>[^\]]+)] "(?<method>\S+) (?<endpoint>\S+) HTTP\/\d\.\d" (?<status>\d+) (?<size>\d+)/;
            const apacheMatch = apacheLogRegex.exec(entry);
            if (apacheMatch) {
                return {
                    ip: apacheMatch.groups.ip,
                    timestamp: moment(apacheMatch.groups.datetime, 'DD/MMM/YYYY:HH:mm:ss Z').toISOString(),
                    method: apacheMatch.groups.method,
                    endpoint: apacheMatch.groups.endpoint,
                    status: parseInt(apacheMatch.groups.status, 10),
                    size: parseInt(apacheMatch.groups.size, 10),
                };
            }

            // Nginx log format
            const nginxLogRegex = /(?<ip>\S+) - - \[(?<datetime>[^\]]+)] "(?<method>\S+) (?<endpoint>\S+) HTTP\/\d\.\d" (?<status>\d+) (?<size>\d+) "(?<referrer>[^"]*)" "(?<userAgent>[^"]*)"/;
            const nginxMatch = nginxLogRegex.exec(entry);
            if (nginxMatch) {
                return {
                    ip: nginxMatch.groups.ip,
                    timestamp: moment(nginxMatch.groups.datetime, 'DD/MMM/YYYY:HH:mm:ss Z').toISOString(),
                    method: nginxMatch.groups.method,
                    endpoint: nginxMatch.groups.endpoint,
                    status: parseInt(nginxMatch.groups.status, 10),
                    size: parseInt(nginxMatch.groups.size, 10),
                    referrer: nginxMatch.groups.referrer,
                    userAgent: nginxMatch.groups.userAgent,
                };
            }

             // Fallback for plain text
             const [timestamp, logLevel, ...messageParts] = entry.split(' ');
             if (timestamp && logLevel) {
                 return {
                     timestamp: new Date(timestamp).toISOString(),
                     logLevel,
                     source: 'unknown', // Default for plain text
                     message: messageParts.join(' ').trim(),
                 };
             }
        }


        return null; // Unsupported format
    } catch (error) {
        console.error('Error parsing log entry:', error.message);
        return null;
    }
};

module.exports = { parseLogEntry };