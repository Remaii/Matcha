var crypto = require('crypto');
var uniqid = require('uniqid')
var cookie = require('cookie');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://UserMatcha:MatchRthid3@localhost:28000/matcha";
var utilities = require('./utility');
var googleMap = require('@google/maps').createClient({
    key:'AIzaSyDz3z3IofGPR759kuGuFwaRA9KaNeRsm14'
});

// Callback d'un tableau, sans doublons
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

// Creer/Ajoute une valeur à un tableau
function makeTab(pastTab, cible, call) {
    if (pastTab != undefined) {
        for (var i = 0; pastTab[i]; i++) {}
        pastTab[i] = cible;
        removeDouble(pastTab, call);
    } else {
        var result = {}
        result[0] = cible;
        call(result);
    }
}

// Supprime une valeur d'un tableau
function downTab(pastTab, cible, call) {
    var result = {},
        nb = 0;

    if (pastTab) {
        for (var i = 0; pastTab[i]; i++) {
            if (pastTab[i] != cible) {
                result[nb] = pastTab[i];
                nb++;
            }
        }
        call(result);
    } else if (pastTab[0] == cible && !pastTab[1]) {
        call({ 0: '' });
    } else if (!pastTab[0]) {
        call({0: ''});
    }
}

// Ajoute une notification a un utilisateur
function notifyHim(to, message) {
    utilities.getLogin(to, function(rep) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({login: rep}).toArray(function(err, doc) {
                makeTab(doc[0]['notif'], message, function(result) {
                    db.collection('user').updateOne({login: rep}, {$set: {notif: result}});
                    db.close();
                });
            });
        });
    });
}

// Supprime une notification parmis la liste de notif de l'utilisateurs
var readNotif = function(to, message) {
    utilities.getLogin(to, function(rep) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({login: rep}).toArray(function(err, doc) {
                downTab(doc[0]['notif'], message, function(result) {
                    db.collection('user').updateOne({login: rep}, {$set: {notif: result}});
                    db.close();
                });
            });
        });
    });
}

// Verifie si le pseudo existe déjà ou non
function verifyPseudo(pseudo, callback) {
    MongoClient.connect(url, function(err, db) {
        db.collection('user').find({ pseudo: pseudo }).toArray(function(err, doc) {
            if (doc[0] == undefined) {
                callback(null, pseudo);
            } else {
                callback(pseudo, null);
            }
            db.close();
        });
    });
}

function returnCityLatLon(tochr, callback) {
    var cmpts = tochr['address_components'],
        data = {
            city: tochr['formatted_address'],
            lo: tochr['geometry'].location.lng,
            la: tochr['geometry'].location.lat
        };

    for (var i = 0; cmpts[i]; i++) {
        if (cmpts[i].types[0] == 'locality')
            data.city = cmpts[i]['long_name'];
    }
    if (!cmpts[i]) {
        callback(data);
    }
}

function getCityName(lo, la, callback) {
    googleMap.reverseGeocode({
        latlng: {
            lat: la,
            lng: lo
        }
    }, function(err, response) {
        if (!err) {
            callback(response.json);
        }
    });
}
// récupère les informations geographique de la ville passer en parametre
function getCity(city, callback) {
    googleMap.geocode({
        address: city
    }, function(err, response) {
        if (!err) {
            callback(response.json);
        }
    });
}

// Met à jour la position geographique de l'utilisateur
var upMyLoca = function(req, res) {
    console.log(req.body);
    if (req.session['myinfo'][8] != req.body.lo && req.session['myinfo'][11] != req.body.la && req.session['myinfo'][14]) {
        getCityName(req.body.lo, req.body.la, function(datas) {
                console.log('datas', datas);
            returnCityLatLon(datas.results[0], function(data) {
                console.log('data', data);
                MongoClient.connect(url, function(err, db) {
                    db.collection('user').updateOne({ login: req.session['login'] }, { $set: { la: data.la, lo: data.lo, city: data.city, position: true } });
                    db.close();
                });
            });
        })
    }
}

