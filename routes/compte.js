var express = require('express')
var router = express.Router()
var mymongo = require('../middle/mymongo')

router.get('/', function(req, res) {
	res.locals.session = req.session;
    res.render('test');
});

router.get('/info', function(req, res) {
    res.locals.session = req.session;
    res.render('compte/info');
});

router.post('/info', function(req, res) {
	if (req.body.submit === 'Update') {
		mymongo.updateUser(req, res);
	}
	res.redirect('/profile');
});

router.get('/profile', function(req, res) {
    mymongo.getMyProfil(req, res, function(result){
    	req.session['myprofile'] = result;
    	res.locals.session = req.session;
		res.render('compte/profile');
    });
});


module.exports = router;