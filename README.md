

## Log Analytics Pipeline

A powerful and flexible log analytics system designed to handle multiple log formats, enabling efficient ingestion, processing, storage, and advanced searching.

---

## **Key Features**
- 📂 **Multi-format Log Ingestion**: Supports JSON, CSV, Plain Text, and Nginx formats.
- 🚀 **Batch Processing**: Optimized for high-performance data handling.
- 🛠️ **Dual Storage System**: 
  - **MongoDB**: Persistent storage.
  - **Elasticsearch**: Fast, flexible search capabilities.
- 🔍 **Advanced Search**: Filter, sort, and paginate logs with ease.
- ⏱️ **Real-time Processing**: Instant updates and log analysis.
- 🛡️ **Status-based Log Levels**: Assigns Nginx log levels dynamically.
- ⚙️ **Flexible Schema**: Supports a variety of log attributes for diverse use cases.
- 🛠️ **Error Logging**: Stores errors encountered during log ingestion or processing in MongoDB for review.


---

## **Getting Started**

### **1. Clone the Repository**
```bash
git clone https://github.com/Shishir-Karki/Log-Analytics-Tool.git
```

### **2. Install Dependencies**
Ensure Node.js and npm are installed, then run:
```bash
npm install
```

### **3. Set Up Environment Variables**
Create a `.env` file in the project root and add:
```plaintext
MONGO_URI=mongodb:Your_URL
ELASTICSEARCH_URL=http://localhost:9200
PORT=5000
```

### **4. Start the Application**
```bash
npm run dev
```

---
## **Setting Up Elasticsearch**

### **1. Download and Installation**

1. Visit the official Elasticsearch website:   ```
   https://www.elastic.co/downloads/elasticsearch   ```

2. Download Elasticsearch 8.x.x for Windows (ZIP file)
   - Choose the ZIP archive, not the MSI installer
   - Example: `elasticsearch-8.16.2-windows-x86_64.zip`

3. Extract the ZIP file to your desired location
   - Recommended: `C:\elasticsearch`
   - Full path example: `C:\elasticsearch\elasticsearch-8.16.2`

### **2. Configuration**

1. Navigate to the config directory:   ```
   C:\elasticsearch\elasticsearch-8.16.2\config   ```

2. Edit `elasticsearch.yml`:   ```yaml

   xpack.security.enabled: false
   network.host: 0.0.0.0
   http.port: 9200
   cluster.name: <name>
   node.name: <your_choice>  ```

### **3. Running Elasticsearch**

1. Open Command Prompt as Administrator

2. Navigate to the bin directory:   ```bash
   cd C:\elasticsearch\elasticsearch-8.16.2\bin   ```

3. Start Elasticsearch:   ```bash
   elasticsearch.bat   ```

4. Wait for startup (you should see something like):   ```
   [2024-03-10T12:00:00,000][INFO ][o.e.n.Node               ] [node-1] started   ```

### **4. Verify Installation**

1. Open a new Command Prompt window

2. Test the connection:   ```bash
   curl http://localhost:9200   ```

   Or visit in your browser:   ```
   http://localhost:9200   ```

3. Expected response:   ```json
   {
     "name" : "node-1",
     "cluster_name" : "log-analytics-cluster",
     "version" : {
       "number" : "8.16.2"
     },
     "tagline" : "You Know, for Search"
   }   ```



## **API Endpoints**

### **Log Ingestion**
- **URL**: `POST /api/logs/ingest`
- **Description**: Upload log files in multiple formats.
- **Supported Formats**: JSON, CSV, Plain Text, Nginx.
- **Request**: Form-data with `files` (supports multiple files).
- **Response Codes**:
  - `200`: Logs ingested successfully.
  - `400`: Invalid format or no files provided.
  - `500`: Internal processing error.

