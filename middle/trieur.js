var utilities = require('./utility');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://UserMatcha:MatchRthid3@localhost:28000/matcha";

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

function toRestrict(tab, max, call) {
    var result = {},
        i = 0;
    while (i < max && tab[i]) {
        result[i] = tab[i];
        i++;
    }
    if (!tab[i] || i >= max) {
        call(result);
    }
}

function removeBloked(login, tab, val, sens, nbRes, call) {
    if (tab[0]) {
        MongoClient.connect(url, function(err, db) {
            db.collection('user').find({ login: login }).toArray(function(err, doc) {
                if (doc.length >= 0) {
                    var blocked = doc[0]['block'],
                        heBlock = doc[0]['heBlockMe'],
                        result = {},
                        nb = 0,
                        falseUser = doc[0]['falseUser'];

                    for (var i = 0; tab[i]; i++) {
                        if (!utilities.alreadySet(blocked, tab[i][1]) && !utilities.alreadySet(falseUser, tab[i][1]) && !utilities.alreadySet(heBlock, tab[i][1])) {
                            result[nb] = tab[i];
                            nb++;
                        }
                    }
                    if (!tab[i]) {
                        db.close();
                        if (sens) {
                            trieCroissant(result, val, function(ret) {
                                toRestrict(ret, nbRes, function(clean) {
                                    call(clean);
                                });
                            });
                        } else if (!sens) {
                            trieDecroissant(result, val, function(ret) {
                                toRestrict(ret, nbRes, function(clean) {
                                    call(clean);
                                });
                            });
                        }
                        if (result[0] == undefined) {
                            call(result);
                        }
                    }
                }
            });
        });
    } else {
        call(tab);
    }
}

