var express = require('express')
var router = express.Router()

router.get('/', function(req, res) {
	res.locals.session = req.session;
    // res.locals.userlog = req.session['login'];
    res.render('compte/compte');
});

router.get('/compte', function(req, res) {
    res.locals.session = req.session;
    // res.locals.userlog = req.session['login'];
    res.render('test');
});

router.post('/', function(req, res) {
	if (req.body.submit === 'Update') {
		mymongo.updateUser(req, res);
	}
	res.redirect('compte/compte');
});

module.exports = router;