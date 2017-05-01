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
app.use(bodyParser.urlencoded({ limit: '80mb', extended: true }));
app.use(bodyParser.json());
app.use('/asset', express.static('public'));
app.use('/node_modules/socket.io-client', express.static('socket.io'));
var sessionMiddle = {
    secret: 'matchaRthidet',
    resave: true,
    saveUninitialized: true,
    cookie: { maxAge: 60 * 60 * 24 * 7 }
}
app.use(session(sessionMiddle));
app.use(require('./middle/flash'));


app.use('/', function(req, res, next) {
    if (req.session['login'] != undefined && req.url != '/compte/info/loc') {
        if (req.session['toget'] != undefined) {
            req.session['toget'] = undefined;
        }
        if (req.session['popu'] != undefined) {
            req.session['popu'] = undefined;
        }
        if (req.session['likeHer'] != undefined) {
            req.session['likeHer'] = undefined;
        }
        if (req.session['blockHer'] != undefined) {
            req.session['blockHer'] = undefined;
        }
        if (req.session['myBlock'] != undefined) {
            req.session['myBlock'] = undefined;
        }
        if (req.session['myLike'] != undefined) {
            req.session['myLike'] = undefined;
        }
        if (req.session['myFalse'] != undefined) {
            req.session['myFalse'] = undefined;
        }
        if (req.session['falseHer'] != undefined) {
            req.session['falseHer'] = undefined;
        }
        if (req.session['allprof'] != undefined) {
            req.session['allprof'] = undefined;
        }
        if (req.session['myinfo'] != undefined) {
            req.session['myinfo'] = undefined;
        }
        if (req.session['mytag'] != undefined) {
            req.session['mytag'] = undefined;
        }
        if (req.session['mypic'] != undefined) {
            req.session['mypic'] = undefined;
        }
        if (req.session['herPro'] != undefined) {
            req.session['herPro'] = undefined;
        }
        if (req.session['herTag'] != undefined) {
            req.session['herTag'] = undefined;
        }
        if (req.session['herPic'] != undefined) {
            req.session['herPic'] = undefined;
        }
        if (req.session['interet'] != undefined) {
            req.session['interet'] = undefined;
        }
        if (req.session['heLikeMe'] != undefined) {
            req.session['heLikeMe'] = undefined;
        }
        next();
    } else if (req.url == '/compte/info/loc' && req.session['login'] != undefined) {
        next();
    } else if (req.session['login'] == undefined && (req.url == '/login' || req.url == '/register')) {
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

// Socket.io
users = [];
people = [];

io.sockets.on('connection', function(socket) {

    socket.on('show_status', function(data) {
        if (data.login) {
            var a = undefined;
            for (var i = 0; people[i]; i++) {
                if (people[i].log == data.login) {
                    a = i;
                    if (people[a].id[0]) {
                        socket.emit('status_is', {login: data.login, status: 'Online'});
                    } else {
                        socket.emit('status_is', {login: data.login, status: 'Offline'});
                    }
                    break;
                }
            } if (!people[i] && a == undefined) {
                socket.emit('status_is', {login: data.login, status: 'Inconnue'});
            }
        }
    });

    socket.on('test', function(data) {
        console.log(people);
        socket.emit('test', people);
    });

    socket.on('stayco', function(data) {
        // console.log('stayco id: ' + socket.id);
        var tab = new Array();
        if (data.login != '' && data.login != undefined) {
            if (users.indexOf(data.login) > -1) {
                for (var a = 0; people[a]; a++) {
                    if (people[a].log == data.login) {
                        var i = a;
                        tab = people[i].id;
                        if (!mymongo.alreadySet(tab, socket.id)) {
                            tab[tab.length] = socket.id;
                            people[i].id = tab;
                        }
                        break;
                    }
                }
                mymongo.getMyNotif(data.login, function(myNotif) {
                    socket.emit('notif', myNotif);
                });
            } else {
				tab[tab.length] = socket.id;
                people.push({ log: data.login, id: tab });
                users.push(data.login);
                mymongo.getMyNotif(data.login, function(myNotif) {
                    socket.emit('notif', myNotif);
                });
            }
        }
    });

    socket.on('disconnect', function(data) {
        // console.log('disconnect id: ' + socket.id);
        if (data == 'transport close') {
            for (var a = 0; people[a]; a++) {
                for (var b = 0; people[a].id[b]; b++) {
                    if (people[a].id[b] == socket.id) {
                        people[a].id.splice(b, 1);
                        break;
                    }
                }
            }
        }
    });

    socket.on('like_user', function(data) {
        for (var i = 0; people[i]; i++) {
            if (people[i].log == data.to) {
                var idto = people[i].id;
                for (var a = 0; idto[a]; a++) {
                    socket.to(idto[a]).emit('newNotif');
                }
            }
            if (people[i].log == data.me) {
                socket.emit('newNotif');
            }
        }
    });

    socket.on('recupLikeur', function(data){
        mymongo.getMyheLike(data.login, function(result) {
            if (result) {
                for (var i = 0; result[i]; i++) {
                    if (!result[i]) break;
                    socket.emit('heLikeYou', {content: result[i]});
                }
            } else {
                socket.emit('heLikeYou', {content: "Personne n'a aimé ton profile"});
            }
        });
    });

    socket.on('message', function(data) {
        var idto = undefined;
        mymongo.postMsg(data.to, data.log, data.msg, true);
        for (var i = 0; people[i]; i++) {
            if (people[i].log == data.to) {
                idto = people[i].id;
                for (var a = 0; idto[a]; a++) {
                    socket.to(idto[a]).emit('theNewMsg', { off: data.log, content: data.msg });
                    socket.to(idto[a]).emit('newNotif');
                }
            }
        }
        socket.emit('theNewMsg', { off: data.log, content: data.msg });
    });

    socket.on('checkMsg', function(data) {
        mymongo.getMsg(data.me, data.to, function(myMsg) {
            if (myMsg != null) {
                for (var b = 0; myMsg[b]; b++) {
                    socket.emit('theOldMsg', { off: myMsg[b].off, content: myMsg[b].content });
                }
            }
        });
    });

    socket.on('downNotif', function(data) {
        mymongo.readNotif(data.login, data.notif);
        socket.emit('newNotif');
    });
});

//__________________Page Delog________________
app.get('/delog', function(req, res) {
    mymongo.delog(req, res);
});

//______________Page introuvable______________
app.use(function(req, res, next) {
	if (req.session['err']) {
	    console.log('404 : ' + req.url + ' ' + req.session['err']);
	    req.flash('err', req.session['err']);
	    req.session['err'] = undefined;
	    res.redirect('/');
	}
});

server.listen(3000)
