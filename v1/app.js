var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	bodyParser = require('body-parser'),
	cookieParser = require('cookie-parser'),
	session = require('express-session'),
	mymongo = require('./middle/mymongo'),
	jQuery = require('jquery'),
	bootSlider = require('bootstrap-slider'),
	socketIOSession = require('socket.io.session')


var index = require('./routes/index'),
	compte = require('./routes/compte'),
	login = require('./routes/login'),
	profile = require('./routes/profile'),
	register = require('./routes/register'),
	tchat = require('./routes/tchat')

//__________________Moteur de template________
app.set('view engine', 'ejs');

//__________________Middlewares_______________
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
app.use(bodyParser.json());
app.use('/asset', express.static('public'));
var sessionMiddle = {
	secret: 'matcharthidet',
	resave: true,
	saveUninitialized:true,
	cookie: { maxAge: 60 * 60 * 24 * 7}
}
app.use(session(sessionMiddle));
app.use(require('./middle/flash'));


app.use('/', function(req, res, next) {
	if (req.session['login'] != undefined) {
		console.log('clean req.session')
	    if (req.session['likeHer']) {
	        req.session['likeHer'] = null;
	    }
	    if (req.session['blockHer']) {
	        req.session['blockHer'] = null;
	    }
	    if (req.session['falseHer']) {
	        req.session['falseHer'] = null;
	    }
	    if (req.session['allprof']) {
	        req.session['allprof'] = {};
	    }
	    if (req.session['myinfo']) {
	        req.session['myinfo'] = {};
	    }
	    if (req.session['mytag']) {
	        req.session['mytag'] = {};
	    }
	    if (req.session['mypic']) {
	        req.session['mypic'] = {};
	    }
	    if (req.session['herPro']) {
	        req.session['herPro'] = {};
	    }
	    if (req.session['herTag']) {
	        req.session['herTag'] = {};
	    }
	    if (req.session['herPic']) {
	        req.session['herPic'] = {};
	    }
	    if (req.session['interet']) {
	        req.session['interet'] = {};
	    }
	    next();
	} else if (req.url == '/login') {
		next();
	} else {
		res.redirect('/login');
	}
})

////__________________Routes__________________
app.use('/', index)
app.use('/compte', compte)
app.use('/login', login)
app.use('/profile', profile)
app.use('/register', register)
app.use('/tchat', tchat)
app.use('/test', require('./routes/test'))//page test


function getnameID(id, people) {

	for (var i = 0; people[i]; i++) {
		for (var a = 0; people[i].id[a]; a++) {
			if (people[i].id[a] == id)
				return ({pos: i, id: people[i].id});
		}
	}
	if (!people[i]) {
		return ({pos: '-1', id: '-1'});
	}
}

// Socket.io
users = [];
people = [];

io.sockets.on('connection', function(socket) {

	socket.on('stayco', function(data) {
		var tab = new Array();
		if (data.login != '' && data.login != undefined) {
	    	if (users.indexOf(data.login) > -1) {
	    		for (var a = 0; people[a]; a++) {
	    			if (people[a].log == data.login) {
	    				var i = a;
	    				tab = people[i].id;
	    				tab[tab.length] = socket.id;
	    				people[i].id = tab;
	    			}
	    		}
	    		mymongo.getMyNotif(data.login, function(myNotif) {
					socket.emit('notif', {myNotif});
				});
	    	} else {
	    		tab[tab.length] = socket.id;
	    		people.push({log: data.login, id: tab});
				users.push(data.login);

				mymongo.getMyNotif(data.login, function(myNotif) {
					socket.emit('notif', {myNotif});
				});
	    	}
	    }
	});

	socket.on('disconnect', function(data) {
		
		if (data == 'transport close') {
			for (var a = 0; people[a]; a++) {
				for (var b = 0; people[a].id[b]; b++) {
					if (people[a].id[b] == socket.id) {
						people[a].id.splice(b, 1);
					}
				}
			}
		}
	});

	socket.on('like_user', function(data) {
		for (var i = 0; people[i]; i++) {
			if (people[i].log == data.to) {
				var to = i;
				socket.broadcast.to(people[to].id).emit('newNotif', {log: data.to});
			}
			if (people[i].log == data.me) {
				socket.emit('newNotif', {log: data.me});
			}
		}
	});


	socket.on('message', function(data) {
		mymongo.postMsg(data.to, data.log, data.msg);
		for (var i = 0; people[i]; i++) {
			if (people[i].log == data.to) {
				var idto = people[i].id;
				for (var a = 0; idto[a]; a++) {
					socket.to(idto[a]).emit('theNewMsg', {off: data.log, content: data.msg});
				}
			}
		}
		socket.emit('theNewMsg', {off: data.log, content: data.msg});
	});

	socket.on('checkMsg', function(data) {
		mymongo.getMsg(data.me, data.to, function(myMsg) {
			if (myMsg != null) {
				for (var b = 0; myMsg[b]; b++) {
					socket.emit('theNewMsg', {off: myMsg[b].off, content: myMsg[b].content});
				}
			}
		});
	});

});

//__________________Page Delog________________
app.get('/delog', function(req, res) {
    mymongo.delog(req, res);
});

// //______________Page introuvable______________
// app.use(function(req, res, next) {
// 	console.log(req.url);
// 	// res.setHeader('Content-Type', 'text/plain');
// 	res.status(404).send('Page introuvable');
// });

server.listen(3000)