var crypto = require('crypto')
var uniqid = require('uniqid')
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:28000/matcha";
var utilities = require('./middle/utility');

function removeDouble(tab, call) {
    var tmp = {};
    var nb = 0;

    for (var a = 0; tab[a]; a++) {
        if (!utilities.alreadySet(tmp, tab[a])) {
            tmp[nb] = tab[a];
            nb++;
        }
    }
    if (!tab[a]) {
        call(tmp);
    }
}

var sexe = {
	0: "Homme",
	1: "Femme"
}

var sexual = {
	0: "Hetero",
	1: "Bi",
	2: "Gay"
}

var lastName = {
	0: "DELAGE",
	1: "PETIT",
	2: "MOREAU",
	3: "RICHARD",
	4: "BERNARD",
	5: "GAILLARD",
	6: "NICOLAS",
	7: "FOUQUET",
	8: "MARQUET",
	9: "BERTRAND",
	10: "FAURE",
	11: "CLEMENT",
	12: "CAILLAUD",
	13: "MARTIN",
	14: "DUPOND",
	15: "BONNET",
	16: "BERTHET"
}

var prenomH = {
	0: "Gabriel",
	1: "Alexandre",
	2: "Arthur",
	3: "Adam",
	4: "Raphael",
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
	15: "Stephane",
	16: "Yannick"
}

var interet = {
	name: 'Tags',
	0:{
		0: "INFORMATIQUE",
		1: "CINEMA",
		2: "MUSIQUE",
		3: "NATURE",
		4: "SKATE",
		5: "SOIREE",
		6: "APPLE",
		7: "MODE",
		8: "VELO",
		9: "VEGAN",
		10: "OMNIVORE",
		11: "GEEK",
		12: "GAMER"
	}
}

function genPosition(callback) {
	var longitude = (Math.random() * (0.01 - 6.00) + 6.00).toFixed(5),
		latitude = (Math.random() * (44.47 - 49.36) + 49.36).toFixed(5);
	callback({lon: longitude, lat: latitude});
}

function allReadySet(tab, toadd) {
	if (tab[0] != null) {
		for (var i = 0; tab[i]; i++) {
			if (tab[i] == toadd)
				return 0;
		}
		return 1;
	} else {
		return 1;
	}
}

function addInteret() {
	MongoClient.connect(url, function(err, db){
		db.collection('interet').insertOne(interet, function(err, result){
			if (result.result.ok){
				console.log("Interet ajouter");
			}
		});
		db.close();
	});
}

function genTag(callback) {
	var i = 0,
		res = {};
	while (i < 2) {
		var rand = (Math.random() * (0 - 12) + 12).toFixed(0);
		res[i] = interet[0][rand];
		i++;
	} if (i == 2) {
		removeDouble(res, function(ret) {	
			callback(ret);
		});
	}
}

var setUsers = function(nb) {
	var passwd = crypto.createHmac('whirlpool', "AutoUser42").digest('hex');
	var mail = "AutoUser42@matcha.fr";
	var user = {};

	MongoClient.connect(url, function(err, db) {
		if (err) return console.log(err);
		var randName = Math.floor((Math.random() * 16) + 0),
			randLast = Math.floor((Math.random() * 16) + 0),
			age = Math.floor((Math.random() * (50 - 18)) + 18),
			randSexe = Math.floor((Math.random() * 2) + 0),
			randSexual = Math.floor((Math.random() * 3) + 0),
			login = uniqid(),
			last = lastName[randLast],
			logauto = prenoms[randName],
			sex = sexe[randSexe],
			sexua = sexual[randSexual],
			lo = 0,
			la = 0,
			tags = {},
			avatar = 'avatar.png';

		for (var i = 0; i < nb; i++) {
			randSexual = Math.floor((Math.random() * 3) + 0);
			randSexe = Math.floor((Math.random() * 2) + 0);
			randLast = Math.floor((Math.random() * 16) + 0);
			randName = Math.floor((Math.random() * 16) + 0);
			sex = sexe[randSexe];
			age = Math.floor((Math.random() * (50 - 18)) + 18);
			last = lastName[randLast];
			sexua = sexual[randSexual];
			genPosition(function(resu) {
				lo = resu.lon;
				la = resu.lat;
			});
			genTag(function(resTags) {
				tags = resTags;
			});
			if (sex == "Homme") {
				avatar = 'avatarH.png';
				logauto = prenomH[randName];
			} else {
				avatar = 'avatarF.png';
				logauto = prenoms[randName];
			}
			login = uniqid();
			user[i] = login;
			var newUser = {
				login: login,
				pseudo: logauto + i,
				firstname: logauto,
				lastname: last,
				age: age,
				pwd: passwd,
				mail: mail,
				lo: lo,
				la: la,
				sexe: sex,
				orient: sexua,
				avatar: avatar,
				bio: "J'ai été généré de façon aléatoire",
				tag: tags,
				heLikeMe: {
					0: "premier"
				},
				heBlockMe: {},
				like:{},
				block:{},
				notif:{},
				visit: {
					0: "premier",
					1: "deuxieme"
				},
				popu: 3,
				created: new Date()
			};
			db.collection('user').insertOne(newUser, function(err, result) {
				if (err) return console.log(err);
				if (result.result.ok) {
					console.log(result.ops[0].pseudo + " ajouté.")
				}
			});
		}
		db.close();
	});
}

function usage(off) {
	if (off == 'all') {
		console.log('Error: Wrong Param');
		console.log('Usage of "all": "node gen.js all [number between 2 and 500]"');
	} else if (off == 'user') {
		console.log('Error: Wrong Param');
		console.log('Usage of "user": "node gen.js user [number between 2 and 5000]"');
	}
}

if (process.argv[2] == 'all' && process.argv[3]) {
	if (Number(process.argv[3]) <= 500 && Number(process.argv[3]) > 1) {
		setUsers(Number(process.argv[3]));
		addInteret();
	} else {
		usage('all');
	}
} else if (process.argv[2] == 'tag') {
	addInteret();
} else if (process.argv[2] == 'user' && process.argv[3]) {
	if (Number(process.argv[3]) <= 5000 && Number(process.argv[3]) > 1) {
		setUsers(Number(process.argv[3]));
	} else {
		usage('user');
	}
}
