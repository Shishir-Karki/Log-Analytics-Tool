const parseLogEntry = (entry, format) => {
    try {
        if (format === 'json' && entry.trim().startsWith('{')) {
            return JSON.parse(entry);
        }

        if (format === 'csv') {
            const [timestamp, logLevel, source, ...messageParts] = entry.split(',');
            if (!timestamp || !logLevel || !source) return null;
            return {
                timestamp: new Date(timestamp).toISOString(),
                logLevel,
                source,
                message: messageParts.join(',').trim(),
            };
        }

        if (format === 'text') {
            // text log format
            const apacheLogRegex = /(?<ip>\S+) - - \[(?<datetime>[^\]]+)] "(?<method>\S+) (?<endpoint>\S+) HTTP\/\d\.\d" (?<status>\d+) (?<size>\d+)/;
            const apacheMatch = apacheLogRegex.exec(entry);
            if (apacheMatch) {
                return {
                    ip: apacheMatch.groups.ip,
                    timestamp: new Date(apacheMatch.groups.datetime.replace(':', ' ')).toISOString(),
                    method: apacheMatch.groups.method,
                    endpoint: apacheMatch.groups.endpoint,
                    status: parseInt(apacheMatch.groups.status, 10),
                    size: parseInt(apacheMatch.groups.size, 10),
                };
            }

            // Standard log format
            const standardLogRegex = /\[(?<datetime>[^\]]+)] \[(?<level>[A-Z]+)] (?<service>[^\s]+) - (?<message>.+)/;
            const standardMatch = standardLogRegex.exec(entry);
            if (standardMatch) {
                return {
                    timestamp: new Date(standardMatch.groups.datetime).toISOString(),
                    logLevel: standardMatch.groups.level,
                    source: standardMatch.groups.service,
                    message: standardMatch.groups.message.trim(),
                };
            }
            
             // Nginx log format
             const nginxLogRegex = /(?<ip>\S+) - - \[(?<datetime>[^\]]+)] "(?<method>\S+) (?<endpoint>\S+) HTTP\/\d\.\d" (?<status>\d+) (?<size>\d+) "(?<referrer>[^"]*)" "(?<userAgent>[^"]*)"/;
             const nginxMatch = nginxLogRegex.exec(entry);
             if (nginxMatch) {
                 return {
                     ip: nginxMatch.groups.ip,
                     timestamp: new Date(nginxMatch.groups.datetime.replace(':', ' ')).toISOString(),
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