// Regarde si l'album photo de l'utilisateur existe ou pas
var checkImageUser = function(login, callback) {
    MongoClient.connect(url, function(err, db) {
        db.collection('image').find({ login: login }).toArray(function(err, docs) {
            if (err) callback(null, null);
            if (docs.length == 0) {
                callback(docs, null);
            } else {
                callback(null, docs);
            }
            db.close();
        });
    });
}

// Supprime une photo de l'utilisateur
var downMyImage = function(req, res) {
    var toSkip = req.body.path;
    var log = req.session['login'];
    var toadd = {};
    checkImageUser(log, function(vide, plein) {
        if (plein) {
            var decal = 0;
            for (var i = 0; plein[0]['image'][i] && i < 4; i++) {
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
                    db.close();
                });
            });
        }
    });
}

// Ajoute une photo à l'utilisateur // Si il y a deja 6 photos la derniere est remplacer
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
                    db.close();
                });
            });
        }
        if (plein) {
            for (var i = 0; plein[0]['image'][i] && i < 4; i++) {
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
                    db.close();
                });
            });
        }
    });
}

// Récupère les photo d'un autre utilisateur
function getHerImage(req, res, call) {
    var login = req.session['herPro'][9];

    if (login != '' || login != undefined) {
        MongoClient.connect(url, function(err, db) {
            db.collection('image').find({ login: login }).toArray(function(err, doc) {
                if (doc.length != 0) {
                    call(doc[0]['image']);
                } else {
                    call({ 0: ' ' });
                }
                db.close();
            });
        });
    }
}

// Récupère les #tags d'un autre utilisateur 
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

// Récupère les infos d'un autre utilisateur
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
                    upHisVisit(req.url.slice(1), req.session['myId']);
                    arr[0] = doc[0]['firstname'];
                    arr[1] = doc[0]['lastname'];
                    arr[2] = doc[0]['age'];
                    arr[3] = doc[0]['sexe'];
                    arr[4] = doc[0]['orient'];
                    arr[5] = doc[0]['bio'];
                    arr[7] = doc[0]['myId'];
                    arr[8] = doc[0]['avatar'];
                    arr[9] = doc[0]['login'];
                    arr[10] = doc[0]['pseudo'];
                    call(null, arr);
                } else {
                    call({err: 'Aucun membre trouvée'}, null);
                }
                db.close();
            });
        });
    }
}

// Met à jour les visites du profil cibler par "login"
function upHisVisit(login, visiteur) {
    if (login != visiteur) {
        utilities.getLogin(login, function(rep) {
            utilities.getLogin(visiteur, function(visi) {
                notifyHim(login, 'Visited by ' + visi);
                MongoClient.connect(url, function(err, db) {
                    db.collection('user').find({ login: rep }).toArray(function(err, doc) {
                        makeTab(doc[0]['visit'], visi, function(result) {
                            MongoClient.connect(url, function(err, db1) {
                                db1.collection('user').updateOne({ login: rep }, { $set: { visit: result } });
                                db1.close();
                                db.close();
                                utilities.makePopu(rep);
                            });
                        });
                    });
                });
            });
        });
    }
}

// Récupère la popularité de l'utilisateur
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

// Récupère les infos de l'utilisateur
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
                    arr[7] = doc[0]['tag'];
                    arr[8] = doc[0]['lo'];
                    arr[9] = doc[0]['avatar'];
                    arr[10] = doc[0]['pseudo'];
                    arr[11] = doc[0]['la'];
                    arr[12] = doc[0]['login'];
                    arr[13] = doc[0]['ray'];
                    arr[14] = doc[0]['position'];
                    arr[15] = doc[0]['city'];
                    arr[16] = doc[0]['myId'];
                    call(arr);
                    db.close();
                }
            });

        });
    }
}

// Récupère la liste des profil qui on visiter mon profil
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

