var uniqid = require('uniqid')

//getImage
function clean(session, callback) {
    if (session['login'] != undefined) {
        var login = session['login'];
        if (session['allprof'] && login != undefined){
            session['allprof'] = {};
        }
        if (session['myinfo'] && login != undefined){
            session['myinfo'] = {};
        }
        if (session['mytag'] && login != undefined){
            session['mytag'] = {};
        }
        if (session['mypic'] && login != undefined){
            session['mypic'] = {};
        }
        if (session['interet'] && login != undefined){
            session['interet'] = {};
        }
        callback();
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
    console.log(str.length + ' ' + i);
    if (i == str.length)
        return 1;
}

exports.checkerTag = checkerTag;
exports.checkerPwd = checkerPwd;
exports.checkerBio = checkerBio;
exports.getImage = getImage;
exports.rmImage = rmImage;
exports.clean = clean;