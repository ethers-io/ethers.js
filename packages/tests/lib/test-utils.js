'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var ethers_1 = require("ethers");
var testcases_1 = require("@ethersproject/testcases");
var utils = __importStar(require("./utils"));
function equals(a, b) {
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) {
            return false;
        }
        for (var i = 0; i < a.length; i++) {
            if (!equals(a[i], b[i])) {
                return false;
            }
        }
        return true;
    }
    return a === b;
}
describe('Test Contract Address Generation', function () {
    // @TODO: Mine a large collection of these from the blockchain
    var getContractAddress = ethers_1.ethers.utils.getContractAddress;
    var Tests = [
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
    ];
    Tests.forEach(function (test) {
        it(('Computes the transaction address - ' + test.name), function () {
            this.timeout(120000);
            assert_1.default.equal(getContractAddress(test.tx), test.address, 'computes the transaction address');
        });
    });
});
describe('Test RLP Coder', function () {
    var tests = (0, testcases_1.loadTests)('rlp-coder');
    tests.forEach(function (test) {
        it(('RLP coder encoded - ' + test.name), function () {
            this.timeout(120000);
            assert_1.default.equal(ethers_1.ethers.utils.RLP.encode(test.decoded), test.encoded, 'RLP encoded - ' + test.name);
        });
    });
    tests.forEach(function (test) {
        it(('RLP coder decoded - ' + test.name), function () {
            this.timeout(120000);
            assert_1.default.ok(equals(ethers_1.ethers.utils.RLP.decode(test.encoded), test.decoded), 'RLP decoded - ' + test.name);
        });
    });
});
describe('Test Unit Conversion', function () {
    var tests = (0, testcases_1.loadTests)('units');
    tests.forEach(function (test) {
        var wei = ethers_1.ethers.BigNumber.from(test.wei);
        it(('parses ' + test.ether + ' ether'), function () {
            assert_1.default.ok(ethers_1.ethers.utils.parseEther(test.ether.replace(/,/g, '')).eq(wei), 'parsing ether failed - ' + test.name);
        });
        it(('formats ' + wei.toString() + ' wei to ether'), function () {
            var actual = ethers_1.ethers.utils.formatEther(wei);
            assert_1.default.equal(actual, test.ether_format, 'formatting wei failed - ' + test.name);
        });
    });
    tests.forEach(function (test) {
        var wei = ethers_1.ethers.BigNumber.from(test.wei);
        ['kwei', 'mwei', 'gwei', 'szabo', 'finney', 'satoshi'].forEach(function (name) {
            var unitName = name;
            if (name === 'satoshi') {
                unitName = 8;
            }
            if (test[name]) {
                it(('parses ' + test[name] + ' ' + name), function () {
                    this.timeout(120000);
                    assert_1.default.ok(ethers_1.ethers.utils.parseUnits(test[name].replace(/,/g, ''), unitName).eq(wei), ('parsing ' + name + ' failed - ' + test.name));
                });
            }
            var expectedKey = (name + '_format');
            if (test[expectedKey]) {
                it(('formats ' + wei.toString() + ' wei to ' + name + ')'), function () {
                    var actual = ethers_1.ethers.utils.formatUnits(wei, unitName);
                    var expected = test[expectedKey];
                    assert_1.default.equal(actual, expected, ('formats ' + name + ' - ' + test.name));
                });
            }
        });
    });
    it("formats with commify", function () {
        var tests = {
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
        Object.keys(tests).forEach(function (test) {
            assert_1.default.equal(ethers_1.ethers.utils.commify(test), tests[test]);
        });
    });
    // See #2016; @TODO: Add more tests along these lines
    it("checks extra tests", function () {
        assert_1.default.ok(ethers_1.ethers.utils.parseUnits("2", 0).eq(2), "folds trailing zeros without decimal: 2");
        assert_1.default.ok(ethers_1.ethers.utils.parseUnits("2.", 0).eq(2), "folds trailing zeros without decimal: 2.");
        assert_1.default.ok(ethers_1.ethers.utils.parseUnits("2.0", 0).eq(2), "folds trailing zeros without decimal: 2.0");
        assert_1.default.ok(ethers_1.ethers.utils.parseUnits("2.00", 0).eq(2), "folds trailing zeros without decimal: 2.00");
        assert_1.default.ok(ethers_1.ethers.utils.parseUnits("2", 1).eq(20), "folds trailing zeros: 2");
        assert_1.default.ok(ethers_1.ethers.utils.parseUnits("2.", 1).eq(20), "folds trailing zeros: 2.");
        assert_1.default.ok(ethers_1.ethers.utils.parseUnits("2.0", 1).eq(20), "folds trailing zeros: 2.0");
        assert_1.default.ok(ethers_1.ethers.utils.parseUnits("2.00", 1).eq(20), "folds trailing zeros: 2.00");
        assert_1.default.ok(ethers_1.ethers.utils.parseUnits("2.5", 1).eq(25), "folds trailing zeros: 2.5");
        assert_1.default.ok(ethers_1.ethers.utils.parseUnits("2.50", 1).eq(25), "folds trailing zeros: 2.50");
        assert_1.default.ok(ethers_1.ethers.utils.parseUnits("2.500", 1).eq(25), "folds trailing zeros: 2.500");
    });
});
describe('Test Namehash', function () {
    var tests = (0, testcases_1.loadTests)('namehash');
    tests.forEach(function (test) {
        it(('computes namehash - "' + test.name + '"'), function () {
            this.timeout(120000);
            assert_1.default.equal(ethers_1.ethers.utils.namehash(test.name), test.expected, 'computes namehash(' + test.name + ')');
        });
    });
    var goodNames = [
        "ricmoo.eth",
        "foo",
        "foo.bar",
    ];
    var badNames = [
        ".",
        "..",
        "ricmoo..eth",
        "ricmoo...eth",
        ".foo",
        "foo.",
    ];
    // The empty string is not a valid name, but has the zero hash
    // as its namehash, which may be used for recursive purposes
    it("empty ENS name", function () {
        assert_1.default.ok(!ethers_1.ethers.utils.isValidName(""));
    });
    goodNames.forEach(function (name) {
        it("ENS namehash ok - " + name, function () {
            assert_1.default.ok(ethers_1.ethers.utils.isValidName(name));
            ethers_1.ethers.utils.namehash(name);
        });
    });
    badNames.forEach(function (name) {
        it("ENS namehash fails - " + name, function () {
            assert_1.default.ok(!ethers_1.ethers.utils.isValidName(name));
            assert_1.default.throws(function () {
                var namehash = ethers_1.ethers.utils.namehash(name);
                console.log(name, namehash);
            }, function (error) {
                return !!error.message.match(/invalid ENS name; empty component/);
            });
        });
    });
});
describe('Test ID Hash Functions', function () {
    var tests = [
        {
            name: 'setAddr signature hash',
            text: 'setAddr(bytes32,address)',
            expected: '0xd5fa2b00b0756613052388dd576d941ba16904757996b8bb03a737ef4fd1f9ce'
        }
    ];
    tests.forEach(function (test) {
        it(('computes id - ' + test.name), function () {
            this.timeout(120000);
            var actual = ethers_1.ethers.utils.id(test.text);
            assert_1.default.equal(actual, test.expected, 'computes id(' + test.text + ')');
        });
    });
});
describe('Test Solidity Hash Functions', function () {
    var tests = (0, testcases_1.loadTests)('solidity-hashes');
    function test(funcName, testKey) {
        it("computes " + funcName + " correctly", function () {
            this.timeout(120000);
            tests.forEach(function (test, index) {
                var actual = (ethers_1.ethers.utils)['solidity' + funcName](test.types, test.values);
                var expected = test[testKey];
                assert_1.default.equal(actual, expected, ('computes solidity-' + funcName + '(' + JSON.stringify(test.values) + ') - ' + test.types));
            });
        });
    }
    test('Keccak256', 'keccak256');
    test('Sha256', 'sha256');
    var testsInvalid = [
        "uint0",
        "uint1",
        "uint08",
        "uint266",
        "bytes0",
        "bytes02",
        "bytes33",
        "purple" // invalid type
    ];
    testsInvalid.forEach(function (type) {
        it("disallows invalid type \"" + type + "\"", function () {
            assert_1.default.throws(function () {
                ethers_1.ethers.utils.solidityPack([type], ["0x12"]);
            }, function (error) {
                var message = error.message;
                return (message.match(/invalid([a-z ]*) type/) && message.indexOf(type) >= 0);
            });
        });
    });
});
describe('Test Hash Functions', function () {
    var tests = (0, testcases_1.loadTests)('hashes');
    it('computes keccak256 correctly', function () {
        this.timeout(120000);
        tests.forEach(function (test) {
            assert_1.default.equal(ethers_1.ethers.utils.keccak256(test.data), test.keccak256, ('Keccak256 - ' + test.data));
        });
    });
    it('computes sha2-256 correctly', function () {
        this.timeout(120000);
        tests.forEach(function (test) {
            assert_1.default.equal(ethers_1.ethers.utils.sha256(test.data), test.sha256, ('SHA256 - ' + test.data));
        });
    });
    it('computes sha2-512 correctly', function () {
        this.timeout(120000);
        tests.forEach(function (test) {
            assert_1.default.equal(ethers_1.ethers.utils.sha512(test.data), test.sha512, ('SHA512 - ' + test.data));
        });
    });
});
describe('Test Solidity splitSignature', function () {
    it('splits a canonical signature', function () {
        this.timeout(120000);
        var r = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
        var s = '0xcafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7e';
        for (var v = 27; v <= 28; v++) {
            var signature = ethers_1.ethers.utils.concat([r, s, [v]]);
            var sig = ethers_1.ethers.utils.splitSignature(signature);
            assert_1.default.equal(sig.r, r, 'split r correctly');
            assert_1.default.equal(sig.s, s, 'split s correctly');
            assert_1.default.equal(sig.v, v, 'split v correctly');
        }
    });
    it('splits a legacy signature', function () {
        this.timeout(120000);
        var r = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
        var s = '0xcafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7e';
        for (var v = 27; v <= 28; v++) {
            var signature = ethers_1.ethers.utils.concat([r, s, [v - 27]]);
            var sig = ethers_1.ethers.utils.splitSignature(signature);
            assert_1.default.equal(sig.r, r, 'split r correctly');
            assert_1.default.equal(sig.s, s, 'split s correctly');
            assert_1.default.equal(sig.v, v, 'split v correctly');
        }
    });
});
describe('Test Base64 coder', function () {
    // https://en.wikipedia.org/wiki/Base64#Examples
    it('encodes and decodes the example from wikipedia', function () {
        this.timeout(120000);
        var decodedText = 'Man is distinguished, not only by his reason, but by this singular passion from other animals, which is a lust of the mind, that by a perseverance of delight in the continued and indefatigable generation of knowledge, exceeds the short vehemence of any carnal pleasure.';
        var decoded = ethers_1.ethers.utils.toUtf8Bytes(decodedText);
        var encoded = 'TWFuIGlzIGRpc3Rpbmd1aXNoZWQsIG5vdCBvbmx5IGJ5IGhpcyByZWFzb24sIGJ1dCBieSB0aGlzIHNpbmd1bGFyIHBhc3Npb24gZnJvbSBvdGhlciBhbmltYWxzLCB3aGljaCBpcyBhIGx1c3Qgb2YgdGhlIG1pbmQsIHRoYXQgYnkgYSBwZXJzZXZlcmFuY2Ugb2YgZGVsaWdodCBpbiB0aGUgY29udGludWVkIGFuZCBpbmRlZmF0aWdhYmxlIGdlbmVyYXRpb24gb2Yga25vd2xlZGdlLCBleGNlZWRzIHRoZSBzaG9ydCB2ZWhlbWVuY2Ugb2YgYW55IGNhcm5hbCBwbGVhc3VyZS4=';
        assert_1.default.equal(ethers_1.ethers.utils.base64.encode(decoded), encoded, 'encodes to base64 string');
        assert_1.default.equal(ethers_1.ethers.utils.toUtf8String(ethers_1.ethers.utils.base64.decode(encoded)), decodedText, 'decodes from base64 string');
    });
});
describe('Test UTF-8 coder', function () {
    var overlong = ethers_1.ethers.utils.Utf8ErrorReason.OVERLONG;
    var utf16Surrogate = ethers_1.ethers.utils.Utf8ErrorReason.UTF16_SURROGATE;
    var overrun = ethers_1.ethers.utils.Utf8ErrorReason.OVERRUN;
    var missingContinue = ethers_1.ethers.utils.Utf8ErrorReason.MISSING_CONTINUE;
    var unexpectedContinue = ethers_1.ethers.utils.Utf8ErrorReason.UNEXPECTED_CONTINUE;
    var outOfRange = ethers_1.ethers.utils.Utf8ErrorReason.OUT_OF_RANGE;
    var BadUTF = [
        // See: https://en.wikipedia.org/wiki/UTF-8#Overlong_encodings
        { bytes: [0xF0, 0x82, 0x82, 0xAC], reason: overlong, ignored: "", replaced: "\u20ac", name: 'wikipedia overlong encoded Euro sign' },
        { bytes: [0xc0, 0x80], reason: overlong, ignored: "", replaced: "\u0000", name: '2-byte overlong - 0xc080' },
        { bytes: [0xc0, 0xbf], reason: overlong, ignored: "", replaced: "?", name: '2-byte overlong - 0xc0bf' },
        { bytes: [0xc1, 0x80], reason: overlong, ignored: "", replaced: "@", name: '2-byte overlong - 0xc180' },
        { bytes: [0xc1, 0xbf], reason: overlong, ignored: "", replaced: "\u007f", name: '2-byte overlong - 0xc1bf' },
        // Reserved UTF-16 Surrogate halves
        { bytes: [0xed, 0xa0, 0x80], reason: utf16Surrogate, ignored: "", replaced: "\ufffd", name: 'utf-16 surrogate - U+d800' },
        { bytes: [0xed, 0xbf, 0xbf], reason: utf16Surrogate, ignored: "", replaced: "\ufffd", name: 'utf-16 surrogate - U+dfff' },
        // a leading byte not followed by enough continuation bytes
        { bytes: [0xdf], reason: overrun, ignored: "", replaced: "\ufffd", name: 'too short - 2-bytes - 0x00' },
        { bytes: [0xe0], reason: overrun, ignored: "", replaced: "\ufffd", name: 'too short - 3-bytes' },
        { bytes: [0xe0, 0x80], reason: overrun, ignored: "", replaced: "\ufffd", name: 'too short - 3-bytes with 1' },
        { bytes: [0x80], reason: unexpectedContinue, ignored: "", replaced: "\ufffd", name: 'unexpected continuation byte' },
        { bytes: [0xc2, 0x00], reason: missingContinue, ignored: "\u0000", replaced: "\ufffd\u0000", name: 'invalid continuation byte - 0xc200' },
        { bytes: [0xc2, 0x40], reason: missingContinue, ignored: "@", replaced: "\ufffd@", name: 'invalid continuation byte - 0xc240' },
        { bytes: [0xc2, 0xc0], reason: missingContinue, ignored: "", replaced: "\ufffd\ufffd", name: 'invalid continuation byte - 0xc2c0' },
        // Out of range
        { bytes: [0xf4, 0x90, 0x80, 0x80], reason: outOfRange, ignored: "", replaced: "\ufffd", name: 'out of range' },
    ];
    BadUTF.forEach(function (test) {
        it('toUtf8String - ' + test.name, function () {
            // Check the string using the ignoreErrors conversion
            var ignored = ethers_1.ethers.utils.toUtf8String(test.bytes, ethers_1.ethers.utils.Utf8ErrorFuncs.ignore);
            assert_1.default.equal(ignored, test.ignored, "ignoring errors matches");
            // Check the string using the replaceErrors conversion
            var replaced = ethers_1.ethers.utils.toUtf8String(test.bytes, ethers_1.ethers.utils.Utf8ErrorFuncs.replace);
            assert_1.default.equal(replaced, test.replaced, "replaced errors matches");
            // Check the string throws the correct error during conversion
            assert_1.default.throws(function () {
                var result = ethers_1.ethers.utils.toUtf8String(test.bytes);
                console.log('Result', result);
            }, function (error) {
                return (error.message.split(";").pop().split("(")[0].trim() === test.reason);
            }, test.name);
        });
    });
    it('toUtf8String - random conversions', function () {
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
            var bytes = ethers_1.ethers.utils.toUtf8Bytes(str);
            var str2 = ethers_1.ethers.utils.toUtf8String(bytes);
            var escaped = JSON.parse(ethers_1.ethers.utils._toEscapedUtf8String(bytes));
            //            assert.ok(Buffer.from(str).equals(Buffer.from(bytes)), 'bytes not generated correctly - ' + bytes)
            assert_1.default.equal(str2, str, 'conversion not reflexive - ' + bytes);
            assert_1.default.equal(escaped, str, 'conversion not reflexive - ' + bytes);
        }
    });
});
describe('Test Bytes32String coder', function () {
    // @TODO: a LOT more test cases; generated from Solidity
    it("encodes an ens name", function () {
        var str = "ricmoo.firefly.eth";
        var bytes32 = ethers_1.ethers.utils.formatBytes32String(str);
        var str2 = ethers_1.ethers.utils.parseBytes32String(bytes32);
        assert_1.default.equal(bytes32, '0x7269636d6f6f2e66697265666c792e6574680000000000000000000000000000', 'formatted correctly');
        assert_1.default.equal(str2, str, "parsed correctly");
    });
});
function getHex(value) {
    return ethers_1.ethers.utils.hexlify(ethers_1.ethers.utils.toUtf8Bytes(value));
}
describe("Test nameprep", function () {
    var Tests = (0, testcases_1.loadTests)("nameprep");
    Tests.forEach(function (test) {
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
        it(test.comment, function () {
            var input = ethers_1.ethers.utils.toUtf8String(test.input);
            if (test.output) {
                var expected = ethers_1.ethers.utils.toUtf8String(test.output);
                var actual = ethers_1.ethers.utils.nameprep(input);
                assert_1.default.equal(actual, expected, "actual(\"" + getHex(actual) + "\") !== expected(\"" + getHex(expected) + "\")");
            }
            else {
                var ok = true;
                var reason = "";
                try {
                    var actual = ethers_1.ethers.utils.nameprep(input);
                    console.log(actual);
                    reason = "should has thrown " + test.rc + " - actual(\"" + getHex(actual) + "\")";
                    ok = false;
                }
                catch (error) {
                }
                assert_1.default.ok(ok, reason);
            }
        });
    });
});
describe("Test Signature Manipulation", function () {
    var tests = (0, testcases_1.loadTests)("transactions");
    tests.forEach(function (test) {
        it("autofills partial signatures - " + test.name, function () {
            var address = ethers_1.ethers.utils.getAddress(test.accountAddress);
            var hash = ethers_1.ethers.utils.keccak256(test.unsignedTransaction);
            var data = ethers_1.ethers.utils.RLP.decode(test.signedTransaction);
            var s = data.pop(), r = data.pop(), v = parseInt(data.pop().substring(2), 16);
            var sig = ethers_1.ethers.utils.splitSignature({ r: r, s: s, v: v });
            {
                var addr = ethers_1.ethers.utils.recoverAddress(hash, {
                    r: r, s: s, v: v
                });
                assert_1.default.equal(addr, address, "Using r, s and v");
            }
            {
                var addr = ethers_1.ethers.utils.recoverAddress(hash, {
                    r: sig.r, _vs: sig._vs
                });
                assert_1.default.equal(addr, address, "Using r, _vs");
            }
            {
                var addr = ethers_1.ethers.utils.recoverAddress(hash, {
                    r: sig.r, s: sig.s, recoveryParam: sig.recoveryParam
                });
                assert_1.default.equal(addr, address, "Using r, s and recoveryParam");
            }
        });
    });
});
describe("Test Typed Transactions", function () {
    var tests = (0, testcases_1.loadTests)("typed-transactions");
    function equalsData(name, a, b, ifNull) {
        assert_1.default.equal(ethers_1.ethers.utils.hexlify(a), ethers_1.ethers.utils.hexlify((b == null) ? ifNull : b), name);
        return true;
    }
    function equalsNumber(name, a, b, ifNull) {
        assert_1.default.ok(ethers_1.ethers.BigNumber.from(a).eq((b == null) ? ifNull : b), name);
        return true;
    }
    function equalsArray(name, a, b, equals) {
        assert_1.default.equal(a.length, b.length, name + ".length");
        for (var i = 0; i < a.length; i++) {
            if (!equals(name + "[" + i + "]", a[i], b[i])) {
                return false;
            }
        }
        return true;
    }
    function makeEqualsArray(equals) {
        return function (name, a, b) {
            return equalsArray(name, a, b, equals);
        };
    }
    function equalsAccessList(name, a, b) {
        return equalsArray(name + "-address", a.map(function (f) { return f.address; }), b.map(function (f) { return f.address; }), equalsData) &&
            equalsArray(name + "-storageKeys", a.map(function (f) { return f.storageKeys; }), b.map(function (f) { return f.storageKeys; }), makeEqualsArray(equalsData));
    }
    function allowNull(name, a, b, equals) {
        if (a == null) {
            assert_1.default.ok(b == null, name + ":!NULL");
            return true;
        }
        else if (b == null) {
            assert_1.default.fail(name + ":!!NULL");
        }
        return equals(name, a, b);
    }
    function equalsCommonTransaction(name, a, b) {
        return equalsNumber(name + "-type", a.type, b.type, 0) &&
            equalsData(name + "-data", a.data, b.data, "0x") &&
            equalsNumber(name + "-gasLimit", a.gasLimit, b.gasLimit, 0) &&
            equalsNumber(name + "-nonce", a.nonce, b.nonce, 0) &&
            allowNull(name + "-to", a.to, b.to, equalsData) &&
            equalsNumber(name + "-value", a.value, b.value, 0) &&
            equalsNumber(name + "-chainId", a.chainId, b.chainId, 0) &&
            equalsAccessList(name + "-accessList", a.accessList, b.accessList || []);
    }
    function equalsEip1559Transaction(name, a, b) {
        return equalsNumber(name + "-maxPriorityFeePerGas", a.maxPriorityFeePerGas, b.maxPriorityFeePerGas, 0) &&
            equalsNumber(name + "-maxFeePerGas", a.maxFeePerGas, b.maxFeePerGas, 0) &&
            equalsCommonTransaction(name, a, b);
    }
    function equalsEip2930Transaction(name, a, b) {
        return equalsNumber(name + "-gasPrice", a.gasPrice, b.gasPrice, 0) &&
            equalsCommonTransaction(name, a, b);
    }
    function equalsTransaction(name, a, b) {
        switch (a.type) {
            case 1:
                return equalsEip2930Transaction(name, a, b);
            case 2:
                return equalsEip1559Transaction(name, a, b);
        }
        assert_1.default.fail("unknown transaction type " + a.type);
    }
    tests.forEach(function (test, index) {
        it(test.name, function () {
            return __awaiter(this, void 0, void 0, function () {
                var wallet, signed, tx, tx;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            wallet = new ethers_1.ethers.Wallet(test.key);
                            return [4 /*yield*/, wallet.signTransaction(test.tx)];
                        case 1:
                            signed = _a.sent();
                            assert_1.default.equal(signed, test.signed, "signed transactions match");
                            assert_1.default.equal(ethers_1.ethers.utils.serializeTransaction(test.tx), test.unsigned, "unsigned transactions match");
                            {
                                tx = ethers_1.ethers.utils.parseTransaction(test.unsigned);
                                assert_1.default.ok(equalsTransaction("transaction", tx, test.tx), "all unsigned keys match");
                            }
                            {
                                tx = ethers_1.ethers.utils.parseTransaction(test.signed);
                                assert_1.default.ok(equalsTransaction("transaction", tx, test.tx), "all signed keys match");
                                assert_1.default.equal(tx.from.toLowerCase(), test.address, "sender matches");
                            }
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
});
describe("BigNumber", function () {
    var tests = (0, testcases_1.loadTests)("bignumber");
    tests.forEach(function (test) {
        if (test.expectedValue == null) {
            it(test.testcase, function () {
                assert_1.default.throws(function () {
                    var value = ethers_1.ethers.BigNumber.from(test.value);
                    console.log("ERROR", value);
                }, function (error) {
                    return true;
                });
            });
        }
        else {
            it(test.testcase, function () {
                var value = ethers_1.ethers.BigNumber.from(test.value);
                assert_1.default.equal(value.toHexString(), test.expectedValue);
                var value2 = ethers_1.ethers.BigNumber.from(value);
                assert_1.default.equal(value2.toHexString(), test.expectedValue);
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
    ].forEach(function (test) {
        it("absolute value (" + test.value + ")", function () {
            var value = ethers_1.ethers.BigNumber.from(test.value);
            var expected = ethers_1.ethers.BigNumber.from(test.expected);
            assert_1.default.ok(value.abs().eq(expected));
        });
    });
    // Fails to create from BN (or any junk with a length) (See: #1172)
    it("Fails on junk with a length property", function () {
        var junk = { negative: 0, words: [1000], length: 1, red: null };
        assert_1.default.throws(function () {
            var value = ethers_1.ethers.BigNumber.from("100").add(junk);
            console.log("ERROR", value);
        }, function (error) {
            return true;
        });
    });
    // @TODO: Add more tests here
});
describe("FixedNumber", function () {
    {
        var Tests = [
            { value: "0.0", expected: "0.0" },
            { value: "-0.0", expected: "0.0" },
            { value: "1.0", expected: "1.0" },
            { value: "1.00", expected: "1.0" },
            { value: "01.00", expected: "1.0" },
            { value: 1, expected: "1.0" },
            { value: "-1.0", expected: "-1.0" },
            { value: "-1.00", expected: "-1.0" },
            { value: "-01.00", expected: "-1.0" },
            { value: -1, expected: "-1.0" },
        ];
        Tests.forEach(function (test) {
            it("Create from=" + test.value, function () {
                var value = ethers_1.ethers.FixedNumber.from(test.value);
                assert_1.default.equal(value.toString(), test.expected);
            });
        });
    }
    {
        var Tests = [
            { value: "1.0", round: 1, expected: "1.0" },
            { value: "1.4", round: 1, expected: "1.4" },
            { value: "1.4", round: 2, expected: "1.4" },
            { value: "1.4", round: 0, expected: "1.0" },
            { value: "1.5", round: 0, expected: "2.0" },
            { value: "1.6", round: 0, expected: "2.0" },
            { value: "-1.0", round: 1, expected: "-1.0" },
            { value: "-1.4", round: 1, expected: "-1.4" },
            { value: "-1.4", round: 2, expected: "-1.4" },
            { value: "-1.4", round: 0, expected: "-1.0" },
            { value: "-1.5", round: 0, expected: "-1.0" },
            { value: "-1.6", round: 0, expected: "-2.0" },
            { value: "1.51", round: 1, expected: "1.5" },
            { value: "1.55", round: 1, expected: "1.6" },
        ];
        Tests.forEach(function (test) {
            it("Rounding value=" + test.value + ", decimals=" + test.round, function () {
                var value = ethers_1.ethers.FixedNumber.from(test.value).round(test.round);
                assert_1.default.equal(value.toString(), test.expected);
            });
        });
    }
    {
        var Tests = [
            { value: "1.0", ceiling: "1.0", floor: "1.0" },
            { value: "1.1", ceiling: "2.0", floor: "1.0" },
            { value: "1.9", ceiling: "2.0", floor: "1.0" },
            { value: "-1.0", ceiling: "-1.0", floor: "-1.0" },
            { value: "-1.1", ceiling: "-1.0", floor: "-2.0" },
            { value: "-1.9", ceiling: "-1.0", floor: "-2.0" },
        ];
        Tests.forEach(function (test) {
            it("Clamping value=" + test.value, function () {
                var value = ethers_1.ethers.FixedNumber.from(test.value);
                assert_1.default.equal(value.floor().toString(), test.floor);
                assert_1.default.equal(value.ceiling().toString(), test.ceiling);
            });
        });
    }
});
describe("Logger", function () {
    var logger = new ethers_1.ethers.utils.Logger("testing/0.0");
    it("setLogLevel", function () {
        ethers_1.ethers.utils.Logger.setLogLevel(ethers_1.ethers.utils.Logger.levels.DEBUG);
        ethers_1.ethers.utils.Logger.setLogLevel(ethers_1.ethers.utils.Logger.levels.INFO);
        ethers_1.ethers.utils.Logger.setLogLevel(ethers_1.ethers.utils.Logger.levels.WARNING);
        ethers_1.ethers.utils.Logger.setLogLevel(ethers_1.ethers.utils.Logger.levels.ERROR);
        ethers_1.ethers.utils.Logger.setLogLevel(ethers_1.ethers.utils.Logger.levels.OFF);
        // Reset back to INFO when done tests
        ethers_1.ethers.utils.Logger.setLogLevel(ethers_1.ethers.utils.Logger.levels.INFO);
    });
    it("checkArgumentCount", function () {
        logger.checkArgumentCount(3, 3);
    });
    it("checkArgumentCount - too few", function () {
        assert_1.default.throws(function () {
            logger.checkArgumentCount(1, 3);
        }, function (error) {
            return error.code === ethers_1.ethers.utils.Logger.errors.MISSING_ARGUMENT;
        });
    });
    it("checkArgumentCount - too many", function () {
        assert_1.default.throws(function () {
            logger.checkArgumentCount(3, 1);
        }, function (error) {
            return error.code === ethers_1.ethers.utils.Logger.errors.UNEXPECTED_ARGUMENT;
        });
    });
});
describe("Base58 Coder", function () {
    it("decodes", function () {
        assert_1.default.equal(ethers_1.ethers.utils.toUtf8String(ethers_1.ethers.utils.base58.decode("JxF12TrwUP45BMd")), "Hello World");
    });
    it("encodes", function () {
        assert_1.default.equal(ethers_1.ethers.utils.base58.encode(ethers_1.ethers.utils.toUtf8Bytes("Hello World")), "JxF12TrwUP45BMd");
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
describe("EIP-712", function () {
    var tests = (0, testcases_1.loadTests)("eip712");
    tests.forEach(function (test) {
        it("encoding " + test.name, function () {
            var encoder = ethers_1.ethers.utils._TypedDataEncoder.from(test.types);
            assert_1.default.equal(encoder.primaryType, test.primaryType, "instance.primaryType");
            assert_1.default.equal(encoder.encode(test.data), test.encoded, "instance.encode()");
            //console.log(test);
            assert_1.default.equal(ethers_1.ethers.utils._TypedDataEncoder.getPrimaryType(test.types), test.primaryType, "getPrimaryType");
            assert_1.default.equal(ethers_1.ethers.utils._TypedDataEncoder.hash(test.domain, test.types, test.data), test.digest, "digest");
        });
    });
    tests.forEach(function (test) {
        if (!test.privateKey) {
            return;
        }
        it("signing " + test.name, function () {
            return __awaiter(this, void 0, void 0, function () {
                var wallet, signature;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            wallet = new ethers_1.ethers.Wallet(test.privateKey);
                            return [4 /*yield*/, wallet._signTypedData(test.domain, test.types, test.data)];
                        case 1:
                            signature = _a.sent();
                            assert_1.default.equal(signature, test.signature, "signature");
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
});
/*
type EIP2930Test = {
    hash: string,
    data:
};
*/
function _deepEquals(a, b, path) {
    if (Array.isArray(a)) {
        if (!Array.isArray(b)) {
            return "{ path }:!isArray(b)";
        }
        if (a.length !== b.length) {
            return "{ path }:a.length[" + a.length + "]!=b.length[" + b.length + "]";
        }
        for (var i = 0; i < a.length; i++) {
            var reason = _deepEquals(a[i], b[i], path + ":" + i);
            if (reason != null) {
                return reason;
            }
        }
        return null;
    }
    if (a.eq) {
        if (!b.eq) {
            return path + ":typeof(b)!=BigNumber";
        }
        return a.eq(b) ? null : path + ":!a.eq(b)";
    }
    if (a != null && typeof (a) === "object") {
        if (b != null && typeof (b) !== "object") {
            return path + ":typeof(b)!=object";
        }
        var keys = Object.keys(a), otherKeys = Object.keys(b);
        keys.sort();
        otherKeys.sort();
        if (keys.length !== otherKeys.length) {
            return path + ":keys(a)[" + keys.join(",") + "]!=keys(b)[" + otherKeys.join(",") + "]";
        }
        for (var key in a) {
            var reason = _deepEquals(a[key], b[key], path + ":" + key);
            if (reason != null) {
                return reason;
            }
        }
        return null;
    }
    if (a !== b) {
        return path + "[" + a + " != " + b + "]";
    }
    return null;
}
function deepEquals(a, b) {
    return _deepEquals(a, b, "");
}
describe("EIP-2930", function () {
    var Tests = [
        {
            hash: "0x48bff7b0e603200118a672f7c622ab7d555a28f98938edb8318803eed7ea7395",
            data: "0x01f87c030d8465cf89a0825b689432162f3581e88a5f62e8a61892b42c46e2c18f7b8080d7d6940000000000000000000000000000000000000000c080a09659cba42376dbea1433cd6afc9c8ffa38dbeff5408ffdca0ebde6207281a3eca027efbab3e6ed30b088ce0a50533364778e101c9e52acf318daec131da64e7758",
            preimage: "0x01f839030d8465cf89a0825b689432162f3581e88a5f62e8a61892b42c46e2c18f7b8080d7d6940000000000000000000000000000000000000000c0",
            tx: {
                hash: "0x48bff7b0e603200118a672f7c622ab7d555a28f98938edb8318803eed7ea7395",
                type: 1,
                chainId: 3,
                nonce: 13,
                gasPrice: ethers_1.ethers.BigNumber.from("0x65cf89a0"),
                gasLimit: ethers_1.ethers.BigNumber.from("0x5b68"),
                to: "0x32162F3581E88a5f62e8A61892B42C46E2c18f7b",
                value: ethers_1.ethers.BigNumber.from("0"),
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
                gasPrice: ethers_1.ethers.BigNumber.from("0x65cf89a0"),
                gasLimit: ethers_1.ethers.BigNumber.from("0x71ac"),
                to: "0x32162F3581E88a5f62e8A61892B42C46E2c18f7b",
                value: ethers_1.ethers.BigNumber.from("0"),
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
    Tests.forEach(function (test) {
        it("tx:" + test.hash, function () {
            var tx = ethers_1.ethers.utils.parseTransaction(test.data);
            assert_1.default.equal(tx.hash, test.hash);
            var reason = deepEquals(tx, test.tx);
            assert_1.default.ok(reason == null, reason);
            var preimageData = ethers_1.ethers.utils.serializeTransaction((test.tx));
            assert_1.default.equal(preimageData, test.preimage);
            var data = ethers_1.ethers.utils.serializeTransaction((test.tx), test.tx);
            assert_1.default.equal(data, test.data);
        });
    });
});
//# sourceMappingURL=test-utils.js.map