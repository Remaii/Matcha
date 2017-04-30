function resizeTchat() {
	var h = window.innerHeight,
		nav = document.getElementsByClassName('navbar navbar-default')[0].offsetHeight + 20,
		div = document.getElementById('tchat');
	div.setAttribute('style', 'box-sizing:content-box;height:' + (h - nav) + 'px;');
}

var send_but = document.querySelector('#send_but'),
	to = document.querySelector('#correspond'),
	msg_area = document.querySelector('#msg_area'),
	first = true,
	log = document.querySelector('#userName').innerText;

if (log != '' || log != undefined) {
	if (first) {
		resizeTchat();
		downNotif('Message of ' + to.innerText);
		first = false;
		sock.emit('checkMsg', {me: log, to: to.innerText});
	}
	// sock.emit('checkMsg', {me: log, to: to.innerText});

	sock.on('theOldMsg', function(data) {
		var msg = document.querySelector('#message'),
			jumbo = document.querySelector('.jumbotron'),
			expe = document.querySelector('#userName'),
			dest = document.querySelector('#correspond'),
			div = document.createElement('div'),
			text = document.createElement('p'),
			name = document.createElement('p');
		
		if (data.off == expe.innerText) {
			text.setAttribute('class', 'text-right');
			text.innerText = data.content;
		} else if (data.off == dest.innerText) {
			text.setAttribute('class', 'text-left');
			text.innerText = data.content;
		}
		msg.appendChild(text);
		jumbo.scrollTop = jumbo.scrollHeight;
	});

	sock.on('theNewMsg', function(data) {
		var msg = document.querySelector('#message'),
			jumbo = document.querySelector('.jumbotron'),
			expe = document.querySelector('#userName'),
			dest = document.querySelector('#correspond'),
			div = document.createElement('div'),
			text = document.createElement('p'),
			name = document.createElement('p');
		
		if (data.off == expe.innerText) {
			text.setAttribute('class', 'text-right');
			text.innerText = data.content;
		} else if (data.off == dest.innerText) {
			downNotif('Message of ' + dest.innerText);
			text.setAttribute('class', 'text-left');
			text.innerText = data.content;
		}
		msg.appendChild(text);
		jumbo.scrollTop = jumbo.scrollHeight;
	});

	function sendMsg() {
		var	too = document.querySelector('#correspond').innerText,
			msg = document.querySelector('#msg_area'),
			log = document.querySelector('#userName').innerText;

		if (msg.value != '') {
			sock.emit('message', {to: too, log: log, msg: msg.value});
			msg.value = '';
		}
	}

	send_but.addEventListener('click', function(ev) {
		sendMsg();
	});

	window.addEventListener('resize', function(ev) {
		setTimeout(function() {resizeTchat();}, 700);
	});
}