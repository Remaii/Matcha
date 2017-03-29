var express = require('express')
var router = express.Router()
var mymongo = require('../middle/mymongo')

router.get('/', function(req, res) {
	if (req.session['login'] != '' || req.session['login'] != undefined) {
		mymongo.getAllProf(req.session['login'], function(result){ 
			req.session['allprof'] = result;
			res.locals.session = req.session;
			res.render('index');
		});
	} else {
		res.render('register');
	}
});

module.exports = router;