// Récupère la liste des profil ayant bloquer l'utilisateur
function getHeBlock(req, res, call) {
    var log = req.session['login'];

    if (log != '' || log != undefined) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({ login: log }).toArray(function(err, doc) {
                if (doc.length > 0) {
                    call(doc[0]['heBlockMe']);
                    db.close();
                } else {
                    call({ 0: ' ' });
                    db.close();
                }
            });
        });
    }
}

// Récupère la liste des profil bloquer par l'utilisateur
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

// Récupère la liste des Match de l'utilisateur
function getMyMatch(req, res, call) {
    var log = req.session['login'];

    if (log != '' || log != undefined) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({ login: log }).toArray(function(err, doc) {
                if (doc.length > 0) {
                    call(doc[0]['tchat']);
                    db.close();
                } else {
                    call({ 0: '' });
                    db.close();
                }
            });
        });
    }
}

// Récupère la liste des profil declarer faux par l'utilisateur
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

// Récupère la liste des utilisateurs qui ont liké le profil de l'utilisateur
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

// Récupère la liste de logins, des profils liké par l'utilisateur
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

// Récupère les photo de l'utilisateur
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

// Récupère les tag de l'utilisateur
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

// Récupère toutes les info des utilisateurs, appliquer un trie de la liste
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
                tmp[8] = docs[i]['myId'];
                tmp[9] = docs[i]['popu'];
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

// Deloguer l'utilisateur
var deLog = function(req, res) {
    console.log(req.session['login'] + ' se delog');
    req.session['login'] = undefined;
    req.session['myId'] = undefined;
    res.redirect('/');
}

// Ajouter un utilisateur a la base mongo =>
// Si le nom d'utilisateur et/ou mail n'existe pas dans la base
var addUser = function(req, res, callback) {
    var logre = req.body.login,
        passwd = req.body.pwd,
        cfpwd = req.body.cfpwd,
        mail = req.body.mail,
        prenom = (req.body.firstname ? req.body.firstname : ''),
        nom = (req.body.lastname ? req.body.lastname : ''),
        sexe = req.body.sexe;

    if (logre != '' && passwd != '' && cfpwd != '' && mail != '' && sexe != '') {
        if (utilities.checkerPwd(passwd) == 1) {
            passwd = crypto.createHmac('whirlpool', passwd).digest('hex');
            cfpwd = crypto.createHmac('whirlpool', cfpwd).digest('hex');
            if (passwd === cfpwd) {
                MongoClient.connect(url, function(err, db) {
                    if (err) {
                        req.flash('error', 'Connection to DataBase Failed');
                        callback(0);
                    }
                    utilities.defineAvatar(sexe, "avatar.png", function(s, a) {
                        var newUser = {
                            login: logre,
                            myId: uniqid(),
                            pseudo: logre,
                            firstname: prenom,
                            lastname: nom,
                            sexe: s,
                            pwd: passwd,
                            mail: mail,
                            tchat: {},
                            tag: {},
                            notif: {},
                            heLikeMe: {},
                            heBlockMe: {},
                            like: {},
                            block: {},
                            position: true,
                            ray: 50,
                            falseUser: {},
                            popu: 1,
                            orient: 'Bi',
                            avatar: a,
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
                                req.session['myId'] = newUser['myId'];
                                req.flash('mess', 'Utilisateur ajouté avec succes');
                                db.collection('user').insertOne(newUser, function(err, result) {
                                    if (result.result['ok']) {
                                        utilities.senderMail(mail, "User");
                                        console.log('User ' + logre + ' add success');
                                        db.close();
                                    }
                                    callback(1);
                                });
                            } else {
                                req.flash('error', 'Utilisateur / Mail, déjà utilisé');
                                callback(0);
                            }
                            db.close();
                        });
                    });
                });
            } else {
                req.flash('error', 'Les mots de passes ne sont pas identiques');
                callback(0);
            }
        } else {
            req.flash('error', 'Le mot de passe doit contenir au minimum 1 Majuscules, 1 chiffre et faire 5 caracteres minimum');
            callback(0);
        }
    } else {
        req.flash('error', 'Un ou Plusieurs champ(s) vide');
        callback(0);
    }
}

