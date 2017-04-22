var express = require('express')
var router = express.Router()
var mymongo = require('../middle/mymongo')
var io = require('socket.io')

router.get('/', function(req, res) {
	res.locals.session = req.session;
    res.render('login');
});

router.post('/', function(req, res) {
	console.log(req.body)
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

module.exports = router;