var express = require('express')
var router = express.Router()
var mymongo = require('../middle/mymongo')
var utilities = require('../middle/utility')

router.get('/', function(req, res) {
	res.locals.session = req.session;
    res.render('login');
});

router.post('/', function(req, res) {
	if (req.body.submit === 'Logon') {
		mymongo.logUser(req, res, function (err, mess, login, redir) {
			if (err) res.redirect(redir);
			if (login) {
				req.flash('mess', mess['mess']);
				req.session['login'] = login;
				res.redirect(redir);
			}
		});
	}
});

router.post('/reset', function(req, res, next) {
	if (req.body.submit === 'Reset') {
		utilities.senderMail(req.body.mail, "Reset");
	}
	next();
}, function(req, res) {
	res.status(200).send({ mess: 'it\' good!' });
});

module.exports = router;