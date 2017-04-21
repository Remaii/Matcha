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
	register = require('./routes/register')

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

////__________________Routes__________________
app.use('/', index)
app.use('/compte', compte)
app.use('/login', login)
app.use('/profile', profile)
app.use('/register', register)

app.use('/test', require('./routes/test'))//page test



// Socket.io
users = [];
people = [];

io.sockets.on('connection', function(socket) {
	console.log(people)
	socket.on('checkNotif', function(data) {
    	if (users.indexOf(data.login) > -1) {
    		for (var a = 0; people[a]; a++) {
    			if (people[a].log == data.login) {
    				people[a].id = socket.id;
    			}
    		}
    		mymongo.getMyNotif(data.login, function(myNotif) {
				socket.emit('notif', {myNotif});
			});
    	} else {
    		people.push({log: data.login, id: socket.id});
			users.push(data.login);
			socket.user = data.login;
			mymongo.getMyNotif(data.login, function(myNotif) {
				socket.emit('notif', {myNotif});
			});
    	}
	});
	
	socket.on('like_user', function(data) {
		for (var i = 0; people[i]; i++) {
			if (people[i].log == data.to) {
				var to = i;
				mymongo.getMyNotif(data.to, function(myNotif) {
					if (myNotif != null) {
						console.log(data.to);
						console.log(myNotif);
						socket.broadcast.to(people[to].id).emit('notif', {myNotif});
					}
				});
			}
			if (people[i].log == data.me) {
				var me = i;
				mymongo.getMyNotif(data.me, function(myNotif1) {
					if (myNotif1 != null) {
						console.log(data.me);
						console.log(myNotif1);
						socket.broadcast.to(people[me].id).emit('notif', {myNotif1});
					}
				});
			}
		}
	});
	
	socket.on('newmsg', function(data){
		//Send message to everyone
		for (var i = 0;people[i]; i++) {
			if (people[i].log == data.to) {
				mymongo.getMyNotif(data.to, function(myNotif) {
					if (myNotif != null) {
						for (var b = 0; people[b]; b++) {
							if (people[b].log == data.to) {
								socket.broadcast.to(people[b].id).emit('notif', {myNotif});
							}
						}
					}
				});
			}
		}
	});
});
// io.on('connection', function(socket) {
// 	console.log('A user connected');
// 	socket.on('setUsername', function(data) {
// 	    console.log(users);
// 	    console.log(data);
// 	    if (users.indexOf(data) > -1) {
// 	    	users.push(data);
// 	    	socket.emit('userSet', {username: data});
// 	    } else {
//     		socket.emit('userExists', data + ' username is taken! Try some other username.');
//     	}
// 	})
// 	socket.on('msg', function(data){
//     	//Send message to everyone
//     	io.sockets.emit('newmsg', data);
// 	})
// 	// socket.on('test', function(pseudo, dest, mess){
// 	// 	console.log(pseudo + ' send message to ' + dest + ' : ' + mess);
// 	// });
// 	// socket.on('mess', function(pseudo, dest){
// 	// 	console.log(pseudo + ' send message to ' + dest);
// 	// });
// 	// socket.on('connect_to', function(pseudo) {
// 	// 	console.log('User connect ' + pseudo);
// 	// });
// 	// socket.on('disconnect', function(pseudo) {
// 	// 	console.log('User disconnect');
// 	// });

// });

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