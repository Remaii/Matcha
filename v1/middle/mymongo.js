var crypto = require('crypto');
var cookie = require('cookie');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:28000/matcha";
var utilities = require('./utility')

var upMyLoca = function(req, res, callback) {
    if (req.session['myinfo'][7] != req.body.city) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').updateOne({login: req.session['login']}, { $set:{geoname: req.body.geoname, city: req.body.city}});
            db.close();
            callback(null, req.body.city);
        });
    }
}

var checkImageUser = function(login, callback) {
    MongoClient.connect(url, function(err, db) {
        db.collection('image').find({login: login}).toArray(function(err, docs) {
            if (err) callback(null, null);
            if (docs.length == 0) {
                callback(docs, null);
            } else {
                callback(null, docs);
            }
        });
    });
}

var downMyImage = function(req, res) {
    var toSkip = req.body.path;
    var log = req.session['login'];
    var toadd = {};
    checkImageUser(log, function(vide, plein) {
        if (plein) {
            var decal = 0;
            for (var i = 0; plein[0]['image'][i] && i < 5; i++) {
                if (plein[0]['image'][i] != toSkip) {
                    toadd[i - decal] = plein[0]['image'][i];
                } else {
                    decal++;
                }
            }
            MongoClient.connect(url, function(err, db) {
                var newImageR = {
                    login: log,
                    image:toadd
                };
                db.collection('image').findOneAndReplace({login: log}, newImageR,function (err, result) {
                    console.log('User ' + log + ' MaJ Down Image success');
                });
                db.close();
            });
        }
    });
}

var upImage = function(value, log) {
    var toadd = {};
    
    checkImageUser(log, function(vide, plein) {
        if (vide) {
            MongoClient.connect(url, function(err, db) {
                var newImage = {
                    login: log,
                    image:{0: value}
                };
                db.collection('image').insertOne(newImage, function (err, result) {
                    console.log('User ' + log + ' Add Image success');
                });
                db.close();
            });
        }
        if (plein) {
            for (var i = 0; plein[0]['image'][i] && i < 5; i++) {
                toadd[i] = plein[0]['image'][i];
            }
            toadd[i] = value;
            MongoClient.connect(url, function(err, db) {
                var newImageR = {
                    login: log,
                    image:toadd
                };
                db.collection('image').findOneAndReplace({login: log}, newImageR,function (err, result) {
                    console.log('User ' + log + ' MaJ Up Image success');
                });
                db.close();
            });
        }
    });
}

function insertThis(tab, where) {
    MongoClient.connect(url, function(err, db) {
        db.collection(where).updateOne({}, tab, function(err, result) {
            if (err) return console.log('insertThis: ' + err);
            if (result.result.ok) return console.log("Les Tags on ete mis à jour");
        });
        db.close();
    });
}

function getThisProf(req, res, call) {
    var arr = {};
    var log = req.session['login'];

    if (log != '' || log != undefined) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({login: log}).toArray(function(err, doc) {
                if (err) {
                    call(err, arr);
                }
                arr[0] = doc[0]['firstname'];
                arr[1] = doc[0]['lastname'];
                arr[2] = doc[0]['age'];
                arr[3] = doc[0]['sexe'];
                arr[4] = doc[0]['orient'];
                arr[5] = doc[0]['bio'];
                arr[6] = doc[0]['mail'];
                arr[7] = doc[0]['city'];
                arr[8] = doc[0]['geoname'];
                arr[9] = doc[0]['avatar'];
                call(null, arr);
            });
            db.close();
        });
    }
}

function getMyInfo(req, res, call) {
    var arr = {};
    var log = req.session['login'];

    if (log != '' || log != undefined) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({login: log}).toArray(function(err, doc) {
                arr[0] = doc[0]['firstname'];
                arr[1] = doc[0]['lastname'];
                arr[2] = doc[0]['age'];
                arr[3] = doc[0]['sexe'];
                arr[4] = doc[0]['orient'];
                arr[5] = doc[0]['bio'];
                arr[6] = doc[0]['mail'];
                arr[7] = doc[0]['city'];
                arr[8] = doc[0]['geoname'];
                arr[9] = doc[0]['avatar'];
                call(arr);
            });
            db.close();
        });
    }
}

function getMyImage(req, res, call) {
    var log = req.session['login'];

    if (log != '' || log != undefined) {
        MongoClient.connect(url, function(err, db) {
            db.collection('image').find({login: log}).toArray(function(err, doc) {
                if (doc.length != 0) {
                    call(doc[0]['image']);
                } else {
                    call({0:' '});
                }
            });
            db.close();
        });
    }
}

function getMyTag(req, res, call) {
    var mytag = {};
    var arr = {};
    var log = req.session['login'];

    if (log != '' || log != undefined) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({login: log}).toArray(function(err, doc) {
                mytag = doc[0]['tag'];
                call(mytag);
            });
            db.close();
        });
    }
}

