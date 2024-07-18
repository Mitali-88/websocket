import WebSocket from 'ws';
import { client } from '../db/db.js';

const serverUrl = 'wss://stats-ws.xdc.org/stats-data/?EIO=4&transport=websocket';
let receivedData = [];


export const startSocket = () => {
    const socket = new WebSocket(serverUrl);

    socket.on('open', function () {
        console.log('WebSocket connection established.');
        socket.send('40');
    });

    socket.on('message', function (data) {
        receivedData.push(data);
    });

    socket.on('close', function () {
        console.log('WebSocket connection closed.');

        // Call getSelectedData to process and save data
        getSelectedData(receivedData)
            .then(filteredData => {
                console.log('Data saved successfully:', filteredData);
            })
            .catch(error => {
                console.error('Error processing or saving data:', error);
            });
    });

    socket.on('error', function (error) {
        console.error('WebSocket error:', error);
    });
};

export const getSelectedData = async (receivedData) => {
    try {
        let newData = [];

        // Process receivedData
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
            const filteredData = newData.map(async data => {
                const os = data?.info?.os || 'Unknown os';
                const os_v = data?.info?.os_v || 'Unknown os_v';
                const node = data?.info?.node || 'Unknown node';
                const go = node.split('/').pop() || 'Unknown go version';
                const mainClient = node.split('/')[0] || 'Unknown mainClient';

                const formattedData = {
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

                // Insert formatted data into PostgreSQL
                const columns = Object.keys(formattedData).join(', ');
                const values = Object.values(formattedData);
                const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');

                const queryText = `INSERT INTO socketData (${columns}) VALUES (${placeholders})`;

                try {
                    await client.query(queryText, values);
                } catch (error) {
                    console.error(`Error inserting data into PostgreSQL: ${error}`);
                    throw new Error(`Failed to insert data: ${error.message}`);
                }

                return formattedData; // Optionally return formatted data if needed
            });

            return { success: true, message: 'Data saved successfully' };
        } else {
            throw new Error('No data received yet');
        }
    } catch (error) {
        console.error('Error handling selectedData request:', error);
        return { success: false, message: `Error: ${error.message}` };
    }
};


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
