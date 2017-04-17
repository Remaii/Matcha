var login = document.getElementById('avatar').alt;
var pseudo = document.getElementById('avatar').name;
var like_user = document.getElementById('like_user');
var dis_like = document.getElementById('dis_like');
var false_user = document.getElementById('false_user');
var block_user = document.getElementById('block_user');
var deblock_user = document.getElementById('deblock_user');

like_user.addEventListener('click', function(ev) {
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		like_user.setAttribute('style', 'display:none;');
		if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
			dis_like.setAttribute('style', '');
		}
	}
	xhr.open("post", "/profile/like", true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send("log=" + login + "&pseudo=" + pseudo);
});

dis_like.addEventListener('click', function(ev) {
	var xhr = new XMLHttpRequest();

	xhr.onreadystatechange = function() {
		dis_like.setAttribute('style', 'display:none;');
		if (xhr.readyState == 4 && (xhr.status == 200 || xhr.status == 0)) {
	 		like_user.setAttribute('style', '');
	 	}
	}
	xhr.open("post", "/profile/dislike", true);
	xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded");
	xhr.send("log=" + login + "&pseudo=" + pseudo);
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
	xhr.send("log=" + login + "&pseudo=" + pseudo);
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
	xhr.send("log=" + login + "&pseudo=" + pseudo);
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
	xhr.send("log=" + login + "&pseudo=" + pseudo);
});