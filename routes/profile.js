var express = require('express')
var router = express.Router()
var mymongo = require('../middle/mymongo')

router.get('/', function(req, res) {
	res.locals.session = req.session;
    // res.locals.userlog = req.session['login'];
    mymongo.getProfile(req, res);
    res.render('test', {profile: req.session.profileTab});
});

router.post('/', function(req, res) {
	// console.log('req=');
	var tmp = {};
	mymongo.getProfile(req, res, function(str) {
		console.log(JSON.stringify(req.body));	
	})
	res.write(req.body);
});

module.exports = router;