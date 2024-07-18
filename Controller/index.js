import WebSocket from 'ws';
import { Op } from 'sequelize'; // Import Op from Sequelize
import { Sequelize } from 'sequelize';
import { sequelize } from '../db/db.js';
import SocketData from '../models/socketData.js';
import NodeData from '../models/nodeCount.js';

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

            // Map and filter data for insertion or update in PostgreSQL via Sequelize
            const results = await Promise.all(newData.map(async data => {
                const id = data?.id || 'Unknown id';

                const formattedData = {
                    country: data?.geo?.country || 'Unknown country',
                    client: data?.info?.client || 'Unknown client',
                    lastUpdate: data?.uptime?.lastUpdate, // Use date directly from data
                    port: data?.info?.port || 'Unknown port',
                    node: data?.info?.node || 'Unknown node',
                    os: `${data?.info?.os || 'Unknown os'} - ${data?.info?.os_v || 'Unknown os_v'}`,
                    name: data?.info?.name || 'Unknown name',
                    miner: data?.stats?.block?.miner || 'Unknown miner',
                    ip: data?.info?.ip || 'Unknown ip',
                    city: data?.geo?.city || 'Unknown city',
                    region: data?.geo?.region || 'Unknown region',
                    blocknumber: data?.stats?.block?.number || 'Unknown number',
                    peer: data?.stats?.peers || 'Unknown peer',
                    pending: data?.stats?.pending || 'Unknown pending',
                    uptime: data?.stats?.uptime || 'Unknown uptime',
                    syncing: data?.stats?.syncing || 'Unknown syncing',
                    timestamp: data?.stats?.block?.timestamp || 'Unknown timestamp',
                    latency: data?.stats?.latency || 'Unknown latency',
                    go: (data?.info?.node || 'Unknown node').split('/').pop() || 'Unknown go version',
                    mainClient: (data?.info?.node || 'Unknown node').split('/')[0] || 'Unknown mainClient'
                };

                try {
                    // Update or create in SocketData
                    let existingSocketData = await SocketData.findOne({
                        where: {
                            id: id,
                            lastUpdate: formattedData.lastUpdate
                        }
                    });

                    if (existingSocketData) {
                        // Data exists, update it
                        await existingSocketData.update(formattedData);
                    } else {
                        // Data does not exist, create new entry
                        await SocketData.create(formattedData);
                    }

                    // Update or create in NodeData
                    let existingNodeData = await NodeData.findOne({
                        where: {
                            node: formattedData.node,
                            lastUpdate: formattedData.lastUpdate
                        }
                    });

                    if (existingNodeData) {
                        // Data exists, update it
                        await existingNodeData.update(formattedData);
                        return { success: true, message: `Data updated for node ${formattedData.node}` };
                    } else {
                        // Data does not exist, create new entry
                        await NodeData.create(formattedData);
                        return { success: true, message: `Data created for node ${formattedData.node}` };
                    }

                } catch (error) {
                    console.error(`Error saving data for id ${id} and node ${formattedData.node}:`, error);
                    return { success: false, message: `Error saving data for id ${id} and node ${formattedData.node}: ${error.message}` };
                }
            }));

            return { success: true, message: 'All data processed successfully', results };
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
        const result = await SocketData.findAll({
            attributes: [
                [Sequelize.fn('DISTINCT', Sequelize.col('node')), 'node']
            ]
        });

        return result.map(row => row.node); // Return the fetched node list
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Throw the error to be handled by the caller
    }
};
export const getOs = async () => {
    try {
        const result = await SocketData.findAll({
            attributes: [
                'os',
                [Sequelize.fn('COUNT', Sequelize.col('*')), 'node_count']
            ],
            group: ['os']
        });

        return result; // Return the fetched data
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Throw the error to be handled by the caller
    }
};


export const getClient = async () => {
    try {
        const result = await SocketData.findAll({
            attributes: [
                'mainClient',
                [Sequelize.fn('COUNT', Sequelize.col('*')), 'node_count']
            ],
            group: ['mainClient']
        });

        return result; // Return the fetched data
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Throw the error to be handled by the caller
    }
};
export const getClientType = async () => {
    try {
        const result = await SocketData.findAll({
            attributes: [
                'go',
                [Sequelize.fn('COUNT', Sequelize.col('*')), 'node_count']
            ],
            group: ['go']
        });

        return result; // Return the fetched data
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Throw the error to be handled by the caller
    }
};

export const getCountryNode = async () => {
    try {
        const result = await SocketData.findAll({
            attributes: [
                'country',
                [Sequelize.fn('COUNT', Sequelize.col('*')), 'node_count']
            ],
            group: ['country']
        });

        return result; // Return the fetched data
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error; // Throw the error to be handled by the caller
    }
};


export const getNodeCount = async (req, res) => {
    try {
        const { date } = req.params; // Date passed as a parameter
        console.log('Requested date:', date);

        // Query node counts from NodeData table for the specified date
        const result = await NodeData.findAll({
            attributes: [
                [Sequelize.fn('DATE', Sequelize.col('lastUpdate')), 'date'],
                [Sequelize.fn('COUNT', Sequelize.col('*')), 'nodeCount']
            ],
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('DATE', Sequelize.col('lastUpdate')), '=', date)
                ]
            },
            group: [Sequelize.fn('DATE', Sequelize.col('lastUpdate'))], // Group by date
            order: [[Sequelize.fn('DATE', Sequelize.col('lastUpdate')), 'ASC']]
        });

        // Log the generated SQL query
        console.log('Generated SQL:', result.toString());

        // Prepare response with node count for the specified date
        let response = result.map(item => ({
            date: item.dataValues.date, // The date is already in 'YYYY-MM-DD' format
            nodeCount: item.dataValues.nodeCount
        }));

        // If no records found for the date, add default nodeCount as 0
        if (response.length === 0) {
            response.push({
                date,
                nodeCount: 0
            });
        }

        res.json(response); // Return the fetched data as JSON response
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};