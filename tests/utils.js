var crypto = require('crypto');

//var utils = require('../lib/utils.js');

function random(lowerRandomInterval, upperOpenInterval) {
    return lowerRandomInterval + parseInt((upperOpenInterval - lowerRandomInterval) * Math.random());
}

function randomBuffer(length) {
    var buffer = crypto.randomBytes(length);
    return buffer;
}

function randomHexString(length) {
    return '0x' + randomBuffer(length).toString('hex');
}

function equals(a, b) {

    // Array (treat recursively)
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) { return false; }
        for (var i = 0; i < a.length; i++) {
            if (!equals(a[i], b[i])) { return false; }
        }
        return true;
    }

    // BigNumber
    if (a.eq) {
        if (!b.eq || !a.eq(b)) { return false; }
        return true;
    }

    // Uint8Array
    if (a.buffer) {
        if (!b.buffer || a.length !== b.length) { return false; }
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) { return false; }
        }

        return true;
    }

    // Something else
    return a === b;
}

module.exports = {
    random: random,
    randomBuffer: randomBuffer,
    randomHexString: randomHexString,
    equals: equals,

    //isHexString: utils.isHexString,
    //hexOrBuffer: utils.hexOrBuffer,
}