// Chercher un utilisateur dans la base mongo,
// si il existe, mettre a jour sa derniere connection
// le connecter au site
var logUser = function(req, res, callback) {
    var i = 0,
        j = 0,
        ok = 0,
        log = req.body.login,
        pwd = req.body.pwd;

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
                        j = i;
                    }
                    i++;
                }
                if (ok == 1) {
                    collec.updateOne({ login: log }, { $set: { last_co: new Date() } });
                    db.close();
                    callback(null, { mess: 'Connection Success' }, {log:log,myId:docs[j]['myId']}, '/');
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

// Met à jour les informations de l'utilisateur telle que, Prénoms, Nom, Age, 
// Orientation Sexuel, Mail, Biographie, Pseudo
var updateUser = function(req, res) {
    var loger = req.session['login'],
        firstname = req.body.firstname,
        lastname = req.body.lastname,
        age = req.body.age,
        orient = req.body.orient,
        mail = req.body.mail,
        bio = req.body.bio,
        ray = req.body.rayon,
        city = req.body.city,
        sexe = req.body.sexe,
        longitude = req.body.longitude,
        latitude = req.body.latitude,
        pseudo = req.body.pseudo;

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
        if (ray != undefined && ray != req.session['myinfo'][13]) {
            MongoClient.connect(url, function(err, db) {
                db.collection('user').updateOne({ login: loger }, { $set: { ray: ray } });
                db.close();
                console.log(loger + ' a mis à jour son Rayon de recherche');
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
        if (sexe != undefined && sexe != req.session['myinfo'][3]) {
            utilities.defineAvatar(sexe, req.session['myinfo'][9], function(s, a) {
                MongoClient.connect(url, function(err, db) {
                    db.collection('user').updateOne({login: loger}, {$set: {sexe: s, avatar: a}});
                    db.close();
                    console.log(loger + ' a mis à jour son Sexe');
                });
            });
        }
        if (orient != undefined && orient != req.session['myinfo'][4]) {
            MongoClient.connect(url, function(err, db) {
                db.collection('user').updateOne({ login: loger }, { $set: { orient: orient } });
                db.close();
                console.log(loger + ' a mis à jour sa Sexualité');
            });
        }
        if (city != req.session['myinfo'][15]) {
            if (city) {
                getCity(city, function(position) {
                    returnCityLatLon(position.results[0], function(data) {
                        MongoClient.connect(url, function(err, db) {
                            db.collection('user').updateOne({ login: loger }, { $set: { lo: data.lo, la: data.la, city: data.city, position: false } });
                            db.close();
                            console.log(loger + ' a mis à jour ses Coordonnées');
                        });
                    });
                });
            } else if (!city) {
                MongoClient.connect(url, function(err, db) {
                    db.collection('user').updateOne({ login: loger }, { $set: { position: true } });
                    db.close();
                    console.log(loger + ' a réactivé la Localisation');
                });
            }
        }
        utilities.makePopu(loger);
        res.redirect('info');
    }
}

// Définie une photo comme avatar
var setAvatar = function(req, res) {
    utilities.defineAvatar(req.session['myinfo'][3], req.body.path, function(s, a) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').updateOne({ login: req.session['login'] }, { $set: { avatar: a } });
            db.close();
            console.log(req.session['login'] + ' à mis a jour son avatar');
        });
    });
}

// Ajoute un #tag à la base de donnée
// pas d'espace, inférieur à 20 caractères, et transformation en majuscule
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

// Récupère les #tags de la basse de donnée
var getInterest = function(req, res, call) {
    MongoClient.connect(url, function(err, db) {
        db.collection('interet').find().toArray(function(err, docs) {
            if (docs[0]['name'] == 'Tags')
                call(docs[0][0]);
            else
                call({0:''});
        });
        db.close();
    });
}

