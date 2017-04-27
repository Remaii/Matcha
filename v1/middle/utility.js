var uniqid = require('uniqid')

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

function makeBasePopu(myinfo, mytag, mypic, callback) {
    var count = 0;
    if (myinfo) {
        for (var i = 0; i < 6; i++) {
            if (myinfo[i] != undefined && myinfo[i] != '') {
                count++;
            }
        }
    } else {
        var i = 6;
    } if (mypic) {
        for (var j = 0; i == 6 && j < 6; j++) {
            if (mypic[j] != undefined && mypic[j] != '') {
                count++;
            }
        }
    } else {
        var j = 6;
    } if (mytag) {
        for (var h = 0; j == 6 && mytag[h]; h++) {
            if (mytag[h] != undefined && mytag[h] != '') {
                count++;
            }
        }
    } else {
        var h = 3;
    } if ((h == 3 && !mytag) || (h >= 3 && (mytag && !mytag[h]))) {
        return((count / (h + j + i)) * 100);
    }
}

function makeLikeVisit(myliker, myvisit) {
    var countl = 1,
        countm = 1;
    if (myliker) {
        for (var l = 0; myliker[l]; l++) {
            if (myliker[l] != undefined && myliker[l] != '') {
                countl++;
            }
        }
    } else {
        var l = -1;
    } if (myvisit) {
        for (var m = 0; myvisit[m]; m++) {
            if (myvisit[m] != undefined && myvisit[m] != '') {
                countm++;
            }
        }
    } else {
        var m = -1;
    }
    if (!myvisit[m] && !myliker[l]) {
        return ((countm + countl) + (m + l));
    }
}

function makePopu(myinfo, mytag, mypic, myliker, myvisit, callback) {
    if (myvisit) {
        console.log('la');
        var prof = makeLikeVisit(myvisit, myliker),
            popu = Math.round(makeBasePopu(myinfo, mytag, mypic));
        if (prof && popu) {
            console.log(prof + ' ' + popu);
            callback(prof, popu);
        }
        //callback(Math.round(makeBasePopu(myinfo, mytag, mypic)), makeLikeVisit(myvisit, myliker));
    } else {
        console.log('ici');
        callback(Math.round(makeBasePopu(myinfo, mytag, mypic)), null);
    }
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

    if (log != undefined && data != undefined) {
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
exports.makePopu = makePopu;