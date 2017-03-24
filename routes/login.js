var express = require('express')
var router = express.Router()
var mymongo = require('../middle/mymongo')

router.get('/', function(req, res) {
	res.locals.session = req.session;
    res.render('login');
});

router.post('/', function(req, res) {
	if (req.body.submit === 'Logon') {
		mymongo.logUser(req, res);
	}
});

module.exports = router;