### **Log Search**
- **URL**: `GET /api/logs/search`
- **Description**: Search logs with advanced filters.
- **Query Parameters**:
  - `query`: Search term.
  - `from`: Start date (ISO format).
  - `to`: End date (ISO format).
  - `level`: Log level (e.g., INFO, WARN, ERROR).
  - `source`: Source filter.
  - `sortField`: Field to sort by (e.g., timestamp).
  - `sortOrder`: `asc` or `desc`.
  - `page`: Page number.
  - `pageSize`: Results per page.

---

## **Supported Log Formats**

### **1. JSON**
```json
[
  {
    "timestamp": "2023-10-01T12:00:00Z",
    "logLevel": "INFO",
    "message": "User logged in",
    "source": "auth-service"
  }
]
```

### **2. CSV**
```csv
timestamp,logLevel,source,message
2023-10-01T12:00:00Z,INFO,auth-service,User logged in
```

### **3. Plain Text**
```plaintext
2023-10-01T12:00:00Z INFO auth-service User logged in
```

### **4. Nginx**
```plaintext
127.0.0.1 - - [10/Apr/2024:16:00:39 +0000] "GET /api/logs/search HTTP/1.1" 404 151 "-" "Mozilla/5.0"
```

---



## **System Design**

The log analytics pipeline is designed to efficiently handle the ingestion, processing, storage, and searching of logs across multiple formats, with comprehensive error tracking. Below is an overview of its key components and data flow:

---

### **Components**

#### **1. Express Server**  
- Acts as the main entry point for API requests.  
- Handles routes for log ingestion (`/api/logs/ingest`) and search (`/api/logs/search`).  

#### **2. Log Ingestion**  
- Supports multiple log formats: **JSON**, **CSV**, **Plain Text**, and **Nginx**.  
- Utilizes **Multer** to manage file uploads.  
- Processes logs in batches for optimal performance.  

#### **3. Data Storage**  
- **MongoDB**: 
  - Persistent storage of raw log data
  - Dedicated error log collection for tracking failures
- **Elasticsearch**: Indexes logs for fast and flexible search capabilities.  

#### **4. Error Logging**
- **Error Collection**: Stores detailed error information in MongoDB
- **Error Types Tracked**:
  - File format validation errors
  - Parsing failures
  - Storage operation failures
- **Error Context**: Captures file names, raw entries, and stack traces

#### **5. Log Parsing**  
- Converts raw log entries into structured data.  
- Applies specific parsing rules for each supported format.
- Records parsing failures in error log collection.

#### **6. Search Functionality**  
- Provides advanced filtering, sorting, and pagination options.  
- Integrates with Elasticsearch for efficient querying and result retrieval.  

---

### **Data Flow**

1. **Ingestion & Validation**:  
   - Logs are uploaded via the `/api/logs/ingest` endpoint.
   - File format validation occurs before processing.
   - Invalid formats are logged to error collection.

2. **Processing & Error Tracking**:
   - Logs are processed in batches of 1000 entries.
   - Parse errors are captured and stored in MongoDB.
   - Successfully parsed logs continue to storage.

3. **Storage**:  
   - Valid logs are saved in MongoDB.
   - Logs are indexed in Elasticsearch.
   - Storage failures are logged to error collection.

4. **Search**:  
   - Users query logs through the `/api/logs/search` endpoint.
   - Elasticsearch handles search operations.
   - Search errors are tracked and logged.

---



## **Processing Pipeline**

### **1. Log Ingestion Flow**

#### File Upload & Validation
- **Multer Integration**: Handles multipart/form-data file uploads
- **Format Validation**: Supports JSON, CSV, Plain Text, Nginx, Apache
- **Error Logging**: Captures validation failures in MongoDB error collection

#### Batch Processing
- **Batch Size**: 1000 logs per batch
- **Storage Flow**:
  1. Parse log entries
  2. Save to MongoDB
  3. Index in Elasticsearch
- **Error Handling**: Per-batch error tracking and storage

### **2. Format-Specific Parsing**

