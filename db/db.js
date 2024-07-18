import pkg from 'pg';
const { Client } = pkg;

import fs from 'fs';
import path from 'path';

// Use import.meta.url to get the current file's directory path
const __dirname = path.dirname(new URL(import.meta.url).pathname);

const client = new Client({
    user: 'postgres',
    host: 'localhost',
    database: 'websocket', // Replace with your database name
    password: 'Mitali@88', // Replace with your database password
    port: 5432,
});

// Connect to PostgreSQL
client.connect()
    .then(() => {
        console.log('Connected to PostgreSQL');
        createTableIfNotExists();
    })
    .catch(err => console.error('Error connecting to PostgreSQL', err));

// Function to create the table if it doesn't exist
async function createTableIfNotExists() {
    const modelPath = path.join(__dirname, './models/socketData.js');
    const { default: model } = await import(`file://${modelPath}`);
    const tableName = model.tableName;
    const attributes = model.attributes;

    let columns = [];
    for (const [name, attr] of Object.entries(attributes)) {
        let sqlType = attr.type.toUpperCase();
        let primaryKey = attr.primaryKey ? 'PRIMARY KEY' : '';
        let defaultValue = attr.default ? `DEFAULT ${attr.default}` : '';
        columns.push(`${name} ${sqlType} ${primaryKey} ${defaultValue}`.trim());
    }

    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS ${tableName} (
            ${columns.join(',\n')}
        );
    `;

    try {
        await client.query(createTableQuery);
        console.log(`Table '${tableName}' created or already exists.`);
    } catch (err) {
        console.error(`Error creating table '${tableName}':`, err);
    }
}

export { client };