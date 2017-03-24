var express = require('express')
var router = express.Router()
var mymongo = require('../middle/mymongo')

router.get('/', function(req, res) {
	res.locals.session = req.session;
    res.render('test');
});

function resInfo(req, res, call) {
	mymongo.getMyTag(req, res, function(mytag) {
		console.log('callback mytag');
		req.session['mytag'] = mytag;
	});
	mymongo.getInterest(req, res, function(tag) {
		console.log('callback tag');
		req.session['interet'] = tag;
	});
	call()
}

router.get('/info', function(req, res) {
	resInfo(req, res, function(tag, mytag) {
		console.log('mytag' + mytag);
		console.log('tag' + tag);
		res.render('compte/info');
	});
	// mymongo.getMyTag(req, res, function(mytag) {
	// 	console.log('callback mytag');
	// 	req.session['mytag'] = mytag;
	// });
	// mymongo.getInterest(req, res, function(tag) {
	// 	console.log('callback tag');
	// 	req.session['interet'] = tag;
	// 	res.render('compte/info');
	// });
});

router.post('/info', function(req, res) {
	var sub = req.body.submit;
	if (sub === 'Update') {
		mymongo.updateUser(req, res);
	}
	else if (sub === 'Creer') {
		mymongo.addInterest(req, res);
	}
	else if (sub === 'Ajouter') {
		mymongo.upMyTag(req, res);
	}
});

router.get('/profile', function(req, res) {
    mymongo.getMyProfil(req, res, function(result){
    	req.session['myprofile'] = result;
    	res.locals.session = req.session;
		res.render('compte/profile');
    });
});


module.exports = router;