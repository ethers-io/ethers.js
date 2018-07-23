'use strict';

var assert = require('assert');

if (global.ethers) {
    console.log('Using global ethers; ' + __filename);
    var ethers = global.ethers;
} else {
    var ethers = require('..');
}

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

    var getContractAddress = ethers.utils.getContractAddress;

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
    var rlp = ethers.utils.RLP;

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

    var tests = utils.loadTests('units');

    tests.forEach(function(test) {
        var wei = ethers.utils.bigNumberify(test.wei);
        var formatting = test.format || {};

        it (('parses ' + test.ether + ' ether'), function() {
            assert.ok(ethers.utils.parseEther(test.ether).eq(wei),
                'parsing ether failed - ' + test.name);
        });

        it (('formats ' + wei.toString() + ' wei (options: ' + JSON.stringify(formatting) + ')'), function() {
            assert.equal(ethers.utils.formatEther(wei, formatting), test.etherFormat,
                   'formatting wei failed - ' + test.name);
        });
    });

    tests.forEach(function(test) {
        var wei = ethers.utils.bigNumberify(test.wei);
        var formatting = test.format || {};

        ['kwei', 'mwei', 'gwei', 'szabo', 'finny', 'satoshi'].forEach(function(name) {

            var unitName = name;
            if (name === 'satoshi') { unitName = 8; }

            if (test[name]) {
                it(('parses ' + test[name] + ' ' + name), function() {
                    assert.ok(ethers.utils.parseUnits(test[name], unitName).eq(wei),
                        ('parsing ' + name + ' failed - ' + test.name));
                });
            }

            if (test[name + '_format']) {
                it (('formats ' + wei.toString() + ' ' + name + ' (options: ' + JSON.stringify(formatting) + ')'), function() {
                    assert.equal(ethers.utils.formatUnits(wei, unitName, formatting), test[name + '_format'],
                        ('formats ' + name + ' - ' + test.name));
                });
            }
        });
    });

});


describe('Test Namehash', function() {
    var tests = utils.loadTests('namehash');
    tests.forEach(function(test) {
        it(('computes namehash - "' + test.name + '"'), function() {
            assert.equal(ethers.utils.namehash(test.name), test.expected,
                'computes namehash(' + test.name + ')');
        });
    });
});

describe('Test ID Hash Function', function () {
    var tests = [
        {
            name: 'setAddr signature hash',
            text: 'setAddr(bytes32,address)',
            expected: '0xd5fa2b00b0756613052388dd576d941ba16904757996b8bb03a737ef4fd1f9ce'
        }
    ]

    tests.forEach(function(test) {
        it(('computes id - ' + test.name), function() {
            var value = ethers.utils.id(test.text);
            assert.equal(value, test.expected,
                'computes id(' + test.text + ')');
        });
    });
});

describe('Test Solidity Hash Functions', function() {
    var tests = utils.loadTests('solidity-hashes');
    ['Keccak256', 'Sha256'].forEach(function(funcName) {
        it(('computes ' + funcName + ' correctly'), function() {
            tests.forEach(function(test, index) {
                var result = ethers.utils['solidity' + funcName](test.types, test.values);
                assert.equal(result, test[funcName.toLowerCase()],
                    ('computes solidity-' + funcName + '(' + JSON.stringify(test.values) + ') - ' + test.types));
            });
        });
    });
});

describe('Test Hash Functions', function() {

    var tests = utils.loadTests('hashes');

    it('computes keccak256 correctly', function() {
        tests.forEach(function(test) {
            assert.equal(ethers.utils.keccak256(test.data), test.keccak256, ('Keccak256 - ' + test.data));
        });
    });

    it('computes sha2566 correctly', function() {
        tests.forEach(function(test) {
            assert.equal(ethers.utils.sha256(test.data), test.sha256, ('SHA256 - ' + test.data));
        });
    });
});

describe('Test Solidity splitSignature', function() {
    var convert = require('../utils/convert');

    it('splits a canonical signature', function() {
        var r = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
        var s = '0xcafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7e';
        for (var v = 27; v <= 28; v++) {
            var signature = convert.concat([ r, s, [ v ] ]);
            var sig = convert.splitSignature(signature);
            assert.equal(sig.r, r, 'split r correctly');
            assert.equal(sig.s, s, 'split s correctly');
            assert.equal(sig.v, v, 'split v correctly');
        }
    });

    it('splits a legacy signature', function() {
        var r = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
        var s = '0xcafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7e';
        for (var v = 27; v <= 28; v++) {
            var signature = convert.concat([ r, s, [ v - 27 ] ]);
            var sig = convert.splitSignature(signature);
            assert.equal(sig.r, r, 'split r correctly');
            assert.equal(sig.s, s, 'split s correctly');
            assert.equal(sig.v, v, 'split v correctly');
        }
    });
});

