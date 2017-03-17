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
    var logre = req.body.login1;
    var passwd = req.body.pwd1;
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
        }
        else {
            req.flash('error', 'Le mot de passe doit contenir au minimum 1 Majuscules, 1 chiffre et faire 5 caracteres minimum');
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

var updateUser = function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:28000/matcha";
    var loger = req.session['login'];
    var sexe = req.body.sexe;
    var orient = req.body.orient;
    var bio = req.body.bio;
    var interet = req.body.interet;

    if (bio != '' && sexe != '' && interet != '' && orient != '' && loger != undefined) {
        if (checkerBio(bio, '500') == 1) {
            MongoClient.connect(url, function(err, db) {
                db.collection('user').updateOne({name: req.session['login']}, { $set:{bio: bio, sexe: sexe, interet: interet, orient: orient}});
            });
        }
        console.log('User: ' + loger + ' info update');
    }
    else {
        req.flash('error', 'Un ou Plusieurs champ(s) vide');
    }
}

var getProfile = function(req, res) {
    var MongoClient = require('mongodb').MongoClient;
    var url = "mongodb://localhost:28000/matcha";
    var j = 0;
    var arr = {}
    var tmp = {}

    MongoClient.connect(url, function(err, db) {
        db.collection('user').find().toArray(function(err, docs) {
            for (var i = 0; docs[i]; i++){
                tmp[0] = docs[i]['name'];
                tmp[1] = docs[i]['sexe'];
                tmp[2] = docs[i]['orient'];
                arr[i] = tmp;
                tmp = {};
            }
            req.body.profileTab = arr;
            //console.log(req.session.profileTab);
        });   
    });
}

exports.getProfile = getProfile;
exports.updateUser = updateUser;
exports.logUser = logUser;
exports.addUser = addUser;
exports.delog = deLog;