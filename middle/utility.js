var uniqid = require('uniqid')
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://UserMatcha:MatchRthid3@localhost:28000/matcha";
var nodemailer = require('nodemailer');
var crypto = require('crypto');

var getLogin = function(myId, callback) {
    MongoClient.connect(url, function(err, db) {
        db.collection('user').find({myId: myId}).toArray(function(err, doc) {
            if (doc[0]) {
                callback(doc[0]['login']);
            } else {
                callback(myId);
            }
            db.close();
        });
    });
}

var getHisId = function(login, callback) {
    MongoClient.connect(url, function(err, db) {
        db.collection('user').find({login: login}).toArray(function(err, doc) {
            if (doc[0]) {
                callback(doc[0]['myId']);
            } else {
                callback(login);
            }
            db.close();
        });
    });
}

var checkerMyPwd = function(login, pwd, callback) {
    pwd = crypto.createHmac('whirlpool', pwd).digest('hex');
    MongoClient.connect(url, function(err, db) {
        db.collection('user').find({login: login}).toArray(function(err, doc) {
            if (doc[0]['pwd'] == pwd) {
                db.close();
                callback(true);
            } else {
                db.close();
                callback(false);
            }
        });
    });
}

// Vérifie si la valeur existe dans le tableau 
function alreadySet(tab, value) {
    if (tab) {
        for (var i = 0; tab[i]; i++) {
            if (tab[i] == value)
                return 1;
            if (i == tab.length) {
                return 0;
            }
        }
    } else {
        return 0;
    }
}

var changePassword = function(password, mail, callback) {
    MongoClient.connect(url, function(err, db) {
        var pass = crypto.createHmac('whirlpool', password).digest('hex');
        db.collection('user').updateOne({mail: mail}, { $set: {pwd: pass}}, function(err, result) {
            db.close();
            if (err) callback(false);
            callback({bool:true});
        });
    });
}

var senderMail = function(mail, reason) {
    var transporter = nodemailer.createTransport();
    if (reason == "User") {
        var mailOption = {
            from: '"Matcha rthidet" <no-reply@matcha.com>',
            to: mail,
            subject: 'Inscription à Matcha',
            text: 'Vous avez réussi votre inscription sur le site Matcha de rthidet',
            html: '<b>Vous avez réussi votre inscription sur le site Matcha de rthidet</b>'
        }
        transporter.sendMail(mailOption, function(error, info) {
            if (error) return console.log(error);
        });
    } else if (reason == 'Reset') {
        var pass = uniqid();
        changePassword(pass, mail, function(bool) {
            if (bool) {
                var mailOption = {
                    from: '"Matcha rthidet" <no-reply@matcha.com>',
                    to: mail,
                    subject: 'Matcha, réinitialisation Mot de passe.',
                    text: 'Vous avez demendé la réinitialisation de vôtre mot de passe, le nouveau mot de passe: ' + pass,
                    html: '<b>Vous avez demendé la réinitialisation de vôtre mot de passe, le nouveau mot de passe: ' + pass + '</b>'
                }
                transporter.sendMail(mailOption, function(error, info) {
                    if (error) return console.log(error);
                });
            }
        });
    }
}

var defineAvatar = function(sexe, avatar, callback) {
    if (avatar == 'avatar.png' || avatar == 'avatarH.png' || avatar == 'avatarF.png') {
        if (sexe == 'Homme') {
            callback(sexe, 'avatarH.png');
        } else if (sexe == 'Femme') {
            callback(sexe, 'avatarF.png');
        } else {
            callback(sexe, 'avatar.png');
        }
    } else {
        callback(sexe, avatar);
    }
}

function calcPopularite(heLikeMe, myVisit, iFalse, callback) {
    if (myVisit[0] && !heLikeMe[0]) {
        for (var v = 0; myVisit[v]; v++) {
            if (!myVisit[v]) break;
        }
        if (iFalse) {
            callback(v / iFalse);
        }
    }
    if (heLikeMe[0] && myVisit[0]) {
        for (var v = 0; myVisit[v]; v++) {
            if (!myVisit[v]) break;
        }
        for (var h = 0; heLikeMe[h]; h++) {
            if (!heLikeMe[h]) break;
        }
        if (iFalse) {
            callback((h + v) / iFalse);
        } else {
            callback(h + v);
        }
    }
}

function updatePopu(login, popu) {
    MongoClient.connect(url, function(err, db) {
        db.collection('user').updateOne({login: login}, {$set: {popu: popu}});
        db.close();
    });
}

exports.makePopu = function(login) {
    MongoClient.connect(url, function(err, db) {
        db.collection('user').find({login: login}).toArray(function(err, doc) {
            if (doc[0]['visit'] && doc[0]['heLikeMe']) {
                calcPopularite(doc[0]['heLikeMe'], doc[0]['visit'], doc[0]['iFalse'],function(result) {
                    updatePopu(login, result);
                    db.close();
                });
            } else {
                updatePopu(login, 0);
                db.close();
            }
        });
    });
}

var getImage = function(req, res, callback) {
    var ImageURI = require('image-data-uri');
    var mkdirp = require('mkdirp');
    var log = req.session['login'];
    var path = __dirname + "/../public/uploads/" + log;
    var data = req.body.photo;
    var date = uniqid();
    var file = log + date + '.png';
    var filePath = path + "/" + file;

    if (log != undefined && data != undefined && (data.indexOf('png') > -1 || data.indexOf('jpeg') > -1)) {
        mkdirp(path, function(err){
            if (err) return callback(err, null);
        });
        ImageURI.outputFile(data, filePath);
        return callback(null, log + '/' + file)
    } else {
        return callback(null, null);
    }
}

var rmImage = function(req, res, callback) {
    var fs = require('fs');
    var login = req.session['login'];
    var path = req.body.path;
    var pos = path.indexOf('/');
    path = path.slice(pos + 1);
    fs.unlink(__dirname + "/../public/uploads/" + login + "/" + path, function() {
        callback(null, path);
    });
}

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

//checker longueur de texte
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

var checkerTag = function(str) {
    for (var i = 0; str[i]; i++) {
        if (str[i] == ' ')
            return 0;
    }
    if (i == str.length)
        return 1;
}

var Distance = function(la_a, lo_a, la_b, lo_b) {
    function convertRad(input){
            return (Math.PI * input)/180;
    }
     
    function Distance(lat_a_degre, lon_a_degre, lat_b_degre, lon_b_degre){
        R = 6371000;
        lat_a = convertRad(lat_a_degre);
        lon_a = convertRad(lon_a_degre);
        lat_b = convertRad(lat_b_degre);
        lon_b = convertRad(lon_b_degre);

        d = R * (Math.PI/2 - Math.asin( Math.sin(lat_b) * Math.sin(lat_a) + Math.cos(lon_b - lon_a) * Math.cos(lat_b) * Math.cos(lat_a)))
        return d / 10;
    }
    return (Math.round(Distance(la_a, lo_a, la_b, lo_b)));
}

exports.defineAvatar = defineAvatar;
exports.Distance = Distance;
exports.checkerTag = checkerTag;
exports.checkerPwd = checkerPwd;
exports.checkerBio = checkerBio;
exports.getImage = getImage;
exports.rmImage = rmImage;
exports.senderMail = senderMail;
exports.alreadySet = alreadySet;
exports.checkerMyPwd = checkerMyPwd;
exports.changePassword = changePassword;
exports.getLogin = getLogin;
exports.getHisId = getHisId;