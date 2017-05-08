function getLikeMe(login) {
	sock.emit('recupLikeur', {login: login});
}

var login = document.getElementById('avatar').alt,
	likeur = document.getElementById('likeur'),
	first = true;

if (first) {
	first = false;
	getLikeMe(login);
}

sock.on('heLikeYou', function(data) {
	var tmp_div = document.createElement('div'),
		link = document.createElement('a');

	tmp_div.setAttribute('class', 'col-lg-6 col-md-6 col-sm-6 col-xs-6 text-center');
	link.setAttribute('href', '/profile/' + data.content);
	link.innerText = data.content;
	tmp_div.appendChild(link);
	likeur.appendChild(tmp_div);
});