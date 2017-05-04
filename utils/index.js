'use strict';

// This is SUPER useful, but adds 140kb (even zipped, adds 40kb)
//var unorm = require('unorm');

var address = require('./address');
var bigNumber = require('./bignumber');
var contractAddress = require('./contract-address');
var convert = require('./convert');
var keccak256 = require('./keccak256');
var namehash = require('./namehash');
var sha256 = require('./sha2').sha256;
var randomBytes = require('./random-bytes');
var properties = require('./properties');
var RLP = require('./rlp');
var utf8 = require('./utf8');
var units = require('./units');


module.exports = {
    RLP: RLP,

    defineProperty: properties.defineProperty,

    // NFKD (decomposed)
    //etherSymbol: '\uD835\uDF63',

    // NFKC (composed)
    etherSymbol: '\u039e',

    arrayify: convert.arrayify,

    concat: convert.concat,
    padZeros: convert.padZeros,
    stripZeros: convert.stripZeros,

    bigNumberify: bigNumber.bigNumberify,

    hexlify: convert.hexlify,

    toUtf8Bytes: utf8.toUtf8Bytes,
    toUtf8String: utf8.toUtf8String,

    namehash: namehash,

    getAddress: address.getAddress,
    getContractAddress: contractAddress.getContractAddress,

    formatEther: units.formatEther,
    parseEther: units.parseEther,

    keccak256: keccak256,
    sha256: sha256,

    randomBytes: randomBytes,
}

require('./standalone')({
    utils: module.exports
});

