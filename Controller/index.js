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

            // Process each data entry
            const results = await Promise.all(newData.map(async data => {
                const node = data?.info?.node || 'Unknown node';

                const formattedData = {
                    country: data?.geo?.country || 'Unknown country',
                    client: data?.info?.client || 'Unknown client',
                    lastUpdate: new Date(data?.uptime?.lastUpdate).toISOString(),
                    port: data?.info?.port || 'Unknown port',
                    node: node,
                    os: `${data?.info?.os || 'Unknown os'} - ${data?.info?.os_v || 'Unknown os_v'}`,
                    name: data?.info?.name || 'Unknown name',
                    miner: data?.stats?.block?.miner || 'Unknown miner',
                    ip: data?.info?.ip || 'Unknown ip',
                    city: data?.geo?.city || 'Unknown city',
                    region: data?.geo?.region || 'Unknown region',
                    BlockNumber: data?.stats?.block?.number || 'Unknown number',
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
                    // Check if data exists for the same node and date in SocketData
                    const existingSocketData = await SocketData.findOne({
                        where: {
                            node: formattedData.node,
                            lastUpdate: {
                                [Op.between]: [
                                    new Date(formattedData.lastUpdate).setHours(0, 0, 0, 0), // Start of formattedData.lastUpdate day
                                    new Date(formattedData.lastUpdate).setHours(23, 59, 59, 999) // End of formattedData.lastUpdate day
                                ]
                            }
                        }
                    });

                    if (existingSocketData) {
                        // Data exists for today and same node, update it
                        await existingSocketData.update(formattedData);
                        // console.log(`Data updated for node ${formattedData.node}`);
                    } else {
                        // Data does not exist for today or same node, create new entry
                        await SocketData.create(formattedData);
                        // console.log(`Data created for node ${formattedData.node}`);
                    }
                } catch (error) {
                    console.error(`Error saving data for node ${formattedData.node}:`, error);
                }

                try {
                    // Check if data exists for the same node and date in NodeData
                    const existingNodeData = await NodeData.findOne({
                        where: {
                            node: formattedData.node,
                            lastUpdate: {
                                [Op.between]: [
                                    new Date(formattedData.lastUpdate).setHours(0, 0, 0, 0), // Start of formattedData.lastUpdate day
                                    new Date(formattedData.lastUpdate).setHours(23, 59, 59, 999) // End of formattedData.lastUpdate day
                                ]
                            }
                        }
                    });

                    if (existingNodeData) {
                        // Data exists for today and same lastUpdate, update it
                        await existingNodeData.update(formattedData);
                        // console.log(`Data updated for node ${formattedData.node}`);
                    } else {
                        // Data does not exist for today or same lastUpdate, create new entry
                        await NodeData.create(formattedData);
                        // console.log(`Data created for node ${formattedData.node}`);
                    }
                } catch (error) {
                    console.error(`Error saving data for node ${formattedData.node}:`, error);
                }

                // Return success message for each data entry
                return { success: true };
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
        const { days } = req.params; // Extract days parameter from request

        // Check if days is not a number or if it's less than or equal to 0
        if (isNaN(days) || parseInt(days) <= 0) {
            return res.status(400).json({ error: 'Invalid number of days' });
        }

        const numDays = parseInt(days);

        // Calculate start date and end date based on number of days
        const endDate = new Date(); // Current date
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - numDays); // Calculate start date based on number of days

        // Query node counts from NodeData table for the specified number of days
        const result = await NodeData.findAll({
            attributes: [
                [Sequelize.fn('DATE', Sequelize.col('lastUpdate')), 'date'],
                [Sequelize.fn('COUNT', Sequelize.col('*')), 'nodeCount']
            ],
            where: {
                [Op.and]: [
                    Sequelize.where(Sequelize.fn('DATE', Sequelize.col('lastUpdate')), '>=', startDate),
                    Sequelize.where(Sequelize.fn('DATE', Sequelize.col('lastUpdate')), '<=', endDate)
                ]
            },
            group: [Sequelize.fn('DATE', Sequelize.col('lastUpdate'))], // Group by date
            order: [[Sequelize.fn('DATE', Sequelize.col('lastUpdate')), 'ASC']]
        });

        // Prepare response with node count for the specified number of days
        let response = result.map(item => ({
            date: item.dataValues.date, // The date is already in 'YYYY-MM-DD' format
            nodeCount: item.dataValues.nodeCount.toString() // Ensure nodeCount is a string as per the desired output
        }));

        res.json(response); // Return the fetched data as JSON response
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};




