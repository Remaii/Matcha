var express = require('express')
var bodyParser = require('body-parser')
var session = require('express-session')
var mymongo = require('./middle/mymongo')

var index = require('./routes/index')
var compte = require('./routes/compte')
var login = require('./routes/login')
var profile = require('./routes/profile')
var app = express()


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
app.use('/', index)
app.use('/compte', compte)
app.use('/login', login)
app.use('/profile', profile)

//__________________Page Delog________________
app.get('/delog', function(req, res) {
    mymongo.delog(req, res);
});

app.listen(3000)