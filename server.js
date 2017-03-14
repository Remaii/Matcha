var express = require('express');
var bodyParser = require('body-parser');
//var cookieParser = require('cookie-parser');
var session = require('express-session');
var crypto = require('crypto');


var mymongo = require('./middle/mymongo');
var app = express();

//__________________Moteur de template________
app.set('view engine', 'ejs');

//__________________Middlewares_______________
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use('/asset', express.static('public'));
app.use(session({
	secret: 'matcharthidet',
	resave: false,
	saveUninitialized:true,
	cookie: { maxAge: 60 * 60 * 24 * 7,
		secure: false}
}));
app.use(require('./middle/flash'));

////__________________Routes__________________
//__________________Page Index________________
app.get('/', function(request, response) {
	response.locals.userlog = request.session['login'];
	response.render('index');
});


//__________________Page Login________________
app.get('/login', function(request, response) {
    response.locals.userlog = request.session['login'];
    response.render('login');
});

app.post('/login', function(req, res) {
	if (req.body.submit === 'Logon') {
		mymongo.logUser(req, res);
	}
	else if (req.body.submit === 'Register') {
		mymongo.addUser(req, res);
	}
});

//__________________Page Compte________________
app.get('/compte', function(request, response) {
    response.locals.userlog = request.session['login'];
    response.render('compte/compte');
});

app.post('/compte', function(req, res) {
	if (req.body.submit === 'Update') {
		mymongo.updateUser(req, res);
	}
	res.redirect('compte');
});


//__________________Page Delog________________
app.get('/delog', function(request, response) {
    mymongo.delog(request, response);
    // response.render('index');
});




//__________________Page test________________
app.get('/test', function(request, response) {
    response.render('test', {
    	input:
    		['profile',
    		'modifie',
    		'option'] });
});

app.get('/compte/:page', function(req, res) {
	if (req.url == '/compte/profile') {
		res.render('compte/profile');
	}
})

//_______Server, Ecoute sur le port: 3000_____
app.listen(3000);