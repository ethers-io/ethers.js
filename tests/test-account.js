'use strict';

var assert = require('assert');

var utils = require('./utils');
var ethers = utils.getEthers(__filename);

describe('Private key generation', function() {
    var tests = utils.loadTests('accounts');
    tests.forEach(function(test) {
        if (!test.privateKey) { return; }
        it(('correctly converts private key - ' + test.name), function() {
            var wallet = new ethers.Wallet(test.privateKey);
            assert.equal(wallet.address.toLowerCase(), test.address.toLowerCase(),
                'correctly computes privateKey - ' + test.privateKey);
        });
    });
});

describe('Checksum and ICAP address generation', function() {
    var tests = utils.loadTests('accounts');
    tests.forEach(function(test) {
        it(('correctly transforms address - ' + test.name), function() {
            assert.equal(ethers.utils.getAddress(test.address), test.checksumAddress,
                'correctly computes checksum address from address');
            assert.equal(ethers.utils.getIcapAddress(test.address), test.icapAddress,
                'correctly computes ICAP address from address');
            assert.equal(ethers.utils.getAddress(test.checksumAddress), test.checksumAddress,
                'correctly computes checksum address from checksum address');
            assert.equal(ethers.utils.getIcapAddress(test.checksumAddress), test.icapAddress,
                'correctly computes ICAP address from checksum address');
            assert.equal(ethers.utils.getAddress(test.icapAddress), test.checksumAddress,
                'correctly computes checksum address from icap address');
            assert.equal(ethers.utils.getIcapAddress(test.icapAddress), test.icapAddress,
                'correctly computes ICAP address from icap address');
        });
    });
});
