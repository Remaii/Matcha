var crypto = require('crypto');
var cookie = require('cookie');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:28000/matcha";
var utilities = require('./utility')

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
    if (!toadd[a]) {
        call(tmp);
    }
}

function makeTab(pastTab, pseudo, call) {
    if (pastTab != undefined) {
        for (var i = 0; pastTab[i]; i++) {}
        pastTab[i] = pseudo;
        removeDouble(pastTab, call);
    } else {
        var result = {}
        result[0] = pseudo;
        call(result);
    }
}

function downTab(pastTab, pseudo, call) {
    var result = {},
        nb = 0;

    if (pastTab) {
        for (var i = 0; pastTab[i]; i++) {
            if (pastTab[i] != pseudo) {
                result[nb] = pastTab[i];
                nb++;
            }
        }
        call(result);
    } else if (pastTab[0] == pseudo && !pastTab[1]) {
        call({ 0: '' });
    } else if (!pastTab) {
        call({0: ''});
    }
}

function notifyHim(to, message) {
    MongoClient.connect(url, function(err, db) {
        db.collection('user').find({login: to}).toArray(function(err, doc) {
            makeTab(doc[0]['notif'], message, function(result) {
                db.collection('user').updateOne({login: to}, {$set: {notif: result}});
                db.close();
            });
        });
    });
}

var readNotif = function(to, message) {
    MongoClient.connect(url, function(err, db) {
        db.collection('user').find({login: to}).toArray(function(err, doc) {
            downTab(doc[0]['notif'], message, function(result) {
                db.collection('user').updateOne({login: to}, {$set: {notif: result}});
                db.close();
            });
        });
    });
}

function verifyPseudo(pseudo, callback) {
    MongoClient.connect(url, function(err, db) {
        db.collection('user').find({ pseudo: pseudo }).toArray(function(err, doc) {
            if (doc[0] == undefined) {
                callback(null, pseudo);
            } else {
                callback(pseudo, null);
            }
        });
        db.close();
    });
}

var upMyLoca = function(req, res, callback) {
    if (req.session['myinfo'][8] != req.body.lo && req.session['myinfo'][11] != req.body.la) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').updateOne({ login: req.session['login'] }, { $set: { la: req.body.la, lo: req.body.lo } });
            db.close();
            callback(null, req.body.city);
        });
    }
}

var checkImageUser = function(login, callback) {
    MongoClient.connect(url, function(err, db) {
        db.collection('image').find({ login: login }).toArray(function(err, docs) {
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
                    image: toadd
                };
                db.collection('image').findOneAndReplace({ login: log }, newImageR, function(err, result) {
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
                    image: { 0: value }
                };
                db.collection('image').insertOne(newImage, function(err, result) {
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
                    image: toadd
                };
                db.collection('image').findOneAndReplace({ login: log }, newImageR, function(err, result) {
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
            db.close();
        });
    });
}

function getHerImage(req, res, call) {
    var login = req.session['herPro'][9];

    if (login != '' || login != undefined) {
        MongoClient.connect(url, function(err, db) {
            db.collection('image').find({ login: login }).toArray(function(err, doc) {
                if (doc.length != 0) {
                    call(doc[0]['image']);
                    db.close();
                } else {
                    call({ 0: ' ' });
                    db.close();
                }
            });
        });
    }
}

function getHerTag(req, res, call) {
    var pseudo = req.session['toget'];

    if (pseudo != '' || pseudo != undefined) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({ login: pseudo }).toArray(function(err, doc) {
                call(doc[0]['tag']);
                db.close();
            });
        });
    }
}

function upHisVisit(pseudo, visiteur) {
    if (pseudo != visiteur) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({ login: pseudo }).toArray(function(err, doc) {
                notifyHim(pseudo, 'Visited by ' + visiteur);
                makeTab(doc[0]['visit'], visiteur, function(result) {
                    MongoClient.connect(url, function(err, db1) {
                        db1.collection('user').updateOne({ login: pseudo }, { $set: { visit: result } });
                        db1.close();
                        db.close();
                        utilities.makePopu(pseudo);
                    });
                });
            });
        });
    }
}

