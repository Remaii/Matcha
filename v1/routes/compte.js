var express = require('express')
var router = express.Router()
var mymongo = require('../middle/mymongo')
var utilities = require('../middle/utility')
var crypto = require('crypto')

router.get('/profile', function(req, res, next) {
	mymongo.getMyInfo(req, res, function(myinfo) {
		req.session['myinfo'] = myinfo;
		next();
	});
}, function(req, res, next) {
	mymongo.getMyTag(req, res, function(mytag) {
		req.session['mytag'] = mytag;
		next();
	});
}, function(req, res, next) {
	mymongo.getMyImage(req, res, function(mypic) {
		req.session['mypic'] = mypic;
		next();
	});
}, function(req, res, next) {
	mymongo.getMyLike(req, res, function(mylike) {
		req.session['mylike'] = mylike;
		next();
	});
}, function(req, res, next) {
	mymongo.getMyVisit(req, res, function(myvisit) {
		req.session['myVisit'] = myvisit;
		next();
	});
}, function(req, res, next) {
	mymongo.getPopu(req.session['login'], function(popu) {
		req.session['popu'] = popu;
		next();
	});
}, function(req, res) {
	res.locals.session = req.session;
	res.render('compte/profile');
});

router.get('/info', function(req, res, next) {
	mymongo.getMyInfo(req, res, function(myinfo){
		req.session['myinfo'] = myinfo;
		next();
	});
}, function(req, res, next) {
	mymongo.getMyTag(req, res, function(mytag) {
		req.session['mytag'] = mytag;
		next();
	});
}, function(req, res, next) {
	mymongo.getMyImage(req, res, function(mypic) {
		req.session['mypic'] = mypic;
		next();
	});
}, function(req, res, next) {
	mymongo.getInterest(req, res, function(tagForAll) {
		req.session['interet'] = tagForAll;
		next();
	});
}, function(req, res, next) {
	res.locals.session = req.session;
	res.render('compte/info');
});

router.get('/info/mypic', function(req, res, next) {
	mymongo.getMyImage(req, res, function(mypic) {
		req.session['mypic'] = mypic;
		res.locals.session = req.session;
		res.render('compte/mypic');
	});
});

router.post('/info/loc', function(req, res, next) {
	mymongo.getMyInfo(req, res, function(myinfo){
		req.session['myinfo'] = myinfo;
		next();
	});
}, function(req, res, next) {
	mymongo.upMyLoca(req, res);
	next();
}, function(req, res) {
	res.status(200).send({ mess: 'it\' good!' });
});

router.post('/info', function(req, res, next) {
	mymongo.getMyInfo(req, res, function(myinfo){
		req.session['myinfo'] = myinfo;
		next();
	});
}, function(req, res, next) {
	mymongo.getMyTag(req, res, function(mytag) {
		req.session['mytag'] = mytag;
		next();
	});
}, function(req, res, next) {
	mymongo.getInterest(req, res, function(tagForAll) {
		req.session['interet'] = tagForAll;
		next();
	});
}, function(req, res) {
	var sub = req.body.submit;
	if (sub === 'Update') {
		mymongo.updateUser(req, res);
	} else if (sub === 'Creer') {
		mymongo.addInterest(req, res);
	} else if (sub === 'Ajouter') {
		mymongo.upMyTag(req, res);
	} else if (sub === 'Supprimer') {
		mymongo.downMyTag(req, res);
	} else if (req.body.photo && sub === 'Upload') {
		utilities.getImage(req, res, function(err, value) {
			if (err) console.log('err: ' + err);
			mymongo.upImage(value, req.session['login']);
		});
		res.redirect('info');
	} else if (req.body.path && sub == 'SuppPic') {
		utilities.rmImage(req, res, function(err, result) {
			mymongo.downMyImage(req, res);
		});
		res.redirect('info');
	} else if (req.body.path && sub == 'toAvatar') {
		mymongo.setAvatar(req, res);
		res.status(200).send({ mess: 'it\' good!' });
	}
});

router.post('/pwd', function(req, res, next) {
	mymongo.getMyInfo(req, res, function(myinfo) {
		req.session['myinfo'] = myinfo;
		next();
	});
}, function(req, res, next) {
	if (!utilities.checkerPwd(req.body.pwd)) {
		next();
	} else if (req.body.pwd != req.body.cfpwd) {
		next();
	} else {
		utilities.checkerMyPwd(req.session['login'], req.body.oldpwd, function(boolee) {
			if (boolee) {
				utilities.changePassword(req.body.pwd, req.session['myinfo'][6], function(bool) {
					next();
				});
			}
		});
	}
}, function(req, res) {
	res.redirect('info');
});

module.exports = router;