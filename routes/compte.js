var express = require('express')
var router = express.Router()
var mymongo = require('../middle/mymongo')

router.get('/', function(req, res) {
	res.locals.session = req.session;
    res.render('test');
});

router.get('/info', function(req, res, next) {
	mymongo.getMyTag(req, res, function(mytag) {
		req.session['mytag'] = mytag;
		next();
	});
}, function(req, res, next) {
	mymongo.getInterest(req, res, function(tag) {
		req.session['interet'] = tag;
		next();
	});
}, function(req, res, next) {
	res.locals.session = req.session;
	res.render('compte/info');
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
	else if (sub === 'Supprimer') {
		mymongo.downMyTag(req, res);
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