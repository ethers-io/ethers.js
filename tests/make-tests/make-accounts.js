'use strict';

var fs = require('fs');

var ethereumUtil = require('ethereumjs-util');
var iban = require('web3/lib/web3/iban.js');

var utils = require('./utils.js');

function icap(address) {
    address = (iban.fromAddress(address))._iban;
    return address;
}

var Tests = [
    // Edge-cases
    '0x0000000000000000000000000000000000000000',
    '0x0000000000000000000000000000000000000001',
    '0xfffffffffffffffffffffffffffffffffffffffe',
    '0xffffffffffffffffffffffffffffffffffffffff',

    // Exposes a padding bug in Web3
    // See: https://github.com/ethereum/web3.js/pull/417
    '0x03582910e5bc7a12793da58559aba9a6c4138e44',
]

var OutputAddresses = [];
var OutputPrivateKeys = [];

Tests.forEach(function(address) {
     OutputAddresses.push({
         address: address,
         checksumAddress: ethereumUtil.toChecksumAddress(address),
         icapAddress: icap(address)
     });
});

for (var i = 0; i < 10000; i++) {
    var privateKey = utils.randomBytes('accounts-' + i, 32);
    var address = '0x' + ethereumUtil.privateToAddress(new Buffer(privateKey)).toString('hex');

    OutputAddresses.push({
         address: address,
         checksumAddress: ethereumUtil.toChecksumAddress(address),
         icapAddress: icap(address),
    });

    OutputPrivateKeys.push({
         address: address,
         checksumAddress: ethereumUtil.toChecksumAddress(address),
         icapAddress: icap(address),
         privateKey: utils.hexlify(privateKey),
    });
}

utils.saveTestcase('addresses', OutputAddresses);
utils.saveTestcase('private-keys', OutputPrivateKeys);

