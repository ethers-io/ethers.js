'use strict';
var Wallet = require('../index.js');

var ethereumUtil = require('ethereumjs-util');
var iban = require('../node_modules/web3/lib/web3/iban.js');

var utils = require('./utils.js');

module.exports = function(test) {
    function testAddress(address) {
        var officialIban = (iban.fromAddress(address))._iban;

        var ethersAddress = Wallet.getAddress(officialIban);
        var officialAddress = ethereumUtil.toChecksumAddress(address)

        var ethersIban = Wallet.getIcapAddress(address);

        test.equal(ethersAddress, officialAddress, 'wrong address');
        test.equal(ethersIban, officialIban, 'wrong ICAP address');
    }

    test.expect(2 * (2 + 10000));

    testAddress('0x0000000000000000000000000000000000000000');
    testAddress('0xffffffffffffffffffffffffffffffffffffffff');
    for (var i = 0; i < 10000; i++) {
        testAddress(utils.randomHexString(20));
    }

    test.done();
};

module.exports.testSelf = module.exports;

