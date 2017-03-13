var crypto = require('crypto');
var cookie = require('cookie');

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
	var url = "mongodb://localhost:27017/matcha";
    var logre = req.body.login1;
    var passwd = req.body.pwd1;
    var cfpwd = req.body.cfpwd;
    var mail = req.body.mail; 



    if (logre != '' && passwd != '' && cfpwd != '' && mail != '') {
        passwd = crypto.createHmac('whirlpool', passwd).digest('hex');
        cfpwd = crypto.createHmac('whirlpool', cfpwd).digest('hex');
        if (passwd === cfpwd) {
        	MongoClient.connect(url, function (err, db) {
        		if (err) {
                    req.flash('error', 'Connection to DataBase Failed');
                    res.redirect('login');
                }
        		var newUser = {name: logre, pwd: passwd, mail: mail, created: new Date()};
                db.collection('user').find({}).toArray(function(err, docs) {
                    var i = 0;
                    var ok = 0;
                    while (docs[i]) {
                        if (docs[i]['name'] === logre || docs[i]['mail'] === mail) {
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
                    res.redirect('compte');
                });
        	});
        }
        else {
            req.flash('error', 'Les mots de passes ne sont pas identiques');
            res.redirect('login');
        }
    } else {
        req.flash('error', 'Un ou Plusieurs champ(s) vide');
        res.redirect('login');
    }
}

// Chercher un utilisateur dans la base mongo,
// si il existe, mettre a jour sa derniere connection
// le connecter au site
var logUser = function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/matcha";
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
                    if (docs[i]['name'] === log && docs[i]['pwd'] === pwd) {
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
                // db.close();
                // res.redirect('/');
            });
        });
    } else {
        req.flash('error', 'Un ou Plusieurs champ(s) vide');
        res.redirect('login');
    }
};

function updater(loger, toUp, value) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/matcha";
// {$set: tocoll}
    if (value != '') {
        MongoClient.connect(url, function(err, db) {
            var collec = db.collection('user');
            console.log(loger);
            collec.updateOne({name: loger}, {$set:{: value}});
        });
    }
}

var updateUser = function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:27017/matcha";
    var loger = req.session['login'];
    var sexe = req.body.sexe;
    var orient = req.body.orient;
    var bio = req.body.bio;
    var interet = req.body.interet;

//    if (bio != '' || interet != '' || sexe != '' || orient != '' || loger != undefined) {
    if (bio != '') {
        updater(loger, 'bio', bio);
    }
    else if (sexe != '') {
        updater(loger, 'sexe', sexe);
    }
    else if (orient != '') {
        updater(loger, 'orient', orient);
    }
    else if (orient != '') {
        updater(loger, 'interet', interet);
    
        // MongoClient.connect(url, function(err, db) {
            // db.collection('user').updateOne({name: req.session['login']}, { $set:{sexe: sexe, orient: orient, bio: bio, interet: interet}});
        // });
        // req.flash('mess', 'User update success');
        console.log('User: ' + loger + ' profile update');
    } else {
        req.flash('error', 'Un ou Plusieurs champ(s) vide');
    }
}

exports.updateUser = updateUser;
exports.logUser = logUser;
exports.addUser = addUser;
exports.delog = deLog;