function getHerInfo(req, res, call) {
    var arr = {};
    var pseudo = req.session['toget'];

    if (pseudo != '' || pseudo != undefined) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({ login: pseudo }).toArray(function(err, doc) {
                if (err) {
                    call(err, null);
                }
                if (doc[0] != undefined) {
                    upHisVisit(pseudo, req.session['login']);
                    arr[0] = doc[0]['firstname'];
                    arr[1] = doc[0]['lastname'];
                    arr[2] = doc[0]['age'];
                    arr[3] = doc[0]['sexe'];
                    arr[4] = doc[0]['orient'];
                    arr[5] = doc[0]['bio'];
                    // arr[6] = doc[0]['city'];
                    arr[7] = doc[0]['login'];
                    arr[8] = doc[0]['avatar'];
                    arr[9] = doc[0]['login'];
                    arr[10] = doc[0]['pseudo'];
                    call(null, arr);
                } else {
                    call(doc, null);
                }
            });
            db.close();
        });
    }
}

var getPopu = function(login, call) {
    MongoClient.connect(url, function(err, db) {
        db.collection('user').find({ login: login }).toArray(function(err, doc) {
            if (doc.length > 0) {
                call(doc[0]['popu']);
                db.close();
            } else {
                call({ 0: '0' });
                db.close();
            }
        });
    });
}

function getMyInfo(req, res, call) {
    var arr = {};
    var log = req.session['login'];

    if (log != '' || log != undefined) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({ login: log }).toArray(function(err, doc) {
                if (doc[0]) {
                    arr[0] = doc[0]['firstname'];
                    arr[1] = doc[0]['lastname'];
                    arr[2] = doc[0]['age'];
                    arr[3] = doc[0]['sexe'];
                    arr[4] = doc[0]['orient'];
                    arr[5] = doc[0]['bio'];
                    arr[6] = doc[0]['mail'];
                    // arr[7] = doc[0]['city'];
                    arr[8] = doc[0]['lo'];
                    arr[9] = doc[0]['avatar'];
                    arr[10] = doc[0]['pseudo'];
                    arr[11] = doc[0]['la'];
                    arr[12] = doc[0]['login'];
                    call(arr);
                    db.close();
                }
            });

        });
    }
}

function getMyVisit(req, res, call) {
    var log = req.session['login'];

    if (log != '' || log != undefined) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({ login: log }).toArray(function(err, doc) {
                if (doc.length > 0) {
                    call(doc[0]['visit']);
                    db.close();
                } else {
                    call({ 0: '' });
                    db.close();
                }
            });
        });
    }
}

function getMyBlock(req, res, call) {
    var log = req.session['login'];

    if (log != '' || log != undefined) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({ login: log }).toArray(function(err, doc) {
                if (doc.length > 0) {
                    call(doc[0]['block']);
                    db.close();
                } else {
                    call({ 0: ' ' });
                    db.close();
                }
            });
        });
    }
}

function getMyFalse(req, res, call) {
    var log = req.session['login'];

    if (log != '' || log != undefined) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({ login: log }).toArray(function(err, doc) {
                if (doc.length > 0) {
                    call(doc[0]['falseUser']);
                    db.close();
                } else {
                    call({ 0: '' });
                    db.close();
                }
            });
        });
    }
}

function getMyLiker(req, res, call) {
    var log = req.session['login'];

    if (log != '' || log != undefined) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({ login: log }).toArray(function(err, doc) {
                if (doc.length > 0) {
                    call(doc[0]['heLikeMe']);
                    db.close();
                } else {
                    call({ 0: '' });
                    db.close();
                }
            });
        });
    }
}

function getMyLike(req, res, call) {
    var log = req.session['login'];

    if (log != '' || log != undefined) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({ login: log }).toArray(function(err, doc) {
                if (doc.length > 0) {
                    call(doc[0]['like']);
                    db.close();
                } else {
                    call({ 0: '' });
                    db.close();
                }
            });
        });
    }
}

