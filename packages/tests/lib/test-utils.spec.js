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
// @ts-ignore
var hethers_1 = require("@hashgraph/hethers");
var testcases_1 = require("@hethers/testcases");
var utils = __importStar(require("./utils"));
var sdk_1 = require("@hashgraph/sdk");
var address_1 = require("@hethers/address");
var logger_1 = require("@hethers/logger");
var bytes_1 = require("@ethersproject/bytes");
// @ts-ignore
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
describe('Utils.spec', function () {
    var localWalletECDSA = utils.getWallets().local.ecdsa[0];
    describe('Test Unit Conversion', function () {
        it("should be able to execute formats with commify", function () {
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
            for (var i in tests) {
                assert_1.default.strictEqual(hethers_1.hethers.utils.commify(i), tests[i]);
            }
        });
        it("should be able to execute formatUnits()", function () {
            var tinyBars = '100000000000';
            var resultTinybar = hethers_1.hethers.utils.formatUnits(tinyBars, 'tinybar');
            var expectedTinybar = ((new sdk_1.Hbar(tinyBars, sdk_1.HbarUnit.Tinybar)).to(sdk_1.HbarUnit.Tinybar)).toString();
            assert_1.default.strictEqual(resultTinybar, expectedTinybar);
            var resultMicrobar = hethers_1.hethers.utils.formatUnits(tinyBars, 'microbar');
            var expectedMicrobar = ((new sdk_1.Hbar(tinyBars, sdk_1.HbarUnit.Tinybar)).to(sdk_1.HbarUnit.Microbar)).toNumber().toFixed(1);
            assert_1.default.strictEqual(resultMicrobar, expectedMicrobar);
            var resultMillibar = hethers_1.hethers.utils.formatUnits(tinyBars, 'millibar');
            var expectedMillibar = ((new sdk_1.Hbar(tinyBars, sdk_1.HbarUnit.Tinybar)).to(sdk_1.HbarUnit.Millibar)).toNumber().toFixed(1);
            assert_1.default.strictEqual(resultMillibar, expectedMillibar);
            var resultHbar = hethers_1.hethers.utils.formatUnits(tinyBars, 'hbar');
            var expectedHbar = ((new sdk_1.Hbar(tinyBars, sdk_1.HbarUnit.Tinybar)).to(sdk_1.HbarUnit.Hbar)).toNumber().toFixed(1);
            assert_1.default.strictEqual(resultHbar, expectedHbar);
            var resultKilobar = hethers_1.hethers.utils.formatUnits(tinyBars, 'kilobar');
            var expectedKilobar = ((new sdk_1.Hbar(tinyBars, sdk_1.HbarUnit.Tinybar)).to(sdk_1.HbarUnit.Kilobar)).toNumber().toFixed(1);
            assert_1.default.strictEqual(resultKilobar, expectedKilobar);
            var resultMegabar = hethers_1.hethers.utils.formatUnits(tinyBars, 'megabar');
            var expectedMegabar = ((new sdk_1.Hbar(tinyBars, sdk_1.HbarUnit.Tinybar)).to(sdk_1.HbarUnit.Megabar)).toString();
            assert_1.default.strictEqual(resultMegabar, expectedMegabar);
            var resultGigabar = hethers_1.hethers.utils.formatUnits(tinyBars, 'gigabar');
            var expectedGigabar = ((new sdk_1.Hbar(tinyBars, sdk_1.HbarUnit.Tinybar)).to(sdk_1.HbarUnit.Gigabar)).toString();
            assert_1.default.strictEqual(resultGigabar, expectedGigabar);
        });
        it("should be able to execute parseUnits()", function () {
            var tinyBars = '1';
            var resultTinybar = hethers_1.hethers.utils.parseUnits(tinyBars, 'tinybar');
            var expectedTinybar = ((new sdk_1.Hbar(tinyBars, sdk_1.HbarUnit.Tinybar)).to(sdk_1.HbarUnit.Tinybar)).toString();
            assert_1.default.strictEqual(resultTinybar.toString(), expectedTinybar);
            var resultMicrobar = hethers_1.hethers.utils.parseUnits(tinyBars, 'microbar');
            var expectedMicrobar = ((new sdk_1.Hbar(tinyBars, sdk_1.HbarUnit.Microbar)).to(sdk_1.HbarUnit.Tinybar)).toString();
            assert_1.default.strictEqual(resultMicrobar.toString(), expectedMicrobar);
            var resultMillibar = hethers_1.hethers.utils.parseUnits(tinyBars, 'millibar');
            var expectedMillibar = ((new sdk_1.Hbar(tinyBars, sdk_1.HbarUnit.Millibar)).to(sdk_1.HbarUnit.Tinybar)).toString();
            assert_1.default.strictEqual(resultMillibar.toString(), expectedMillibar);
            var resultHbar = hethers_1.hethers.utils.parseUnits(tinyBars, 'hbar');
            var expectedHbar = ((new sdk_1.Hbar(tinyBars, sdk_1.HbarUnit.Hbar)).to(sdk_1.HbarUnit.Tinybar)).toString();
            assert_1.default.strictEqual(resultHbar.toString(), expectedHbar);
            var resultKilobar = hethers_1.hethers.utils.parseUnits(tinyBars, 'kilobar');
            var expectedKilobar = ((new sdk_1.Hbar(tinyBars, sdk_1.HbarUnit.Kilobar)).to(sdk_1.HbarUnit.Tinybar)).toString();
            assert_1.default.strictEqual(resultKilobar.toString(), expectedKilobar);
            var resultMegabar = hethers_1.hethers.utils.parseUnits(tinyBars, 'megabar');
            var expectedMegabar = ((new sdk_1.Hbar(tinyBars, sdk_1.HbarUnit.Megabar)).to(sdk_1.HbarUnit.Tinybar)).toString();
            assert_1.default.strictEqual(resultMegabar.toString(), expectedMegabar);
            var resultGigabar = hethers_1.hethers.utils.parseUnits(tinyBars, 'gigabar');
            var expectedGigabar = ((new sdk_1.Hbar(tinyBars, sdk_1.HbarUnit.Gigabar)).to(sdk_1.HbarUnit.Tinybar)).toString();
            assert_1.default.strictEqual(resultGigabar.toString(), expectedGigabar);
        });
        it("should be able to execute formatHbar()", function () {
            var result = hethers_1.hethers.utils.formatHbar('100000000');
            assert_1.default.strictEqual(result, '1.0');
        });
        it("should be able to execute parseHbar()", function () {
            var result = hethers_1.hethers.utils.parseHbar('1');
            assert_1.default.strictEqual(result.toString(), '100000000');
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
                var actual = hethers_1.hethers.utils.id(test.text);
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
                    var actual = (hethers_1.hethers.utils)['solidity' + funcName](test.types, test.values);
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
                    hethers_1.hethers.utils.solidityPack([type], ["0x12"]);
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
                assert_1.default.equal(hethers_1.hethers.utils.keccak256(test.data), test.keccak256, ('Keccak256 - ' + test.data));
            });
        });
        it('computes sha2-256 correctly', function () {
            this.timeout(120000);
            tests.forEach(function (test) {
                assert_1.default.equal(hethers_1.hethers.utils.sha256(test.data), test.sha256, ('SHA256 - ' + test.data));
            });
        });
        it('computes sha2-512 correctly', function () {
            this.timeout(120000);
            tests.forEach(function (test) {
                assert_1.default.equal(hethers_1.hethers.utils.sha512(test.data), test.sha512, ('SHA512 - ' + test.data));
            });
        });
    });
    describe('Test Solidity splitSignature', function () {
        it('splits a canonical signature', function () {
            this.timeout(120000);
            var r = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
            var s = '0xcafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7e';
            for (var v = 27; v <= 28; v++) {
                var signature = hethers_1.hethers.utils.concat([r, s, [v]]);
                var sig = hethers_1.hethers.utils.splitSignature(signature);
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
                var signature = hethers_1.hethers.utils.concat([r, s, [v - 27]]);
                var sig = hethers_1.hethers.utils.splitSignature(signature);
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
            var decoded = hethers_1.hethers.utils.toUtf8Bytes(decodedText);
            var encoded = 'TWFuIGlzIGRpc3Rpbmd1aXNoZWQsIG5vdCBvbmx5IGJ5IGhpcyByZWFzb24sIGJ1dCBieSB0aGlzIHNpbmd1bGFyIHBhc3Npb24gZnJvbSBvdGhlciBhbmltYWxzLCB3aGljaCBpcyBhIGx1c3Qgb2YgdGhlIG1pbmQsIHRoYXQgYnkgYSBwZXJzZXZlcmFuY2Ugb2YgZGVsaWdodCBpbiB0aGUgY29udGludWVkIGFuZCBpbmRlZmF0aWdhYmxlIGdlbmVyYXRpb24gb2Yga25vd2xlZGdlLCBleGNlZWRzIHRoZSBzaG9ydCB2ZWhlbWVuY2Ugb2YgYW55IGNhcm5hbCBwbGVhc3VyZS4=';
            assert_1.default.equal(hethers_1.hethers.utils.base64.encode(decoded), encoded, 'encodes to base64 string');
            assert_1.default.equal(hethers_1.hethers.utils.toUtf8String(hethers_1.hethers.utils.base64.decode(encoded)), decodedText, 'decodes from base64 string');
        });
    });
    describe('Test UTF-8 coder', function () {
        var overlong = hethers_1.hethers.utils.Utf8ErrorReason.OVERLONG;
        var utf16Surrogate = hethers_1.hethers.utils.Utf8ErrorReason.UTF16_SURROGATE;
        var overrun = hethers_1.hethers.utils.Utf8ErrorReason.OVERRUN;
        var missingContinue = hethers_1.hethers.utils.Utf8ErrorReason.MISSING_CONTINUE;
        var unexpectedContinue = hethers_1.hethers.utils.Utf8ErrorReason.UNEXPECTED_CONTINUE;
        var outOfRange = hethers_1.hethers.utils.Utf8ErrorReason.OUT_OF_RANGE;
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
                var ignored = hethers_1.hethers.utils.toUtf8String(test.bytes, hethers_1.hethers.utils.Utf8ErrorFuncs.ignore);
                assert_1.default.equal(ignored, test.ignored, "ignoring errors matches");
                // Check the string using the replaceErrors conversion
                var replaced = hethers_1.hethers.utils.toUtf8String(test.bytes, hethers_1.hethers.utils.Utf8ErrorFuncs.replace);
                assert_1.default.equal(replaced, test.replaced, "replaced errors matches");
                // Check the string throws the correct error during conversion
                assert_1.default.throws(function () {
                    var result = hethers_1.hethers.utils.toUtf8String(test.bytes);
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
                var bytes = hethers_1.hethers.utils.toUtf8Bytes(str);
                var str2 = hethers_1.hethers.utils.toUtf8String(bytes);
                var escaped = JSON.parse(hethers_1.hethers.utils._toEscapedUtf8String(bytes));
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
            var bytes32 = hethers_1.hethers.utils.formatBytes32String(str);
            var str2 = hethers_1.hethers.utils.parseBytes32String(bytes32);
            assert_1.default.equal(bytes32, '0x7269636d6f6f2e66697265666c792e6574680000000000000000000000000000', 'formatted correctly');
            assert_1.default.equal(str2, str, "parsed correctly");
        });
    });
    function getHex(value) {
        return hethers_1.hethers.utils.hexlify(hethers_1.hethers.utils.toUtf8Bytes(value));
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
                var input = hethers_1.hethers.utils.toUtf8String(test.input);
                if (test.output) {
                    var expected = hethers_1.hethers.utils.toUtf8String(test.output);
                    var actual = hethers_1.hethers.utils.nameprep(input);
                    assert_1.default.equal(actual, expected, "actual(\"" + getHex(actual) + "\") !== expected(\"" + getHex(expected) + "\")");
                }
                else {
                    var ok = true;
                    var reason = "";
                    try {
                        var actual = hethers_1.hethers.utils.nameprep(input);
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
    // FIXME
    //  FileCreate requires some of the changes made in `feat/signing-and-sending-transactions`,
    //  as it currently throws on FileCreate parsing
    describe("Test Typed Transactions", function () {
        var _this = this;
        var sendingAccount = "0.0.101010";
        it('Should parse ContractCreate', function () {
            return __awaiter(this, void 0, void 0, function () {
                var initialBalance, cc, tx, _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            initialBalance = sdk_1.Hbar.fromTinybars(1);
                            cc = new sdk_1.ContractCreateTransaction()
                                .setContractMemo("memo")
                                .setGas(1000)
                                .setBytecodeFileId("0.0.111111")
                                .setNodeAccountIds([new sdk_1.AccountId(0, 0, 3)])
                                .setInitialBalance(initialBalance)
                                .setConstructorParameters(new sdk_1.ContractFunctionParameters().addAddress(hethers_1.hethers.utils.getAddressFromAccount(sendingAccount)))
                                .setTransactionId(sdk_1.TransactionId.generate(sendingAccount))
                                .freeze();
                            return [4 /*yield*/, hethers_1.hethers.utils.parseTransaction(cc.toBytes())];
                        case 1:
                            tx = _e.sent();
                            (0, assert_1.default)(tx.gasLimit.toNumber() === 1000, "Invalid gas limit");
                            (0, assert_1.default)(tx.data == hethers_1.hethers.utils.hexlify(cc.constructorParameters));
                            (0, assert_1.default)(tx.from === hethers_1.hethers.utils.getAddressFromAccount(sendingAccount), "Invalid sending account");
                            _a = assert_1.default;
                            _b = tx.hash;
                            _d = (_c = hethers_1.hethers.utils).hexlify;
                            return [4 /*yield*/, cc.getTransactionHash()];
                        case 2:
                            _a.apply(void 0, [_b === _d.apply(_c, [_e.sent()]), "Hash mismatch"]);
                            (0, assert_1.default)(tx.value.toString() === "1", "Invalid initial balance tx.value(" + tx.value.toString() + ") != ce.initialBalance(1)");
                            return [2 /*return*/];
                    }
                });
            });
        });
        it("Should parse ContractExecute", function () {
            return __awaiter(this, void 0, void 0, function () {
                var payableAmount, ce, tx, _a, _b, _c, _d;
                return __generator(this, function (_e) {
                    switch (_e.label) {
                        case 0:
                            payableAmount = sdk_1.Hbar.fromTinybars(1);
                            ce = new sdk_1.ContractExecuteTransaction()
                                .setGas(1000)
                                .setPayableAmount(payableAmount)
                                .setContractId("0.0.1112121")
                                .setFunction("exec", new sdk_1.ContractFunctionParameters().addAddress(hethers_1.hethers.utils.getAddressFromAccount(sendingAccount)))
                                .setTransactionId(sdk_1.TransactionId.generate(sendingAccount))
                                .setNodeAccountIds([new sdk_1.AccountId(0, 0, 3)])
                                .freeze();
                            return [4 /*yield*/, hethers_1.hethers.utils.parseTransaction(ce.toBytes())];
                        case 1:
                            tx = _e.sent();
                            (0, assert_1.default)(tx.gasLimit.toNumber() === 1000, "Invalid gas");
                            (0, assert_1.default)(tx.from === hethers_1.hethers.utils.getAddressFromAccount(sendingAccount), "Invalid sending account");
                            // remove 0x prefix
                            (0, assert_1.default)(tx.to.slice(2) === ce.contractId.toSolidityAddress(), "Invalid tx.to");
                            (0, assert_1.default)(tx.data == hethers_1.hethers.utils.hexlify(ce.functionParameters));
                            _a = assert_1.default;
                            _b = tx.hash;
                            _d = (_c = hethers_1.hethers.utils).hexlify;
                            return [4 /*yield*/, ce.getTransactionHash()];
                        case 2:
                            _a.apply(void 0, [_b === _d.apply(_c, [_e.sent()]), "Hash mismatch"]);
                            (0, assert_1.default)(tx.value.toString() === "1", "Invalid initial balance tx.value(" + tx.value.toString() + ") != ce.payableAmount(1); Tinybar value " + ce.payableAmount.toTinybars().toNumber());
                            return [2 /*return*/];
                    }
                });
            });
        });
        it("Should fail parsing other transactions", function () {
            return __awaiter(this, void 0, void 0, function () {
                var t, tx, err_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            t = new sdk_1.TransferTransaction()
                                .addHbarTransfer("0.0.98", new sdk_1.Hbar(1))
                                .addHbarTransfer("0.0.101010", new sdk_1.Hbar(-1))
                                .setNodeAccountIds([new sdk_1.AccountId(0, 0, 3)])
                                .setTransactionId(sdk_1.TransactionId.generate(sendingAccount))
                                .freeze();
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, hethers_1.hethers.utils.parseTransaction(t.toBytes())];
                        case 2:
                            tx = _a.sent();
                            (0, assert_1.default)(tx == null, "unexpected tx");
                            return [3 /*break*/, 4];
                        case 3:
                            err_1 = _a.sent();
                            (0, assert_1.default)(err_1 !== undefined, "expected error on parsing transfer tx");
                            return [3 /*break*/, 4];
                        case 4: return [2 /*return*/];
                    }
                });
            });
        });
        it('should place admin key for contracts when given', function () { return __awaiter(_this, void 0, void 0, function () {
            var tx, signedTx, signedBytes, parsedHederaTx, adminKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tx = {
                            data: '0x',
                            gasLimit: 30000,
                            customData: {
                                bytecodeFileId: '1.1.1',
                                contractAdminKey: localWalletECDSA._signingKey().compressedPublicKey
                            }
                        };
                        return [4 /*yield*/, localWalletECDSA.signTransaction(tx)];
                    case 1:
                        signedTx = _a.sent();
                        signedBytes = hethers_1.hethers.utils.arrayify(signedTx);
                        parsedHederaTx = sdk_1.Transaction.fromBytes(signedBytes);
                        adminKey = (0, bytes_1.hexlify)(parsedHederaTx.adminKey._toProtobufKey().ECDSASecp256k1);
                        assert_1.default.strictEqual(adminKey, tx.customData.contractAdminKey, 'admin key mismatch or not present');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should accept contract id ', function () { return __awaiter(_this, void 0, void 0, function () {
            var tx, signedTx, signedBytes, parsedHederaTx, adminKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        tx = {
                            data: '0x',
                            gasLimit: 30000,
                            customData: {
                                bytecodeFileId: '1.1.1',
                                contractAdminKey: '0.0.2'
                            }
                        };
                        return [4 /*yield*/, localWalletECDSA.signTransaction(tx)];
                    case 1:
                        signedTx = _a.sent();
                        signedBytes = hethers_1.hethers.utils.arrayify(signedTx);
                        parsedHederaTx = sdk_1.Transaction.fromBytes(signedBytes);
                        adminKey = (parsedHederaTx.adminKey._toProtobufKey().contractID);
                        assert_1.default.strictEqual(adminKey.shardNum + "." + adminKey.realmNum + "." + adminKey.contractNum, tx.customData.contractAdminKey, 'admin key mismatch or not present');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should accept contract address', function () { return __awaiter(_this, void 0, void 0, function () {
            var addr, tx, signedTx, signedBytes, parsedHederaTx, adminKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        addr = (0, address_1.getAddressFromAccount)('0.0.2');
                        tx = {
                            data: '0x',
                            gasLimit: 30000,
                            customData: {
                                bytecodeFileId: '1.1.1',
                                contractAdminKey: addr
                            }
                        };
                        return [4 /*yield*/, localWalletECDSA.signTransaction(tx)];
                    case 1:
                        signedTx = _a.sent();
                        signedBytes = hethers_1.hethers.utils.arrayify(signedTx);
                        parsedHederaTx = sdk_1.Transaction.fromBytes(signedBytes);
                        adminKey = (parsedHederaTx.adminKey._toProtobufKey().contractID);
                        assert_1.default.strictEqual(adminKey.shardNum + "." + adminKey.realmNum + "." + adminKey.contractNum, '0.0.2', 'admin key mismatch or not present');
                        return [2 /*return*/];
                }
            });
        }); });
        it('should accept valid contract memo', function () {
            return __awaiter(this, void 0, void 0, function () {
                var memo, tx, signedTx, signedBytes, parsedHederaTx, contractCreateTx;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            memo = 'memo';
                            tx = {
                                data: '0x',
                                gasLimit: 30000,
                                customData: {
                                    bytecodeFileId: '1.1.1',
                                    contractMemo: memo
                                }
                            };
                            return [4 /*yield*/, localWalletECDSA.signTransaction(tx)];
                        case 1:
                            signedTx = _a.sent();
                            signedBytes = hethers_1.hethers.utils.arrayify(signedTx);
                            parsedHederaTx = sdk_1.Transaction.fromBytes(signedBytes);
                            contractCreateTx = parsedHederaTx;
                            assert_1.default.strictEqual(memo, contractCreateTx.contractMemo, 'invalid contract memo');
                            return [2 /*return*/];
                    }
                });
            });
        });
        it('should reject invalid memos', function () {
            return __awaiter(this, void 0, void 0, function () {
                var invalidMemo, tx, e_1, i, e_2, e_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            invalidMemo = '';
                            tx = {
                                data: '0x',
                                gasLimit: 30000,
                                customData: {
                                    bytecodeFileId: '1.1.1',
                                    contractMemo: invalidMemo
                                }
                            };
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, localWalletECDSA.signTransaction(tx)];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            assert_1.default.strictEqual(logger_1.Logger.errors.INVALID_ARGUMENT, e_1.code, "expected invalid contract memo");
                            assert_1.default.strictEqual(e_1.message.startsWith('invalid contract memo'), true, 'expected fail message on invalid memo');
                            return [3 /*break*/, 4];
                        case 4:
                            for (i = 0; i <= 101; i++) {
                                invalidMemo += '0';
                            }
                            tx.customData.contractMemo = invalidMemo;
                            _a.label = 5;
                        case 5:
                            _a.trys.push([5, 7, , 8]);
                            return [4 /*yield*/, localWalletECDSA.signTransaction(tx)];
                        case 6:
                            _a.sent();
                            return [3 /*break*/, 8];
                        case 7:
                            e_2 = _a.sent();
                            assert_1.default.strictEqual(logger_1.Logger.errors.INVALID_ARGUMENT, e_2.code, "expected invalid contract memo");
                            assert_1.default.strictEqual(e_2.message.startsWith('invalid contract memo'), true, 'expected fail message on invalid memo');
                            return [3 /*break*/, 8];
                        case 8:
                            tx.customData.contractMemo = "validContractMemo";
                            // @ts-ignore - does not allow setting memo when not present initially
                            tx.customData.memo = invalidMemo;
                            _a.label = 9;
                        case 9:
                            _a.trys.push([9, 11, , 12]);
                            return [4 /*yield*/, localWalletECDSA.signTransaction(tx)];
                        case 10:
                            _a.sent();
                            return [3 /*break*/, 12];
                        case 11:
                            e_3 = _a.sent();
                            assert_1.default.strictEqual(logger_1.Logger.errors.INVALID_ARGUMENT, e_3.code, "expected invalid tx memo");
                            assert_1.default.strictEqual(e_3.message.startsWith('invalid tx memo'), true, 'expected fail message on invalid memo');
                            return [3 /*break*/, 12];
                        case 12: return [2 /*return*/];
                    }
                });
            });
        });
        it('differentiates between contract memo and tx memo', function () {
            return __awaiter(this, void 0, void 0, function () {
                var contractMemo, txMemo, tx, signedTx, signedBytes, parsedHederaTx, contractCreateTx;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            contractMemo = 'contractMemo';
                            txMemo = "txMemo";
                            tx = {
                                data: '0x',
                                gasLimit: 30000,
                                customData: {
                                    bytecodeFileId: '1.1.1',
                                    contractMemo: contractMemo,
                                    memo: txMemo
                                }
                            };
                            return [4 /*yield*/, localWalletECDSA.signTransaction(tx)];
                        case 1:
                            signedTx = _a.sent();
                            signedBytes = hethers_1.hethers.utils.arrayify(signedTx);
                            parsedHederaTx = sdk_1.Transaction.fromBytes(signedBytes);
                            contractCreateTx = parsedHederaTx;
                            assert_1.default.strictEqual(contractMemo, contractCreateTx.contractMemo, 'invalid contract memo');
                            assert_1.default.strictEqual(txMemo, contractCreateTx.transactionMemo, "invalid tx memo");
                            return [2 /*return*/];
                    }
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
                        var value = hethers_1.hethers.BigNumber.from(test.value);
                        console.log("ERROR", value);
                    }, function (error) {
                        return true;
                    });
                });
            }
            else {
                it(test.testcase, function () {
                    var value = hethers_1.hethers.BigNumber.from(test.value);
                    assert_1.default.equal(value.toHexString(), test.expectedValue);
                    var value2 = hethers_1.hethers.BigNumber.from(value);
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
                var value = hethers_1.hethers.BigNumber.from(test.value);
                var expected = hethers_1.hethers.BigNumber.from(test.expected);
                assert_1.default.ok(value.abs().eq(expected));
            });
        });
        // Fails to create from BN (or any junk with a length) (See: #1172)
        it("Fails on junk with a length property", function () {
            var junk = { negative: 0, words: [1000], length: 1, red: null };
            assert_1.default.throws(function () {
                var value = hethers_1.hethers.BigNumber.from("100").add(junk);
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
                    var value = hethers_1.hethers.FixedNumber.from(test.value);
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
                    var value = hethers_1.hethers.FixedNumber.from(test.value).round(test.round);
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
                    var value = hethers_1.hethers.FixedNumber.from(test.value);
                    assert_1.default.equal(value.floor().toString(), test.floor);
                    assert_1.default.equal(value.ceiling().toString(), test.ceiling);
                });
            });
        }
    });
    describe("Logger", function () {
        var logger = new hethers_1.hethers.utils.Logger("testing/0.0");
        it("setLogLevel", function () {
            hethers_1.hethers.utils.Logger.setLogLevel(hethers_1.hethers.utils.Logger.levels.DEBUG);
            hethers_1.hethers.utils.Logger.setLogLevel(hethers_1.hethers.utils.Logger.levels.INFO);
            hethers_1.hethers.utils.Logger.setLogLevel(hethers_1.hethers.utils.Logger.levels.WARNING);
            hethers_1.hethers.utils.Logger.setLogLevel(hethers_1.hethers.utils.Logger.levels.ERROR);
            hethers_1.hethers.utils.Logger.setLogLevel(hethers_1.hethers.utils.Logger.levels.OFF);
            // Reset back to INFO when done tests
            hethers_1.hethers.utils.Logger.setLogLevel(hethers_1.hethers.utils.Logger.levels.INFO);
        });
        it("checkArgumentCount", function () {
            logger.checkArgumentCount(3, 3);
        });
        it("checkArgumentCount - too few", function () {
            assert_1.default.throws(function () {
                logger.checkArgumentCount(1, 3);
            }, function (error) {
                return error.code === hethers_1.hethers.utils.Logger.errors.MISSING_ARGUMENT;
            });
        });
        it("checkArgumentCount - too many", function () {
            assert_1.default.throws(function () {
                logger.checkArgumentCount(3, 1);
            }, function (error) {
                return error.code === hethers_1.hethers.utils.Logger.errors.UNEXPECTED_ARGUMENT;
            });
        });
    });
    describe("Base58 Coder", function () {
        it("decodes", function () {
            assert_1.default.equal(hethers_1.hethers.utils.toUtf8String(hethers_1.hethers.utils.base58.decode("JxF12TrwUP45BMd")), "Hello World");
        });
        it("encodes", function () {
            assert_1.default.equal(hethers_1.hethers.utils.base58.encode(hethers_1.hethers.utils.toUtf8Bytes("Hello World")), "JxF12TrwUP45BMd");
        });
    });
    describe("Account like to string", function () {
        it('Is usable for ethereum addresses', function () {
            return __awaiter(this, void 0, void 0, function () {
                var contractAddr, accStr;
                return __generator(this, function (_a) {
                    contractAddr = '0000000000000000000000000000000001b34cbb';
                    accStr = (0, address_1.asAccountString)(contractAddr);
                    // should not be touched
                    assert_1.default.strictEqual(accStr, '0.0.28527803');
                    return [2 /*return*/];
                });
            });
        });
        it('Is able to convert hedera account to string', function () {
            return __awaiter(this, void 0, void 0, function () {
                var accLike, accStr, split, accLike2, split2;
                return __generator(this, function (_a) {
                    accLike = {
                        shard: BigInt(0),
                        realm: BigInt(0),
                        num: BigInt(420),
                    };
                    accStr = (0, address_1.asAccountString)(accLike);
                    split = accStr.split('.');
                    assert_1.default.notStrictEqual(accStr, "");
                    assert_1.default.strictEqual(split[0], "0");
                    assert_1.default.strictEqual(split[1], "0");
                    assert_1.default.strictEqual(split[2], "420");
                    accLike2 = "0.0.69";
                    accStr = (0, address_1.asAccountString)(accLike2);
                    split2 = accStr.split('.');
                    assert_1.default.notStrictEqual(accStr, "");
                    assert_1.default.strictEqual(split2[0], "0");
                    assert_1.default.strictEqual(split2[1], "0");
                    assert_1.default.strictEqual(split2[2], "69");
                    return [2 /*return*/];
                });
            });
        });
        it("Should throw on random string", function () {
            return __awaiter(this, void 0, void 0, function () {
                var notReallyAccountLike;
                return __generator(this, function (_a) {
                    notReallyAccountLike = "foo";
                    try {
                        (0, address_1.asAccountString)(notReallyAccountLike);
                    }
                    catch (e) {
                        assert_1.default.strictEqual(e.code, logger_1.Logger.errors.INVALID_ARGUMENT);
                        assert_1.default.notStrictEqual(e, null);
                    }
                    return [2 /*return*/];
                });
            });
        });
    });
    /*
    describe("Web Fetch", function() {
        it("fetches JSON", async function() {
            const url = "https:/\/api.etherscan.io/api?module=stats&action=ethprice&apikey=9D13ZE7XSBTJ94N9BNJ2MA33VMAY2YPIRB";
            const getData = hethers.utils.fetchJson(url)
        });
    });
    */
    // TODO: check when implementing wallet.signTypedData
    describe("EIP-712", function () {
        var tests = (0, testcases_1.loadTests)("eip712");
        tests.forEach(function (test) {
            it("encoding " + test.name, function () {
                var encoder = hethers_1.hethers.utils._TypedDataEncoder.from(test.types);
                assert_1.default.equal(encoder.primaryType, test.primaryType, "instance.primaryType");
                assert_1.default.equal(encoder.encode(test.data), test.encoded, "instance.encode()");
                //console.log(test);
                assert_1.default.equal(hethers_1.hethers.utils._TypedDataEncoder.getPrimaryType(test.types), test.primaryType, "getPrimaryType");
                assert_1.default.equal(hethers_1.hethers.utils._TypedDataEncoder.hash(test.domain, test.types, test.data), test.digest, "digest");
            });
        });
        tests.forEach(function (test) {
            if (!test.privateKey) {
                return;
            }
            it("signing " + test.name, function () {
                return __awaiter(this, void 0, void 0, function () {
                    var wallet;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                wallet = new hethers_1.hethers.Wallet(test.privateKey);
                                return [4 /*yield*/, assert_1.default.rejects(wallet._signTypedData(test.domain, test.types, test.data), '_signTypedData not supported')];
                            case 1:
                                _a.sent();
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
    // FIXME
    // function _deepEquals(a: any, b: any, path: string): string {
    //     if (Array.isArray(a)) {
    //         if (!Array.isArray(b)) {
    //             return `{ path }:!isArray(b)`;
    //         }
    //         if (a.length !== b.length) {
    //             return `{ path }:a.length[${ a.length }]!=b.length[${ b.length }]`;
    //         }
    //         for (let i = 0; i < a.length; i++) {
    //             const reason = _deepEquals(a[i], b[i], `${ path }:${ i }`);
    //             if (reason != null) { return reason; }
    //         }
    //         return null;
    //     }
    //
    //     if (a.eq) {
    //         if (!b.eq) { return `${ path }:typeof(b)!=BigNumber`; }
    //         return a.eq(b) ? null: `${ path }:!a.eq(b)`;
    //     }
    //
    //     if (a != null && typeof(a) === "object") {
    //         if (b != null && typeof(b) !== "object") { return `${ path }:typeof(b)!=object`; }
    //         const keys = Object.keys(a), otherKeys = Object.keys(b);
    //         keys.sort();
    //         otherKeys.sort();
    //         if (keys.length !== otherKeys.length) { return `${ path }:keys(a)[${ keys.join(",") }]!=keys(b)[${ otherKeys.join(",") }]`; }
    //         for (const key in a) {
    //             const reason = _deepEquals(a[key], b[key], `${ path }:${ key }`);
    //             if (reason != null) { return reason; }
    //         }
    //         return null;
    //     }
    //
    //     if (a !== b) { return `${ path }[${ a } != ${ b }]`; }
    //
    //     return null;
    // }
    // FIXME
    // function deepEquals(a: any, b: any): string {
    //     return _deepEquals(a, b, "");
    // }
    // TODO - check when hedera supports the optional access list
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
                    gasPrice: hethers_1.hethers.BigNumber.from("0x65cf89a0"),
                    gasLimit: hethers_1.hethers.BigNumber.from("0x5b68"),
                    to: "0x32162F3581E88a5f62e8A61892B42C46E2c18f7b",
                    value: hethers_1.hethers.BigNumber.from("0"),
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
                    gasPrice: hethers_1.hethers.BigNumber.from("0x65cf89a0"),
                    gasLimit: hethers_1.hethers.BigNumber.from("0x71ac"),
                    to: "0x32162F3581E88a5f62e8A61892B42C46E2c18f7b",
                    value: hethers_1.hethers.BigNumber.from("0"),
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
                // FIXME
                // const tx = hethers.utils.parseTransaction(test.data);
                // assert.equal(tx.hash, test.hash);
                // const reason = deepEquals(tx, test.tx);
                // assert.ok(reason == null, reason);
                //
                // const preimageData = hethers.utils.serializeTransaction(<any>(test.tx));
                // assert.equal(preimageData, test.preimage);
                //
                // const data = hethers.utils.serializeTransaction(<any>(test.tx), test.tx);
                // assert.equal(data, test.data);
            });
        });
    });
});
//# sourceMappingURL=test-utils.spec.js.map