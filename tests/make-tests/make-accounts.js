'use strict';

var fs = require('fs');

var ethereumUtil = require('ethereumjs-util');
var iban = require('web3/lib/web3/iban.js');

var utils = require('../utils.js');

function icap(address) {
    address = (iban.fromAddress(address))._iban;
    return address;
}

var Output = [];

// Some specific addresses to check
(function() {
    var Tests = [
        // Edge-cases
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000001',
        '0x0000000000000000000000000000000000000010',
        '0xfffffffffffffffffffffffffffffffffffffffe',
        '0xffffffffffffffffffffffffffffffffffffffff',

        // Exposes a padding bug in Web3
        // See: https://gist.github.com/ricmoo/dbc2133ae2a20978eaf7
        // See: https://github.com/ethereum/web3.js/pull/417
        '0x03582910e5bc7a12793da58559aba9a6c4138e44',
        '0x00582910e5bc7a12793da58559aba9a6c4138e44',
    ]

    Tests.forEach(function(address) {
        Output.push({
            address: address,
            checksumAddress: ethereumUtil.toChecksumAddress(address),
            icapAddress: icap(address),
            index: Output.length,
            name: ('address-' + address)
        });
    });
})();

// Some specific private keys to check
(function() {
    var Tests = [
        // Edge-cases
        '0x0000000000000000000000000000000000000000000000000000000000000001',
        '0x00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff00',
        '0x00fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0',
        '0x00ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        '0x0fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
        '0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd036413f',
        '0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364140',
    ]

    Tests.forEach(function(privateKey) {
        var privateKeyBuffer = Buffer.from(privateKey.substring(2), 'hex');
        var address = '0x' + ethereumUtil.privateToAddress(privateKeyBuffer).toString('hex');
        Output.push({
            address: address,
            checksumAddress: ethereumUtil.toChecksumAddress(address),
            icapAddress: icap(address),
            index: Output.length,
            name: ('privateKey-' + privateKey),
            privateKey: privateKey
        });
    });
})();
/*
Output.push({
    error: 'invalid private key',
    index: Ouput.length,
    name: 'privateKey-tooBig',
    privateKey: '0xfffffffffffffffffffffffffffffffebaaedce6af48a03bbfd25e8cd0364141',
});

Output.push({
    error: 'invalid private key',
    index: Ouput.length,
    name: 'privateKey-zero',
    privateKey: '0x0000000000000000000000000000000000000000000000000000000000000000',
});
*/

// Add 1024 random private keys (checks for nibble and byte padding bugs)
for (var i = 0; i < 1024; i++) {
    var privateKey = Buffer.from(utils.randomBytes('accounts-' + i, 32));
    var address = '0x' + ethereumUtil.privateToAddress(Buffer.from(privateKey)).toString('hex');

    Output.push({
         address: address,
         checksumAddress: ethereumUtil.toChecksumAddress(address),
         icapAddress: icap(address),
         index: Output.length,
         name: ('random-' + i),
         privateKey: '0x' + privateKey.toString('hex'),
    });
}

utils.saveTests('accounts', Output);

