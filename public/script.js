const socket  = io();
const app = {};
const d = document;

app.login = (socket, username) => {
	socket.emit('login', {username})
}
app.validateUsername = (username) => {
	let regex = /^[a-z0-9]+$/;
	return regex.test(username);
}
app.loginLoading = () => {
	let login = d.querySelector('.login');
	login.classList.add('loading');
}
app.endLoginLoading = () => {
	let login = d.querySelector('.login');
	login.classList.remove('loading');
};
app.loginError=(errStr) => {
	let loginError = d.querySelector('.login_error');
	loginError.innerHTML = errStr;
}
//open layouts
app.openUsersList = () => {
	d.querySelector(".login").style.display = 'none';
	d.querySelector('.chat').style.display = 'none';
	d.querySelector('.users').style.display = 'flex';
}

app.bindLoginForm = () => {
	let loginForm = d.getElementById('login_form');
	let username = d.getElementById('username_input');
	loginForm.addEventListener('submit', (e) => {
		e.preventDefault();
		if (!app.validateUsername(username.value)) {
			alert('username only contain lowercase letters and numbers');
			return;
		}
		app.loginLoading();
		app.login(socket, username.value);
	})
}

//sockets listen
socket.on('login', d => {
	app.endLoginLoading();
	if (!d) {
		return app.loginError('* Username already exists');
	}
	app.openUsersList();
});


window.onload = () => {
	app.bindLoginForm();
}

