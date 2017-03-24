var express = require('express')
var router = express.Router()
var mymongo = require('../middle/mymongo')

router.get('/', function(req, res) {
	res.locals.session = req.session;
    // res.locals.userlog = req.session['login'];
    // mymongo.getProfile(req, res);
    res.render('test');
});

router.post('/', function(req, res) {
	
});

module.exports = router;