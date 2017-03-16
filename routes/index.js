var express = require('express')
var router = express.Router()

router.get('/', function(req, res) {
	res.locals.userlog = req.session['login'];
	res.render('index');
});

module.exports = router;