// Ajout d'un ou plusieurs #tags à l'utilisateur
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

// Suppression d'un ou plusieurs #tags à l'utilisateur
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

// Récupère les likes d'un utilisateurs
function getHisLike(login, call) {
    MongoClient.connect(url, function(err, db) {
        db.collection('user').find({ login: login }).toArray(function(err, doc) {
            call(doc[0]['like']);
        });
        db.close();
    });
}

// Met à jour, la liste de Match d'un utilisateur
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

// Check si les utilisateur (A, B) se like mutuellement et les connecte si c'est le cas
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

// Met à jour les like d'un utilisateur
// Notifie l'utilisateur
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

// Met à jour heBlockMe d'un utilisateur
// Notifie l'utilisateur
function upHisBlock(sens, login, me) {
    if (sens == true) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({ login: login }).toArray(function(err, doc) {
                makeTab(doc[0]['heBlockMe'], me, function(result) {
                    MongoClient.connect(url, function(err, db) {
                        db.collection('user').updateOne({ login: login }, { $set: { heBlockMe: result } });
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
                downTab(doc[0]['heBlockMe'], me, function(result) {
                    MongoClient.connect(url, function(err, db) {
                        db.collection('user').updateOne({ login: login }, { $set: { heBlockMe: result } });
                        db.close();
                        utilities.makePopu(login);
                        notifyHim(login, 'Dislike by ' + me);
                    });
                });
            });
        });
    }
}

// Ajoute l'utilisateur liker a la liste de 'like' de l'utilisateur
// lance le check pour le match des profils
var likeUser = function(req, res, callback) {
    var login = req.session['login'];

    utilities.getLogin(req.body.pseudo, function(rep) {
        if (rep != login) {
            upHisLike(true, rep, login);
            utilities.makePopu(login);
        }
        makeTab(req.session['myLike'], rep, function(result) {
            MongoClient.connect(url, function(err, db) {
                db.collection('user').updateOne({ login: login }, { $set: { like: result } });
                db.close();
                checkConnect(login, rep);
                callback(null, { mess: 'Like Success' });
            });
        });
    });
}

// Supprime l'utilisateur dislike de la liste 'like' de l'utilisateur 
var disLikeUser = function(req, res, callback) {
    var login = req.session['login'];

    utilities.getLogin(req.body.pseudo, function(rep) {
        if (req.body.pseudo != login) {
            utilities.getLogin(req.body.pseudo, function(rep) {
                upHisLike(false, rep, login);
            });
            utilities.makePopu(login);
            downTab(req.session['myLike'], rep, function(result) {
                MongoClient.connect(url, function(err, db) {
                    db.collection('user').updateOne({ login: login }, { $set: { like: result } });
                    db.close();
                    checkConnect(login, rep);
                    callback(null, { mess: 'Dislike Success' });
                });
            });
        }
    });
}

// Ajoute l'utilisateur bloquer a la liste 'block' de l'utilisateur
var blockUser = function(req, res, callback) {
    var login = req.session['login'];

    utilities.getLogin(req.body.pseudo, function(rep) {
        if (req.body.pseudo != login) {
            upHisBlock(true, rep, login);
            makeTab(req.session['myBlock'], rep, function(result) {
                MongoClient.connect(url, function(err, db) {
                    db.collection('user').updateOne({ login: login }, { $set: { block: result } });
                    db.close();
                    utilities.makePopu(login);
                    callback(null, { mess: 'Block Success' });
                });
            });
        }
    });
}

// Supprime l'utilisateur debloquer de la liste 'block' de l'utilisateur
var deBlockUser = function(req, res, callback) {
    var login = req.session['login'];

    utilities.getLogin(req.body.pseudo, function(rep) {
        if (rep != login) {
            upHisBlock(false, rep, login);
            downTab(req.session['myBlock'], rep, function(result) {
                MongoClient.connect(url, function(err, db) {
                    db.collection('user').updateOne({ login: login }, { $set: { block: result } });
                    db.close();
                    utilities.makePopu(login);
                    callback(null, { mess: 'Deblock Success' });
                });
            });
        }
    });
}

// Met a jour le compteur iFalse de l'utilisateur cibler
// Si iFalse est >= 5 l'utilisateur cibler est supprimer de la base de donnée, ainsi que ses photos
function upHerFalse(login) {
    utilities.getLogin(login, function(rep) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({ login: rep }).toArray(function(err, doc) {
                if (doc[0]['iFalse'] < 5) {
                    var iFalse = (Number.parseInt(doc[0]['iFalse']) + 1);
                    db.collection('user').updateOne({ login: rep }, { $set: { iFalse: iFalse } });
                    utilities.makePopu(rep);
                    notifyHim(rep, 'False number ' + iFalse);
                    db.close();
                } else if (doc[0]['iFalse'] >= 5) {
                    db.collection('user').removeOne({ login: rep }, { justOne: true });
                    db.collection('image').removeOne({ login: rep }, { justOne: true });
                } else {
                    db.collection('user').updateOne({ login: rep }, { $set: { iFalse: '1' } });
                    utilities.makePopu(rep);
                    notifyHim(rep, 'False number 1');
                    db.close();
                }
            });
        });
    });
}

