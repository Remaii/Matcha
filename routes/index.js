var express = require('express')
var router = express.Router()

function getTest(name, callback) {
	var mongoClient = require('mongodb').MongoClient;
	var url = "mongodb://localhost:28000/matcha";
	var result = {};
	var tmp = {};

	mongoClient.connect(url, function(err, db) {
		db.collection('user').find().toArray(function(err, docs) {
            for (var i = 0; docs[i]; i++){
                tmp[0] = docs[i]['name'];
                tmp[1] = docs[i]['sexe'];
                tmp[2] = docs[i]['orient'];
                tmp[3] = docs[i]['bio'];
                result[i] = tmp;
                tmp = {};
            }
            callback(result);
        });
	});
}

router.get('/', function(req, res) {
	var test = getTest(req.session['login'], function(result){ 
		req.session['test'] = result;
		res.locals.session = req.session;
		res.render('index');
	});
});

module.exports = router;