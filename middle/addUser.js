// Ajouter un utilisateur a la base mongo =>
// require('./mongo' //ce module//).addUser(log,pwd,mail)
var addUsr = {
	addUser: function(login, passwd, mail) {
		var MongoClient = require('mongodb').MongoClient;
		var url = "mongodb://localhost:27017/matcha";
		MongoClient.connect(url, function (err, db) {
			if (err) return require('./flash')('error', err);
			var newUser = {name: login, pwd: passwd, mail: mail, created: new Date()};
			db.collection('user').insertOne(newUser, function (err, result) {
				if (err) return err;
				if (result.ok == 1) {
					console.log('User add success');
				}
			});
			db.close();
		})
	}
};

module.exports = addUsr;