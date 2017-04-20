var utilities = require('./utility')

function getGay(list, Sex, callback) {
    var result = {};
    var nb = 0;
    for (var i = 0; list[i]; i++) {
        if (list[i][2] == Sex && (list[i][3] == 'Gay' || list[i][3] == 'Bi')) {
            result[nb] = list[i];
            nb++;
        }
    }
    if (!list[i]) {
        callback(result);
    }
}

function getOposite(list, Sex, callback) {
    var result = {};
    var nb = 0;
    for (var i = 0; list[i]; i++) {
        if (list[i][2] != Sex && (list[i][3] == 'Hetero' || list[i][3] == 'Bi')) {
            result[nb] = list[i];
            nb++;
        }
    }
    if (!list[i]) {
        callback(result);
    }
}

function getBi(list, Sex, callback) {
    var result = {};
    var nb = 0;

    for (var i = 0; list[i]; i++) {
        if (list[i][2] != Sex && (list[i][3] == 'Hetero' || list[i][3] == 'Bi')) {
            result[nb] = list[i];
            nb++;
        } else if (list[i][2] == Sex && list[i][3] != 'Hetero') {
            result[nb] = list[i];
            nb++;
        }
    }
    if (!list[i]) {
        callback(result);
    }
}

var intelTri = function(myinfo, list, callback) {
    var Sex = myinfo[3];
    var OSex = myinfo[4];
    var lo = myinfo[8];
    var la = myinfo[11];

    if (Sex == 'Homme') {
        if (OSex == 'Gay') {
            getGay(list, Sex, function(retour){
                callback(retour);
            });
        } else if (OSex == 'Hetero') {
            getOposite(list, Sex, function(retour){
                callback(retour);
            });
        } else {
            getBi(list, Sex, function(retour) {
                callback(retour);
            });
        }
    } else if (Sex == 'Femme') {
        if (OSex == 'Gay') {
            getGay(list, Sex, function(retour){
                callback(retour);
            });
        } else if (OSex == 'Hetero') {
            getOposite(list, Sex, function(retour){
                callback(retour);
            });
        } else {
            getBi(list, Sex, function(retour) {
                callback(retour);
            });
        }
    } else {
        getBi(list, 'Homme', function(retour) {
                callback(retour);
        });
    }
}

var forIndex = function(myinfo, allprof, callback, ray) {
    var tmp = {};
    var result = {};
    var rayon;
    var nb = 0;

    if (ray == 0)
        rayon = 200;
    else
        rayon = ray;
    for (var i = 0; allprof[i]; i++) {
        tmp[0] = allprof[i][0];
        tmp[1] = allprof[i][1];
        tmp[2] = utilities.Distance(myinfo[8], myinfo[11], allprof[i][5], allprof[i][4]) / 100;
        tmp[3] = allprof[i][8];
        if (tmp[2] <= rayon) {
            result[nb] = tmp;    
            nb++;
            tmp = {};
        }
        tmp = {};
    }
    if (!allprof[i]) {
        callback(result)
    }
}

function getSexe(sexe, list, callback) {
    var result = {};
    var nb = 0;
    for (var i = 0; list[i]; i++){
        if (list[i][2] == sexe) {
            result[nb] = list[i];
            nb++;
        }
    }
    if (!list[i]) {
        callback(result);
    }
}

function getOrient(orient, list, callback) {
    var result = {};
    var nb = 0;
    for (var i = 0; list[i]; i++){
        if (list[i][3] == orient) {
            result[nb] = list[i];
            nb++;
        }
    }
    if (!list[i]) {
        callback(result);
    }
}

function forAge(amin, amax, list, callback) {
    var result = {};
    var nb = 0;

    for (var i = 0; list[i]; i++) {
        if (list[i][6] >= amin && list[i][6] <= amax) {
            result[nb] = list[i];
            nb++;
        } else if (list[i][6] == '') {
            result[nb] = list[i];
            nb++;
        }
    }
    if (!list[i]) {
        callback(result);
    }
}

function withTags(tags, list, callback) {
    var result = {};
    var nb = 0;
    var ok = 0;

    for (var i = 0; list[i]; i++) {
        if (list[i][7] != undefined) {
            ok = 0;
            for (var j = 0;list[i][7][j]; j++) {
                for (var t = 0; tags[t]; t++) {
                    if (list[i][7][j] == tags[t]) {
                        ok++;
                    }
                }
            }
            if (ok > 0 && !list[i][7][j]) {
                result[nb] = list[i];
                nb++;
            }
        }
    }
    if (!list[i]) {
        callback(result);
    }
}

var makeResearch = function(req, callback) {
    var list = req.session['allprof'];
    var result = {};
    var nb = 0;
    var sexe = req.body['s'];
    var orient = req.body['os'];
    var amin = req.body['amin'];
    var amax = req.body['amax'];
    var tags = req.body['t'].split(',');

    if (sexe != '') {
        getSexe(sexe, list, function(retourSexe){
            if (orient != '') {
                getOrient(orient, retourSexe, function(retourOrient) {
                    forAge(amin, amax, retourOrient, function(retourAge){
                        if (tags == '') {
                            callback(null, retourAge);
                        } else {
                            withTags(tags, retourAge, function(retourTag) {
                                callback(null, retourTag);
                            });
                        }
                    });
                });
            } else {
                forAge(amin, amax, retourSexe, function(retourAge){
                    if (tags == '') {
                        callback(null, retourAge);
                    } else {
                        withTags(tags, retourAge, function(retourTag) {
                            callback(null, retourTag);
                        });
                    }
                });
            }
        });
    } else if (orient != '' && sexe == '') {
        getOrient(orient, list, function(retourOrient){
            forAge(amin, amax, retourOrient, function(retourAge){
                if (tags == '') {
                    callback(null, retourAge);
                } else {
                    withTags(tags, retourAge, function(retourTag) {
                        callback(null, retourTag);
                    });
                }
            });
        });
    } else if (orient == '' && sexe == '') {
        forAge(amin, amax, list, function(retourAge) {
            if (tags == '') {
                callback(null, retourAge);
            } else {
                withTags(tags, retourAge, function(retourTag) {
                    callback(null, retourTag);
                });
            }
        });
    }
}

var verifyTag = function(req, callback) {
    callback(req.session['allprof']);
}

exports.verifyTag = verifyTag;
exports.makeResearch = makeResearch;
exports.forIndex = forIndex;
exports.intelTri = intelTri;