const express = require("express");
const {Server} = require('socket.io');
const path = require('path');
const http = require('http');

const app = express();
app.use('/', express.static(path.join(__dirname, './public')));

const httpServer = http.createServer(app);

let users = [];

const io = new Server(httpServer);
io.on('connection', (socket)=> {
	console.log('new user connected: ' +socket.id);
	socket.on('login', data=> {
		let usernameExists = users.some(el => el.username === data.username);
		if (!usernameExists) {
			users.push({socketId: socket.id, ...data});
			socket.emit('login', true);
		}else {
			socket.emit('login', false);
		}
	})
});

module.exports = httpServer;

