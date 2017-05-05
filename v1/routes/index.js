var express = require('express')
var router = express.Router()
var utilities = require('../middle/utility')
var mymongo = require('../middle/mymongo')
var trie = require('../middle/trieur')
var io = require('socket.io')

function determineTrie(nombre, list, myinfo, call) {
	if (nombre['trie'] == 0 || !nombre['trie']) {
		if (myinfo[7][0] && (myinfo[2] != undefined && myinfo[2] != '')) {
			trie.intelTri(myinfo, list, function(result) {
				trie.ponderate("all", myinfo, result, function(trier) {
					call(trier);
				});
			});
		} else {
			trie.intelTri(myinfo, list, function(result) {
				trie.forIndex(myinfo, result, 2, true, function(retour) {
					call(retour);
				}, 50);
			});
		}
	} else if (nombre['trie'] == 1) {
		if (myinfo[7][0] && (myinfo[2] != undefined && myinfo[2] != '')) {
			trie.intelTri(myinfo, list, function(result) {
				trie.ponderate("age", myinfo, result, function(trier) {
					call(trier);
				});
			});
		} else {
			trie.intelTri(myinfo, list, function(result) {
				trie.forIndex(myinfo, result, 2, true, function(retour) {
					call(retour);
				}, 50);
			});
		}
	} else if (nombre['trie'] == 2) {
		if (myinfo[7][0] && (myinfo[2] != undefined && myinfo[2] != '')) {
			trie.intelTri(myinfo, list, function(result) {
				trie.ponderate("loc", myinfo, result, function(trier) {
					call(trier);
				});
			});
		} else {
			trie.intelTri(myinfo, list, function(result) {
				trie.forIndex(myinfo, result, 2, true, function(retour) {
					call(retour);
				}, 50);
			});
		}
	} else if (nombre['trie'] == 3) {
		if (myinfo[7][0] && (myinfo[2] != undefined && myinfo[2] != '')) {
			trie.intelTri(myinfo, list, function(result) {
				trie.ponderate("popu", myinfo, result, function(trier) {
					call(trier);
				});
			});
		} else {
			trie.intelTri(myinfo, list, function(result) {
				trie.forIndex(myinfo, result, 2, true, function(retour) {
					call(retour);
				}, 50);
			});
		}
 	} else if (nombre['trie'] == 4) {
 		if (myinfo[7][0] && (myinfo[2] != undefined && myinfo[2] != '')) {
			trie.intelTri(myinfo, list, function(result) {
				trie.ponderate("tag", myinfo, result, function(trier) {
					call(trier);
				});
			});
		} else {
			trie.intelTri(myinfo, list, function(result) {
				trie.forIndex(myinfo, result, 2, true, function(retour) {
					call(retour);
				}, 50);
			});
		}
 	}
}

router.get('/', function(req, res, next) {
	mymongo.getAllProf(function(err, result){ 
		if (err) console.log(err);
		req.session['allprof'] = result;
		next();
	});
}, function(req, res, next) {
	mymongo.getMyLiker(req, res, function(myLiker) {
		req.session['heLikeMe'] = myLiker;
		next();
	});
}, function(req, res, next) {
	mymongo.getMyInfo(req, res, function(myinfo){
		req.session['myinfo'] = myinfo;
		next();
	});
}, function(req, res, next) {
	mymongo.getMyLike(req, res, function(result) {
		req.session['mylike'] = result;
		next();
	});
}, function (req, res, next) {
	determineTrie(req.query, req.session['allprof'], req.session['myinfo'], function(trier) {
		req.session['allprof'] = trier;
		next();
	});
}, function (req, res, next) {
	res.locals.session = req.session;
	res.render('index');
});

module.exports = router;