function getMyImage(req, res, call) {
    var log = req.session['login'];

    if (log != '' || log != undefined) {
        MongoClient.connect(url, function(err, db) {
            db.collection('image').find({ login: log }).toArray(function(err, doc) {
                if (doc.length != 0) {
                    call(doc[0]['image']);
                    db.close();
                } else {
                    call({ 0: '' });
                    db.close();
                }
            });
        });
    }
}

function getMyTag(req, res, call) {
    var mytag = {};
    var arr = {};
    var log = req.session['login'];

    if (log != '' || log != undefined) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({ login: log }).toArray(function(err, doc) {
                if (doc.length != 0) {
                    call(doc[0]['tag']);
                    db.close();
                } else {
                    call({ 0: '' });
                    db.close();
                }
            });
        });
    }
}

var getAllProf = function(callback) {
    var tmp = {};
    var result = {};
    var nb = 0;

    MongoClient.connect(url, function(err, db) {
        db.collection('user').find().toArray(function(err, docs) {
            if (err) callback(err, null);
            for (var i = docs.length - 1; i >= 0; i--) {
                tmp[0] = docs[i]['avatar'];
                tmp[1] = docs[i]['pseudo'];
                tmp[2] = docs[i]['sexe'];
                tmp[3] = docs[i]['orient'];
                tmp[4] = docs[i]['la'];
                tmp[5] = docs[i]['lo'];
                tmp[6] = docs[i]['age'];
                tmp[7] = docs[i]['tag'];
                tmp[8] = docs[i]['login'];
                result[nb] = tmp;
                tmp = {};
                nb++;
            }
            if (i == -1) {
                callback(null, result);
                db.close();
            }
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
                MongoClient.connect(url, function(err, db) {
                    if (err) {
                        req.flash('error', 'Connection to DataBase Failed');
                        res.redirect('login');
                    }
                    var newUser = {
                        login: logre,
                        pseudo: logre,
                        pwd: passwd,
                        mail: mail,
                        heLikeMe: {},
                        like: {},
                        block: {},
                        falseUser: {},
                        orient: 'Bi',
                        avatar: 'avatar.png',
                        created: new Date()
                    };
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
                            db.collection('user').insertOne(newUser, function(err, result) {
                                if (result.result['ok']) {
                                    utilities.senderMail(mail, "User");
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
            } else {
                req.flash('error', 'Les mots de passes ne sont pas identiques');
                res.redirect('register');
            }
        } else {
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
var logUser = function(req, res, callback) {
    var i = 0;
    var ok = 0;
    var log = req.body.login;
    var pwd = req.body.pwd;

    if (log != '' && pwd != '') {
        pwd = crypto.createHmac('whirlpool', pwd).digest('hex');
        MongoClient.connect(url, function(err, db) {
            var collec = db.collection('user');
            if (err) {
                callback({ err: 'Connection to DataBase Failed' }, null, null, 'login');
                req.flash('error', 'Connection to DataBase Failed');
            }
            collec.find({}).toArray(function(err, docs) {
                while (docs[i]) {
                    if (docs[i]['login'] === log && docs[i]['pwd'] === pwd) {
                        console.log('User: ' + log + ' is Connected');
                        ok = 1;
                    }
                    i++;
                }
                if (ok == 1) {
                    collec.updateOne({ login: log }, { $set: { last_co: new Date() } });
                    db.close();
                    callback(null, { mess: 'Connection Success' }, log, '/');
                } else {
                    req.flash('error', 'Utilisateur/Mot de passe invalides');
                    db.close();
                    callback('Utilisateur/Mot de passe incorrects', null, null, 'login');
                }
            });
        });
    } else {
        req.flash('error', 'Un ou Plusieurs champ(s) vide');
        callback('Un ou Plusieurs champ(s) vide', null, null, 'login');
    }
};

var updateUser = function(req, res) {
    var loger = req.session['login'],
        firstname = req.body.firstname,
        lastname = req.body.lastname,
        age = req.body.age,
        sexe = req.body.sexe,
        orient = req.body.orient,
        mail = req.body.mail,
        bio = req.body.bio,
        pseudo = req.body.pseudo,
        avatar = req.body.avatar;

    if (loger != undefined) {
        if (pseudo != '' && pseudo != req.session['myinfo'][10]) {
            verifyPseudo(pseudo, function(err, result) {
                if (err) console.log(err + ' éxiste déjà!');
                if (result) {
                    MongoClient.connect(url, function(err, db) {
                        db.collection('user').updateOne({ login: loger }, { $set: { pseudo: result } });
                        db.close();
                        console.log(loger + ' a mis a jour son Pseudo');
                    });
                }
            });
        }
        if (mail != undefined && mail != req.session['myinfo'][6]) {
            MongoClient.connect(url, function(err, db) {
                db.collection('user').updateOne({ login: loger }, { $set: { mail: mail } });
                db.close();
                console.log(loger + ' a mis à jour son Mail');
            });
        }
        if (age != undefined && age != req.session['myinfo'][2]) {
            MongoClient.connect(url, function(err, db) {
                db.collection('user').updateOne({ login: loger }, { $set: { age: age } });
                db.close();
                console.log(loger + ' a mis à jour son Âge');
            });
        }
        if (lastname != undefined && lastname != req.session['myinfo'][1]) {
            MongoClient.connect(url, function(err, db) {
                db.collection('user').updateOne({ login: loger }, { $set: { lastname: lastname } });
                db.close();
                console.log(loger + ' a mis à jour son Nom');
            });
        }
        if (firstname != undefined && firstname != req.session['myinfo'][0]) {
            MongoClient.connect(url, function(err, db) {
                db.collection('user').updateOne({ login: loger }, { $set: { firstname: firstname } });
                db.close();
                console.log(loger + ' a mis à jour son Prénom');
            });
        }
        if (bio != undefined && bio != req.session['myinfo'][5]) {
            if (utilities.checkerBio(bio, '500') == 1) {
                MongoClient.connect(url, function(err, db) {
                    db.collection('user').updateOne({ login: loger }, { $set: { bio: bio } });
                    db.close();
                    console.log(loger + ' a mis à jour sa Bio');
                });
            }
        }
        if (sexe != req.session['myinfo'][3] || (req.session['myinfo'][3] == null && avatar != req.session['myinfo'][9])) {
            utilities.defineAvatar(sexe, avatar, function(s, a) {
                MongoClient.connect(url, function(err, db) {
                    db.collection('user').updateOne({ login: loger }, { $set: { sexe: s, avatar: a } });
                    db.close();
                });
                console.log(loger + ' mis à jour son Sexe');
            });
        }
        if (orient != undefined && orient != req.session['myinfo'][4]) {
            MongoClient.connect(url, function(err, db) {
                db.collection('user').updateOne({ login: loger }, { $set: { orient: orient } });
                db.close();
                console.log(loger + ' mise à jour sa Sexualité');
            });
        }
        utilities.makePopu(loger);
        res.redirect('info');
    }
}

var setAvatar = function(req, res) {
    utilities.defineAvatar(req.session['myinfo'][3], req.body.path, function(s, a) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').updateOne({ login: req.session['login'] }, { $set: { avatar: a } });
            db.close();
            console.log(req.session['login'] + ' à mis a jour son avatar');
        });
    });
}

var addInterest = function(req, res) {
    var toadd = req.body.interet.toUpperCase();

    if (toadd == '' || toadd == undefined) {
        req.flash('error', 'Tu n\'a rien mis :(');
        res.redirect('info');
    } else if (utilities.checkerBio(toadd, 20) && utilities.checkerTag(toadd)) {
        makeTab(req.session['interet'], toadd, function(result) {
            MongoClient.connect(url, function(err, db) {
                db.collection('interet').updateOne({ name: "Tags" }, { $set: { 0: result } });
                db.close();
                req.flash('mess', 'Tag ajouté !')
                res.redirect('info');
            });
        });
    } else {
        req.flash('error', 'Il y a un espace ou plus de 20 caractères');
        res.redirect('info');
    }
}

var getInterest = function(req, res, call) {
    MongoClient.connect(url, function(err, db) {
        db.collection('interet').find().toArray(function(err, docs) {
            if (docs[0])
                call(docs[0][0]);
            else
                call({0:''});
        });
        db.close();
    });
}

function upMyTag(req, res) {
    var interet = req.body.select;

    if (Array.isArray(interet)) {
        for (var i = 0; i < interet.length; i++) {
            makeTab(req.session['mytag'], interet[i], function(result) {
                req.session['mytag'] = result;
            });
        }
        if (i == interet.length) {
            MongoClient.connect(url, function(err, db) {
                db.collection('user').updateOne({ login: req.session['login'] }, { $set: { tag: req.session['mytag'] } });
                db.close();
            });
            res.redirect('info');
        }
    } else {
        makeTab(req.session['mytag'], interet, function(result) {
            req.session['mytag'] = result;
            MongoClient.connect(url, function(err, db) {
                db.collection('user').updateOne({ login: req.session['login'] }, { $set: { tag: req.session['mytag'] } });
                db.close();
            });
        });
        res.redirect('info');
    }
}

function downMyTag(req, res) {
    var interet = req.body.select;

    if (Array.isArray(interet)) {
        for (var i = 0; i < interet.length; i++) {
            downTab(req.session['mytag'], interet[i], function(result) {
                req.session['mytag'] = result;
            });
        }
        if (i == interet.length) {
            MongoClient.connect(url, function(err, db) {
                db.collection('user').updateOne({ login: req.session['login'] }, { $set: { tag: req.session['mytag'] } });
                db.close();
            });
            res.redirect('info');
        }
    } else {
        downTab(req.session['mytag'], interet, function(result) {
            req.session['mytag'] = result;
            MongoClient.connect(url, function(err, db) {
                db.collection('user').updateOne({ login: req.session['login'] }, { $set: { tag: req.session['mytag'] } });
                db.close();
            });
        });
        res.redirect('info');
    }
}

function getHisLike(login, call) {
    MongoClient.connect(url, function(err, db) {
        db.collection('user').find({ login: login }).toArray(function(err, doc) {
            call(doc[0]['like']);
        });
        db.close();
    });
}

function upHisMatch(sens, login, me) {
    if (sens == true) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({ login: login }).toArray(function(err, doc) {
                makeTab(doc[0]['tchat'], me, function(result) {
                    MongoClient.connect(url, function(err, db) {
                        db.collection('user').updateOne({ login: login }, { $set: { tchat: result } });
                        db.close();
                        notifyHim(login, 'Match with ' + me);
                    });
                });
            });
        });
    } else {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({ login: login }).toArray(function(err, doc) {
                downTab(doc[0]['tchat'], me, function(result) {
                    MongoClient.connect(url, function(err, db) {
                        db.collection('user').updateOne({ login: login }, { $set: { tchat: result } });
                        db.close();
                    });
                });
            });
        });
    }
}

function checkConnect(loginA, loginB) {
    var logA = undefined,
        ok = 0,
        logB = undefined;

    function checkMatch(logA, logB) {
        if (logA && logB) {
            for (var a = 0; logA[a]; a++) {
                if (logA[a] == loginB) {
                    for (var b = 0; logB[b]; b++) {
                        if (logB[b] == loginA) {
                            ok = 1;
                            upHisMatch(true, loginA, loginB);
                            upHisMatch(true, loginB, loginA);
                        }
                    }
                }
            }
            if (!logA[a] && !logB[b] && ok != 1) {
                upHisMatch(false, loginA, loginB);
                upHisMatch(false, loginB, loginA);
            }
        }
    }
    getHisLike(loginA, function(tab) {
        logA = tab;
        checkMatch(logA, logB);
    });
    getHisLike(loginB, function(tab) {
        logB = tab;
        checkMatch(logA, logB);
    });
}

function upHisLike(sens, login, me) {
    if (sens == true) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({ login: login }).toArray(function(err, doc) {
                makeTab(doc[0]['heLikeMe'], me, function(result) {
                    MongoClient.connect(url, function(err, db) {
                        db.collection('user').updateOne({ login: login }, { $set: { heLikeMe: result } });
                        db.close();
                        utilities.makePopu(login);
                        notifyHim(login, 'Like by ' + me);
                    });
                });
            });
        });
    } else {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({ login: login }).toArray(function(err, doc) {
                downTab(doc[0]['heLikeMe'], me, function(result) {
                    MongoClient.connect(url, function(err, db) {
                        db.collection('user').updateOne({ login: login }, { $set: { heLikeMe: result } });
                        db.close();
                        utilities.makePopu(login);
                        notifyHim(login, 'Dislike by ' + me);
                    });
                });
            });
        });
    }
}