#### JSON Logs
- Array of objects validation
- Schema conformity check
- Required fields: timestamp, logLevel, message, source

#### CSV Logs
- Header validation
- Column mapping
- Required columns: timestamp, logLevel, source, message

#### Plain Text
- Space-separated format
- Timestamp validation
- Message concatenation

#### Nginx/Apache Logs
- Regex-based parsing
- Status code to log level mapping:
  - 2xx/3xx → INFO
  - 4xx → WARN
  - 5xx → ERROR
- IP and user agent extraction

### **3. Error Handling**

#### Error Collection
- **MongoDB Storage**: Dedicated error log collection
- **Context Capture**: 
  - Raw log entry
  - Error type
  - Stack trace
  - Timestamp
- **Retrieval**: Paginated error log access

### **3. Search Implementation**
#### Query Building
- **Elasticsearch Query DSL**:
  - Bool query with must/filter clauses
  - Range queries for timestamps
  - Fuzzy matching for messages
  - Reference implementation:

### **4. Response Formats**
Add standardized response formats for:
- Successful ingestion
- Search results with highlighting
- Error responses with context


## **Parsing Rules**

### **JSON**
- Must be an array of objects.
- Required fields: `timestamp`, `logLevel`, `message`, `source`.
- Timestamp must follow ISO format.

### **CSV**
- First row should contain headers.
- Required columns: `timestamp`, `logLevel`, `source`, `message`.
- Values should be comma-separated.
- Timestamp must follow ISO format.

### **Plain Text**
- Space-separated values: `timestamp logLevel source message`.
- Timestamp must follow ISO format.

### **Nginx**
- Uses the standard Nginx log format.
- Log levels are auto-assigned based on HTTP status codes:
  - `2xx/3xx`: INFO
  - `4xx`: WARN
  - `5xx`: ERROR

---

## **Example Commands**

### **Ingest Logs**
#### JSON
```bash
curl -X POST http://localhost:5000/api/logs/ingest -F "files=@logs.json"
```

#### CSV
```bash
curl -X POST http://localhost:5000/api/logs/ingest -F "files=@logs.csv"
```

#### Plain Text
```bash
curl -X POST http://localhost:5000/api/logs/ingest -F "files=@logs.txt"
```

#### Nginx
```bash
curl -X POST http://localhost:5000/api/logs/ingest -F "files=@nginx.log"
```

---

### **Search Logs**
#### Basic Search
```bash
http://localhost:5000/api/logs/search?query=error
```

#### Advanced Search
```bash
http://localhost:5000/api/logs/search?query=error&from=2023-10-01T00:00:00Z&to=2023-10-02T00:00:00Z&level=ERROR&source=db-service&sortField=timestamp&sortOrder=desc&page=1&pageSize=10
```

---

### **Basic error logs request**
```bash
curl http://localhost:5000/api/logs/errors
```

### **With pagination**
```bash
curl http://localhost:5000/api/logs/errors?page=2&pageSize=20
```
---

#### Performance Optimizations
- **Caching Strategy**:
  - Query results caching
  - Field data caching
  - Filter cache optimization

- **Search Efficiency**:
  - Term-level queries for exact matches
  - Field data optimization for sorting
  - Scroll API for deep pagination

### **4. Error Handling System**
#### Hierarchical Error Classification
- **Parse Errors**:
  - Format validation
  - Schema validation
  - Timestamp parsing
- **Storage Errors**:
  - MongoDB connection issues
  - Elasticsearch indexing failures
- **Query Errors**:
  - Invalid parameters
  - Malformed queries


----

## **Future Improvements**
- 🔐 Authentication and Authorization.
- 📊 Advanced Analytics Dashboard.
- 🤖 Machine Learning for predictive log analysis.
- ⚡ Real-time Log Streaming.
- ⏳ Rate Limiting and Quota Management.
- 🔄 Export Logs in multiple formats.
- 🌐 Support for Custom Log Formats.

---

