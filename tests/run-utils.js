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
    "rlp-coder": testRLPCoder,
    "units": testUnits,
}

