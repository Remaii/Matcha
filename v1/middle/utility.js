//getImage
var getImage = function(req, res, callback) {
    var ImageURI = require('image-data-uri');
    var mkdirp = require('mkdirp');
    var log = req.session['login'];
    var path = __dirname + "/../public/uploads/" + log;
    var data = req.body.photo;
    var date = Date.now();
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