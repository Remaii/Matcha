var express = require('express')
var router = express.Router()
var mymongo = require('../middle/mymongo')

router.get('/', function(req, res) {
	if (req.session['login'] == undefined) {
		res.redirect('register');
	} else {
		mymongo.getAllProf(req.session['login'], function(result){ 
			req.session['allprof'] = result;
			res.locals.session = req.session;
			res.render('index');
		});
	}
});

module.exports = router;