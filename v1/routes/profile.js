var express = require('express')
var router = express.Router()
var mymongo = require('../middle/mymongo')
var utilities = require('../middle/utility')

router.get('/', function(req, res) {
	res.locals.session = req.session;
    // res.locals.userlog = req.session['login'];
    // mymongo.getProfile(req, res);
    res.render('test');
});

router.post('/', function(req, res) {
	
});

router.get('/:pseudo', function(req, res, next) {
	if (req.session['login'] != undefined) {
		utilities.clean(req.session, function(ret){
			if (ret) console.log('ret: ' + ret);
			next();
		});
	} else {
		res.redirect('../');
	}
}, function(req, res, next) {
	req.session['toget'] = req.url.slice(1);
	mymongo.getHerInfo(req, res, function(err, result) {
		if (err) console.log(err);
		if (result)	req.session['herPro'] = result;
		next();
	});
}, function(req, res, next) {
	mymongo.getHerTag(req, res, function(mytag) {
		req.session['herTag'] = mytag;
		next();
	});
}, function(req, res, next) {
	mymongo.getHerImage(req, res, function(mypic) {
		req.session['herPic'] = mypic;
		next();
	});
}, function(req, res) {
	res.locals.session = req.session;
	res.render('herPro');
});

module.exports = router;