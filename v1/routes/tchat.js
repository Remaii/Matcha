var express = require('express')
var router = express.Router()
var mymongo = require('../middle/mymongo')

router.get('/:login', function(req, res, next) {
	req.session['tchat_with'] = req.url.slice(1);
	// mymongo.getMsg(req.session['login'], req.session['tchat_with'], function(result) {
	// 	req.session['msg_tchat'] = result;
	// });
	next();
}, function(req, res, next) {
	res.locals.session = req.session;
    res.render('tchat');
});

// router.post('/', function(req, res, next) {
// 	mymongo.postMsg(req.body.to, req.body.log, req.body.msg, function(result) {
// 		console.log(result);
// 	});
// 	next();
// }, function(req, res) {

// 	res.render('partial/like');
// });

module.exports = router;