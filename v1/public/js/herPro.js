var login = document.getElementById('avatar').alt;
var me = document.getElementById('userName').innerText;
var pseudo = document.getElementById('avatar').name;
var like_user = document.getElementById('like_user');
var unlike_user = document.getElementById('unlike_user');
var false_user = document.getElementById('false_user');
var block_user = document.getElementById('block_user');
var deblock_user = document.getElementById('deblock_user');

like_user.addEventListener('click', function(ev) {
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		like_user.setAttribute('style', 'display:none;');
		if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
			unlike_user.setAttribute('style', '');
			sock.emit('like_user', {me: me, to: login});
			// socket.emit('checkNotif', {login: login});
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
	 	}
	}
	xhr.open("post", "/profile/block", true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send("log=" + pseudo + "&pseudo=" + login);
});