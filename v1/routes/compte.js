var express = require('express')
var router = express.Router()
var mymongo = require('../middle/mymongo')
var utilities = require('../middle/utility')

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
	mymongo.getMyLiker(req, res, function(mypic) {
		req.session['heLikeMe'] = mypic;
		next();
	});
}, function(req, res, next) {
	mymongo.getMyVisit(req, res, function(myvisit) {
		req.session['myvisit'] = myvisit;
		next();
	});
}, function(req, res, next) {
	utilities.makePopu(req.session['myinfo'], req.session['mytag'], req.session['mypic'], req.session['heLikeMe'], req.session['myvisit'],function(prof, popu) {
		req.session['prof'] = prof;
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
	mymongo.getInterest(req, res, function(err, tag) {
		if (tag) {
			req.session['interet'] = tag;
		}
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
	mymongo.upMyLoca(req, res, function(err, value) {
		if (err) console.log(err);
		if (value) req.session['myinfo'][7] = value;
		res.locals.session = req.session;
		res.render('compte/info')
	});
});

router.post('/info', function(req, res, next) {
	mymongo.getMyInfo(req, res, function(myinfo){
		req.session['myinfo'] = myinfo;
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
		res.render('partial/like');
	}
});

module.exports = router;