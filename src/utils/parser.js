const moment = require('moment'); // Library for date parsing and formatting

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

        return null; // Unsupported or invalid log format
    } catch (error) {
        console.error('Error parsing log entry:', error.message);
        return null;
    }
};

module.exports = { parseLogEntry }; // Export the log parser function
