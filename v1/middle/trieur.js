var utilities = require('./utility');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:28000/matcha";

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
            getGay(list, Sex, function(retour) {
                callback(retour);
            });
        } else if (OSex == 'Hetero') {
            getOposite(list, Sex, function(retour) {
                callback(retour);
            });
        } else {
            getBi(list, Sex, function(retour) {
                callback(retour);
            });
        }
    } else if (Sex == 'Femme') {
        if (OSex == 'Gay') {
            getGay(list, Sex, function(retour) {
                callback(retour);
            });
        } else if (OSex == 'Hetero') {
            getOposite(list, Sex, function(retour) {
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

function trieDecroissant(tab, where, callback) {
    var tmp = {},
        j = 0;

    for (var i = 0; tab[i]; i++) {
        if (i == 0 || i == 1) {
            j = 0;
        } else {
            j = i - 1;
        }
        if (tab[i][where] > tab[j][where]) {
            tmp = tab[i - 1];
            tab[i - 1] = tab[i];
            tab[i] = tmp;
            i = 0;
        }
    }
    if (!tab[i]) {
        callback(tab);
    }
}

function trieCroissant(tab, where, callback) {
    var tmp = {},
        j = 0;
    
    for (var i = 0; tab[i]; i++) {
        if (i == 0 || i == 1) {
            j = 0;
        } else {
            j = i - 1;
        }
        if (tab[i][where] < tab[j][where]) {
            tmp = tab[i - 1];
            tab[i - 1] = tab[i];
            tab[i] = tmp;
            i = 0;
        }
    }
    if (!tab[i]) {
        callback(tab);
    }
}

function removeBloked(login, tab, val, sens, call) {
    MongoClient.connect(url, function(err, db) {
        db.collection('user').find({login: login}).toArray(function(err, doc) {
            if (doc.length >= 0) {
                var blocked = doc[0]['block'],
                    result = {},
                    nb = 0,
                    falseUser = doc[0]['falseUser'];

                for (var i = 0; tab[i]; i++) {
                    if (!utilities.alreadySet(blocked, tab[i][3]) && !utilities.alreadySet(falseUser, tab[i][3])) {
                        result[nb] = tab[i];
                        nb++;
                    }
                }
                if (!tab[i]) {
                    db.close();
                    if (sens) {
                        trieCroissant(result, val, function(ret) {
                            call(ret);
                        });
                    } else {
                        trieDecroissant(result, val, function(ret) {
                            call(ret);
                        });
                    }
                }
            }
        });
    });
}

var forIndex = function(myinfo, allprof, val, sens, callback, ray) {
    var tmp = {};
    var result = {};
    var rayon;
    var nb = 0;

    if (ray == 0)
        rayon = 200;
    else
        rayon = ray;
    for (var i = 0; allprof[i]; i++) {
        if (allprof[i][8] != myinfo[12]) {
            tmp[0] = allprof[i][0];
            tmp[1] = allprof[i][1];
            tmp[2] = utilities.Distance(myinfo[8], myinfo[11], allprof[i][5], allprof[i][4]) / 100;
            tmp[3] = allprof[i][8];
            tmp[4] = allprof[i][7];
            tmp[5] = allprof[i][6];
            if (tmp[2] <= rayon) {
                result[nb] = tmp;
                nb++;
                tmp = {};
            }
            tmp = {};
        }
    }
    if (!allprof[i]) {
        if (sens) {
            removeBloked(myinfo[12], result, val, sens, callback);
        } else {
            removeBloked(myinfo[12], result, val, sens, callback);
        }
    }
}

function verifyAge(user, me) {
    if (user[6] > me[2]) {
        if ((user[6] - me[2]) <= 5) {
            return 1;
        } else {
            return 0;
        }
    } else if (user[6] < me[2]) {
        if ((me[2] - user[6]) <= 5) {
            return 1;
        } else {
            return 0;
        }
    } else {
        return 1;
    }
}

function verifyDist(user, me, dist) {
    if ((utilities.Distance(me[8], me[11], user[5], user[4]) / 100) <= dist)
        return 1;
    else
        return 0;
}

function getCommun(user, me, callback) {
    var pts = 0,
        i = 0,
        j = 0;

    while (user[7][i]) {
        j = 0;
        while (me[7][j]) {
            if (user[7][i] == me[7][j]) {
                pts += 2;
                j++;
            } else {
                j++;
            }
        } if (!me[7][j]) {
            i++;
        }
    }
    if (!user[7][i]) {
        callback(pts);
    }
}

function allPonderate(thisUser, me, callback) {
    var points = 0;

    if (thisUser[7] && me[7]) {
        getCommun(thisUser, me, function(pts) {
            points += pts;
            if (verifyAge(thisUser, me)) {
                points++;
            }
            if (verifyDist(thisUser, me, 50)) {
                points++;
            }
            callback(points);
        });
    } else {
        callback(0);
    }
}

var ponderate = function(type, myinfo, list, callback) {
    var i = 0;
    
    if (list[0]) {
        if (type == 'all') {
            while (list[i]) {
                allPonderate(list[i], myinfo, function(result) {
                    list[i][7] = result + list[i][9];
                    i++;
                });
            } if (!list[i]) {
                forIndex(myinfo, list, 4, false, callback, 80);
            }
        } else if (type == 'age') {
            forIndex(myinfo, list, 5, true, callback, 80);
        } else if (type == 'loc') {
            forIndex(myinfo, list, 2, true, callback, myinfo[13]);
        } else if (type == 'popu') {
            while (list[i]) {
                list[i][7] = list[i][9];
                i++;
            } if (!list[i]) {
                forIndex(myinfo, list, 4, false, callback, 80);
            }
        } else if (type == 'tag') {
            while (list[i]) {
                getCommun(list[i], myinfo, function(pts) {
                    list[i][7] = pts;
                    i++;
                });
            } if (!list[i]) {
                forIndex(myinfo, list, 4, false, callback, 80);
            }
        }
    }
}

function getSexe(sexe, list, callback) {
    var result = {};
    var nb = 0;
    for (var i = 0; list[i]; i++) {
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
    for (var i = 0; list[i]; i++) {
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
            for (var j = 0; list[i][7][j]; j++) {
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
        getSexe(sexe, list, function(retourSexe) {
            if (orient != '') {
                getOrient(orient, retourSexe, function(retourOrient) {
                    forAge(amin, amax, retourOrient, function(retourAge) {
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
                forAge(amin, amax, retourSexe, function(retourAge) {
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
        getOrient(orient, list, function(retourOrient) {
            forAge(amin, amax, retourOrient, function(retourAge) {
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

exports.makeResearch = makeResearch;
exports.forIndex = forIndex;
exports.intelTri = intelTri;
exports.ponderate = ponderate;