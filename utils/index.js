'use strict';

// This is SUPER useful, but adds 140kb (even zipped, adds 40kb)
//var unorm = require('unorm');

var address = require('./address.js');
var bigNumber = require('./bignumber.js');
var contractAddress = require('./contract-address.js');
var convert = require('./convert.js');
var keccak256 = require('./keccak256.js');
var sha256 = require('./sha2.js').sha256;
var randomBytes = require('./random-bytes.js');
var properties = require('./properties.js');
var rlp = require('./rlp.js');
var utf8 = require('./utf8.js');
var units = require('./units.js');

////var xmlhttprequest = require('./xmlhttprequest.js');

/*
function cloneObject(object) {
    var clone = {};
    for (var key in object) { clone[key] = object[key]; }
    return clone;
}
*/

module.exports = {
    rlp: rlp,

    defineProperty: properties.defineProperty,

    // NFKD (decomposed)
    //etherSymbol: '\uD835\uDF63',

    // NFKC (composed)
    etherSymbol: '\u039e',

    arrayify: convert.arrayify,
    isArrayish: convert.isArrayish,

    concat: convert.concat,
    padZeros: convert.padZeros,
    stripZeros: convert.stripZeros,

    bigNumberify: bigNumber.bigNumberify,
    isBigNumber: bigNumber.isBigNumber,

    hexlify: convert.hexlify,
    isHexString: convert.isHexString,

    toUtf8Bytes: utf8.toUtf8Bytes,
    toUtf8String: utf8.toUtf8String,

    getAddress: address.getAddress,
    getContractAddress: contractAddress.getContractAddress,

    formatEther: units.formatEther,
    parseEther: units.parseEther,

    keccak256: keccak256,
    sha256: sha256,

    randomBytes: randomBytes,
}
