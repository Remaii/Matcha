var express = require('express')
var router = express.Router()
var mymongo = require('../middle/mymongo')
var utilities = require('../middle/utility')
var trie = require('../middle/trieur')

router.get('/', function(req, res, next) {
	mymongo.getInterest(req, res, function(tag) {
		req.session['interet'] = tag;
		next();
	});
}, function(req, res) {
	res.locals.session = req.session;
    res.render('recherche');
});

router.post('/', function(req, res, next) {
	if (!req.body['search'] && (req.body['s'] || req.body['os'] || req.body['amin'] || req.body['amax'] || req.body['d'])) {
		next();
	} else if (req.body['search'] == '' && (!req.body['s'] || !req.body['os'] || !req.body['amin'] || !req.body['amax'] || !req.body['d'])) {
		res.redirect('/profile');
	} else if (req.body['search'] != undefined && req.body['search'] != '') {
		res.redirect('/profile/' + req.body['search']);
	}
}, function(req, res, next) {
	mymongo.getAllProf(function(err, result) { 
		if (err) console.log(err);
		req.session['allprof'] = result;
		next();
	});
}, function(req, res, next) {
	mymongo.getMyInfo(req, res, function(myinfo){
		req.session['myinfo'] = myinfo;
		next();
	});
}, function(req, res, next) {
	mymongo.getInterest(req, res, function(tag) {
		req.session['interet'] = tag;
		next();
	});
}, function(req, res, next) {
	trie.makeResearch(req, function(err, result) {
		var query = {};
		if (req.body.trie) {
			query = {
				trie:req.body.trie
			}
		}
		if (result) {
			trie.determineTrieS(query, result, req.session['myinfo'], function(retour) {
				req.session['allprof'] = retour;
				next();
			});
		}
	});
}, function(req, res) {
	res.locals.session = req.session;
    res.render('search');
});

router.get('/:pseudo', function(req, res, next) {
	mymongo.getMyInfo(req, res, function(myinfo){
		req.session['myinfo'] = myinfo;
		next();
	});
}, function(req, res, next) {
	if (req.session['myinfo'][9] != "avatarH.png" && req.session['myinfo'][9] != "avatarF.png")
		next();
	else {
		req.flash('error', 'Tu dois mettre un avatar pour acceder au profile');
		res.redirect('../compte/info');
	}
}, function(req, res, next) {
	utilities.getLogin(req.url.slice(1), function(rep) {
		req.session['toget'] = rep;
		next();
	});
}, function(req, res, next) {
	mymongo.getHerInfo(req, res, function(err, result) {
		if (err) {
			req.flash('error', err.err);
			res.redirect('/')
		}
		if (result) {
			req.session['herPro'] = result;
			next();
		}
	});
}, function(req, res, next) {
	mymongo.getHerTag(req, res, function(mytag) {
		req.session['herTag'] = mytag;
		next();
	});
}, function(req, res, next) {
	mymongo.getHerImage(req, res, function(mypic) {
		req.session['herPic'] = mypic;
		next();
	});
}, function(req, res, next) {
	mymongo.getMyLike(req, res, function(myLike) {
		if (myLike != undefined) {
			for (var i = 0; myLike[i]; i++) {
				if (myLike[i] == req.session['herPro'][9]) {
					req.session['likeHer'] = myLike[i];
				}
			}
			if (!myLike[i] && req.session['likeHer'] != req.session['herPro'][9])
				req.session['likeHer'] = undefined;
		}
		next();
	});
}, function(req, res, next) {
	mymongo.getMyLiker(req, res, function(myLiker) {
		req.session['heLikeMe'] = myLiker;
		next();
	});
}, function(req, res, next) {
	mymongo.getMyBlock(req, res, function(myBlock) {
		if (myBlock != undefined) {
			for (var i = 0; myBlock[i]; i++) {
				if (myBlock[i] == req.session['herPro'][9]) {
					req.session['blockHer'] = myBlock[i];
				}
			}
			if (!myBlock[i] && req.session['blockHer'] != req.session['herPro'][9])
				req.session['blockHer'] = undefined;
		}
		next();
	});
}, function(req, res, next) {
	mymongo.getMyFalse(req, res, function(myFalse) {
		if (myFalse != undefined) {
			for (var i = 0; myFalse[i]; i++) {
				if (myFalse[i] == req.session['herPro'][9]) {
					req.session['falseHer'] = myFalse[i];
				}
			}
			if (!myFalse[i] && req.session['falseHer'] != req.session['herPro'][9])
				req.session['falseHer'] = undefined;
		}
		next();
	});
}, function(req, res, next) {
	mymongo.getPopu(req.session['toget'], function(popu) {
		req.session['herPro'][11] = popu;
		next();
	});
}, function(req, res) {
	res.locals.session = req.session;
	res.render('herPro');
});

router.post('/like', function(req, res, next) {
	mymongo.getMyLike(req, res, function(myLike) {
		req.session['myLike'] = myLike;
		next();
	});
}, function(req, res, next) {
	mymongo.likeUser(req, res, function(err, ret) {
		res.locals.like = ret;
		next();
	});
}, function(req, res) {
	res.status(200).send({ mess: 'it\'s good!' });
});

router.post('/dislike', function(req, res, next) {
	mymongo.getMyLike(req, res, function(myLike) {
		req.session['myLike'] = myLike;
		next();
	});
}, function(req, res, next) {
	mymongo.disLikeUser(req, res, function(err, ret) {
		res.locals.like = ret;
		next();
	});
}, function(req, res) {
	res.status(200).send({ mess: 'it\'s good!' });
});

router.post('/false_user', function(req, res, next) {
	mymongo.getMyFalse(req, res, function(myFalse) {
		req.session['myFalse'] = myFalse;
		next();
	});
}, function(req, res, next) {
	mymongo.falseUser(req, res, function(err, ret) {
		res.locals.like = ret;
		next();
	});
}, function(req, res) {
	res.status(200).send({ mess: 'it\'s good!' });
});

router.post('/block', function(req, res, next) {
	mymongo.getMyBlock(req, res, function(myBlock) {
		req.session['myBlock'] = myBlock;
		next();
	});
}, function(req, res, next) {
	mymongo.blockUser(req, res, function(err, ret) {
		res.locals.like = ret;
		next();
	});
}, function(req, res) {
	res.status(200).send({ mess: 'it\'s good!' });
});

router.post('/deblock', function(req, res, next) {
	mymongo.getMyBlock(req, res, function(myBlock) {
		req.session['myBlock'] = myBlock;
		next();
	});
}, function(req, res, next) {
	mymongo.deBlockUser(req, res, function(err, ret) {
		res.locals.like = ret;
		next();
	});
}, function(req, res) {
	res.status(200).send({ mess: 'it\'s good!' });
});

module.exports = router;