var crypto = require('crypto');
var cookie = require('cookie');

//checker de mot de passe
var checkerPwd = function(password) {
    var maj = 0;
    var num = 0;
    var i = 0;

    while (password[i]) {
        if (password.charCodeAt(i) >= 65 && password.charCodeAt(i) <= 90)
            maj++;
        else if (password.charCodeAt(i) >= 48 && password.charCodeAt(i) <= 57)
            num++;
        i++;
    }
    if (i >= 5 && maj > 0 && num > 0) {
        return 1;
    } else {
        return 0;
    }
}

var checkerBio = function(str, nb) {
    var i = 0;
    while (str[i]){
        i++;
    }
    if (i >= nb){
        return 0;
    } else {
        return 1;
    }
}

var getAllProf = function (name, callback) {
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
                tmp[3] = docs[i]['tag'];
                result[i] = tmp;
                tmp = {};
            }
            callback(result);
        });
    });
}

var getMyProfil = function(req, res, call) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:28000/matcha";
    var log = req.session['login'];
    
    MongoClient.connect(url, function(err, db) {
        db.collection('user').find({login: log}).toArray(function(err, doc) {
            var result = {
                name: doc[0]['name'],
                sexe: doc[0]['sexe'],
                orient: doc[0]['orient'],
                bio: doc[0]['bio'],
                interet: doc[0]['tag']
            };
            call(result);
        });
        db.close();
    });
}

//deloguer l'utilisateur
var deLog = function(req, res) {
    console.log(req.session['login'] + ' se delog');
    req.session['login'] = undefined;
    res.redirect('/');
}

// Ajouter un utilisateur a la base mongo =>
// Si le nom d'utilisateur et/ou mail n'existe pas dans la base
var addUser = function(req, res) {
	var MongoClient = require('mongodb').MongoClient;
	var url = "mongodb://localhost:28000/matcha";
    var logre = req.body.login;
    var passwd = req.body.pwd;
    var cfpwd = req.body.cfpwd;
    var mail = req.body.mail;

    if (logre != '' && passwd != '' && cfpwd != '' && mail != '') {
        if (checkerPwd(passwd) == 1) {
            passwd = crypto.createHmac('whirlpool', passwd).digest('hex');
            cfpwd = crypto.createHmac('whirlpool', cfpwd).digest('hex');
            if (passwd === cfpwd) {
            	MongoClient.connect(url, function (err, db) {
            		if (err) {
                        req.flash('error', 'Connection to DataBase Failed');
                        res.redirect('login');
                    }
            		var newUser = {login: logre, name: logre, pwd: passwd, mail: mail, created: new Date()};
                    db.collection('user').find({}).toArray(function(err, docs) {
                        var i = 0;
                        var ok = 0;
                        while (docs[i]) {
                            if (docs[i]['login'] === logre || docs[i]['mail'] === mail) {
                                console.log('User: ' + logre + ' are already register');
                                ok = -1;
                                break;
                            }
                            ok++;
                            i++;
                        }
                        if (ok != -1) {
                            req.session['login'] = logre;
                            req.flash('mess', 'Utilisateur ajouté avec succes');
                            db.collection('user').insertOne(newUser, function (err, result) {
                                if (result.result['ok']) {
                                    console.log('User ' + logre + ' add success');
                                }

                            });
            			} else {
                            req.flash('error', 'Utilisateur / Mail, déjà utilisé');
                        }
            			db.close();
                        res.redirect('compte/info');
                    });
            	});
            }
            else {
                req.flash('error', 'Les mots de passes ne sont pas identiques');
                res.redirect('register');
            }
        }
        else {
            req.flash('error', 'Le mot de passe doit contenir au minimum 1 Majuscules, 1 chiffre et faire 5 caracteres minimum');
            res.redirect('register');
        }
    } else {
        req.flash('error', 'Un ou Plusieurs champ(s) vide');
        res.redirect('register');
    }
}

// Chercher un utilisateur dans la base mongo,
// si il existe, mettre a jour sa derniere connection
// le connecter au site
var logUser = function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:28000/matcha";
    var i = 0;
    var ok = 0;
    var log = req.body.login;
    var pwd = req.body.pwd;

    if (log != '' && pwd != '') {
        pwd = crypto.createHmac('whirlpool', pwd).digest('hex');
        MongoClient.connect(url, function (err, db) {
            var collec = db.collection('user');
            if (err) {
                req.flash('error', 'Connection to DataBase Failed');
                res.redirect('login');
            }
            collec.find({}).toArray(function(err, docs){
                while (docs[i]) {
                    if (docs[i]['login'] === log && docs[i]['pwd'] === pwd) {
                        console.log('User: ' + log + ' is Connected');
                        ok = 1;
                    }
                    i++;
                }
                if (ok == 1) {
                    collec.updateOne({name: log}, { $set:{last_co: new Date()}});
                    req.session['login'] = log;
                    req.flash('mess', 'Connection Success');
                    db.close(); 
                    res.redirect('/');
                }
                else {
                    req.flash('error', 'Utilisateur/Mot de passe invalides');
                    db.close();
                    res.redirect('login');
                }
            });
        });
    } else {
        req.flash('error', 'Un ou Plusieurs champ(s) vide');
        res.redirect('login');
    }
};

