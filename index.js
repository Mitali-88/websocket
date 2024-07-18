// index.js

import express, { json } from 'express';
import router from './routes/server.js';
import { sequelize, testConnection } from './db/db.js'; // Import Sequelize instance and testConnection function
import cron from 'node-cron';
import { startSocket } from './Controller/index.js';

const app = express();
const port = 8000;

// Middleware to attach Sequelize instance to req object
app.use((req, res, next) => {
    req.db = sequelize; // Attach Sequelize client to req object
    next();
});

app.use(json());

// Schedule cron job to run every minute
cron.schedule('*/10 * * * *', async () => {
    try {
        await startSocket();
        // Optionally, perform additional tasks after WebSocket task completes
        // console.log('WebSocket task completed successfully.');
    } catch (error) {
        console.error('Error running WebSocket task:', error);
    }
});

// Define application routes
app.use('/', router);

// Start server
const server = app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);

    // Test database connection
    testConnection();
});

export default server;