var likeUser = function(req, res, callback) {
    var login = req.session['login'];

    if (req.body.pseudo != login) {
        upHisLike(true, req.body.pseudo, login);
        utilities.makePopu(login);
    }
    makeTab(req.session['myLike'], req.body.pseudo, function(result) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').updateOne({ login: login }, { $set: { like: result } });
            db.close();
            checkConnect(login, req.body.pseudo);
            callback(null, { mess: 'Like Success' });
        });
    });
}

var disLikeUser = function(req, res, callback) {
    var login = req.session['login'];

    if (req.body.pseudo != login) {
        upHisLike(false, req.body.pseudo, login);
        utilities.makePopu(login);
        downTab(req.session['myLike'], req.body.pseudo, function(result) {
            MongoClient.connect(url, function(err, db) {
                db.collection('user').updateOne({ login: login }, { $set: { like: result } });
                db.close();
                callback(null, { mess: 'Dislike Success' });
            });
        });
    }
}

var blockUser = function(req, res, callback) {
    var login = req.session['login'];

    if (req.body.pseudo != login) {
        makeTab(req.session['myBlock'], req.body.pseudo, function(result) {
            MongoClient.connect(url, function(err, db) {
                db.collection('user').updateOne({ login: login }, { $set: { block: result } });
                db.close();
                utilities.makePopu(login);
                callback(null, { mess: 'Block Success' });
            });
        });
    }
}

