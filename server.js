const app = require('./src/app'); // Import the main Express app instance
const dotenv = require('dotenv'); // Import dotenv to load environment variables

dotenv.config(); // Load environment variables into `process.env`

const PORT = process.env.PORT || 5000; // Set server port, defaulting to 5000

app.listen(PORT, () => { // Start the server
    console.log(`Server running on port ${PORT}`); // Log server start message
});
