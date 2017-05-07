var express = require('express')
var router = express.Router()
var mymongo = require('../middle/mymongo')
var utilities = require('../middle/utility')

router.get('/:login', function(req, res, next) {
	mymongo.getMyMatch(req, res, function(result){
		req.session['myinfo'] = result;
		next();
	});
}, function(req, res, next) {
	utilities.getHisId(req.url.slice(1), function(rep) {
		if (utilities.alreadySet(req.session['myinfo'], req.url.slice(1))) {	
			req.session['tchat_with'] = rep;
			res.locals.session = req.session;
		    res.render('tchat');
		} else {
			req.flash('error', 'Vous n\'avez pas matché')
			res.redirect('/');
		}
	});
});

module.exports = router;