var crypto = require('crypto');

var utils = require('../lib/utils.js');

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

module.exports = {
    random: random,
    randomBuffer: randomBuffer,
    randomHexString: randomHexString,

    isHexString: utils.isHexString,
    hexOrBuffer: utils.hexOrBuffer,
}
