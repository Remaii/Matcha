// var mongoClient = require('mongodb');
//
// module.exports = function(login, pwd, mail) {
// 	mongoClient("mongodb://localhost/matcha", function(err, db) {
// 		if (err) throw err;
// 		else {
// 			var newAcc = {name: login, pwd: pwd, mail: mail};
// 			db.collection('user').insertOne(newAcc, null, function (err, results){
// 				if (err) throw err;
// 				console.log(results + ' utilisateur '+ login +' ajouter');
// 			});
// 		}
// 	});
// };

// module.exports = function (req, res, next) {
//
// 	mongoClient.connect("mongodb://localhost/matcha", function (err, db) {
// 		if (err) throw err;
//
// 		 function(login, pwd, mail){
// 			var newAccount = {name: login, pwd: pwd, mail: mail};
//
// 			db.collection('user').insert(newAccount, function (err, results) {
// 				if (err) throw err;
// 				console.log("Add new user: " + results + newAccount['name']);
// 			});
// 		};
// 	});
// }
