var express = require('express')
var router = express.Router()
var utilities = require('../middle/utility')
var mymongo = require('../middle/mymongo')
var trie = require('../middle/trieur')
var io = require('socket.io')


router.get('/', function(req, res, next) {
	if (req.session['login'] != undefined) {
		utilities.clean(req.session, function(ret) {
			next();
		});
	} else {
		res.redirect('register');
	}
}, function(req, res, next) {
	mymongo.getAllProf(function(err, result){ 
		if (err) console.log(err);
		req.session['allprof'] = result;
		next();
	});
}, function(req, res, next) {
	mymongo.getMyLiker(req, res, function(myLiker) {
		req.session['heLikeMe'] = myLiker;
		next();
	});
}, function(req, res, next) {
	mymongo.getMyInfo(req, res, function(myinfo){
		req.session['myinfo'] = myinfo;
		next();
	});
}, function(req, res, next) {
	mymongo.getMyLike(req, res, function(result) {
		req.session['mylike'] = result;
		next();
	});
}, function (req, res, next) {
	trie.intelTri(req.session['myinfo'], req.session['allprof'], function(result) {
		req.session['allprof'] = result;
		next();
	});
}, function(req, res, next) {
	trie.forIndex(req.session['myinfo'], req.session['allprof'], function(retour) {
		req.session['allprof'] = retour;
		next();
	}, 0);
}, function (req, res, next) {
	res.locals.session = req.session;
	res.render('index');
});

module.exports = router;