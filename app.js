const express = require('express');
const WebSocket = require('ws');

const app = express();
const port = 8000;

const serverUrl = 'wss://stats-ws.xdc.org/stats-data/?EIO=4&transport=websocket';

app.get('/start-websocket', (req, res) => {
    const socket = new WebSocket(serverUrl);

    socket.on('open', function () {
        console.log('WebSocket connection established.');
        // Send "40" to the WebSocket server
        socket.send('40');
    });

    socket.on('message', function (data) {
        // console.log('Received message: %s', data);
        res.write(`Received message: ${data}\n`);
    });

    socket.on('close', function () {
        console.log('WebSocket connection closed.');
        res.end('WebSocket connection closed.\n');
    });

    socket.on('error', function (error) {
        console.error('WebSocket error:', error);
        res.end(`WebSocket error: ${error.message}\n`);
    });

    req.on('close', () => {
        socket.close();
        console.log('HTTP connection closed, WebSocket connection closed.');
    });
});

app.get("/selectedData",(req,res)=>{
res.send("hello")
})
app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
