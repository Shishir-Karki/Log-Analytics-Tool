const { Client } = require('@elastic/elasticsearch');

// Elasticsearch client setup

const client = new Client({
    node: process.env.ELASTICSEARCH_URL || 'http://localhost:9200'
    
});

module.exports = client;