var forIndex = function(myinfo, allprof, val, sens, callback, opt) {
    var tmp = {};
    var result = {};
    var rayon;
    var nb = 0;

    if (opt.dist == 0)
        rayon = 1000;
    else
        rayon = opt.dist;
    for (var i = 0; allprof[i]; i++) {
        if (allprof[i][8] != myinfo[16]) {
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
            removeBloked(myinfo[12], result, val, sens, opt.res, callback);
        } else {
            removeBloked(myinfo[12], result, val, sens, opt.res, callback);
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
    var egal = utilities.Distance(me[8], me[11], user[5], user[4]) / 100;
    if (egal >= dist)
        return -1;
    else if (egal <= dist && egal >= dist / 2)
        return 1;
    else if (egal < dist / 2 && egal > dist / 4)
        return 2;
    else if (egal < dist / 4 && egal >= 0)
        return 3
}

function getCommun(user, me, callback) {
    var pts = 0;

    for (var i = 0; me[7][i]; i++) {
        if (utilities.alreadySet(user[7], me[7][i]))
            pts += 3;
    }
    if (!me[7][i]) {
        callback(pts);
    }
}

function allPonderate(thisUser, me, callback) {
    var points = 0;

    if (thisUser[7] && me[7]) {
        getCommun(thisUser, me, function(pts) {
            callback(pts + verifyAge(thisUser, me) + verifyDist(thisUser, me, 200));
        });
    } else {
        callback(0);
    }
}

var ponderate = function(type, myinfo, list, resu, callback) {
    var i = 0;

    if (list[0]) {
        if (type == 'all') {
            while (list[i]) {
                allPonderate(list[i], myinfo, function(result) {
                    list[i][7] = result + list[i][9];
                    i++;
                });
            }
            if (!list[i]) {
                forIndex(myinfo, list, 4, false, callback, { dist: '0', res: resu });
            }
        } else if (type == 'age') {
            forIndex(myinfo, list, 5, true, callback, { dist: myinfo[13], res: resu });
        } else if (type == 'loc') {
            forIndex(myinfo, list, 2, true, callback, { dist: myinfo[13], res: resu });
        } else if (type == 'popu') {
            while (list[i]) {
                list[i][7] = list[i][9];
                i++;
            }
            if (!list[i]) {
                forIndex(myinfo, list, 4, false, callback, { dist: myinfo[13], res: resu });
            }
        } else if (type == 'tag') {
            while (list[i]) {
                getCommun(list[i], myinfo, function(pts) {
                    list[i][7] = pts;
                    i++;
                });
            }
            if (!list[i]) {
                forIndex(myinfo, list, 4, false, callback, { dist: '0', res: resu });
            }
        }
    }
}

function determineTrie(nombre, list, myinfo, call) {
    if (nombre['trie'] == 0 || !nombre['trie']) {
        if (myinfo[7][0] && (myinfo[2] != undefined && myinfo[2] != '')) {
            intelTri(myinfo, list, function(result) {
                ponderate("all", myinfo, result, 50, function(trier) {
                    call(trier);
                });
            });
        } else {
            intelTri(myinfo, list, function(result) {
                forIndex(myinfo, result, 2, true, function(retour) {
                    call(retour);
                }, {dist:'0', res:'50'});
            });
        }
    } else if (nombre['trie'] == 1) {
        if (myinfo[2] != undefined && myinfo[2] != '') {
            intelTri(myinfo, list, function(result) {
                ponderate("age", myinfo, result, 50, function(trier) {
                    call(trier);
                });
            });
        } else {
            intelTri(myinfo, list, function(result) {
                forIndex(myinfo, result, 2, true, function(retour) {
                    call(retour);
                }, {dist:'0', res:'50'});
            });
        }
    } else if (nombre['trie'] == 2) {
        intelTri(myinfo, list, function(result) {
            ponderate("loc", myinfo, result, 50, function(trier) {
                call(trier);
            });
        });
    } else if (nombre['trie'] == 3) {
        intelTri(myinfo, list, function(result) {
            ponderate("popu", myinfo, result, 50, function(trier) {
                call(trier);
            });
        });
    } else if (nombre['trie'] == 4) {
        if (myinfo[7][0]) {
            intelTri(myinfo, list, function(result) {
                ponderate("tag", myinfo, result, 50, function(trier) {
                    call(trier);
                });
            });
        } else {
            intelTri(myinfo, list, function(result) {
                forIndex(myinfo, result, 2, true, function(retour) {
                    call(retour);
                }, {dist:'0', res:'50'});
            });
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

function determineTrieS(nombre, result, myinfo, call) {
    if (nombre['trie'] == 0 || !nombre['trie']) {
        if (myinfo[7][0] && (myinfo[2] != undefined && myinfo[2] != '')) {
            ponderate("all", myinfo, result, 50, function(trier) {
                call(trier);
            });
        } else {
            forIndex(myinfo, result, 2, true, function(retour) {
                call(retour);
            }, {dist:'0', res:'50'});
        }
    } else if (nombre['trie'] == 1) {
        if (myinfo[2] != undefined && myinfo[2] != '') {
            ponderate("age", myinfo, result, 50, function(trier) {
                call(trier);
            });
        } else {
            forIndex(myinfo, result, 2, true, function(retour) {
                call(retour);
            }, {dist:'0', res:'50'});
        }
    } else if (nombre['trie'] == 2) {
        ponderate("loc", myinfo, result, 50, function(trier) {
            call(trier);
        });
    } else if (nombre['trie'] == 3) {
        ponderate("popu", myinfo, result, 50, function(trier) {
            call(trier);
        });
    } else if (nombre['trie'] == 4) {
        if (myinfo[7][0]) {
            ponderate("tag", myinfo, result, 50, function(trier) {
                call(trier);
            });
        } else {
            forIndex(myinfo, result, 2, true, function(retour) {
                call(retour);
            }, {dist:'0', res:'50'});
        }
    }
}

function interPopu(list, min, max, callback) {
    var result = {},
        nb = 0;
    for (var i = 0; list[i]; i++) {
        if (Number.parseInt(list[i][9]) <= max && Number.parseInt(list[i][9]) >= min) {
            result[nb] = list[i];
            nb++;
        }
    }
    if (!list[i]) {
        callback(result);
    }
}

var makeResearch = function(req, callback) {
    var list = req.session['allprof'],
        result = {},
        nb = 0,
        sexe = req.body['s'],
        popmin = (req.body['pomin'] ? req.body['pomin'] : 0),
        popmax = (req.body['pomax'] ? req.body['pomax'] : 1000),
        orient = req.body['os'],
        amin = req.body['amin'],
        amax = req.body['amax'],
        tags = req.body['t'].split(',');

    if (sexe != '') {
        getSexe(sexe, list, function(retourSexe) {
            if (orient != '') {
                getOrient(orient, retourSexe, function(retourOrient) {
                    forAge(amin, amax, retourOrient, function(retourAge) {
                        interPopu(retourAge, popmin, popmax, function(pop) {
                            if (tags == '') {
                                callback(null, retourAge);
                            } else {
                                withTags(tags, retourAge, function(retourTag) {
                                    callback(null, retourTag);
                                });
                            }
                        });
                    });
                });
            } else {
                forAge(amin, amax, retourSexe, function(retourAge) {
                    interPopu(retourAge, popmin, popmax, function(pop) {
                        if (tags == '') {
                            callback(null, retourAge);
                        } else {
                            withTags(tags, retourAge, function(retourTag) {
                                callback(null, retourTag);
                            });
                        }
                    });
                });
            }
        });
    } else if (orient != '' && sexe == '') {
        getOrient(orient, list, function(retourOrient) {
            forAge(amin, amax, retourOrient, function(retourAge) {
                interPopu(retourAge, popmin, popmax, function(pop) {
                    if (tags == '') {
                        callback(null, retourAge);
                    } else {
                        withTags(tags, retourAge, function(retourTag) {
                            callback(null, retourTag);
                        });
                    }
                });
            });
        });
    } else if (orient == '' && sexe == '') {
        forAge(amin, amax, list, function(retourAge) {
            interPopu(retourAge, popmin, popmax, function(pop) {
                if (tags == '') {
                    callback(null, pop);
                } else {
                    withTags(tags, pop, function(retourTag) {
                        callback(null, retourTag);
                    });
                }
            });
        });
    }
}

exports.makeResearch = makeResearch;
exports.forIndex = forIndex;
exports.intelTri = intelTri;
exports.ponderate = ponderate;
exports.determineTrie = determineTrie;
exports.determineTrieS = determineTrieS;