var getAllProf = function (name, callback) {
    var result = {};
    var tmp = {};

    MongoClient.connect(url, function(err, db) {
        db.collection('user').find().toArray(function(err, docs) {
            for (var i = 0; docs[i]; i++){
                tmp[0] = docs[i]['firstname'];
                tmp[1] = docs[i]['lastname'];
                tmp[2] = docs[i]['age'];
                tmp[3] = docs[i]['sexe'];
                tmp[4] = docs[i]['orient'];
                tmp[5] = docs[i]['tag'];
                tmp[6] = docs[i]['login'];
                tmp[7] = docs[i]['avatar'];
                result[i] = tmp;
                tmp = {};
            }
            callback(result);
        });
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
    var logre = req.body.login;
    var passwd = req.body.pwd;
    var cfpwd = req.body.cfpwd;
    var mail = req.body.mail;

    if (logre != '' && passwd != '' && cfpwd != '' && mail != '') {
        if (utilities.checkerPwd(passwd) == 1) {
            passwd = crypto.createHmac('whirlpool', passwd).digest('hex');
            cfpwd = crypto.createHmac('whirlpool', cfpwd).digest('hex');
            if (passwd === cfpwd) {
            	MongoClient.connect(url, function (err, db) {
            		if (err) {
                        req.flash('error', 'Connection to DataBase Failed');
                        res.redirect('login');
                    }
            		var newUser = {login: logre, firstname: logre, pwd: passwd, mail: mail, created: new Date()};
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
                    collec.updateOne({login: log}, { $set:{last_co: new Date()}});
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
    var loger = req.session['login'];
    var firstname = req.body.firstname;
    var lastname = req.body.lastname;
    var age = req.body.age;
    var sexe = req.body.sexe;
    var orient = req.body.orient;
    var mail = req.body.mail;
    var bio = req.body.bio;
    

    if (mail != '' && age != '' && lastname != '' && firstname != '' && bio != '' && sexe != '' && orient != '' && loger != undefined) {
        if (utilities.checkerBio(bio, '500') == 1) {
            MongoClient.connect(url, function(err, db) {
                db.collection('user').updateOne({login: loger}, { $set:{mail: mail, firstname: firstname, lastname: lastname, age: age, bio: bio, sexe: sexe, orient: orient}});
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

var setAvatar = function(req, res) {
    if (req.session['login'] != undefined) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').updateOne({login: req.session['login']}, { $set:{avatar: req.body.path}});
            db.close();
            console.log(req.session['login'] + ' à mis a jour son avatar');
        });
    } else {
        console.log('un utilisateur inconnue a essayer de mettre a jour son avatar');
    }
}

var addInterest = function(req, res) {
    var toadd = req.body.interet.toUpperCase();

    if (toadd == '' || toadd == undefined) {
        req.flash('error', 'Tu n\'a rien mis :(');
        res.redirect('info');
    } else if (utilities.checkerBio(toadd, 20) && utilities.checkerTag(toadd)) {
        MongoClient.connect(url, function(err, db) {
        //    if (err) return console.log(err);
            var tab = {};
            var ok = 0;
            db.collection('interet').find().toArray(function(err, doc) {
                if (doc[0] == undefined) {
                    tab[0] = toadd;
                    insertThis(tab, 'interet');
                    ok = -2;
                }
                if (ok != -2) {
                    for (var i = 0; doc[0][i]; i++) {
                        if (doc[0][i] == toadd) {
                            ok = -1;
                        }
                        if (ok != -1)
                            ok++;
                        tab[i] = doc[0][i];
                    }
                }
                if (ok > 0 && ok != -2) {
                    tab[i] = toadd;
                    req.flash('mess', 'Tag ajouté avec success');
                    insertThis(tab, 'interet');
                }
                else if (ok == -1) {
                    req.flash('error', 'Ce Tag existe déjà');
                }
                db.close();
                res.redirect('info');
            });
        });
    } else {
        req.flash('error', 'Il y a un espace ou plus de 20 caractères');
        res.redirect('info');
    }
}

var getInterest = function(req, res, call) {
    var tag = {};

    MongoClient.connect(url, function(err, db) {
        db.collection('interet').find().toArray(function(err, docs){
            if (docs.length > 0) {
                for (var i = 0; docs[0][i]; i++){
                    tag[i] = docs[0][i];
                }
                call(null, tag);
            } else {
                call("no interest in db", null);
            }            
        });
        db.close();
    });
}

function alreadySet(tab, value) {
    for (var i = 0; tab[i]; i++) {
        if (tab[i] == value)
            return 1;
        if (i == tab.length) {
            return 0;
        }
    }
}

function removeDouble(toadd, call) {
    var tmp = {};
    var nb = 0;

    for (var a = 0; toadd[a]; a++) {
        if (!alreadySet(tmp, toadd[a])) {
            tmp[nb] = toadd[a];
            nb++;
        }
    }
    call(tmp);
}

var upMyTag = function(req, res) {
    var interet = req.body.select;
    var log = req.session['login'];
    var toadd = {};
    var decal = 0;
    var ok = 0;

    if ((interet != '' || interet != null || interet != undefined) && (log != undefined || log != '')) {
        if (Array.isArray(interet)) {
            for (var i = 0; interet[i]; i++) {
                toadd[i] = interet[i];
                if (!interet[i + 1] && (req.session['mytag'] != undefined || req.session['mytag'] != '') && req.session['mytag']) {
                    for (var u = 0; req.session['mytag'][u];u++) {
                        if (req.session['mytag'][u] != ' ') {
                            toadd[i + u + 1 + decal] = req.session['mytag'][u];
                        } else {
                            decal++;
                        }
                        if (!req.session['mytag'][u + 1]) {
                            ok = 1;
                        }
                    }
                } else if (!interet[i + 1]) {
                    ok = 1;
                }
            }
        } else {
            if ((req.session['mytag'] != undefined || req.session['mytag'] != '') && req.session['mytag']) {
                if (req.session['mytag'][0] != ' ') {   
                    for (var u = 0; req.session['mytag'][u];u++) {
                        toadd[u] = req.session['mytag'][u];
                        if (!req.session['mytag'][u + 1]) {
                            toadd[u + 1] = interet;
                            ok = 1;
                        }
                    }
                } else if (req.session['mytag'][1] && req.session['mytag'][0] == ' ') {
                    for (var u = 1; req.session['mytag'][u];u++) {
                        toadd[u - 1] = req.session['mytag'][u];
                        if (!req.session['mytag'][u + 1]) {
                            toadd[u + 1] = interet;
                            ok = 1;
                        }
                    }
                }
            } else {
                if (interet != null) {
                    toadd[0] = interet;
                }
                ok = 1;
            }
        }
        if (ok == 1) {
            removeDouble(toadd, function(resultat) {
                MongoClient.connect(url, function(err, db) {
                    db.collection('user').updateOne({login: log}, { $set:{tag: resultat}});
                    db.close();
                });
                console.log(log + ' ajout tag: ' + interet);
                res.redirect('info');
            });
        }
    } else {
        res.redirect('info');
    }
}

var downMyTag = function(req, res) {
    var interet = req.body.select;
    var log = req.session['login'];
    var toadd = {};
    var nb = 0;
    var ok = 0;
    var count = 0;

    if ((log != undefined || log != '') && (req.session['mytag'] != undefined || req.session['mytag'] != '') && req.session['mytag']) {
        for (var i = 0; req.session['mytag'][i]; i++) {
            if (Array.isArray(interet)) {
                count = 0;
                for (var a = 0; interet[a]; a++) {
                    if (req.session['mytag'][i] == interet[a]) {
                        count = -100;
                    } else {
                        count++;
                    }
                }
                if (count > 0){
                    toadd[nb] = req.session['mytag'][i];
                    nb++;
                }
            } else {
                if (req.session['mytag'][i] != interet) {
                    toadd[nb] = req.session['mytag'][i];
                    nb++;
                }
            }
        }
		if (toadd[0] == undefined) {
            MongoClient.connect(url, function(err, db) {
                db.collection('user').updateOne({login: log}, { $unset:{tag: ' '}});
                db.close();
            });
            console.log(log + ' suppression tag: ' + interet + ' et n\'a plus de tag');
            res.redirect('info');
		} else {
            ok = 1;
        }
        if (ok == 1) {
            removeDouble(toadd, function(resultat) {
                MongoClient.connect(url, function(err, db) {
                    db.collection('user').updateOne({login: log}, { $set:{tag: resultat}});
                    db.close();
                });
                console.log(log + ' suppression tag: ' + interet);
                res.redirect('info');
            });
        }
    } else {
        res.redirect('info');
    }
}

exports.getMyImage = getMyImage;
exports.getMyTag = getMyTag;
exports.getMyInfo = getMyInfo;
exports.getAllProf = getAllProf;
exports.upMyTag = upMyTag;
exports.downMyTag = downMyTag;
exports.getInterest = getInterest;
exports.addInterest = addInterest;
exports.updateUser = updateUser;
exports.logUser = logUser;
exports.addUser = addUser;
exports.delog = deLog;
exports.upImage = upImage;
exports.downMyImage = downMyImage;
exports.upMyLoca = upMyLoca;
exports.getThisProf = getThisProf;
exports.setAvatar = setAvatar;