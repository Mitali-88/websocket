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

            // Map and filter data for insertion or update in PostgreSQL
            const results = await Promise.all(newData.map(async data => {
                const id = data?.id || 'Unknown id';

                const formattedData = {
                    country: data?.geo?.country || 'Unknown client',
                    client: data?.info?.client || 'Unknown client',
                    lastUpdate: new Date(data?.uptime?.lastUpdate).toISOString(),
                    port: data?.info?.port || 'Unknown port',
                    node: data?.info?.node || 'Unknown node',
                    os: `${data?.info?.os || 'Unknown os'} - ${data?.info?.os_v || 'Unknown os_v'}`,
                    name: data?.info?.name || 'Unknown name',
                    miner: data?.stats?.block?.miner || 'Unknown miner',
                    ip: data?.info?.ip || 'Unknown ip',
                    city: data?.geo?.city || 'unknown city',
                    region: data?.geo?.region || 'unknown region',
                    blocknumber: data?.stats?.block?.number || 'unknown number',
                    peer: data?.stats?.peers || 'unknown peer',
                    pending: data?.stats?.pending || 'unknown pending',
                    uptime: data?.stats?.uptime || 'unknown uptime',
                    syncing: data?.stats?.syncing || 'unknown syncing',
                    timestamp: data?.stats?.block?.timestamp || 'unknown timestamp',
                    latency: data?.stats?.latency || 'unknown latency',
                    go: (data?.info?.node || 'Unknown node').split('/').pop() || 'Unknown go version',
                    mainClient: (data?.info?.node || 'Unknown node').split('/')[0] || 'Unknown mainClient'
                };

                // Check if data exists for the same date in PostgreSQL
                const existingDataQuery = `
                    SELECT id FROM socketData WHERE id = $1 AND DATE(lastUpdate) = DATE($2)
                `;
                const existingDataResult = await client.query(existingDataQuery, [id, formattedData.lastUpdate]);

                if (existingDataResult.rows.length > 0) {
                    // Data exists for the same date, update it
                    const updateQuery = `
                        UPDATE socketData
                        SET
                            country = $2,
                            client = $3,
                            lastUpdate = $4,
                            port = $5,
                            node = $6,
                            os = $7,
                            name = $8,
                            miner = $9,
                            ip = $10,
                            city = $11,
                            region = $12,
                            blocknumber = $13,
                            peer = $14,
                            pending = $15,
                            uptime = $16,
                            syncing = $17,
                            timestamp = $18,
                            latency = $19,
                            go = $20,
                            mainClient = $21
                        WHERE id = $1 AND DATE(lastUpdate) = DATE($4)
                    `;
                    const updateValues = [
                        id,
                        formattedData.country,
                        formattedData.client,
                        formattedData.lastUpdate,
                        formattedData.port,
                        formattedData.node,
                        formattedData.os,
                        formattedData.name,
                        formattedData.miner,
                        formattedData.ip,
                        formattedData.city,
                        formattedData.region,
                        formattedData.blocknumber,
                        formattedData.peer,
                        formattedData.pending,
                        formattedData.uptime,
                        formattedData.syncing,
                        formattedData.timestamp,
                        formattedData.latency,
                        formattedData.go,
                        formattedData.mainClient
                    ];

                    await client.query(updateQuery, updateValues);
                } else {
                    // Data does not exist for the same date, insert it
                    const insertQuery = `
                        INSERT INTO socketData (id, country, client, lastUpdate, port, node, os, name,
                            miner, ip, city, region, "blocknumber", peer, pending, uptime, syncing,
                            timestamp, latency, go, mainClient)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16,
                            $17, $18, $19, $20, $21)
                    `;
                    const insertValues = [
                        id,
                        formattedData.country,
                        formattedData.client,
                        formattedData.lastUpdate,
                        formattedData.port,
                        formattedData.node,
                        formattedData.os,
                        formattedData.name,
                        formattedData.miner,
                        formattedData.ip,
                        formattedData.city,
                        formattedData.region,
                        formattedData.blocknumber,
                        formattedData.peer,
                        formattedData.pending,
                        formattedData.uptime,
                        formattedData.syncing,
                        formattedData.timestamp,
                        formattedData.latency,
                        formattedData.go,
                        formattedData.mainClient
                    ];

                    await client.query(insertQuery, insertValues);
                }

                return { success: true, message: 'Data saved or updated successfully' };
            }));

            return { success: true, message: 'All data processed successfully' };
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
            SELECT mainClient, COUNT(*) AS node_count 
            FROM socketData 
            GROUP BY mainClient
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
