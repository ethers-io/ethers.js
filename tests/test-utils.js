'use strict';

var assert = require('assert');

var utils = require('./utils');
var ethers = utils.getEthers(__filename);

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
            this.timeout(120000);
            assert.equal(getContractAddress(test.tx), test.address, 'computes the transaction address');
        });
    });
});

describe('Test RLP Coder', function () {
    var rlp = ethers.utils.RLP;

    var tests = utils.loadTests('rlp-coder');

    tests.forEach(function(test) {
        it(('RLP coder encoded - ' + test.name), function() {
            this.timeout(120000);
            assert.equal(rlp.encode(test.decoded), test.encoded, 'RLP encoded - ' + test.name);
        });
    });

    tests.forEach(function(test) {
        it(('RLP coder decoded - ' + test.name), function() {
            this.timeout(120000);
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

        // We no longer support padding
        if (formatting.pad) { return; }

        it (('parses ' + test.ether + ' ether'), function() {
            assert.ok(ethers.utils.parseEther(test.ether.replace(/,/g, '')).eq(wei),
                'parsing ether failed - ' + test.name);
        });

        it (('formats ' + wei.toString() + ' wei (options: ' + JSON.stringify(formatting) + ')'), function() {
            var v = ethers.utils.formatEther(wei);
            if (formatting.commify) { v = ethers.utils.commify(v); }
            assert.equal(v, test.etherFormat,
                   'formatting wei failed - ' + test.name);
        });
    });

    tests.forEach(function(test) {
        var wei = ethers.utils.bigNumberify(test.wei);
        var formatting = test.format || {};

        ['kwei', 'mwei', 'gwei', 'szabo', 'finney', 'satoshi'].forEach(function(name) {

            var unitName = name;
            if (name === 'satoshi') { unitName = 8; }

            if (test[name]) {
                it(('parses ' + test[name] + ' ' + name), function() {
                    this.timeout(120000);
                    assert.ok(ethers.utils.parseUnits(test[name].replace(/,/g, ''), unitName).eq(wei),
                        ('parsing ' + name + ' failed - ' + test.name));
                });
            }

            if (test[name + '_format']) {
                it (('formats ' + wei.toString() + ' ' + name + ' (options: ' + JSON.stringify(formatting) + ')'), function() {
                    var v = ethers.utils.formatUnits(wei, unitName);
                    if (formatting.commify) { v = ethers.utils.commify(v); }
                    assert.equal(v, test[name + '_format'],
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
            this.timeout(120000);
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
            this.timeout(120000);
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
            this.timeout(120000);

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
        this.timeout(120000);
        tests.forEach(function(test) {
            assert.equal(ethers.utils.keccak256(test.data), test.keccak256, ('Keccak256 - ' + test.data));
        });
    });

    it('computes sha2566 correctly', function() {
        this.timeout(120000);
        tests.forEach(function(test) {
            assert.equal(ethers.utils.sha256(test.data), test.sha256, ('SHA256 - ' + test.data));
        });
    });
});

describe('Test Solidity splitSignature', function() {

    it('splits a canonical signature', function() {
        this.timeout(120000);
        var r = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
        var s = '0xcafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7e';
        for (var v = 27; v <= 28; v++) {
            var signature = ethers.utils.concat([ r, s, [ v ] ]);
            var sig = ethers.utils.splitSignature(signature);
            assert.equal(sig.r, r, 'split r correctly');
            assert.equal(sig.s, s, 'split s correctly');
            assert.equal(sig.v, v, 'split v correctly');
        }
    });

    it('splits a legacy signature', function() {
        this.timeout(120000);
        var r = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
        var s = '0xcafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7e';
        for (var v = 27; v <= 28; v++) {
            var signature = ethers.utils.concat([ r, s, [ v - 27 ] ]);
            var sig = ethers.utils.splitSignature(signature);
            assert.equal(sig.r, r, 'split r correctly');
            assert.equal(sig.s, s, 'split s correctly');
            assert.equal(sig.v, v, 'split v correctly');
        }
    });
});

describe('Test Base64 coder', function() {

    // https://en.wikipedia.org/wiki/Base64#Examples
    it('encodes and decodes the example from wikipedia', function() {
        this.timeout(120000);
        var decodedText = 'Man is distinguished, not only by his reason, but by this singular passion from other animals, which is a lust of the mind, that by a perseverance of delight in the continued and indefatigable generation of knowledge, exceeds the short vehemence of any carnal pleasure.';
        var decoded = ethers.utils.toUtf8Bytes(decodedText);
        var encoded = 'TWFuIGlzIGRpc3Rpbmd1aXNoZWQsIG5vdCBvbmx5IGJ5IGhpcyByZWFzb24sIGJ1dCBieSB0aGlzIHNpbmd1bGFyIHBhc3Npb24gZnJvbSBvdGhlciBhbmltYWxzLCB3aGljaCBpcyBhIGx1c3Qgb2YgdGhlIG1pbmQsIHRoYXQgYnkgYSBwZXJzZXZlcmFuY2Ugb2YgZGVsaWdodCBpbiB0aGUgY29udGludWVkIGFuZCBpbmRlZmF0aWdhYmxlIGdlbmVyYXRpb24gb2Yga25vd2xlZGdlLCBleGNlZWRzIHRoZSBzaG9ydCB2ZWhlbWVuY2Ugb2YgYW55IGNhcm5hbCBwbGVhc3VyZS4=';
        assert.equal(ethers.utils.base64.encode(decoded), encoded, 'encodes to base64 string');
        assert.equal(ethers.utils.toUtf8String(ethers.utils.base64.decode(encoded)), decodedText, 'decodes from base64 sstring');
    });
});

describe('Test UTF-8 coder', function() {
    var BadUTF = [
        // See: https://en.wikipedia.org/wiki/UTF-8#Overlong_encodings
        { bytes: [ 0xF0,0x82, 0x82, 0xAC ], reason: 'overlong', name: 'wikipedia overlong encoded Euro sign' },
        { bytes: [ 0xc0, 0x80 ], reason: 'overlong', name: '2-byte overlong - 0xc080' },
        { bytes: [ 0xc0, 0xbf ], reason: 'overlong', name: '2-byte overlong - 0xc0bf' },
        { bytes: [ 0xc1, 0x80 ], reason: 'overlong', name: '2-byte overlong - 0xc180' },
        { bytes: [ 0xc1, 0xbf ], reason: 'overlong', name: '2-byte overlong - 0xc1bf' },

        // Reserved UTF-16 Surrogate halves
        { bytes: [ 0xed, 0xa0, 0x80 ], reason: 'utf-16 surrogate', name: 'utf-16 surrogate - U+d800' },
        { bytes: [ 0xed, 0xbf, 0xbf ], reason: 'utf-16 surrogate', name: 'utf-16 surrogate - U+dfff' },

        // a leading byte not followed by enough continuation bytes
        { bytes: [ 0xdf ], reason: 'too short', name: 'too short - 2-bytes - 0x00' },
        { bytes: [ 0xe0 ], reason: 'too short', name: 'too short - 3-bytes' },
        { bytes: [ 0xe0, 0x80 ], reason: 'too short', name: 'too short - 3-bytes with 1' },

        { bytes: [ 0x80 ], reason: 'unexpected continuation byte', name: 'unexpected continuation byte' },
        { bytes: [ 0xc2, 0x00 ], reason: 'invalid continuation byte', name: 'invalid continuation byte - 0xc200' },
        { bytes: [ 0xc2, 0x40 ], reason: 'invalid continuation byte', name: 'invalid continuation byte - 0xc240' },
        { bytes: [ 0xc2, 0xc0 ], reason: 'invalid continuation byte', name: 'invalid continuation byte - 0xc2c0' },

        // Out of range
        { bytes: [ 0xf4, 0x90, 0x80, 0x80 ], reason: 'out-of-range', name: 'out of range' },
    ];

    BadUTF.forEach(function(test) {
        it('toUtf8String - ' + test.name, function() {
            assert.throws(function() {
                var result = ethers.utils.toUtf8String(test.bytes);
                console.log('Result', result);
            }, function(error) {
                return (error.message.split(';').pop().trim() === test.reason)
            }, test.name);
        });
    });

    it('toUtf8String - random conversions', function() {
        this.timeout(200000);

        function randomChar(seed) {
            switch (utils.randomNumber(seed + '-range', 0, 4)) {
                case 0:
                    return String.fromCharCode(utils.randomNumber(seed + '-value', 0, 0x100));
                case 1:
                    return String.fromCharCode(utils.randomNumber(seed + '-value', 0, 0xd800));
                case 2:
                    return String.fromCharCode(utils.randomNumber(seed + '-value', 0xdfff + 1, 0xffff));
                case 3:
                    var left = utils.randomNumber(seed + '-value', 0xd800, 0xdbff + 1);
                    var right = utils.randomNumber(seed + '-value', 0xdc00, 0xdfff + 1);
                    return String.fromCharCode(left, right);
            }

            throw new Error('this should not happen');
        }

        function randomString(seed) {
            var length = utils.randomNumber(seed + '-length', 1, 5);
            var str = '';
            for (var i = 0; i < length; i++) {
                str += randomChar(seed + '-char-' + i);
            }
            return str;
        }

        for (var i = 0; i < 100000; i++) {
            var seed = 'test-' + String(i);
            var str = randomString(seed);

            var bytes = ethers.utils.toUtf8Bytes(str)
            var str2 = ethers.utils.toUtf8String(bytes);

            assert.ok(Buffer.from(str).equals(Buffer.from(bytes)), 'bytes not generated correctly - ' + bytes)
            assert.equal(str2, str, 'conversion not reflexive - ' + bytes);
        }
    });
});

describe('Test Bytes32String coder', function() {
    // @TODO: a LOT more test cases; generated from Solidity
    it("encodes an ens name", function() {
        var str = "ricmoo.firefly.eth";
        var bytes32 = ethers.utils.formatBytes32String(str);
        var str2 = ethers.utils.parseBytes32String(bytes32);
        assert.equal(bytes32, '0x7269636d6f6f2e66697265666c792e6574680000000000000000000000000000', 'formatted correctly');
        assert.equal(str2, str, "parsed correctly");
    });
});

describe('Test BigNumber', function() {
    it("computes absoltue values", function() {
        function testAbs(test) {
            var value = ethers.utils.bigNumberify(test.value);
            var expected = ethers.utils.bigNumberify(test.expected);
            assert.ok(value.abs().eq(expected), 'BigNumber.abs - ' + test.value);
        }

        [
            { value: "0x0", expected: "0x0" },
            { value: "-0x0", expected: "0x0" },
            { value: "0x5", expected: "0x5" },
            { value: "-0x5", expected: "0x5" },
            { value: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", expected: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" },
            { value: "-0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", expected: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" },
            { value: "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", expected: "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" },
            { value: "-0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", expected: "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" },
        ].forEach(testAbs);
    });
});

describe("Hexlify", function() {
    it("hexlify on string of unsafe number", function() {
        assert(ethers.utils.hexlify(ethers.utils.bigNumberify("9985956830000000000")), "0x8a953ed43a892c00", "hexlify on large BigNumber");
    });

    [9007199254740991, 9985956830000000000].forEach(function(value) {
        it('hexlify fails on unsafe number - ' + value, function() {
            assert.throws(function() {
                var result = ethers.utils.hexlify(value);
                console.log('Result', result);
            }, function(error) {
                return (error.code === "NUMERIC_FAULT" && error.fault === "out-of-safe-range");
            }, "hexlify throws on out-of-range value - " + value);
        });
    });
});
