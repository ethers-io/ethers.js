'use strict';

var assert = require('assert');

var utils = require('./utils');

function equals(a, b) {
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) {
            return false;
        }
        for (var i = 0; i < a.length; i++) {
            if (!equals(a[i], b[i])) { return false; }
        }
        return true;
    }

    return a === b;
}

describe('Test Contract Address Generation', function() {

    // @TODO: Mine a large collection of these from the blockchain

    var getContractAddress = require('../utils/contract-address.js').getContractAddress;

    // Transaction: 0x939aa17985bc2a52a0c1cba9497ef09e092355a805a8150e30e24b753bac6864
    var Tests = [
        {
            address: '0x3474627D4F63A678266BC17171D87f8570936622',
            name: 'tx-0x939aa17985bc2a52a0c1cba9497ef09e092355a805a8150e30e24b753bac6864',
            tx: {
                from: '0xb2682160c482eb985ec9f3e364eec0a904c44c23',
                nonce: 10,
            }
        },

        // Ropsten: 0x5bdfd14fcc917abc2f02a30721d152a6f147f09e8cbaad4e0d5405d646c5c3e1
        {
            address: '0x0CcCC7507aEDf9FEaF8C8D731421746e16b4d39D',
            name: 'zero-nonce',
            tx: {
                from: '0xc6af6e1a78a6752c7f8cd63877eb789a2adb776c',
                nonce: 0
            }
        },
    ]

    Tests.forEach(function(test) {
        it(('Computes the transaction address - ' + test.name), function() {
            assert.equal(getContractAddress(test.tx), test.address, 'computes the transaction address');
        });
    });
});

describe('Test RLP Coder', function () {
    var rlp = require('../utils/rlp.js');

    var tests = utils.loadTests('rlp-coder');

    tests.forEach(function(test) {
        it(('RLP coder encoded - ' + test.name), function() {
            assert.equal(rlp.encode(test.decoded), test.encoded, 'RLP encoded - ' + test.name);
        });
    });

    tests.forEach(function(test) {
        it(('RLP coder decoded - ' + test.name), function() {
            assert.ok(equals(rlp.decode(test.encoded), test.decoded),
                'RLP decoded - ' + test.name);
        });
    });
});

describe('Test Unit Conversion', function () {
    var units = require('../utils/units.js');
    var bigNumberify = require('../utils/bignumber.js').bigNumberify;

    var tests = utils.loadTests('units');
    tests.forEach(function(test) {
        var wei = bigNumberify(test.wei);
        var formatting = test.format || {};

        it (('parses ' + test.ether + ' ether'), function() {
            assert.ok(units.parseEther(test.ether).eq(wei),
                'parsing ether failed - ' + test.name);
        });

        it (('formats ' + wei.toHexString() + ' wei (options: ' + JSON.stringify(formatting) + ')'), function() {
            assert.equal(units.formatEther(wei, formatting), test.etherFormat,
                   'formatting wei failed - ' + test.name);
        });
    });

});

describe('Test Namehash', function() {
    var namehash = require('../utils/namehash');

    var tests = utils.loadTests('namehash');
    tests.forEach(function(test) {
        it(('computes namehash - "' + test.name + '"'), function() {
            assert.equal(namehash(test.name), test.expected,
                'computes namehash(' + test.name + ')');
        });
    });
});

describe('Test ID hash function', function () {
    var id = require('../utils/id');

    var tests = [
        {
            name: 'setAddr signature hash',
            text: 'setAddr(bytes32,address)',
            expected: '0xd5fa2b00b0756613052388dd576d941ba16904757996b8bb03a737ef4fd1f9ce'
        }
    ]

    tests.forEach(function(test) {
        it(('computes id - ' + test.name), function() {
            var value = id(test.text);
            assert.equal(value, test.expected,
                'computes id(' + test.text + ')');
        });
    });
});

// @TODO: Cryptographics hashes?
