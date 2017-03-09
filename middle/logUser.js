// Chercher un utilisateur dans la base mongo,
// si il existe, mettre a jour derniere connection
// faire en sorte quil soit connecter au site
var logUsr = {
	logUser: function(login, passwd) {
		var MongoClient = require('mongodb').MongoClient;
		var url = "mongodb://localhost:27017/matcha";
		var i = 0;
		var ok = 0;

		MongoClient.connect(url, function (err, db) {
			var collec = db.collection('user');
			if (err) return err;
			collec.find({}).toArray(function(err, docs){
				while (docs[i]) {
					if (docs[i]['name'] === login && docs[i]['pwd'] === passwd) {
						console.log('User: ' + login + ' is Connected');
						ok = 1;
					}
					i++;
				}
				if (ok == 1) {
					collec.updateOne({name: login}, { $set:{last_co: new Date()}});
				}
				db.close();
			});

		});
	}
};
module.exports = logUsr;