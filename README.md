# Log Analytics Pipeline

## Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd log-analytics-pipeline
   ```

2. **Install dependencies:**
   Make sure you have Node.js and npm installed. Then run:
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the root directory and add the following variables:
   ```plaintext
   MONGO_URI=mongodb://localhost:27017/logs
   ELASTICSEARCH_URL=http://localhost:9200
   PORT=5000
   ```

4. **Start the application:**
   You can start the application in development mode using:
   ```bash
   npm run dev
   ```

5. **Access the API:**
   The API will be available at `http://localhost:5000/api/logs`.

## API Documentation

### Ingest Logs

- **Endpoint:** `POST /api/logs/ingest`
- **Description:** Ingests log files in JSON, CSV, or plain text format.
- **Request:**
  - **Form Data:**
    - `files`: The log files to be uploaded (multiple files allowed).
- **Response:**
  - **200 OK:** Logs ingested successfully.
  - **400 Bad Request:** If no files are uploaded or if the file format is unsupported.
  - **500 Internal Server Error:** If there is an error during processing.

### Search Logs

- **Endpoint:** `GET /api/logs/search`
- **Description:** Searches for logs based on query parameters.
- **Query Parameters:**
  - `query`: Search term to match in log messages (supports fuzzy matching).
  - `from`: Start date for the search range (ISO format).
  - `to`: End date for the search range (ISO format).
  - `level`: Log level to filter (e.g., INFO, ERROR).
  - `source`: Source of the logs to filter.
  - `sortField`: Field to sort by (default is `timestamp`).
  - `sortOrder`: Order of sorting (`asc` or `desc`).
  - `page`: Page number for pagination (default is 1).
  - `pageSize`: Number of results per page (default is 10).
- **Response:**
  - **200 OK:** Returns an array of matching log entries with pagination and highlighting.
  - **500 Internal Server Error:** If there is an error during the search.

## System Design Explanation

The Log Analytics Pipeline is designed to efficiently ingest, process, and search logs from various sources. The system is built using Node.js, Express, and MongoDB for data storage, with Elasticsearch for powerful search capabilities.

### Components:

- **Express.js:** Handles HTTP requests and routes.
- **Multer:** Middleware for handling file uploads.
- **Mongoose:** ODM for MongoDB to define schemas and interact with the database.
- **Elasticsearch:** Used for indexing and searching log entries.

### Workflow:

1. **File Upload:** Users upload log files via the `/ingest` endpoint.
2. **Processing:** The application processes the files based on their format (JSON, CSV, or plain text) and saves the entries to MongoDB and Elasticsearch.
3. **Searching:** Users can search for logs using various filters via the `/search` endpoint.


## Parsing Assumptions

- **JSON Format:** Assumes the file contains an array of JSON objects, each representing a log entry with fields like `timestamp`, `logLevel`, `message`, and `source`.
- **CSV Format:** Assumes the first line contains headers matching the fields `timestamp`, `logLevel`, `source`, and `message`. Each subsequent line represents a log entry.
- **Plain Text Format:** Assumes each line is a log entry with a format like `timestamp [logLevel] source - message`. The parser splits the line by spaces and uses the first two parts as `timestamp` and `logLevel`, with the rest as the `message`.
- **Nginx Log Format:** Uses a regex pattern to extract fields such as `ip`, `datetime`, `method`, `endpoint`, `status`, `size`, `referrer`, and `userAgent`.

## Sample Log Formats Supported

### JSON Format


json
[
{
"timestamp": "2023-10-01T12:00:00Z",
"logLevel": "INFO",
"message": "User logged in",
"source": "auth-service"
},
{
"timestamp": "2023-10-01T12:05:00Z",
"logLevel": "ERROR",
"message": "Failed to connect to database",
"source": "db-service"
}
]

    
### CSV Format

timestamp,logLevel,source,message
2023-10-01T12:00:00Z,INFO,auth-service,User logged in
2023-10-01T12:05:00Z,ERROR,db-service,Failed to connect to database


### Plain Text Format

2023-10-01T12:00:00Z INFO auth-service User logged in
2023-10-01T12:05:00Z ERROR db-service Failed to connect to database

### Nginx Format

127.0.0.1 - - [10/Apr/2024:16:00:39 +0000] "GET /api/logs/search?query=Failed HTTP/1.1" 404 151 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3"



## Future Improvements

- **Enhanced Security:** Implement authentication and authorization for API endpoints.
- **Scalability:** Use containerization and orchestration tools like Docker and Kubernetes for scaling.
- **Advanced Analytics:** Integrate machine learning models for predictive analytics on log data.
- **User Interface:** Develop a web-based dashboard for visualizing log data and analytics.

## Testing URLs

- **Ingest Logs:**
  - `POST http://localhost:5000/api/logs/ingest` with form data containing log files.

- **Search Logs:**
  - `GET http://localhost:5000/api/logs/search?query=error&from=2023-10-01T00:00:00Z&to=2023-10-02T00:00:00Z&level=ERROR&source=db-service&sortField=timestamp&sortOrder=desc&page=1&pageSize=10`

This `README.md` provides a comprehensive overview of this application, including setup instructions, API documentation, system design, supported log formats, and future improvements. Adjust the repository URL and any other specific details as needed for your project.