describe('Test Base64 coder', function() {

    var utf8 = require('../utils/utf8')
    var base64 = require('../utils').base64;

    // https://en.wikipedia.org/wiki/Base64#Examples
    it('encodes and decodes the example from wikipedia', function() {
        var decodedText = 'Man is distinguished, not only by his reason, but by this singular passion from other animals, which is a lust of the mind, that by a perseverance of delight in the continued and indefatigable generation of knowledge, exceeds the short vehemence of any carnal pleasure.';
        var decoded = utf8.toUtf8Bytes(decodedText);
        var encoded = 'TWFuIGlzIGRpc3Rpbmd1aXNoZWQsIG5vdCBvbmx5IGJ5IGhpcyByZWFzb24sIGJ1dCBieSB0aGlzIHNpbmd1bGFyIHBhc3Npb24gZnJvbSBvdGhlciBhbmltYWxzLCB3aGljaCBpcyBhIGx1c3Qgb2YgdGhlIG1pbmQsIHRoYXQgYnkgYSBwZXJzZXZlcmFuY2Ugb2YgZGVsaWdodCBpbiB0aGUgY29udGludWVkIGFuZCBpbmRlZmF0aWdhYmxlIGdlbmVyYXRpb24gb2Yga25vd2xlZGdlLCBleGNlZWRzIHRoZSBzaG9ydCB2ZWhlbWVuY2Ugb2YgYW55IGNhcm5hbCBwbGVhc3VyZS4=';
        assert.equal(base64.encode(decoded), encoded, 'encodes to base64 string');
        assert.equal(utf8.toUtf8String(base64.decode(encoded)), decodedText, 'decodes from base64 sstring');
    });
});