var deBlockUser = function(req, res, callback) {
    var login = req.session['login'];

    if (req.body.pseudo != login) {
        downTab(req.session['myBlock'], req.body.pseudo, function(result) {
            MongoClient.connect(url, function(err, db) {
                db.collection('user').updateOne({ login: login }, { $set: { block: result } });
                db.close();
                utilities.makePopu(login);
                callback(null, { mess: 'Deblock Success' });
            });
        });
    }
}

function upHerFalse(login) {
    MongoClient.connect(url, function(err, db) {
        db.collection('user').find({ login: login }).toArray(function(err, doc) {
            if (doc[0]['iFalse'] < 5) {
                var iFalse = (Number.parseInt(doc[0]['iFalse']) + 1);
                db.collection('user').updateOne({ login: login }, { $set: { iFalse: iFalse } });
                utilities.makePopu(login);
                notifyHim(login, 'You False! ' + iFalse);
                db.close();
            } else if (doc[0]['iFalse'] >= 5) {
                db.collection('user').removeOne({ login: login }, { justOne: true });
            } else {
                db.collection('user').updateOne({ login: login }, { $set: { iFalse: '1' } });
                utilities.makePopu(login);
                notifyHim(login, 'You False! 1');
                db.close();
            }
        });
    });
}

var falseUser = function(req, res, callback) {
    var login = req.session['login'];

    if (req.body.pseudo != login) {
        makeTab(req.session['myFalse'], req.body.pseudo, function(result) {
            MongoClient.connect(url, function(err, db) {
                db.collection('user').updateOne({ login: login }, { $set: { falseUser: result } });
                db.close();
                upHerFalse(req.body.pseudo);
                callback(null, { mess: 'False User Success' });
            });
        });
    }
}

