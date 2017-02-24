'use strict';

var ethersAddress = require('../utils/address.js');

var ethereumUtil = require('ethereumjs-util');
var iban = require('../node_modules/web3/lib/web3/iban.js');

var utils = require('./utils.js');

module.exports = function(test) {
    function testAddress(address) {
        var officialIban = (iban.fromAddress(address))._iban;

        var address = ethersAddress.getAddress(officialIban);
        var officialAddress = ethereumUtil.toChecksumAddress(address)

        var ethersIban = ethersAddress.getAddress(address, true);

        test.equal(address, officialAddress, 'wrong address');
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

