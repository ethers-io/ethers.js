'use strict';

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

function testAddress(test) {
    var getAddress = require('../utils/address.js').getAddress;

    var testcases = require('./tests/addresses.json');
    testcases.forEach(function(testcase) {
        test.equal(getAddress(testcase.address), testcase.checksumAddress, 'getAddress failed to match checsum address');
        test.equal(getAddress(testcase.address, true), testcase.icapAddress, 'getAddress failed to match ICAP address');
    });

    test.done();
}

function testContractAddress(test) {

    // @TODO: Mine a large collection of these from the blockchain

    var getContractAddress = require('../utils/contract-address.js').getContractAddress;

    // Transaction: 0x939aa17985bc2a52a0c1cba9497ef09e092355a805a8150e30e24b753bac6864
    var transaction = {
        from: '0xb2682160c482eb985ec9f3e364eec0a904c44c23',
        nonce: 10,
    }

    test.equal(
        getContractAddress(transaction),
        "0x3474627D4F63A678266BC17171D87f8570936622",
        'Failed to match contract address'
    )

    // Ropsten: 0x5bdfd14fcc917abc2f02a30721d152a6f147f09e8cbaad4e0d5405d646c5c3e1
    transaction = {
        from: '0xc6af6e1a78a6752c7f8cd63877eb789a2adb776c',
        nonce: 0
    };

    test.equal(
        getContractAddress(transaction),
        '0x0CcCC7507aEDf9FEaF8C8D731421746e16b4d39D',
        'zero nonce'
    );

    test.done();
}

function testRLPCoder(test) {
    var rlp = require('../utils/rlp.js');

    var testcases = require('./tests/rlp-coder.json');
    testcases.forEach(function(testcase) {
        test.equal(rlp.encode(testcase.decoded), testcase.encoded, 'RLP encoding failed - ' + testcase.name);
        test.ok(equals(rlp.decode(testcase.encoded), testcase.decoded), 'RLP decoding failed - ' + testcase.name);
    });

    test.done();
}

function testUnits(test) {
    var units = require('../utils/units.js');
    var bigNumberify = require('../utils/bignumber.js').bigNumberify;

    var testcases = require('./tests/units.json');
    testcases.forEach(function(testcase) {
        var wei = bigNumberify(testcase.wei);
        var formatting = testcase.format || {};

        test.ok(units.parseEther(testcase.ether).eq(wei),
                'parsing ether failed - ' + testcase.name);

        test.equal(units.formatEther(wei, formatting), testcase.etherFormat,
                   'formatting wei failed - ' + testcase.name);
    });

    test.done();
}

module.exports = {
    "address": testAddress,
    "contract-address": testContractAddress,
    "rlp-coder": testRLPCoder,
    "units": testUnits,
}

