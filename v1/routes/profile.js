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

router.get('/:login', function(req, res) {
	mymongo.getThisProf(req, res, function(err, result) {
		if (err) {
			console.log(err);
			console.log(result);
		}
		if (result && !err) {
			req.session['herPro'] = result;
			res.locals.session = req.session;
			res.render('herPro');
		}
	});
});

module.exports = router;