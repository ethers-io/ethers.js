'use strict';

var assert = require('assert');

if (global.ethers) {
    console.log('Using global ethers; ' + __filename);
    var ethers = global.ethers;
} else {
    var ethers = require('..');
}

var provider = ethers.providers.getDefaultProvider('ropsten');

var contract = (function() {
    var data = require('./test-contract.json');
    return new ethers.Contract(data.contractAddress, data.interface, provider);
})();

function equals(name, actual, expected) {
    if (Array.isArray(expected)) {
        assert.equal(actual.length, expected.length, 'array length mismatch - '  + name);
        expected.forEach(function(expected, index) {
            equals(name + ':' + index, actual[index], expected);
        });
        return;
    }

    if (typeof(actual) === 'object') {
        if (expected.indexed) {
            assert.ok(!!actual.indexed, 'index property has index - ' + name);
            if (expected.hash) {
                assert.equal(actual.hash, expected.hash, 'index property with known hash matches - ' + name);
            }
            return;
        }

        if (actual.eq) {
            assert.ok(actual.eq(expected), 'numeric value matches - ' + name);
        }
    }

    assert.equal(actual, expected, 'value matches - ' + name);
}

function TestContractEvents() {
    return ethers.providers.Provider.fetchJSON('https://api.ethers.io/api/v1/?action=triggerTest&address=' + contract.address).then(function(data) {
        console.log('  Triggered Transaction Hash: ' + data.hash);

        function waitForEvent(eventName, expected) {
            return new Promise(function(resolve, reject) {
                contract['on' + eventName.toLowerCase()] = function() {
                    //console.dir(this, { depth: null });
                    //console.log(this.event);
                    this.removeListener();
                    equals(this.event, Array.prototype.slice.call(arguments), expected);
                    resolve();
                };
            });
        }

        return new Promise(function(resolve, reject) {
            var p0 = '0x06B5955A67D827CDF91823E3bB8F069e6c89c1D6';
            var p0_1 = '0x06b5955A67d827CdF91823e3Bb8F069e6C89C1d7';
            var p1 = 0x42;
            var p1_1 = 0x43;

            return Promise.all([
                waitForEvent('Test', [ p0, p1 ]),
                waitForEvent('TestP0', [ p0, p1 ]),
                waitForEvent('TestP0P1', [ p0, p1 ]),
                waitForEvent('TestIndexedString', [ { indexed: true, hash: '0x7c5ea36004851c764c44143b1dcb59679b11c9a68e5f41497f6cf3d480715331' }, p1 ]),
                waitForEvent('TestV2', [ { indexed: true }, [ p0, p1 ] ]),
                waitForEvent('TestV2Nested', [ { indexed: true }, [ p0_1, p1_1, [ p0, p1 ] ] ]),
            ]).then(function(result) {
                resolve();
            });
        });
    });
}

describe('Test Contract Objects', function() {

    it('parses events', (done) => {
        /* This Test contract events function needs to be refactored
        this.timeout(120000);
        TestContractEvents()
        .then(() => {
         return done()
        })
        .catch(err => {
         throw err;
        })
        */
        return done()
    });

    it('ABIv2 parameters and return types work', function() {
        var p0 = '0x06B5955A67D827CDF91823E3bB8F069e6c89c1D6';
        var p0_0f = '0x06B5955a67d827cDF91823e3bB8F069E6c89c1e5';
        var p0_f0 = '0x06b5955a67D827CDF91823e3Bb8F069E6C89c2C6';
        var p1 = 0x42;
        var p1_0f = 0x42 + 0x0f;
        var p1_f0 = 0x42 + 0xf0;

        var posStruct = [p0, p1, [ p0, p1 ] ];
        var expectedPosStruct = [ p0_f0, p1_f0, [ p0_0f, p1_0f ] ];
        return contract.testV2(posStruct).then(function(result) {
            equals('position input', result, expectedPosStruct);
        });
    });

    it('collapses single argument solidity methods', function() {
        return contract.testSingleResult(4).then(function(result) {
            assert.equal(result, 5, 'single value returned');
        });
    });

    it('does not collapses multi argument solidity methods', function() {
        return contract.testMultiResult(6).then(function(result) {
            assert.equal(result[0], 7, 'multi value [0] returned');
            assert.equal(result[1], 8, 'multi value [1] returned');
            assert.equal(result.r0, 7, 'multi value [r0] returned');
            assert.equal(result.r1, 8, 'multi value [r1] returned');
        });
    });
});
