const socket = io();
const app = {};
const d = document;

app.state = {
  username: "",
  socketId: "",
  users: [],
  currentChatId: "",
};

app.login = function (socket, username) {
  socket.emit("login", { username });
};
app.validateUsername = function (username) {
  let regex = /^[a-z0-9]+$/;
  return regex.test(username);
};
app.loginLoading = () => {
  d.querySelector(".login").classList.add("loading");
};
app.endLoginLoading = () => {
  d.querySelector(".login").classList.remove("loading");
};
app.loginError = (errStr) => {
  d.querySelector(".login_error").innerHTML = errStr;
};
app.setUser = (user) => {
  app.state.socketId = user.socketId;
  app.state.username = user.username;
  let p = d.querySelector(".h-users p");
  p.innerHTML = app.state.username;
};
//open layouts
app.openUsersList = () => {
  d.querySelector(".login").style.display = "none";
  d.querySelector(".chat").style.display = "none";
  d.querySelector(".users").style.display = "block";
};

app.openChat = () => {
  d.querySelector(".login").style.display = "none";
  d.querySelector(".chat").style.display = "flex";
  d.querySelector(".users").style.display = "none";
};

//bind login form
app.bindLoginForm = () => {
  let loginForm = d.getElementById("login_form");
  let username = d.getElementById("username_input");
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!app.validateUsername(username.value)) {
      alert("username only contain lowercase letters and numbers");
      return;
    }
    app.loginLoading();
    app.login(socket, username.value);
  });
};

//bind message form
app.bindMessageForm = () => {
  let messageForm = d.getElementById("chat_form");
  let txtMessage = d.getElementById("input_message");
  messageForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!txtMessage.value) {
      alert("message empty");
      return;
    }
    let msg = app.messageObject(app.state.socketId, app.state.currentChatId, txtMessage.value);
    app.sendMessage(msg);
    txtMessage.value = "";
  });
};

//users list
app.generateUser = (user) => {
  let { username, socketId } = user;
  let div = d.createElement("div");
  let span = d.createElement("span");
  let btn = d.createElement("button");
  //add atributes
  div.classList.add("user");
  div.setAttribute("id", socketId);
  btn.setAttribute("id", socketId);
  btn.classList.add("user-btn");
  //add username to span
  let usernameTxt = d.createTextNode(username);
  span.appendChild(usernameTxt);
  //add chat text to btn
  let btnTxt = d.createTextNode("chat");
  btn.appendChild(btnTxt);
  //add childs to div
  div.appendChild(span);
  div.appendChild(btn);
  return div;
};
app.getUsers = () => {
  socket.emit("get-users");
};
app.getUser = () => {};
app.addUsersList = (user) => {
  let div = d.querySelector(".users-list");
  div.appendChild(user);
};
app.removeUser = (socketId) => {
  let listUsers = d.querySelector(".users-list");
  let child = d.getElementById(socketId);
  listUsers.removeChild(child);
};

//chat
app.bindOpenChat = () => {
  if (!d.querySelectorAll(".user-btn")) return;
  d.querySelectorAll(".user-btn").forEach((btn) => {
    btn.onclick = (e) => {
      app.setCurrentChat(e.target.id);
      app.openChat();
    };
  });
};
app.bindBackBtn = () => {
  let back = () => {
    d.querySelector(".login").style.display = "none";
    d.querySelector(".chat").style.display = "none";
    d.querySelector(".users").style.display = "block";
    d.querySelector(".back-model").style.display = "none";
    d.querySelector(".messages").innerHTML = "";
  };
  d.querySelector(".back-btn").onclick = back;
  d.querySelector(".back-btn-model").onclick = back;
};
app.setUsernameToChatHeader = (username) => {
  let currentUsername = document.getElementById("current-username");
  currentUsername.innerHTML = username;
};
app.setCurrentChat = (socketId) => {
  app.state.currentChatId = socketId;
  let user = app.state.users.find((user) => user.socketId === socketId);
  app.setUsernameToChatHeader(user.username);
};

//messages
app.messageObject = (senderId, receiverId, txtMessage) => {
  return { senderId, receiverId, txtMessage };
};
app.sendMessage = (messageObject) => {
  socket.emit("new-message", messageObject);
};
app.generateMessage = (msg) => {
  let div = d.createElement("div");
  let spanTik = d.createElement("span");
  let spanTxt = d.createElement("span");
  //add clasess
  let classTxt = msg.senderId == app.state.socketId ? "message own" : "message";
  div.setAttribute("class", classTxt);
  spanTik.classList.add("tik");
  spanTxt.classList.add("txt");
  //create content message
  let txt = d.createTextNode(msg.txtMessage);
  spanTxt.appendChild(txt);

  //set to container
  div.appendChild(spanTik);
  div.appendChild(spanTxt);
  return div;
};
app.addMessage = (message) => {
  let messages = d.querySelector(".messages");
  messages.appendChild(message);
};
app.backtoUsersList = () => {};
//sockets listen

//login
socket.on("login", (d) => {
  app.endLoginLoading();
  if (!d) {
    return app.loginError("* Username already exists");
  }
  app.setUser(d);
  app.openUsersList();
  app.getUsers();
});

//new user
socket.on("new-user", (user) => {
  let element = app.generateUser(user);
  if (app.state.socketId !== user.socketId) {
    app.addUsersList(element);
    app.state.users.push(user);
    app.bindOpenChat();
  }
});
//remove user
socket.on("remove-user", (id) => {
  app.removeUser(id);
  if (id === app.state.currentChatId) {
    d.querySelector(".back-model").style.display = "block";
  }
});
//get users
socket.on("get-users", (users) => {
  if (users && users.length) {
    users.forEach((user) => {
      let element = app.generateUser(user);
      app.addUsersList(element);
      if (user.socketId === app.state.socketId) console.log(user);
    });
    app.state.users = users;
    app.bindOpenChat();
  }
});

//message
socket.on("new-message", (msg) => {
  let msgDiv = app.generateMessage(msg);
  (app.state.currentChatId === msg.senderId || app.state.socketId === msg.senderId) && app.addMessage(msgDiv);
  msgDiv.scrollIntoView();
});

window.onload = () => {
  app.bindLoginForm();
  app.bindMessageForm();
  app.bindBackBtn();
};
