---

## **Log Analytics Pipeline

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
MONGO_URI=mongodb://localhost:27017/logs
ELASTICSEARCH_URL=http://localhost:9200
PORT=5000
```

### **4. Start the Application**
```bash
npm run dev
```

---

## **Setting Up Elasticsearch**

Ensure Elasticsearch is running on **port 9200**.  

```

### **Verify Elasticsearch**  
Test if Elasticsearch is running with:  
```bash
curl -X GET http://localhost:9200/
```

You should see a JSON response confirming it is operational.

---

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

The log analytics pipeline is designed to efficiently handle the ingestion, processing, storage, and searching of logs across multiple formats. Below is an overview of its key components and data flow:

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
- **MongoDB**: Persistent storage of raw log data.  
- **Elasticsearch**: Indexes logs for fast and flexible search capabilities.  

#### **4. Log Parsing**  
- Converts raw log entries into structured data.  
- Applies specific parsing rules for each supported log format.  

#### **5. Search Functionality**  
- Provides advanced filtering, sorting, and pagination options.  
- Integrates with Elasticsearch for efficient querying and result retrieval.  

---

### **Data Flow**

1. **Ingestion**:  
   - Logs are uploaded via the `/api/logs/ingest` endpoint.  
   - The server processes logs in batches, parsing and preparing them for storage.  

2. **Storage**:  
   - Logs are saved in **MongoDB** for persistence.  
   - Simultaneously, logs are indexed in **Elasticsearch** for fast querying.  

3. **Search**:  
   - Users query logs through the `/api/logs/search` endpoint.  
   - Elasticsearch retrieves results based on user-defined filters, sorting, and pagination criteria.  

---

### **Key Advantages**

- **Scalability**: Handles large volumes of logs efficiently.  
- **Flexibility**: Supports multiple log formats and customizable search queries.  
- **Performance**: Combines batch processing, structured parsing, and Elasticsearch for quick data retrieval.  

This robust design ensures the system remains efficient and reliable, even with high log ingestion rates and complex search requirements.  

--- 



### **2. Processing Pipeline**
#### Log Ingestion Flow
1. **File Upload**:
   - Multer middleware handles multipart/form-data
   - In-memory storage for processing
   - File type validation

2. **Batch Processing**:
   - Batch size: 1000 logs
   - Parallel processing using Promise.all()
   - Error handling per batch
   - Reference implementation:


3. **Format-Specific Parsing**:
   - JSON: Direct parsing with schema validation
   - CSV: Header validation and row parsing
   - Plain Text: Regex-based parsing
   - Nginx: Custom parser with status code mapping

### **3. Search Implementation**
#### Query Building
- **Elasticsearch Query DSL**:
  - Bool query with must/filter clauses
  - Range queries for timestamps
  - Fuzzy matching for messages
  - Reference implementation:


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

#### Error Logging Strategy
- **Error Log Schema**:
  - Timestamp
  - Error type
  - Raw input
  - Stack trace
  - Context information



## **Security Considerations**
- Input sanitization
- Error message sanitization


### Software Requirements
- Node.js 16+
- MongoDB 4.4+
- Elasticsearch 8.16+
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

