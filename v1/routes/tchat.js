var express = require('express')
var router = express.Router()
var mymongo = require('../middle/mymongo')

router.get('/:login', function(req, res, next) {
	req.session['tchat_with'] = req.url.slice(1);
	res.locals.session = req.session;
    res.render('tchat');
});

module.exports = router;