var crypto = require('crypto')
var uniqid = require('uniqid')
var sexe = {
	0: "Homme",
	1: "Femme",
	2: "Secret"
}

var sexual = {
	0: "Hetero",
	1: "Bi-Sex",
	2: "Gay"
}

var prenomH = {
	0: "Gabriel",
	1: "Alexandre",
	2: "Arthur",
	3: "Adam",
	4: "Raphaël",
	5: "Louis",
	6: "Paul",
	7: "Antoine",
	8: "Maxime",
	9: "Thomas",
	10: "Victor",
	11: "Lucas",
	12: "Jules",
	13: "Nathan",
	14: "Hugo",
	15: "Sacha",
	16: "Enzo"
}

var prenoms = {
	0: "Alex",
	1: "Ange",
	2: "Camille",
	3: "Chantal",
	4: "Charlie",
	5: "Claude",
	6: "Alice",
	7: "Dominique",
	8: "Tatiana",
	9: "Jackie",
	10: "Leslie",
	11: "Lou",
	12: "Charline",
	13: "Morgane",
	14: "Sacha",
	15: "Stéphane",
	16: "Yannick"
}

var setUsers = function(nb) {
	var MongoClient = require('mongodb').MongoClient;
	var url = "mongodb://localhost:28000/matcha";
	var passwd = crypto.createHmac('whirlpool', "AutoUser42").digest('hex');
	var mail = "AutoUser42@matcha.fr";
	

	MongoClient.connect(url, function(err, db) {
		if (err) return console.log(err);
		var randName = Math.floor((Math.random() * 16) + 0);
		var randSexe = Math.floor((Math.random() * 3) + 0);
		var randSexual = Math.floor((Math.random() * 3) + 0);
		var login = uniqid();
		var logauto = prenoms[randName];
		var sex = sexe[randSexe];
		var sexua = sexual[randSexual];
		for (var i = 0; i < nb; i++) {
			randSexual = Math.floor((Math.random() * 3) + 0);
			randSexe = Math.floor((Math.random() * 3) + 0);
			sex = sexe[randSexe];
			sexua = sexual[randSexual];
			randName = Math.floor((Math.random() * 16) + 0);
			if (sex == "Homme") {
				logauto = prenomH[randName];
			} else {
				logauto = prenoms[randName];
			}
			login = uniqid();
			var newUser = {
				login: login,
				name: logauto,
				pwd: passwd,
				mail: mail,
				sexe: sex,
				orient: sexua,
				bio: "J'ai été généré pour la correction",
				interet: {
					0: "Informatique",
					1: "Cinema",
					2: "Musique"
				},
				created: new Date()
			};
			db.collection('user').insertOne(newUser, function(err, result) {
				if (err) return console.log(err);
			});
		}
		db.close();
	});
}

setUsers(Number(process.argv[2]));