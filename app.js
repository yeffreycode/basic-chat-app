const express = require("express");
const { Server } = require("socket.io");
const path = require("path");
const http = require("http");

const app = express();
app.use("/", express.static(path.join(__dirname, "./public")));

const httpServer = http.createServer(app);

let users = [];

//remove user
const removeUser = (socketId) => {
  users = users.filter((user) => user.socketId !== socketId);
};
const io = new Server(httpServer);
io.on("connection", (socket) => {
  console.log("new user connected: " + socket.id);
  socket.on("login", (data) => {
    let usernameExists = users.some((el) => el.username === data.username);
    if (!usernameExists) {
      let user = { socketId: socket.id, ...data };
      users.push({ socketId: socket.id, ...data });
      socket.emit("login", user);
      users.map((item) => {
        item.socketId !== user.socketId && io.to(item.socketId).emit("new-user", user);
      });
    } else {
      socket.emit("login", false);
    }
  });
  socket.on("get-users", () => {
    socket.emit("get-users", users);
  });

  //message
  socket.on("new-message", (msg) => {
    io.to(msg.receiverId).emit("new-message", msg);
    msg.senderId !== msg.receiverId && socket.emit("new-message", msg);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected");
    removeUser(socket.id);
    users.map((user) => {
      io.to(user.socketId).emit("remove-user", socket.id);
    });
  });
});

module.exports = httpServer;