var getMyNotif = function(name, callback) {
    MongoClient.connect(url, function(err, db) {
        db.collection('user').find({ login: name }).toArray(function(err, doc) {
            if (err) callback(null);
            if (doc[0]['notif'] || doc[0]['tchat']) {
                callback({ notif: doc[0]['notif'], tchat: doc[0]['tchat'] });
                db.close();
            } else {
                callback(null);
                db.close();
            }
        });
    });
}

var getMsg = function(me, wth, callback) {
    var result = {};
    MongoClient.connect(url, function(err, db) {
        db.collection('tchat').find({ convers: { $all: [me, wth] } }).toArray(function(err, doc) {
            if (doc) {
                for (var i = 0; i < doc.length; i++) {
                    result[i] = { off: doc[i]['exp'], content: doc[i]['msg'] };
                }
                if (i == doc.length) {
                    callback(result);
                }
            } else {
                callback({ 0: ' ' });
            }
        });
    });
}

var postMsg = function(to, off, msg, notif) {
    if (msg != '') {
        var tchat = {
            convers: [off, to],
            exp: off,
            msg: msg
        };
        if (notif) {
            notifyHim(to, 'Message of ' + off);
        }
        MongoClient.connect(url, function(err, db) {
            db.collection('tchat').insertOne(tchat, function(err, result) {
                db.close();
            });
        });
    }
}

