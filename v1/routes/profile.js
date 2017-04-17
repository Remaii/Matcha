var express = require('express')
var router = express.Router()
var mymongo = require('../middle/mymongo')
var utilities = require('../middle/utility')
var trie = require('../middle/trieur')

router.get('/', function(req, res, next) {
	if (req.session['login'] != undefined) {
		utilities.clean(req.session, function(ret) {
			if (ret) console.log('ret: ' + ret);
			next();
		});
	} else {
		res.redirect('../');
	}
}, function(req, res, next) {
	mymongo.getInterest(req, res, function(err, tag) {
		if (tag) {
			req.session['interet'] = tag;
		}
		next();
	});
}, function(req, res) {
	res.locals.session = req.session;
    res.render('recherche');
});

router.post('/', function(req, res, next) {
	if (req.session['login'] != undefined) {
		utilities.clean(req.session, function(ret) {
			if (ret) console.log('ret: ' + ret);
			next();
		});
	} else {
		res.redirect('../');
	}
}, function(req, res, next) {
	if (!req.body['search'] && (req.body['s'] || req.body['os'] || req.body['amin'] || req.body['amax'] || req.body['d'])) {
		next();
	} else if (req.body['search'] == '' && (!req.body['s'] || !req.body['os'] || !req.body['amin'] || !req.body['amax'] || !req.body['d'])) {
		res.redirect('/profile');
	} else if (req.body['search'] != undefined && req.body['search'] != '') {
		res.redirect('/profile/' + req.body['search']);
	}
},function(req, res, next) {
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
	trie.makeResearch(req, function(err, result) {
		if (result) {
			trie.forIndex(req.session['myinfo'], result, function(retour) {
				req.session['allprof'] = retour;
				next();
			}, req.body['d']);
		}
	});
}, function(req, res) {
	res.locals.session = req.session;
    res.render('search');
});

router.get('/:pseudo', function(req, res, next) {
	if (req.session['login'] != undefined) {
		utilities.clean(req.session, function(ret){
			if (ret) console.log('ret: ' + ret);
			next();
		});
	} else {
		res.redirect('../');
	}
}, function(req, res, next) {
	req.session['toget'] = req.url.slice(1);
	mymongo.getHerInfo(req, res, function(err, result) {
		if (err) console.log(err);
		if (result)	req.session['herPro'] = result;
		next();
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
//	console.log('check my like list + block list + falseUser list')
//	console.log('function(like, block, false) { callback du check if (like) req.session[likeHer] == 1; ...}');
	next();
}, function(req, res) {
	res.locals.session = req.session;
	res.render('herPro');
});

router.post('/like', function(req, res, next) {
	mymongo.likeUser(req, res, function(err, ret) {
		if (err) console.log(err);
		console.log(ret);
	});
	next();
}, function(req, res, next) {
	console.log('update like');
	next();
}, function(req, res) {
	res.render('partial/like')
});

router.post('/dislike', function(req, res, next) {
	mymongo.disLikeUser(req, res, function(err, ret) {
		if (err) console.log(err);
		console.log(ret);
	});
	next();
}, function(req, res, next) {
	console.log('update like');
	next();
}, function(req, res) {
	res.render('partial/like')
});

router.post('/false_user', function(req, res, next) {
	mymongo.falseUser(req, res, function(err, ret) {
		if (err) console.log(err);
		console.log(ret);
	});
	next();
}, function(req, res, next) {
	console.log('update false_user');
	next();
}, function(req, res ,next) {
	console.log('update myfalseuser');
	next();
}, function(req, res) {
	res.render('partial/like')
});

router.post('/block', function(req, res, next) {
	mymongo.blockUser(req, res, function(err, ret) {
		if (err) console.log(err);
		console.log(ret);
	});
	next();
}, function(req, res, next) {
	console.log('update myBlocked add' + req.body.log);
	next();
}, function(req, res) {
	res.render('partial/like')
});

router.post('/deblock', function(req, res, next) {
	mymongo.deBlockUser(req, res, function(err, ret) {
		if (err) console.log(err);
		console.log(ret);
	});
	next();
}, function(req, res, next) {
	console.log('update myBlocked');
	next();
}, function(req, res) {
	res.render('partial/like')
});

module.exports = router;