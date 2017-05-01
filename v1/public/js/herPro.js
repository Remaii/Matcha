var login = document.getElementById('avatar').alt,
	me = document.getElementById('userName').innerText,
	pseudo = document.getElementById('avatar').name,
	like_user = document.getElementById('like_user'),
	unlike_user = document.getElementById('unlike_user'),
	false_user = document.getElementById('false_user'),
	block_user = document.getElementById('block_user'),
	deblock_user = document.getElementById('deblock_user'),
	status = document.getElementById('status'),
	visited = true;

if (visited) {
	sock.emit('like_user', {me: me, to: login});
	sock.emit('show_status', {login: login});
	visited = false;
}

sock.on('status_is', function(data) {
	var status = document.getElementById('status'),
		point = document.createElement('p');
	if (data.login == login) {
		if (data.status == "Online") {
			point.innerText = data.login + " est connecté";
		} else if (data.status == "Offline") {
			point.innerText = data.login + " est déconnecté";
		} else if (data.status == "Inconnue") {
			point.innerText = data.login + " n'est pas venu depuis longtemps";
		}
		status.appendChild(point);
	}
});

like_user.addEventListener('click', function(ev) {
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		like_user.setAttribute('style', 'display:none;');
		if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
			unlike_user.setAttribute('style', '');
			sock.emit('like_user', {me: me, to: login});
		}
	}
	xhr.open("post", "/profile/like", true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send("log=" + pseudo + "&pseudo=" + login);
});

unlike_user.addEventListener('click', function(ev) {
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		unlike_user.setAttribute('style', 'display:none;');
		if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
	 		like_user.setAttribute('style', '');
	 		sock.emit('like_user', {me: me, to: login});
	 	}
	}
	xhr.open("post", "/profile/dislike", true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send("log=" + pseudo + "&pseudo=" + login);
});

false_user.addEventListener('click', function(ev){
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
	 		false_user.setAttribute('style', 'display:none;');
	 		sock.emit('like_user', {me: me, to: login});
	 	}
	}
	xhr.open("post", "/profile/false_user", true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send("log=" + pseudo + "&pseudo=" + login);
});

deblock_user.addEventListener('click', function(ev){
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		deblock_user.setAttribute('style', 'display:none;');
		if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
	 		block_user.setAttribute('style', '');
	 		sock.emit('like_user', {me: me, to: login});
	 	}
	}
	xhr.open("post", "/profile/deblock", true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send("log=" + pseudo + "&pseudo=" + login);
});

block_user.addEventListener('click', function(ev){
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		block_user.setAttribute('style', 'display:none;');
		if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
	 		deblock_user.setAttribute('style', '');
	 		sock.emit('like_user', {me: me, to: login});
	 	}
	}
	xhr.open("post", "/profile/block", true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send("log=" + pseudo + "&pseudo=" + login);
});