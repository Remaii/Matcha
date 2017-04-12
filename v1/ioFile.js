var io = require('socket.io');

var new_membre = function(pseudo) {
	socket.user_name = pseudo;
	socket.emit('logged_on', pseudo + ' viens de se connecter');
};


exports.new_membre = new_membre;