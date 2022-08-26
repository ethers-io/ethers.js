'use strict';

import assert from 'assert';

import { ethers } from "ethers";
import { loadTests, TestCase } from "@ethersproject/testcases";

import * as utils from './utils';


function equals(a: any, b: any): boolean {
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (!equals(a[i], b[i])) { return false; }
        }
        return true;
    }

    return a === b;
}

describe('Test Contract Address Generation', function() {

    // @TODO: Mine a large collection of these from the blockchain

    let getContractAddress = ethers.utils.getContractAddress;

    let Tests = [
        // Transaction: 0x939aa17985bc2a52a0c1cba9497ef09e092355a805a8150e30e24b753bac6864
        {
            address: '0x3474627D4F63A678266BC17171D87f8570936622',
            name: 'tx-0x939aa179 (number)',
            tx: {
                from: '0xb2682160c482eb985ec9f3e364eec0a904c44c23',
                nonce: 10,
            }
        },

        {
            address: '0x3474627D4F63A678266BC17171D87f8570936622',
            name: 'tx-0x939aa179 (odd-zero-hex)',
            tx: {
                from: '0xb2682160c482eb985ec9f3e364eec0a904c44c23',
                nonce: "0xa",
            }
        },

        {
            address: '0x3474627D4F63A678266BC17171D87f8570936622',
            name: 'tx-0x939aa179 (even-zero-hex)',
            tx: {
                from: '0xb2682160c482eb985ec9f3e364eec0a904c44c23',
                nonce: "0x0a",
            }
        },

        // Ropsten: https://etherscan.io/tx/0x78d17f8ab31fb6ad688340634a9a29d8726feb6d588338a9b9b21a44159bc916
        {
            address: '0x271300790813f82638A8A6A8a86d65df6dF33c17',
            name: 'tx-0x78d17f8a (odd-long-hex)',
            tx: {
                from: '0x8ba1f109551bd432803012645ac136ddd64dba72',
                nonce: "0x200",
            }
        },

        {
            address: '0x271300790813f82638A8A6A8a86d65df6dF33c17',
            name: 'tx-0x78d17f8a (even-long-hex)',
            tx: {
                from: '0x8ba1f109551bd432803012645ac136ddd64dba72',
                nonce: "0x0200",
            }
        },

        // https://ropsten.etherscan.io/tx/0x444ea8ae9890ac0ee5fd249512726abf9d23f44a378d5f45f727b65dc1b899c2
        {
            address: '0x995C25706C407a1F1E84b3777775e3e619764933',
            name: 'tx-0x444ea8ae (even-long-hex)',
            tx: {
                from: '0x8ba1f109551bd432803012645ac136ddd64dba72',
                nonce: "0x1d",
            }
        },

        {
            address: '0x995C25706C407a1F1E84b3777775e3e619764933',
            name: 'tx-0x444ea8ae (padded-long-hex)',
            tx: {
                from: '0x8ba1f109551bd432803012645ac136ddd64dba72',
                nonce: "0x001d",
            }
        },

        {
            address: '0x995C25706C407a1F1E84b3777775e3e619764933',
            name: 'tx-0x444ea8ae (number)',
            tx: {
                from: '0x8ba1f109551bd432803012645ac136ddd64dba72',
                nonce: 29,
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

describe('Test RLP Coder', function() {
    type TestCase = {
        name: string,

        decoded: string,
        encoded: string
    };

    const tests: Array<TestCase> = loadTests('rlp-coder');

    tests.forEach(function(test) {
        it(('RLP coder encoded - ' + test.name), function() {
            this.timeout(120000);
            assert.equal(ethers.utils.RLP.encode(test.decoded), test.encoded, 'RLP encoded - ' + test.name);
        });
    });

    tests.forEach((test: TestCase) => {
        it(('RLP coder decoded - ' + test.name), function() {
            this.timeout(120000);
            assert.ok(equals(ethers.utils.RLP.decode(test.encoded), test.decoded),
                'RLP decoded - ' + test.name);
        });
    });
});

describe('Test Unit Conversion', function () {

    const tests: Array<TestCase.Unit> = loadTests('units');

    tests.forEach((test) => {
        let wei = ethers.BigNumber.from(test.wei);

        it (('parses ' + test.ether + ' ether'), function() {
            assert.ok(ethers.utils.parseEther(test.ether.replace(/,/g, '')).eq(wei),
                'parsing ether failed - ' + test.name);
        });

        it (('formats ' + wei.toString() + ' wei to ether'), function() {
            let actual = ethers.utils.formatEther(wei);
            assert.equal(actual, test.ether_format,
                   'formatting wei failed - ' + test.name);
        });
    });

    tests.forEach((test) => {
        let wei = ethers.BigNumber.from(test.wei);

        type UnitName = 'kwei' | 'mwei' | 'gwei' | 'szabo' | 'finney' | 'satoshi'
        type UnitNameFormat = 'kwei_format' | 'mwei_format' | 'gwei_format' | 'szabo_format' | 'finney_format' | 'satoshi_format'

        ['kwei', 'mwei', 'gwei', 'szabo', 'finney', 'satoshi'].forEach((name: UnitName) => {

            let unitName: string | number = name;
            if (name === 'satoshi') { unitName = 8; }

            if (test[name]) {
                it(('parses ' + test[name] + ' ' + name), function() {
                    this.timeout(120000);
                    assert.ok(ethers.utils.parseUnits(test[name].replace(/,/g, ''), unitName).eq(wei),
                        ('parsing ' + name + ' failed - ' + test.name));
                });
            }

            let expectedKey: UnitNameFormat = (<UnitNameFormat>(name + '_format'));
            if (test[expectedKey]) {
                it (('formats ' + wei.toString() + ' wei to ' + name + ')'), function() {
                    let actual = ethers.utils.formatUnits(wei, unitName);
                    let expected = test[expectedKey];
                    assert.equal(actual, expected,
                        ('formats ' + name + ' - ' + test.name));
                });
            }
        });
    });

    it("formats with commify", function() {
        const tests: { [ testcase: string ]: string } = {
            "0.0": "0.0",
            ".0": "0.0",
            "0.": "0.0",
            "00.00": "0.0",

            "100.000": "100.0",
            "100.0000": "100.0",
            "1000.000": "1,000.0",
            "1000.0000": "1,000.0",

            "100.123": "100.123",
            "100.1234": "100.1234",
            "1000.1234": "1,000.1234",
            "1000.12345": "1,000.12345",

            "998998998998.123456789": "998,998,998,998.123456789",
        };

        Object.keys(tests).forEach((test) => {
            assert.equal(ethers.utils.commify(test), tests[test]);
        });
    });

    // See #2016; @TODO: Add more tests along these lines
    it("checks extra tests", function() {
        assert.ok(ethers.utils.parseUnits("2", 0).eq(2), "folds trailing zeros without decimal: 2");
        assert.ok(ethers.utils.parseUnits("2.", 0).eq(2), "folds trailing zeros without decimal: 2.");
        assert.ok(ethers.utils.parseUnits("2.0", 0).eq(2), "folds trailing zeros without decimal: 2.0");
        assert.ok(ethers.utils.parseUnits("2.00", 0).eq(2), "folds trailing zeros without decimal: 2.00");

        assert.ok(ethers.utils.parseUnits("2", 1).eq(20), "folds trailing zeros: 2");
        assert.ok(ethers.utils.parseUnits("2.", 1).eq(20), "folds trailing zeros: 2.");
        assert.ok(ethers.utils.parseUnits("2.0", 1).eq(20), "folds trailing zeros: 2.0");
        assert.ok(ethers.utils.parseUnits("2.00", 1).eq(20), "folds trailing zeros: 2.00");

        assert.ok(ethers.utils.parseUnits("2.5", 1).eq(25), "folds trailing zeros: 2.5");
        assert.ok(ethers.utils.parseUnits("2.50", 1).eq(25), "folds trailing zeros: 2.50");
        assert.ok(ethers.utils.parseUnits("2.500", 1).eq(25), "folds trailing zeros: 2.500");
    });
});


describe('Test Namehash', function() {
    type TestCase = {
         expected: string,
         name: string
    };

    const tests: Array<TestCase> = loadTests('namehash');

    tests.forEach((test: TestCase) => {
        it(('computes namehash - "' + test.name + '"'), function() {
            this.timeout(120000);
            assert.equal(ethers.utils.namehash(test.name), test.expected,
                'computes namehash(' + test.name + ')');
        });
    });

    const goodNames = [
        "ricmoo.eth",
        "foo",
        "foo.bar",
    ];

    const badNames = [
        ".",
        "..",
        "ricmoo..eth",
        "ricmoo...eth",
        ".foo",
        "foo.",
    ];

    // The empty string is not a valid name, but has the zero hash
    // as its namehash, which may be used for recursive purposes
    it("empty ENS name", function() {
        assert.ok(!ethers.utils.isValidName(""));
    });

    goodNames.forEach((name) => {
        it(`ENS namehash ok - ${ name }`, function() {
            assert.ok(ethers.utils.isValidName(name));
            ethers.utils.namehash(name);
        });
    });

    badNames.forEach((name) => {
        it(`ENS namehash fails - ${ name }`, function() {
            assert.ok(!ethers.utils.isValidName(name));
            assert.throws(() => {
                const namehash = ethers.utils.namehash(name);
                console.log(name, namehash);
            }, (error: Error) => {
                return !!error.message.match(/invalid ENS name; empty component/);
            });
        });
    });
});

describe('Test ID Hash Functions', function () {
    type TestCase = {
         expected: string,
         name: string,
         text: string
    };

    const tests: Array<TestCase> = [
        {
            name: 'setAddr signature hash',
            text: 'setAddr(bytes32,address)',
            expected: '0xd5fa2b00b0756613052388dd576d941ba16904757996b8bb03a737ef4fd1f9ce'
        }
    ]

    tests.forEach((test: TestCase) => {
        it(('computes id - ' + test.name), function() {
            this.timeout(120000);
            let actual = ethers.utils.id(test.text);
            assert.equal(actual, test.expected,
                'computes id(' + test.text + ')');
        });
    });
});

describe('Test Solidity Hash Functions', function() {

    type TestCase = {
        keccak256: string,
        sha256: string,
        types: Array<string>,
        values: Array<string>
    };

    const tests: Array<TestCase> = loadTests('solidity-hashes');

    function test(funcName: string, testKey: 'keccak256' | 'sha256') {
        it(`computes ${ funcName } correctly`, function() {
            this.timeout(120000);

            tests.forEach((test, index) => {
                let actual = (<any>(ethers.utils))['solidity' + funcName](test.types, test.values);
                let expected = test[testKey];
                assert.equal(actual, expected,
                    ('computes solidity-' + funcName + '(' + JSON.stringify(test.values) + ') - ' + test.types));
            });
        });
    }

    test('Keccak256', 'keccak256');
    test('Sha256', 'sha256');

    const testsInvalid = [
        "uint0",     // number - null length
        "uint1",     // number - not byte-aligned
        "uint08",    // number - leading zeros
        "uint266",   // number - out-of-range
        "bytes0",    // bytes - null length
        "bytes02",   // bytes - leading zeros
        "bytes33",   // bytes - out-of-range
        "purple"     // invalid type
    ];

    testsInvalid.forEach((type) => {
        it(`disallows invalid type "${ type }"`, function() {
            assert.throws(() => {
                ethers.utils.solidityPack([ type ], [ "0x12" ]);
            }, (error: Error) => {
                const message = error.message;
                return (message.match(/invalid([a-z ]*) type/) && message.indexOf(type) >= 0);
            });
        });
    });
});

describe('Test Hash Functions', function() {

    const tests: Array<TestCase.Hash> = loadTests('hashes');

    it('computes keccak256 correctly', function() {
        this.timeout(120000);
        tests.forEach(function(test) {
            assert.equal(ethers.utils.keccak256(test.data), test.keccak256, ('Keccak256 - ' + test.data));
        });
    });

    it('computes sha2-256 correctly', function() {
        this.timeout(120000);
        tests.forEach(function(test) {
            assert.equal(ethers.utils.sha256(test.data), test.sha256, ('SHA256 - ' + test.data));
        });
    });

    it('computes sha2-512 correctly', function() {
        this.timeout(120000);
        tests.forEach(function(test) {
            assert.equal(ethers.utils.sha512(test.data), test.sha512, ('SHA512 - ' + test.data));
        });
    });
});

describe('Test Solidity splitSignature', function() {

    it('splits a canonical signature', function() {
        this.timeout(120000);
        let r = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
        let s = '0xcafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7e';
        for (let v = 27; v <= 28; v++) {
            let signature = ethers.utils.concat([ r, s, [ v ] ]);
            let sig = ethers.utils.splitSignature(signature);
            assert.equal(sig.r, r, 'split r correctly');
            assert.equal(sig.s, s, 'split s correctly');
            assert.equal(sig.v, v, 'split v correctly');
        }
    });

    it('splits a legacy signature', function() {
        this.timeout(120000);
        let r = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
        let s = '0xcafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7e';
        for (let v = 27; v <= 28; v++) {
            let signature = ethers.utils.concat([ r, s, [ v - 27 ] ]);
            let sig = ethers.utils.splitSignature(signature);
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
        let decodedText = 'Man is distinguished, not only by his reason, but by this singular passion from other animals, which is a lust of the mind, that by a perseverance of delight in the continued and indefatigable generation of knowledge, exceeds the short vehemence of any carnal pleasure.';
        let decoded = ethers.utils.toUtf8Bytes(decodedText);
        let encoded = 'TWFuIGlzIGRpc3Rpbmd1aXNoZWQsIG5vdCBvbmx5IGJ5IGhpcyByZWFzb24sIGJ1dCBieSB0aGlzIHNpbmd1bGFyIHBhc3Npb24gZnJvbSBvdGhlciBhbmltYWxzLCB3aGljaCBpcyBhIGx1c3Qgb2YgdGhlIG1pbmQsIHRoYXQgYnkgYSBwZXJzZXZlcmFuY2Ugb2YgZGVsaWdodCBpbiB0aGUgY29udGludWVkIGFuZCBpbmRlZmF0aWdhYmxlIGdlbmVyYXRpb24gb2Yga25vd2xlZGdlLCBleGNlZWRzIHRoZSBzaG9ydCB2ZWhlbWVuY2Ugb2YgYW55IGNhcm5hbCBwbGVhc3VyZS4=';
        assert.equal(ethers.utils.base64.encode(decoded), encoded, 'encodes to base64 string');
        assert.equal(ethers.utils.toUtf8String(ethers.utils.base64.decode(encoded)), decodedText, 'decodes from base64 string');
    });
});

describe('Test UTF-8 coder', function() {
    const overlong = ethers.utils.Utf8ErrorReason.OVERLONG;
    const utf16Surrogate = ethers.utils.Utf8ErrorReason.UTF16_SURROGATE;
    const overrun = ethers.utils.Utf8ErrorReason.OVERRUN;
    const missingContinue = ethers.utils.Utf8ErrorReason.MISSING_CONTINUE;
    const unexpectedContinue = ethers.utils.Utf8ErrorReason.UNEXPECTED_CONTINUE;
    const outOfRange = ethers.utils.Utf8ErrorReason.OUT_OF_RANGE;

    let BadUTF = [
        // See: https://en.wikipedia.org/wiki/UTF-8#Overlong_encodings
        { bytes: [ 0xF0,0x82, 0x82, 0xAC ], reason: overlong, ignored: "", replaced: "\u20ac", name: 'wikipedia overlong encoded Euro sign' },
        { bytes: [ 0xc0, 0x80 ], reason: overlong, ignored: "", replaced: "\u0000", name: '2-byte overlong - 0xc080' },
        { bytes: [ 0xc0, 0xbf ], reason: overlong, ignored: "", replaced: "?", name: '2-byte overlong - 0xc0bf' },
        { bytes: [ 0xc1, 0x80 ], reason: overlong, ignored: "", replaced: "@", name: '2-byte overlong - 0xc180' },
        { bytes: [ 0xc1, 0xbf ], reason: overlong, ignored: "", replaced: "\u007f", name: '2-byte overlong - 0xc1bf' },

        // Reserved UTF-16 Surrogate halves
        { bytes: [ 0xed, 0xa0, 0x80 ], reason: utf16Surrogate, ignored: "", replaced: "\ufffd", name: 'utf-16 surrogate - U+d800' },
        { bytes: [ 0xed, 0xbf, 0xbf ], reason: utf16Surrogate, ignored: "", replaced: "\ufffd", name: 'utf-16 surrogate - U+dfff' },

        // a leading byte not followed by enough continuation bytes
        { bytes: [ 0xdf ], reason: overrun, ignored: "", replaced: "\ufffd", name: 'too short - 2-bytes - 0x00' },
        { bytes: [ 0xe0 ], reason: overrun, ignored: "", replaced: "\ufffd", name: 'too short - 3-bytes' },
        { bytes: [ 0xe0, 0x80 ], reason: overrun, ignored: "", replaced: "\ufffd", name: 'too short - 3-bytes with 1' },

        { bytes: [ 0x80 ], reason: unexpectedContinue, ignored: "", replaced: "\ufffd", name: 'unexpected continuation byte' },
        { bytes: [ 0xc2, 0x00 ], reason: missingContinue, ignored: "\u0000", replaced: "\ufffd\u0000", name: 'invalid continuation byte - 0xc200' },
        { bytes: [ 0xc2, 0x40 ], reason: missingContinue, ignored: "@", replaced: "\ufffd@", name: 'invalid continuation byte - 0xc240' },
        { bytes: [ 0xc2, 0xc0 ], reason: missingContinue, ignored: "", replaced: "\ufffd\ufffd", name: 'invalid continuation byte - 0xc2c0' },

        // Out of range
        { bytes: [ 0xf4, 0x90, 0x80, 0x80 ], reason: outOfRange, ignored: "", replaced: "\ufffd", name: 'out of range' },
    ];

    BadUTF.forEach(function(test) {
        it('toUtf8String - ' + test.name, function() {
            // Check the string using the ignoreErrors conversion
            const ignored = ethers.utils.toUtf8String(test.bytes, ethers.utils.Utf8ErrorFuncs.ignore);
            assert.equal(ignored, test.ignored, "ignoring errors matches");

            // Check the string using the replaceErrors conversion
            const replaced = ethers.utils.toUtf8String(test.bytes, ethers.utils.Utf8ErrorFuncs.replace);
            assert.equal(replaced, test.replaced, "replaced errors matches");

            // Check the string throws the correct error during conversion
            assert.throws(function() {
                let result = ethers.utils.toUtf8String(test.bytes);
                console.log('Result', result);
            }, function(error: Error) {
                return (error.message.split(";").pop().split("(")[0].trim() === test.reason)
            }, test.name);
        });
    });

    it('toUtf8String - random conversions', function() {
        this.timeout(200000);

        function randomChar(seed: string) {
            switch (utils.randomNumber(seed + '-range', 0, 4)) {
                case 0:
                    return String.fromCharCode(utils.randomNumber(seed + '-value', 0, 0x100));
                case 1:
                    return String.fromCharCode(utils.randomNumber(seed + '-value', 0, 0xd800));
                case 2:
                    return String.fromCharCode(utils.randomNumber(seed + '-value', 0xdfff + 1, 0xffff));
                case 3:
                    let left = utils.randomNumber(seed + '-value', 0xd800, 0xdbff + 1);
                    let right = utils.randomNumber(seed + '-value', 0xdc00, 0xdfff + 1);
                    return String.fromCharCode(left, right);
            }

            throw new Error('this should not happen');
        }

        function randomString(seed: string) {
            let length = utils.randomNumber(seed + '-length', 1, 5);
            let str = '';
            for (let i = 0; i < length; i++) {
                str += randomChar(seed + '-char-' + i);
            }
            return str;
        }

        for (let i = 0; i < 100000; i++) {
            let seed = 'test-' + String(i);
            let str = randomString(seed);

            let bytes = ethers.utils.toUtf8Bytes(str)
            let str2 = ethers.utils.toUtf8String(bytes);
            let escaped = JSON.parse(ethers.utils._toEscapedUtf8String(bytes));

//            assert.ok(Buffer.from(str).equals(Buffer.from(bytes)), 'bytes not generated correctly - ' + bytes)
            assert.equal(str2, str, 'conversion not reflexive - ' + bytes);
            assert.equal(escaped, str, 'conversion not reflexive - ' + bytes);
        }
    });
});

describe('Test Bytes32String coder', function() {
    // @TODO: a LOT more test cases; generated from Solidity
    it("encodes an ens name", function() {
        let str = "ricmoo.firefly.eth";
        let bytes32 = ethers.utils.formatBytes32String(str);
        let str2 = ethers.utils.parseBytes32String(bytes32);
        assert.equal(bytes32, '0x7269636d6f6f2e66697265666c792e6574680000000000000000000000000000', 'formatted correctly');
        assert.equal(str2, str, "parsed correctly");
    });
});


function getHex(value: string): string {
    return ethers.utils.hexlify(ethers.utils.toUtf8Bytes(value));
}

describe("Test nameprep", function() {
    const Tests: Array<TestCase.Nameprep> = loadTests("nameprep");
    Tests.forEach((test) => {
        // No RTL support yet... These will always fail
        if ([
            "Surrogate code U+DF42",
            "Left-to-right mark U+200E",
            "Deprecated U+202A",
            "Language tagging character U+E0001",
            "Bidi: RandALCat character U+05BE and LCat characters",
            "Bidi: RandALCat character U+FD50 and LCat characters",
            "Bidi: RandALCat without trailing RandALCat U+0627 U+0031"
        ].indexOf(test.comment) >= 0) {
            return;
        }

        it(test.comment, function() {
            let input = ethers.utils.toUtf8String(test.input);
            if (test.output) {
                let expected = ethers.utils.toUtf8String(test.output)
                let actual = ethers.utils.nameprep(input);
                assert.equal(actual, expected, `actual("${ getHex(actual) }") !== expected("${ getHex(expected) }")`);
            } else {
                let ok = true;
                let reason = "";
                try {
                    let actual = ethers.utils.nameprep(input);
                    console.log(actual);
                    reason = `should has thrown ${ test.rc } - actual("${ getHex(actual) }")`;
                    ok = false;
                } catch (error) {
                }
                assert.ok(ok, reason);
            }
        });
    });
});

describe("Test Signature Manipulation", function() {
    const tests: Array<TestCase.SignedTransaction> = loadTests("transactions");
    tests.forEach((test) => {
        it("autofills partial signatures - " + test.name, function() {
            const address = ethers.utils.getAddress(test.accountAddress);
            const hash = ethers.utils.keccak256(test.unsignedTransaction);
            const data = ethers.utils.RLP.decode(test.signedTransaction);
            const s = data.pop(), r = data.pop(), v = parseInt(data.pop().substring(2), 16);
            const sig = ethers.utils.splitSignature({ r: r, s: s, v: v });

            {
                const addr = ethers.utils.recoverAddress(hash, {
                    r: r, s: s, v: v
                });
                assert.equal(addr, address, "Using r, s and v");
            }

            {
                const addr = ethers.utils.recoverAddress(hash, {
                    r: sig.r, _vs: sig._vs
                });
                assert.equal(addr, address, "Using r, _vs");
            }

            {
                const addr = ethers.utils.recoverAddress(hash, {
                    r: sig.r, s: sig.s, recoveryParam: sig.recoveryParam
                });
                assert.equal(addr, address, "Using r, s and recoveryParam");
            }
        });
    });
});

describe("Test Typed Transactions", function() {
    const tests: Array<TestCase.TypedTransaction> = loadTests("typed-transactions");

    function equalsData(name: string, a: any, b: any, ifNull?: any): boolean {
        assert.equal(ethers.utils.hexlify(a), ethers.utils.hexlify((b == null) ? ifNull: b), name);
        return true;
    }

    function equalsNumber(name: string, a: any, b: any, ifNull?: any): boolean {
        assert.ok(ethers.BigNumber.from(a).eq((b == null) ? ifNull: b), name);
        return true;
    }

    function equalsArray(name: string, a: any, b: any, equals: (name: string, a: any, b: any) => boolean): boolean {
        assert.equal(a.length, b.length, `${ name }.length`);
        for (let i = 0; i < a.length; i++) {
            if (!equals(`${ name }[${ i }]`, a[i], b[i])) { return false; }
        }
        return true;
    }

    function makeEqualsArray(equals: (name: string, a: any, b: any) => boolean): (name: string, a: any, b: any) => boolean {
        return function(name: string, a: any, b: any) {
            return equalsArray(name, a, b, equals);
        };
    }

    function equalsAccessList(name: string, a: Array<any>, b: Array<any>): boolean {
        return equalsArray(`${ name }-address`, a.map((f) => f.address), b.map((f) => f.address), equalsData) &&
               equalsArray(`${ name }-storageKeys`, a.map((f) => f.storageKeys), b.map((f) => f.storageKeys), makeEqualsArray(equalsData))
    }

    function allowNull(name: string, a: any, b: any, equals: (name: string, a: any, b: any) => boolean): boolean {
        if (a == null) {
            assert.ok(b == null, `${ name }:!NULL`);
            return true;
        } else if (b == null) {
            assert.fail(`${ name }:!!NULL`);
        }
        return equals(name, a, b);
    }

    function equalsCommonTransaction(name: string, a: any, b: any): boolean {
        return equalsNumber(`${ name }-type`, a.type, b.type, 0) &&
               equalsData(`${ name }-data`, a.data, b.data, "0x") &&
               equalsNumber(`${ name }-gasLimit`, a.gasLimit, b.gasLimit, 0) &&
               equalsNumber(`${ name }-nonce`, a.nonce, b.nonce, 0) &&
               allowNull(`${ name }-to`, a.to, b.to, equalsData) &&
               equalsNumber(`${ name }-value`, a.value, b.value, 0) &&
               equalsNumber(`${ name }-chainId`, a.chainId, b.chainId, 0) &&
               equalsAccessList(`${ name }-accessList`, a.accessList, b.accessList || [ ]);
    }

    function equalsEip1559Transaction(name: string, a: any, b: any): boolean {
        return equalsNumber(`${ name }-maxPriorityFeePerGas`, a.maxPriorityFeePerGas, b.maxPriorityFeePerGas, 0) &&
               equalsNumber(`${ name }-maxFeePerGas`, a.maxFeePerGas, b.maxFeePerGas, 0) &&
               equalsCommonTransaction(name, a, b);
    }

    function equalsEip2930Transaction(name: string, a: any, b: any): boolean {
        return equalsNumber(`${ name }-gasPrice`, a.gasPrice, b.gasPrice, 0) &&
               equalsCommonTransaction(name, a, b);
    }

    function equalsTransaction(name: string, a: any, b: any): boolean {
        switch (a.type) {
            case 1:
                return equalsEip2930Transaction(name, a, b);
            case 2:
                return equalsEip1559Transaction(name, a, b);
        }
        assert.fail(`unknown transaction type ${ a.type }`);
    }

    tests.forEach((test, index) => {
        it(test.name, async function() {
            {
                const wallet = new ethers.Wallet(test.key);
                const signed = await wallet.signTransaction(test.tx);
                assert.equal(signed, test.signed, "signed transactions match");
            }

            assert.equal(ethers.utils.serializeTransaction(test.tx), test.unsigned, "unsigned transactions match");

            {
                const tx = ethers.utils.parseTransaction(test.unsigned);
                assert.ok(equalsTransaction("transaction", tx, test.tx), "all unsigned keys match");
            }

            {
                const tx = ethers.utils.parseTransaction(test.signed);
                assert.ok(equalsTransaction("transaction", tx, test.tx), "all signed keys match");
                assert.equal(tx.from.toLowerCase(), test.address, "sender matches");
            }
        });
    });
});

describe("BigNumber", function() {
    const tests: Array<TestCase.BigNumber> = loadTests("bignumber");
    tests.forEach((test) => {
        if (test.expectedValue == null) {
            it(test.testcase, function() {
                assert.throws(() => {
                    const value = ethers.BigNumber.from(test.value);
                    console.log("ERROR", value);
                }, (error: Error) => {
                    return true;
                });
            });
        } else {
            it(test.testcase, function() {
                const value = ethers.BigNumber.from(test.value);
                assert.equal(value.toHexString(), test.expectedValue);

                const value2 = ethers.BigNumber.from(value)
                assert.equal(value2.toHexString(), test.expectedValue);
            });
        }
    });

    [
        { value: "0x0", expected: "0x0" },
        { value: "-0x0", expected: "0x0" },
        { value: "0x5", expected: "0x5" },
        { value: "-0x5", expected: "0x5" },
        { value: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", expected: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" },
        { value: "-0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", expected: "0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" },
        { value: "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", expected: "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" },
        { value: "-0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff", expected: "0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff" },
    ].forEach((test) => {
        it(`absolute value (${ test.value })`, function() {
            const value = ethers.BigNumber.from(test.value);
            const expected = ethers.BigNumber.from(test.expected);
            assert.ok(value.abs().eq(expected));
        });
    });

    // Fails to create from BN (or any junk with a length) (See: #1172)
    it("Fails on junk with a length property", function() {
        const junk: any = { negative: 0, words: [ 1000 ], length: 1, red: null };
        assert.throws(() => {
            const value = ethers.BigNumber.from("100").add(junk);
            console.log("ERROR", value);
        }, (error: Error) => {
            return true;
        });
    });

    // @TODO: Add more tests here

});


describe("FixedNumber", function() {
    {
        const Tests = [
            { value: "0.0",    expected: "0.0"  },
            { value: "-0.0",   expected: "0.0"  },

            { value: "1.0",    expected: "1.0"  },
            { value: "1.00",   expected: "1.0"  },
            { value: "01.00",  expected: "1.0"  },
            { value: 1,        expected: "1.0"  },

            { value: "-1.0",   expected: "-1.0"  },
            { value: "-1.00",  expected: "-1.0"  },
            { value: "-01.00", expected: "-1.0"  },
            { value: -1,       expected: "-1.0"  },
        ];

        Tests.forEach((test) => {
            it (`Create from=${ test.value }`, function() {
                const value = ethers.FixedNumber.from(test.value);
                assert.equal(value.toString(), test.expected);
            });
        });
    }

    {
        const Tests = [
            { value: "1.0",    round: 1,   expected: "1.0"  },
            { value: "1.4",    round: 1,   expected: "1.4"  },
            { value: "1.4",    round: 2,   expected: "1.4"  },
            { value: "1.4",    round: 0,   expected: "1.0"  },
            { value: "1.5",    round: 0,   expected: "2.0"  },
            { value: "1.6",    round: 0,   expected: "2.0"  },

            { value: "-1.0",   round: 1,   expected: "-1.0" },
            { value: "-1.4",   round: 1,   expected: "-1.4" },
            { value: "-1.4",   round: 2,   expected: "-1.4" },
            { value: "-1.4",   round: 0,   expected: "-1.0" },
            { value: "-1.5",   round: 0,   expected: "-1.0" },
            { value: "-1.6",   round: 0,   expected: "-2.0" },

            { value: "1.51",   round: 1,   expected: "1.5"  },
            { value: "1.55",   round: 1,   expected: "1.6"  },
        ];

        Tests.forEach((test) => {
            it (`Rounding value=${ test.value }, decimals=${ test.round }`, function() {
                const value = ethers.FixedNumber.from(test.value).round(test.round);
                assert.equal(value.toString(), test.expected);
            });
        });
    }

    {
        const Tests = [
            { value: "1.0",   ceiling: "1.0",   floor: "1.0"  },
            { value: "1.1",   ceiling: "2.0",   floor: "1.0"  },
            { value: "1.9",   ceiling: "2.0",   floor: "1.0"  },
            { value: "-1.0",  ceiling: "-1.0",  floor: "-1.0" },
            { value: "-1.1",  ceiling: "-1.0",  floor: "-2.0" },
            { value: "-1.9",  ceiling: "-1.0",  floor: "-2.0" },
        ];

        Tests.forEach((test) => {
            it (`Clamping value=${ test.value }`, function() {
                const value = ethers.FixedNumber.from(test.value);
                assert.equal(value.floor().toString(), test.floor);
                assert.equal(value.ceiling().toString(), test.ceiling);
            });
        });
    }
});

describe("Logger", function() {
    const logger = new ethers.utils.Logger("testing/0.0");

    it ("setLogLevel", function() {
        ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.DEBUG);
        ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.INFO);
        ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.WARNING);
        ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.ERROR);
        ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.OFF);

        // Reset back to INFO when done tests
        ethers.utils.Logger.setLogLevel(ethers.utils.Logger.levels.INFO);
    });

    it("checkArgumentCount", function() {
        logger.checkArgumentCount(3, 3);
    });

    it("checkArgumentCount - too few", function() {
        assert.throws(() => {
            logger.checkArgumentCount(1, 3);
        }, (error: any) => {
            return error.code === ethers.utils.Logger.errors.MISSING_ARGUMENT;
        });
    });

    it("checkArgumentCount - too many", function() {
        assert.throws(() => {
            logger.checkArgumentCount(3, 1);
        }, (error: any) => {
            return error.code === ethers.utils.Logger.errors.UNEXPECTED_ARGUMENT;
        });
    });
});

describe("Base58 Coder", function() {
    it("decodes", function() {
        assert.equal(ethers.utils.toUtf8String(ethers.utils.base58.decode("JxF12TrwUP45BMd")), "Hello World");
    });

    it("encodes", function() {
        assert.equal(ethers.utils.base58.encode(ethers.utils.toUtf8Bytes("Hello World")), "JxF12TrwUP45BMd");
    });
});

/*
describe("Web Fetch", function() {
    it("fetches JSON", async function() {
        const url = "https:/\/api.etherscan.io/api?module=stats&action=ethprice&apikey=9D13ZE7XSBTJ94N9BNJ2MA33VMAY2YPIRB";
        const getData = ethers.utils.fetchJson(url)
    });
});
*/

describe("EIP-712", function() {
    const tests = loadTests<Array<TestCase.Eip712>>("eip712");

    tests.forEach((test) => {
        it(`encoding ${ test.name }`, function() {
            const encoder = ethers.utils._TypedDataEncoder.from(test.types);
            assert.equal(encoder.primaryType, test.primaryType, "instance.primaryType");
            assert.equal(encoder.encode(test.data), test.encoded, "instance.encode()");

            //console.log(test);
            assert.equal(ethers.utils._TypedDataEncoder.getPrimaryType(test.types), test.primaryType, "getPrimaryType");
            assert.equal(ethers.utils._TypedDataEncoder.hash(test.domain, test.types, test.data), test.digest, "digest");
        });
    });

    tests.forEach((test) => {
        if (!test.privateKey) { return; }
        it(`signing ${ test.name }`, async function() {
            const wallet = new ethers.Wallet(test.privateKey);
            const signature = await wallet._signTypedData(test.domain, test.types, test.data);
            assert.equal(signature, test.signature, "signature");
        });
    });
});

/*
type EIP2930Test = {
    hash: string,
    data:
};
*/

function _deepEquals(a: any, b: any, path: string): string {
    if (Array.isArray(a)) {
        if (!Array.isArray(b)) {
            return `{ path }:!isArray(b)`;
        }
        if (a.length !== b.length) {
            return `{ path }:a.length[${ a.length }]!=b.length[${ b.length }]`;
        }
        for (let i = 0; i < a.length; i++) {
            const reason = _deepEquals(a[i], b[i], `${ path }:${ i }`);
            if (reason != null) { return reason; }
        }
        return null;
    }

    if (a.eq) {
        if (!b.eq) { return `${ path }:typeof(b)!=BigNumber`; }
        return a.eq(b) ? null: `${ path }:!a.eq(b)`;
    }

    if (a != null && typeof(a) === "object") {
        if (b != null && typeof(b) !== "object") { return `${ path }:typeof(b)!=object`; }
        const keys = Object.keys(a), otherKeys = Object.keys(b);
        keys.sort();
        otherKeys.sort();
        if (keys.length !== otherKeys.length) { return `${ path }:keys(a)[${ keys.join(",") }]!=keys(b)[${ otherKeys.join(",") }]`; }
        for (const key in a) {
            const reason = _deepEquals(a[key], b[key], `${ path }:${ key }`);
            if (reason != null) { return reason; }
        }
        return null;
    }

    if (a !== b) { return `${ path }[${ a } != ${ b }]`; }

    return null;
}

function deepEquals(a: any, b: any): string {
    return _deepEquals(a, b, "");
}

describe("EIP-2930", function() {

    const Tests = [
        {
            hash: "0x48bff7b0e603200118a672f7c622ab7d555a28f98938edb8318803eed7ea7395",
            data: "0x01f87c030d8465cf89a0825b689432162f3581e88a5f62e8a61892b42c46e2c18f7b8080d7d6940000000000000000000000000000000000000000c080a09659cba42376dbea1433cd6afc9c8ffa38dbeff5408ffdca0ebde6207281a3eca027efbab3e6ed30b088ce0a50533364778e101c9e52acf318daec131da64e7758",
            preimage: "0x01f839030d8465cf89a0825b689432162f3581e88a5f62e8a61892b42c46e2c18f7b8080d7d6940000000000000000000000000000000000000000c0",
            tx: {
                hash: "0x48bff7b0e603200118a672f7c622ab7d555a28f98938edb8318803eed7ea7395",
                type: 1,
                chainId: 3,
                nonce: 13,
                gasPrice: ethers.BigNumber.from("0x65cf89a0"),
                gasLimit: ethers.BigNumber.from("0x5b68"),
                to: "0x32162F3581E88a5f62e8A61892B42C46E2c18f7b",
                value: ethers.BigNumber.from("0"),
                data: "0x",
                accessList: [
                    {
                        address: "0x0000000000000000000000000000000000000000",
                        storageKeys: []
                    }
                ],
                v: 0,
                r: "0x9659cba42376dbea1433cd6afc9c8ffa38dbeff5408ffdca0ebde6207281a3ec",
                s: "0x27efbab3e6ed30b088ce0a50533364778e101c9e52acf318daec131da64e7758",
                from: "0x32162F3581E88a5f62e8A61892B42C46E2c18f7b",
            }
        },
        {
            hash: "0x1675a417e728fd3562d628d06955ef35b913573d9e417eb4e6a209998499c9d3",
            data: "0x01f8e2030e8465cf89a08271ac9432162f3581e88a5f62e8a61892b42c46e2c18f7b8080f87cf87a940000000000000000000000000000000000000000f863a0deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefa00000000000111111111122222222223333333333444444444455555555556666a0deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef80a0b0646756f89817d70cdb40aa2ae8b5f43ef65d0926dcf71a7dca5280c93763dfa04d32dbd9a44a2c5639b8434b823938202f75b0a8459f3fcd9f37b2495b7a66a6",
            preimage: "0x01f89f030e8465cf89a08271ac9432162f3581e88a5f62e8a61892b42c46e2c18f7b8080f87cf87a940000000000000000000000000000000000000000f863a0deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefa00000000000111111111122222222223333333333444444444455555555556666a0deadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
            tx: {
                hash: "0x1675a417e728fd3562d628d06955ef35b913573d9e417eb4e6a209998499c9d3",
                type: 1,
                chainId: 3,
                nonce: 14,
                gasPrice: ethers.BigNumber.from("0x65cf89a0"),
                gasLimit: ethers.BigNumber.from("0x71ac"),
                to: "0x32162F3581E88a5f62e8A61892B42C46E2c18f7b",
                value: ethers.BigNumber.from("0"),
                data: "0x",
                accessList: [
                    {
                        address: "0x0000000000000000000000000000000000000000",
                        storageKeys: [
                            "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef",
                            "0x0000000000111111111122222222223333333333444444444455555555556666",
                            "0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef"
                        ]
                    }
                ],
                v: 0,
                r: "0xb0646756f89817d70cdb40aa2ae8b5f43ef65d0926dcf71a7dca5280c93763df",
                s: "0x4d32dbd9a44a2c5639b8434b823938202f75b0a8459f3fcd9f37b2495b7a66a6",
                from: "0x32162F3581E88a5f62e8A61892B42C46E2c18f7b",
            }
        },
    ];

    Tests.forEach((test) => {
        it(`tx:${ test.hash }`, function() {
            const tx = ethers.utils.parseTransaction(test.data);
            assert.equal(tx.hash, test.hash);
            const reason = deepEquals(tx, test.tx);
            assert.ok(reason == null, reason);

            const preimageData = ethers.utils.serializeTransaction(<any>(test.tx));
            assert.equal(preimageData, test.preimage);

            const data = ethers.utils.serializeTransaction(<any>(test.tx), test.tx);
            assert.equal(data, test.data);
        });
    });
});
