var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var crypto = require('crypto');
var addUsr = require('./middle/addUser');
var logUsr = require('./middle/logUser');
var app = express();

//__________________Moteur de template________
app.set('view engine', 'ejs');

//__________________Middlewares_______________
app.use(bodyParser.urlencoded({ extended: false}));
app.use(bodyParser.json());
app.use('/asset', express.static('public'));
app.use(session({
	secret: 'matchaRthidet',
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
	var login_log = req.body.login;
	var login_reg = req.body.login1;
	var pwd_log = req.body.pwd;
	var pwd_reg = req.body.pwd1;
	var cfpwd = req.body.cfpwd;
	var mail = req.body.mail;
	if (req.body.submit === 'Logon') {
		if (login_log === '' || login_log === undefined || pwd_log === '' || pwd_log === undefined) {
			req.flash('error', "le(s) champ(s) sont vides");
			res.redirect('login');
		} else {
			pwd_log = crypto.createHmac('whirlpool', pwd_log);
			logUsr.logUser(login_log, pwd_log.digest('hex'));
			req.flash('mess', login_log + ' ' + pwd_log.digest('hex'));
			res.redirect('login');
		}
	}
	else if (req.body.submit === 'Register') {
		if (login_reg === '' || login_reg === undefined || pwd_reg === '' || pwd_reg === undefined || cfpwd === '' || cfpwd === undefined || mail === '' || mail === undefined) {
			req.flash('error', "le(s) champ(s) sont vides");
			res.redirect('login');
		} else {
			if (pwd_reg != cfpwd) {
				req.flash('error', "Les 2 mots de passe ne sont pas identiques");
			} else {
				pwd_reg = crypto.createHmac('whirlpool', cfpwd);
				addUsr.addUser(login_reg, pwd_reg.digest('hex'), mail);
			}
			res.redirect('login');
		}
	}
});


//_______Server, Ecoute sur le port: 3000_____
app.listen(3000);