var updateUser = function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:28000/matcha";
    var loger = req.session['login'];
    var name = req.body.name;
    var sexe = req.body.sexe;
    var orient = req.body.orient;
    var bio = req.body.bio;
    

    if (name != '' && bio != '' && sexe != '' && orient != '' && loger != undefined) {
        if (checkerBio(bio, '500') == 1) {
            MongoClient.connect(url, function(err, db) {
                db.collection('user').updateOne({login: req.session['login']}, { $set:{name: name, bio: bio, sexe: sexe, orient: orient}});
                db.close();
                res.redirect('info');
            });
        }
        console.log('User: ' + loger + ' info update');
    }
    else {
        req.flash('error', 'Un ou Plusieurs champ(s) vide');
    }
}

function insertThis(tab) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:28000/matcha";

    MongoClient.connect(url, function(err, db) {
        db.collection('interet').updateOne({}, tab, function(err, result) {
            if (err) return console.log(err);
            if (result.result.ok) return console.log("Les Tags on ete mis à jour");
        });
        db.close();
    });
}

var addInterest = function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:28000/matcha";
    var toadd = req.body.interet.toUpperCase();

    if (toadd == '' || toadd == undefined) {
        req.flash('error', 'Tu n\'a rien mis :(');
        res.redirect('info');
    } else {
        MongoClient.connect(url, function(err, db) {
            if (err) return console.log(err);
            var tab = {};
            var ok = 1;
            db.collection('interet').find().toArray(function(err, doc) {
                for (var i = 0; doc[0][i]; i++) {
                    if (doc[0][i] == toadd) {
                        ok = -1;
                    }
                    if (ok != -1)
                        ok++;
                    tab[i] = doc[0][i];
                }
                if (ok > 5) {
                    tab[i] = toadd;
                    req.flash('mess', 'Tag ajouté avec success');
                    insertThis(tab);
                }
                else if (ok == -1) {
                    req.flash('error', 'Ce Tag existe déjà');
                }
                db.close();
                res.redirect('info');
            });
        });
    }
}

function getMyTag(req, res, call) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:28000/matcha";
    var mytag = {}
    var log = req.session['login'];

    if (log != '' || log != undefined) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({login: log}).toArray(function(err, doc) {
                mytag = doc[0]['tag'];
                call(mytag);
            });
            db.close();
        });
    }// else error 404 ? no avaible ?
}

var getInterest = function(req, res, call) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:28000/matcha";
    var tag = {};

    MongoClient.connect(url, function(err, db) {
        db.collection('interet').find().toArray(function(err, docs){
            for (var i = 0; docs[0][i]; i++){
                tag[i] = docs[0][i];
            }
            call(tag);
        });
        db.close();
    });
}

var upMyTag = function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:28000/matcha";
    var interet = req.body.select;
    var log = req.session['login'];
    var toadd = {};
    var ok = 0;

    if (Array.isArray(interet)) {
        for (var i = 0; interet[i]; i++) {
            console.log(i + "_interet_" + interet[i])
            toadd[i] = interet[i];
            if (!interet[i + 1] && (req.session['mytag'] != undefined || req.session['mytag'] != '')) {
                for (var u = 0; req.session['mytag'][u];u++) {
                    console.log(req.session['mytag'][u]);
                    toadd[i + u + 1] = req.session['mytag'][u];
                    if (!req.session['mytag'][u + 1]) {
                        ok = 1;
                    }
                }                
            } else if (!interet[i + 1]) {
                ok = 1;
            }
        }
        // for (var u = 0; req.session['mytag'][u];u++) {
        //     console.log(req.session['mytag'][u]);
        //     // if (!req.session['mytag'][u + 1]) {
        //         // ok = 1;
        //     // }
        // }
    } else {
        toadd[0] = interet;
        if (req.session['mytag']) {
            for (var u = 0; req.session['mytag'][u];u++) {
                console.log(req.session['mytag'][u]);
                toadd[u + 1] = req.session['mytag'][u];
                if (!req.session['mytag'][u + 1]) {
                    ok = 1;
                }
            }
        } else {
            ok = 1;
        }
    }
    if ((log != undefined || log != '') && ok == 1) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').updateOne({login: log}, { $set:{tag: toadd}});
            db.close();
        });
    }
    res.redirect('info');
}


exports.getMyTag = getMyTag;
exports.getAllProf = getAllProf;
exports.upMyTag = upMyTag;
exports.getInterest = getInterest;
exports.addInterest = addInterest;
exports.updateUser = updateUser;
exports.logUser = logUser;
exports.addUser = addUser;
exports.delog = deLog;
exports.getMyProfil = getMyProfil;