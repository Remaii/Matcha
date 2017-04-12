var express = require('express')
var router = express.Router()

router.get('/', function(req, res) {
	res.locals.session = req.session;
    res.render('test');
});

module.exports = router;