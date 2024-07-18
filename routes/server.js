

import { Router } from 'express';

import { sequelize } from '../db/db.js'; // Import PostgreSQL client instance from db.js
const router = Router();
import {getClient,startSocket,getSelectedData,getNodes,getOs,getCountryNode,getClientType,getNodeCount} from '../Controller/index.js'

let receivedData = [];

router.get('/start-websocket', startSocket)

// router.get('/selectedData', getSelectedData) 


// router.get('/getCountryNodes', getCountryNode) 

// router.get('/getNodes', getNodes);

// router.get('/getOs', getOs);

// router.get('/getClientType',getClientType);
// router.get('/getClient', getClient)

router.get('/getAllData', async (req, res) => {
    try {
        // const nodes = await getNodes();
        const os = await getOs();
        const clientData = await getClient();
        const clientType = await getClientType();
        const countryNode = await getCountryNode();

        const allData = {
            // nodes,
            os,
            clientData,
            clientType,
            countryNode
        };

        res.json(allData);
    } catch (error) {
        console.error('Error fetching all data:', error);
        res.status(500).send('Internal server error');
    }
});

router.get('/getNodeCount/:days',getNodeCount)

// Export the router
export default router;