var getMyheLike = function(login, callback) {
    MongoClient.connect(url, function(err, db) {
        db.collection('user').find({ login: login }).toArray(function(err, doc) {
            if (doc[0]['heLikeMe'] != {}) {
                callback(doc[0]['heLikeMe']);
            } else {
                callback(null);
            }
        });
    });
}

// récupère tout les pseudos et avatars des membres du site /==>/ tout les pseudo/avatar "interessant" avec utilities.intelTri(); 
exports.getAllProf = getAllProf;

// récupère les informations, les images, les tags, les likes, de l'utilisateur connecté.
exports.getMyImage = getMyImage;
exports.getMyTag = getMyTag;
exports.getMyInfo = getMyInfo;
exports.getMyLike = getMyLike;
exports.getMyLiker = getMyLiker;
exports.getMyheLike = getMyheLike;
exports.getMyFalse = getMyFalse;
exports.getMyBlock = getMyBlock;
exports.getMyVisit = getMyVisit;
exports.getPopu = getPopu;
exports.getMyNotif = getMyNotif;
exports.getMsg = getMsg;

// fonctionnalitées utilisateurs, MaJ des tags, Ajout de tags a la BdD, MaJ image + avatar 
exports.upMyTag = upMyTag;
exports.downMyTag = downMyTag;
exports.addInterest = addInterest;
exports.updateUser = updateUser;
exports.upImage = upImage;
exports.downMyImage = downMyImage;
exports.setAvatar = setAvatar;
exports.readNotif = readNotif;

// fonctionnalitées utilisateurs sur les autres utilisateurs, like/dislike, bloque/débloque, déclarer faux
exports.likeUser = likeUser;
exports.disLikeUser = disLikeUser;
exports.blockUser = blockUser;
exports.deBlockUser = deBlockUser;
exports.falseUser = falseUser;
exports.postMsg = postMsg;
exports.alreadySet = alreadySet;

// fonctionnalitées sites, login, logout, register, localisation, recuperer une listes des tags présents en BdD
exports.getInterest = getInterest;
exports.logUser = logUser;
exports.addUser = addUser;
exports.delog = deLog;
exports.upMyLoca = upMyLoca;

// récupère les informations, les images, les tags, de l'utilisateur ciblé par /profile/:pseudo.
exports.getHerInfo = getHerInfo;
exports.getHerImage = getHerImage;
exports.getHerTag = getHerTag;
