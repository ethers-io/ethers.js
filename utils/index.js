'use strict';

// This is SUPER useful, but adds 140kb (even zipped, adds 40kb)
//var unorm = require('unorm');

var address = require('./address');
var AbiCoder = require('./abi-coder');
var base64 = require('./base64');
var bigNumber = require('./bignumber');
var contractAddress = require('./contract-address');
var convert = require('./convert');
var id = require('./id');
var keccak256 = require('./keccak256');
var namehash = require('./namehash');
var sha256 = require('./sha2').sha256;
var solidity = require('./solidity');
var randomBytes = require('./random-bytes');
var properties = require('./properties');
var RLP = require('./rlp');
var utf8 = require('./utf8');
var units = require('./units');


module.exports = {
    AbiCoder: AbiCoder,

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

    base64: base64,

    bigNumberify: bigNumber.bigNumberify,
    BigNumber: bigNumber.BigNumber,

    hexlify: convert.hexlify,

    toUtf8Bytes: utf8.toUtf8Bytes,
    toUtf8String: utf8.toUtf8String,

    namehash: namehash,
    id: id,

    getAddress: address.getAddress,
    getContractAddress: contractAddress.getContractAddress,

    formatEther: units.formatEther,
    parseEther: units.parseEther,

    formatUnits: units.formatUnits,
    parseUnits: units.parseUnits,

    keccak256: keccak256,
    sha256: sha256,

    randomBytes: randomBytes,

    solidityPack: solidity.pack,
    solidityKeccak256: solidity.keccak256,
    soliditySha256: solidity.sha256,

    splitSignature: convert.splitSignature,
}
