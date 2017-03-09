var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var crypto = require('crypto');
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
	cookie: { secure: false}
}));
app.use(require('./middle/flash'));
// app.use(require('./middle/mongo'));



////__________________Routes__________________
//__________________Page Index________________
app.get('/', function(request, response) {
	response.render('index');
});


//__________________Page Login________________
app.get('/login', function(request, response) {
    response.render('login');
});

app.post('/login', function(req, res) {
	if (req.body.submit === 'Logon') {
		if (req.body.login === '' || req.body.login === undefined || req.body.pwd === '' || req.body.pwd === undefined) {
			req.flash('error', "le(s) champ(s) sont vides");
			res.redirect('login');
		} else {
			var log = req.body.login;
			var pwd = crypto.createHmac('whirlpool', req.body.pwd);
			req.flash('mess', log + pwd.digest('hex'));
			res.redirect('login');
		}
	}
	else if (req.body.submit === 'Register') {
		if (req.body.login1 === '' || req.body.login1 === undefined || req.body.pwd1 === '' || req.body.pwd1 === undefined || req.body.cfpwd === '' || req.body.cfpwd === undefined || req.body.mail === '' || req.body.mail === undefined) {
			req.flash('error', "le(s) champ(s) sont vides");
			res.redirect('login');
		} else {
			var logi = req.body.login1;
			var mail = req.body.mail;
			if (req.body.pwd1 !== req.body.cfpwd) {
				req.flash('error', "Les 2 mots de passe ne sont pas identiques");
			} else {
				var pwd = crypto.createHmac('whirlpool', req.body.pwd1);
				req.flash('mess', logi + pwd.digest('hex'));
				// require('./middle/mongo')(logi, pwd, mail);
			}
			res.redirect('login');
		}
	}
});


//_______Server, Ecoute sur le port: 3000_____
app.listen(3000);