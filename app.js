const express = require("express");
const {Server} = require('socket.io');
const path = require('path');
const http = require('http');

const app = express();
app.use('/', express.static(path.join(__dirname, './public')));

const httpServer = http.createServer(app);

const io = new Server(httpServer);
io.on('connection', (socket)=> {
	console.log({id: socket.id});
});

module.exports = httpServer;

