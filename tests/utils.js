'use strict';

var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var zlib = require('zlib');

var getEthers = require('./utils-ethers');

var bigNumber = require('../utils/bignumber');
var convert = require('../utils/bytes');
var keccak256 = require('../utils/keccak256').keccak256;
var utf8 = require('../utils/utf8');

var readFileSync = fs.readFileSync;
if (!readFileSync) {
    var data = require('./dist/tests.json');

    readFileSync = function(filename) {
        return Buffer.from(data[filename], 'base64');
    }
}

/*
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
*/
function randomBytes(seed, lower, upper) {
    if (!upper) { upper = lower; }

    if (upper === 0 && upper === lower) { return new Uint8Array(0); }

    seed = utf8.toUtf8Bytes(seed);

    var result = convert.arrayify(keccak256(seed));
    while (result.length < upper) {
        result = convert.concat([result, keccak256(convert.concat([seed, result]))]);
    }

    var top = convert.arrayify(keccak256(result));
    var percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;

    return result.slice(0, lower + parseInt((upper - lower) * percent));
}

function randomHexString(seed, lower, upper) {
    return convert.hexlify(randomBytes(seed, lower, upper));
}

function randomNumber(seed, lower, upper) {
    var top = randomBytes(seed, 3);
    var percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;
    return lower + parseInt((upper - lower) * percent);
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

function saveTests(tag, data) {
   var filename = path.resolve(__dirname, 'tests', tag + '.json.gz');

   var data = JSON.stringify(data, undefined, ' ') + '\n';
   fs.writeFileSync(filename, zlib.gzipSync(data));

   console.log('Save testcase: ' + filename);
}

function loadTests(tag) {
   var filename = path.resolve(__dirname, 'tests', tag + '.json.gz');
   return JSON.parse(zlib.gunzipSync(readFileSync(filename)));
}

function loadJson(filename) {
   var filename = path.resolve(__dirname, 'tests', filename);
   return JSON.parse(readFileSync(filename).toString());
}

function loadText(filename) {
   var filename = path.resolve(__dirname, filename);
   return readFileSync(filename).toString();
}


module.exports = {
    getEthers: getEthers,

    randomBytes: randomBytes,
    randomHexString: randomHexString,
    randomNumber:randomNumber,

    bigNumberify: bigNumber.bigNumberify,

    equals: equals,
    isHexString: convert.isHexString,
    hexlify: convert.hexlify,
    arrayify: convert.arrayify,

    loadTests: loadTests,
    saveTests: saveTests,

    loadJson: loadJson,
    loadText: loadText,
}
