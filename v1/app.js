var express = require('express')
var bodyParser = require('body-parser')
var session = require('express-session')
var mymongo = require('./middle/mymongo')
var jQuery = require('jquery')
var app = express()


var index = require('./routes/index')
var compte = require('./routes/compte')
var login = require('./routes/login')
var profile = require('./routes/profile')
var register = require('./routes/register')

//__________________Moteur de template________
app.set('view engine', 'ejs');

//__________________Middlewares_______________
app.use(bodyParser.urlencoded({limit: '50mb', extended: true}));
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
app.use('/', index)
app.use('/compte', compte)
app.use('/login', login)
app.use('/profile', profile)
app.use('/register', register)

//__________________Page Delog________________
app.get('/delog', function(req, res) {
    mymongo.delog(req, res);
});

//______________Page introuvable______________
app.use(function(req, res, next) {
	res.setHeader('Content-Type', 'text/plain');
	res.status(404).send('Page introuvable');
});

app.listen(3000)