describe('Test coderNumber', function() {
    var coder = utils.abiCoder.defaultCoder;
    describe('uint8', function() {
        describe('encode', function() {
            function testUint8Encode(input, expected) {
                var encoded = coder.encode(['uint8'], [input]);
                assert.equal(encoded.toString('hex'), expected.toString('hex'));
            }
            it('min value', function() {
                testUint8Encode(
                    '0',
                    '0x0000000000000000000000000000000000000000000000000000000000000000'
                );
            });
            it('middle value', function() {
                testUint8Encode(
                    '12',
                    '0x000000000000000000000000000000000000000000000000000000000000000c'
                );
            });
            it('max value', function() {
                testUint8Encode(
                    '255',
                    '0x00000000000000000000000000000000000000000000000000000000000000ff'
                );
            });
            it('throws for min value - 1', function() {
                var input = '-1';
                assert.throws(() => coder.encode(['uint8'], [input]));
            });
            it('throws for max value + 1', function() {
                var input = '256';
                assert.throws(() => coder.encode(['uint8'], [input]));
            });
        });
        describe('decode', function() {
            function testUint8Decode(encoded, expected) {
                var decoded = coder.decode(['uint8'], encoded);
                assert.equal(decoded.toString(), expected);
            }
            it('min value', function() {
                testUint8Decode(
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0'
                );
            });
            it('middle value', function() {
                testUint8Decode(
                    '0x000000000000000000000000000000000000000000000000000000000000000c',
                    '12'
                );
            });
            it('max value', function() {
                testUint8Decode(
                    '0x00000000000000000000000000000000000000000000000000000000000000ff',
                    '255'
                );
            });
        });
    });
    describe('uint256', function() {
        describe('encode', function() {
            function testUint256Encode(input, expected) {
                var encoded = coder.encode(['uint256'], [input]);
                assert.equal(encoded.toString('hex'), expected.toString('hex'));
            }
            it('min value', function() {
                testUint256Encode(
                    '0',
                    '0x0000000000000000000000000000000000000000000000000000000000000000'
                );
            });
            it('middle value', function() {
                testUint256Encode(
                    '123456789',
                    '0x00000000000000000000000000000000000000000000000000000000075bcd15'
                );
            });
            it('max value', function() {
                testUint256Encode(
                    '115792089237316195423570985008687907853269984665640564039457584007913129639935',
                    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
                );
            });
            it('throws for min value - 1', function() {
                var input = '-1';
                assert.throws(() => coder.encode(['uint256'], [input]));
            });
            it('throws for max value + 1', function() {
                var input =
                    '115792089237316195423570985008687907853269984665640564039457584007913129639936';
                assert.throws(() => coder.encode(['uint256'], [input]));
            });
        });
        describe('decode', function() {
            function testUint256Decode(encoded, expected) {
                var decoded = coder.decode(['uint256'], encoded);
                assert.equal(decoded.toString(), expected);
            }
            it('min value', function() {
                testUint256Decode(
                    '0x0000000000000000000000000000000000000000000000000000000000000000',
                    '0'
                );
            });
            it('middle value', function() {
                testUint256Decode(
                    '0x00000000000000000000000000000000000000000000000000000000075bcd15',
                    '123456789'
                );
            });
            it('max value', function() {
                testUint256Decode(
                    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
                    '115792089237316195423570985008687907853269984665640564039457584007913129639935'
                );
            });
        });
    });
    describe('int8', function() {
        describe('encode', function() {
            function testInt8Encode(input, expected) {
                var encoded = coder.encode(['int8'], [input]);
                assert.equal(encoded.toString('hex'), expected.toString('hex'));
            }
            it('min value', function() {
                testInt8Encode(
                    '-128',
                    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff80'
                );
            });
            it('negative middle value', function() {
                testInt8Encode(
                    '-12',
                    '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff4'
                );
            });
            it('middle value', function() {
                testInt8Encode(
                    '12',
                    '0x000000000000000000000000000000000000000000000000000000000000000c'
                );
            });
            it('max value', function() {
                testInt8Encode(
                    '127',
                    '0x000000000000000000000000000000000000000000000000000000000000007f'
                );
            });
            it('throws for min value - 1', function() {
                var input = '-129';
                assert.throws(() => coder.encode(['int8'], [input]));
            });
            it('throws for max value + 1', function() {
                var input = '128';
                assert.throws(() => coder.encode(['int8'], [input]));
            });
        });
        describe('decode', function() {
            function testInt8Decode(encoded, expected) {
                var decoded = coder.decode(['int8'], encoded);
                assert.equal(decoded.toString(), expected);
            }
            it('min value', function() {
                testInt8Decode(
                    '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff80',
                    '-128'
                );
            });
            it('negative middle value', function() {
                testInt8Decode(
                    '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff4',
                    '-12'
                );
            });
            it('middle value', function() {
                testInt8Decode(
                    '0x000000000000000000000000000000000000000000000000000000000000000c',
                    '12'
                );
            });
            it('max value', function() {
                testInt8Decode(
                    '0x000000000000000000000000000000000000000000000000000000000000007f',
                    '127'
                );
            });
      });
    });
    describe('int256', function() {
        describe('encode', function() {
            function testInt256Encode(input, expected) {
                var encoded = coder.encode(['int256'], [input]);
                assert.equal(encoded.toString('hex'), expected.toString('hex'));
            }
            it('min value', function() {
                testInt256Encode(
                    '-57896044618658097711785492504343953926634992332820282019728792003956564819968',
                    '0x8000000000000000000000000000000000000000000000000000000000000000'
                );
            });
            it('negative middle value', function() {
                testInt256Encode(
                    '-123456789',
                    '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffff8a432eb'
                );
            });
            it('middle value', function() {
                testInt256Encode(
                    '123456789',
                    '0x00000000000000000000000000000000000000000000000000000000075bcd15'
                );
            });
            it('max value', function() {
                testInt256Encode(
                    '57896044618658097711785492504343953926634992332820282019728792003956564819967',
                    '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
                );
            });
            it('throws for min value - 1', function() {
                var input =
                    '-57896044618658097711785492504343953926634992332820282019728792003956564819969';
                assert.throws(() => coder.encode(['int256'], [input]));
            });
            it('throws for max value + 1', function() {
                var input =
                    '57896044618658097711785492504343953926634992332820282019728792003956564819968';
                assert.throws(() => coder.encode(['int256'], [input]));
            });
        });
        describe('decode', function() {
            function testInt256Decode(encoded, expected) {
                var decoded = coder.decode(['int256'], encoded);
                assert.equal(decoded.toString(), expected);
            }
            it('min value', function() {
                testInt256Decode(
                    '0x8000000000000000000000000000000000000000000000000000000000000000',
                    '-57896044618658097711785492504343953926634992332820282019728792003956564819968'
                );
            });
            it('negative middle value', function() {
                testInt256Decode(
                    '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffff8a432eb',
                    '-123456789'
                );
            });
            it('middle value', function() {
                testInt256Decode(
                    '0x00000000000000000000000000000000000000000000000000000000075bcd15',
                    '123456789'
                );
            });
            it('max value', function() {
                testInt256Decode(
                    '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
                    '57896044618658097711785492504343953926634992332820282019728792003956564819967'
                );
            });
        });
    });
});