// Ajoute l'utilisateur 'déclarer faux' à la liste 'falseUser' de l'utilisateur
var falseUser = function(req, res, callback) {
    var login = req.session['login'];

    utilities.getLogin(req.body.pseudo, function(rep) {
        if (rep != login) {
            makeTab(req.session['myFalse'], rep, function(result) {
                MongoClient.connect(url, function(err, db) {
                    db.collection('user').updateOne({ login: login }, { $set: { falseUser: result } });
                    db.close();
                    upHerFalse(rep);
                    callback(null, { mess: 'False User Success' });
                });
            });
        }
    });
}

// Récupere le tableau 'notif' de l'utilisateur
var getMyNotif = function(name, callback) {
    utilities.getLogin(name, function(rep) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({ login: rep }).toArray(function(err, doc) {
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
    });
}

// Récupère les messages entre 2 utilisateurs
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

// Ajoute un message a la collection 'tchat'
var postMsg = function(to, off, msg, notif) {
    if (msg != '') {
        var tchat = {
            convers: [off, to],
            exp: off,
            msg: msg
        };
        if (notif) {
            utilities.getLogin(off, function(offf) {
                notifyHim(to, 'Message of ' + offf);
            });
        }
        MongoClient.connect(url, function(err, db) {
            db.collection('tchat').insertOne(tchat, function(err, result) {
                db.close();
            });
        });
    }
}

// Récupère la liste des likeur du profil cibler par login
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

var getLastCo = function(login, callback) {
    MongoClient.connect(url, function(err, db) {
        db.collection('user').find({ login: login }).toArray(function(err, doc) {
            var date;
            if (doc[0]['last_co']) {
                date = doc[0]['last_co'];
                callback(date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear())
            } else if (doc[0]['created'] && !doc[0]['last_co']) { 
                date = doc[0]['created'];
                callback(date.getDate() + '/' + (date.getMonth() + 1) + '/' + date.getFullYear())
            }
            db.close();
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
exports.getMyMatch = getMyMatch;
exports.getMyVisit = getMyVisit;
exports.getHeBlock = getHeBlock;
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
exports.getLastCo = getLastCo;

// fonctionnalitées utilisateurs sur les autres utilisateurs, like/dislike, bloque/débloque, déclarer faux
exports.likeUser = likeUser;
exports.disLikeUser = disLikeUser;
exports.blockUser = blockUser;
exports.deBlockUser = deBlockUser;
exports.falseUser = falseUser;
exports.postMsg = postMsg;

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
