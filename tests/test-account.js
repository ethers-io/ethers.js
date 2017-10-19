'use strict';

var assert = require('assert');

var utils = require('./utils');

describe('Private key generation', function() {
    var Wallet = require('../wallet/Wallet');

    var tests = utils.loadTests('accounts');
    tests.forEach(function(test) {
        if (!test.privateKey) { return; }
        it(('correctly converts private key - ' + test.name), function() {
            var wallet = new Wallet(test.privateKey);
            assert.equal(wallet.address.toLowerCase(), test.address.toLowerCase(),
                'correctly computes privateKey - ' + test.privateKey);
        });
    });
});

describe('Checksum and ICAP address generation', function() {
    var getAddress = require('../utils/address').getAddress;

    var tests = utils.loadTests('accounts');
    tests.forEach(function(test) {
        it(('correctly transforms address - ' + test.name), function() {
            assert.equal(getAddress(test.address), test.checksumAddress,
                'correctly computes checksum address from address');
            assert.equal(getAddress(test.address, true), test.icapAddress,
                'correctly computes ICAP address from address');
            assert.equal(getAddress(test.checksumAddress), test.checksumAddress,
                'correctly computes checksum address from checksum address');
            assert.equal(getAddress(test.checksumAddress, true), test.icapAddress,
                'correctly computes ICAP address from checksum address');
            assert.equal(getAddress(test.icapAddress), test.checksumAddress,
                'correctly computes checksum address from icap address');
            assert.equal(getAddress(test.icapAddress, true), test.icapAddress,
                'correctly computes ICAP address from icap address');
        });
    });
});
