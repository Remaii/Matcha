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
    console.log(list)
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

var forIndex = function(myinfo, allprof, callback) {
    var tmp = {};
    var result = {};
    var rayon = 200;
    var nb = 0;

    for (var i = 0; allprof[i]; i++) {
        tmp[0] = allprof[i][0];
        tmp[1] = allprof[i][1];
        tmp[2] = utilities.Distance(myinfo[8], myinfo[11], allprof[i][5], allprof[i][4]) / 100;
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


exports.forIndex = forIndex;
exports.intelTri = intelTri;