var express = require('express')
var router = express.Router()
var mymongo = require('../middle/mymongo')

router.get('/', function(req, res) {
	res.locals.session = req.session;
    res.render('register');
});

router.post('/', function(req, res) {
	if (req.body.submit === 'Register') {
		mymongo.addUser(req, res, function(ok) {
			if (ok == 1) res.redirect('compte/info');
			else res.redirect('register');
		});
	}
});

module.exports = router;