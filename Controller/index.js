
import WebSocket from 'ws';
// const { client } = require('../db/db'); // Import PostgreSQL client instance
import { client } from '../db/db.js'; 
const serverUrl = 'wss://stats-ws.xdc.org/stats-data/?EIO=4&transport=websocket';

let receivedData = [];

export const startSocket = () => {
    return new Promise((resolve, reject) => {
        const socket = new WebSocket(serverUrl);

        socket.on('open', function () {
            console.log('WebSocket connection established.');
            // Send "40" to the WebSocket server if needed
            socket.send('40');
        });

        socket.on('message', function (data) {
           
            receivedData.push(data);

            console.log(`Received message: ${data}`);
            
        });

        socket.on('close', function () {
            console.log('WebSocket connection closed.');
            // Perform any cleanup if needed
            resolve(); // Resolve the promise when socket closes
        });

        socket.on('error', function (error) {
            console.error('WebSocket error:', error);
            reject(error); // Reject the promise on WebSocket error
        });
    });
};


export const getSelectedData = async (req, res) => {
    try {
        let newData = [];
        if (receivedData.length > 0) {
            receivedData.forEach(data => {
                try {
                    let message = JSON.parse(data.slice(2)); // Remove the initial "42"
                    if (Array.isArray(message) && message[0] === 'network-stats-nodes') {
                        newData = message[1].nodes;
                    }
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            });

            // Map and filter data for insertion into PostgreSQL
            const filteredData = newData.map(data => {
                const os = data?.info?.os || 'Unknown os';
                const os_v = data?.info?.os_v || 'Unknown os_v';
                const node = data?.info?.node || 'Unknown node';
                const go = node.split('/').pop() || 'Unknown go version';
                const mainClient = node.split('/')[0] || 'Unknown mainClient';

                return {
                    country: data?.geo?.country || 'Unknown client',
                    client: data?.info?.client || 'Unknown client',
                    lastUpdate: new Date(data?.uptime?.lastUpdate).toISOString(),
                    port: data?.info?.port || 'Unknown port',
                    node,
                    os: `${os} - ${os_v}`,
                    name: data?.info?.name || 'Unknown name',
                    id: data?.id || 'Unknown id',
                    miner: data?.stats?.block?.miner || 'Unknown miner',
                    ip: data?.info?.ip || 'Unknown ip',
                    city: data?.geo?.city || 'unknown city',
                    region: data?.geo?.region || 'unknown region',
                    BlockNumber: data?.stats?.block?.number || 'unknown number',
                    peer: data?.stats?.peers || 'unknown peer',
                    pending: data?.stats?.pending || 'unknown pending',
                    uptime: data?.stats?.uptime || 'unknown uptime',
                    syncing: data?.stats?.syncing || 'unknown syncing',
                    timestamp: data?.stats?.block?.timestamp || 'unknown timestamp',
                    latency: data?.stats?.latency || 'unknown latency',
                    go,
                    mainClient, // Save the extracted Go version
                };
            });

            // Insert filtered data into PostgreSQL
            for (let data of filteredData) {
                const columns = Object.keys(data).join(', ');
                const values = Object.values(data);
                const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

                const queryText = `INSERT INTO socketData (${columns}) VALUES (${placeholders})`;

                try {
                    await client.query(queryText, values);
                } catch (error) {
                    console.error(`Error inserting data into PostgreSQL: ${error}`);
                }
            }

            res.json(filteredData);
        } else {
            res.status(404).send('No data received yet');
        }
    } catch (error) {
        console.error('Error handling selectedData request:', error);
        res.status(500).send('Internal server error');
    }
}

export const getNodes = async () => {
    try {
        const result = await client.query(`
            SELECT DISTINCT node
            FROM socketData
        `); // Query to fetch distinct node names

        return result.rows.map(row => row.node); // Return the fetched node list
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Throw the error to be handled by the caller
    }
};

export const getOs = async () => {
    try {
        const result = await client.query(`
            SELECT os, COUNT(*) AS node_count
            FROM socketData
            GROUP BY os
        `);

        return result.rows; // Return the fetched data
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Throw the error to be handled by the caller
    }
};

export const getClient = async () => {
    try {
        const result = await client.query(`
            SELECT go, COUNT(*) AS node_count 
            FROM socketData 
            GROUP BY go
        `);

        return result.rows; // Return the fetched data
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Throw the error to be handled by the caller
    }
};

export const getClientType = async () => {
    try {
        const result = await client.query(`
            SELECT go, COUNT(*) AS node_count
            FROM socketData
            GROUP BY go
        `);

        return result.rows; // Return the fetched data
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Throw the error to be handled by the caller
    }
};

export const getCountryNode = async () => {
    try {
        const result = await client.query(`
            SELECT country, COUNT(*) AS node_count
            FROM socketData
            GROUP BY country
        `);

        return result.rows; // Return the fetched data
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Throw the error to be handled by the caller
    }
};
