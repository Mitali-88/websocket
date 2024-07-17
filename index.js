// index.js

import express, { json } from 'express';
import router from './routes/server.js'; // Corrected import path
import {client}  from './db/db.js'; // Import database client and setup
import cron from 'node-cron';
import {startSocket} from './Controller/index.js'
const app = express();
const port = 8000;

 // Access the client from db.js

// Middleware to use for all routes
app.use((req, res, next) => {
    req.db = client; // Attach PostgreSQL client to req object
    next();
});

app.use(json());

cron.schedule('*/1 * * * *', async () => {
    try {
        await startSocket();
        // Optionally, you can perform additional tasks after WebSocket task completes
        console.log('WebSocket task completed successfully.');
    } catch (error) {
        console.error('Error running WebSocket task:', error);
    }
});
app.use('/', router);

// Start server
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

export default app;
