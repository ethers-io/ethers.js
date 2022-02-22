'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import assert from 'assert';
// @ts-ignore
import { hethers } from "hethers";
import { loadTests } from "@hethers/testcases";
import * as utils from './utils';
import { AccountId, ContractCreateTransaction, ContractExecuteTransaction, ContractFunctionParameters, Hbar, HbarUnit, TransactionId, TransferTransaction } from "@hashgraph/sdk";
import { getAddressFromAccount, hexlify } from "hethers/lib/utils";
import { asAccountString } from "@hethers/address";
import { Logger } from "@hethers/logger";
// @ts-ignore
function equals(a, b) {
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) {
            return false;
        }
        for (let i = 0; i < a.length; i++) {
            if (!equals(a[i], b[i])) {
                return false;
            }
        }
        return true;
    }
    return a === b;
}
describe('Test Unit Conversion', function () {
    it("should be able to execute formats with commify", function () {
        const tests = {
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
        for (let i in tests) {
            assert.strictEqual(hethers.utils.commify(i), tests[i]);
        }
    });
    it("should be able to execute formatUnits()", function () {
        const tinyBars = '100000000000';
        let resultTinybar = hethers.utils.formatUnits(tinyBars, 'tinybar');
        let expectedTinybar = ((new Hbar(tinyBars, HbarUnit.Tinybar)).to(HbarUnit.Tinybar)).toString();
        assert.strictEqual(resultTinybar, expectedTinybar);
        let resultMicrobar = hethers.utils.formatUnits(tinyBars, 'microbar');
        let expectedMicrobar = ((new Hbar(tinyBars, HbarUnit.Tinybar)).to(HbarUnit.Microbar)).toNumber().toFixed(1);
        assert.strictEqual(resultMicrobar, expectedMicrobar);
        let resultMillibar = hethers.utils.formatUnits(tinyBars, 'millibar');
        let expectedMillibar = ((new Hbar(tinyBars, HbarUnit.Tinybar)).to(HbarUnit.Millibar)).toNumber().toFixed(1);
        assert.strictEqual(resultMillibar, expectedMillibar);
        let resultHbar = hethers.utils.formatUnits(tinyBars, 'hbar');
        let expectedHbar = ((new Hbar(tinyBars, HbarUnit.Tinybar)).to(HbarUnit.Hbar)).toNumber().toFixed(1);
        assert.strictEqual(resultHbar, expectedHbar);
        let resultKilobar = hethers.utils.formatUnits(tinyBars, 'kilobar');
        let expectedKilobar = ((new Hbar(tinyBars, HbarUnit.Tinybar)).to(HbarUnit.Kilobar)).toNumber().toFixed(1);
        assert.strictEqual(resultKilobar, expectedKilobar);
        let resultMegabar = hethers.utils.formatUnits(tinyBars, 'megabar');
        let expectedMegabar = ((new Hbar(tinyBars, HbarUnit.Tinybar)).to(HbarUnit.Megabar)).toString();
        assert.strictEqual(resultMegabar, expectedMegabar);
        let resultGigabar = hethers.utils.formatUnits(tinyBars, 'gigabar');
        let expectedGigabar = ((new Hbar(tinyBars, HbarUnit.Tinybar)).to(HbarUnit.Gigabar)).toString();
        assert.strictEqual(resultGigabar, expectedGigabar);
    });
    it("should be able to execute parseUnits()", function () {
        const tinyBars = '1';
        let resultTinybar = hethers.utils.parseUnits(tinyBars, 'tinybar');
        let expectedTinybar = ((new Hbar(tinyBars, HbarUnit.Tinybar)).to(HbarUnit.Tinybar)).toString();
        assert.strictEqual(resultTinybar.toString(), expectedTinybar);
        let resultMicrobar = hethers.utils.parseUnits(tinyBars, 'microbar');
        let expectedMicrobar = ((new Hbar(tinyBars, HbarUnit.Microbar)).to(HbarUnit.Tinybar)).toString();
        assert.strictEqual(resultMicrobar.toString(), expectedMicrobar);
        let resultMillibar = hethers.utils.parseUnits(tinyBars, 'millibar');
        let expectedMillibar = ((new Hbar(tinyBars, HbarUnit.Millibar)).to(HbarUnit.Tinybar)).toString();
        assert.strictEqual(resultMillibar.toString(), expectedMillibar);
        let resultHbar = hethers.utils.parseUnits(tinyBars, 'hbar');
        let expectedHbar = ((new Hbar(tinyBars, HbarUnit.Hbar)).to(HbarUnit.Tinybar)).toString();
        assert.strictEqual(resultHbar.toString(), expectedHbar);
        let resultKilobar = hethers.utils.parseUnits(tinyBars, 'kilobar');
        let expectedKilobar = ((new Hbar(tinyBars, HbarUnit.Kilobar)).to(HbarUnit.Tinybar)).toString();
        assert.strictEqual(resultKilobar.toString(), expectedKilobar);
        let resultMegabar = hethers.utils.parseUnits(tinyBars, 'megabar');
        let expectedMegabar = ((new Hbar(tinyBars, HbarUnit.Megabar)).to(HbarUnit.Tinybar)).toString();
        assert.strictEqual(resultMegabar.toString(), expectedMegabar);
        let resultGigabar = hethers.utils.parseUnits(tinyBars, 'gigabar');
        let expectedGigabar = ((new Hbar(tinyBars, HbarUnit.Gigabar)).to(HbarUnit.Tinybar)).toString();
        assert.strictEqual(resultGigabar.toString(), expectedGigabar);
    });
    it("should be able to execute formatHbar()", function () {
        const result = hethers.utils.formatHbar('100000000');
        assert.strictEqual(result, '1.0');
    });
    it("should be able to execute parseHbar()", function () {
        const result = hethers.utils.parseHbar('1');
        assert.strictEqual(result.toString(), '100000000');
    });
});
describe('Test ID Hash Functions', function () {
    const tests = [
        {
            name: 'setAddr signature hash',
            text: 'setAddr(bytes32,address)',
            expected: '0xd5fa2b00b0756613052388dd576d941ba16904757996b8bb03a737ef4fd1f9ce'
        }
    ];
    tests.forEach((test) => {
        it(('computes id - ' + test.name), function () {
            this.timeout(120000);
            let actual = hethers.utils.id(test.text);
            assert.equal(actual, test.expected, 'computes id(' + test.text + ')');
        });
    });
});
describe('Test Solidity Hash Functions', function () {
    const tests = loadTests('solidity-hashes');
    function test(funcName, testKey) {
        it(`computes ${funcName} correctly`, function () {
            this.timeout(120000);
            tests.forEach((test, index) => {
                let actual = (hethers.utils)['solidity' + funcName](test.types, test.values);
                let expected = test[testKey];
                assert.equal(actual, expected, ('computes solidity-' + funcName + '(' + JSON.stringify(test.values) + ') - ' + test.types));
            });
        });
    }
    test('Keccak256', 'keccak256');
    test('Sha256', 'sha256');
    const testsInvalid = [
        "uint0",
        "uint1",
        "uint08",
        "uint266",
        "bytes0",
        "bytes02",
        "bytes33",
        "purple" // invalid type
    ];
    testsInvalid.forEach((type) => {
        it(`disallows invalid type "${type}"`, function () {
            assert.throws(() => {
                hethers.utils.solidityPack([type], ["0x12"]);
            }, (error) => {
                const message = error.message;
                return (message.match(/invalid([a-z ]*) type/) && message.indexOf(type) >= 0);
            });
        });
    });
});
describe('Test Hash Functions', function () {
    const tests = loadTests('hashes');
    it('computes keccak256 correctly', function () {
        this.timeout(120000);
        tests.forEach(function (test) {
            assert.equal(hethers.utils.keccak256(test.data), test.keccak256, ('Keccak256 - ' + test.data));
        });
    });
    it('computes sha2-256 correctly', function () {
        this.timeout(120000);
        tests.forEach(function (test) {
            assert.equal(hethers.utils.sha256(test.data), test.sha256, ('SHA256 - ' + test.data));
        });
    });
    it('computes sha2-512 correctly', function () {
        this.timeout(120000);
        tests.forEach(function (test) {
            assert.equal(hethers.utils.sha512(test.data), test.sha512, ('SHA512 - ' + test.data));
        });
    });
});
describe('Test Solidity splitSignature', function () {
    it('splits a canonical signature', function () {
        this.timeout(120000);
        let r = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
        let s = '0xcafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7e';
        for (let v = 27; v <= 28; v++) {
            let signature = hethers.utils.concat([r, s, [v]]);
            let sig = hethers.utils.splitSignature(signature);
            assert.equal(sig.r, r, 'split r correctly');
            assert.equal(sig.s, s, 'split s correctly');
            assert.equal(sig.v, v, 'split v correctly');
        }
    });
    it('splits a legacy signature', function () {
        this.timeout(120000);
        let r = '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef';
        let s = '0xcafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7ecafe1a7e';
        for (let v = 27; v <= 28; v++) {
            let signature = hethers.utils.concat([r, s, [v - 27]]);
            let sig = hethers.utils.splitSignature(signature);
            assert.equal(sig.r, r, 'split r correctly');
            assert.equal(sig.s, s, 'split s correctly');
            assert.equal(sig.v, v, 'split v correctly');
        }
    });
});
describe('Test Base64 coder', function () {
    // https://en.wikipedia.org/wiki/Base64#Examples
    it('encodes and decodes the example from wikipedia', function () {
        this.timeout(120000);
        let decodedText = 'Man is distinguished, not only by his reason, but by this singular passion from other animals, which is a lust of the mind, that by a perseverance of delight in the continued and indefatigable generation of knowledge, exceeds the short vehemence of any carnal pleasure.';
        let decoded = hethers.utils.toUtf8Bytes(decodedText);
        let encoded = 'TWFuIGlzIGRpc3Rpbmd1aXNoZWQsIG5vdCBvbmx5IGJ5IGhpcyByZWFzb24sIGJ1dCBieSB0aGlzIHNpbmd1bGFyIHBhc3Npb24gZnJvbSBvdGhlciBhbmltYWxzLCB3aGljaCBpcyBhIGx1c3Qgb2YgdGhlIG1pbmQsIHRoYXQgYnkgYSBwZXJzZXZlcmFuY2Ugb2YgZGVsaWdodCBpbiB0aGUgY29udGludWVkIGFuZCBpbmRlZmF0aWdhYmxlIGdlbmVyYXRpb24gb2Yga25vd2xlZGdlLCBleGNlZWRzIHRoZSBzaG9ydCB2ZWhlbWVuY2Ugb2YgYW55IGNhcm5hbCBwbGVhc3VyZS4=';
        assert.equal(hethers.utils.base64.encode(decoded), encoded, 'encodes to base64 string');
        assert.equal(hethers.utils.toUtf8String(hethers.utils.base64.decode(encoded)), decodedText, 'decodes from base64 string');
    });
});
describe('Test UTF-8 coder', function () {
    const overlong = hethers.utils.Utf8ErrorReason.OVERLONG;
    const utf16Surrogate = hethers.utils.Utf8ErrorReason.UTF16_SURROGATE;
    const overrun = hethers.utils.Utf8ErrorReason.OVERRUN;
    const missingContinue = hethers.utils.Utf8ErrorReason.MISSING_CONTINUE;
    const unexpectedContinue = hethers.utils.Utf8ErrorReason.UNEXPECTED_CONTINUE;
    const outOfRange = hethers.utils.Utf8ErrorReason.OUT_OF_RANGE;
    let BadUTF = [
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
            const ignored = hethers.utils.toUtf8String(test.bytes, hethers.utils.Utf8ErrorFuncs.ignore);
            assert.equal(ignored, test.ignored, "ignoring errors matches");
            // Check the string using the replaceErrors conversion
            const replaced = hethers.utils.toUtf8String(test.bytes, hethers.utils.Utf8ErrorFuncs.replace);
            assert.equal(replaced, test.replaced, "replaced errors matches");
            // Check the string throws the correct error during conversion
            assert.throws(function () {
                let result = hethers.utils.toUtf8String(test.bytes);
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
                    let left = utils.randomNumber(seed + '-value', 0xd800, 0xdbff + 1);
                    let right = utils.randomNumber(seed + '-value', 0xdc00, 0xdfff + 1);
                    return String.fromCharCode(left, right);
            }
            throw new Error('this should not happen');
        }
        function randomString(seed) {
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
            let bytes = hethers.utils.toUtf8Bytes(str);
            let str2 = hethers.utils.toUtf8String(bytes);
            let escaped = JSON.parse(hethers.utils._toEscapedUtf8String(bytes));
            //            assert.ok(Buffer.from(str).equals(Buffer.from(bytes)), 'bytes not generated correctly - ' + bytes)
            assert.equal(str2, str, 'conversion not reflexive - ' + bytes);
            assert.equal(escaped, str, 'conversion not reflexive - ' + bytes);
        }
    });
});
describe('Test Bytes32String coder', function () {
    // @TODO: a LOT more test cases; generated from Solidity
    it("encodes an ens name", function () {
        let str = "ricmoo.firefly.eth";
        let bytes32 = hethers.utils.formatBytes32String(str);
        let str2 = hethers.utils.parseBytes32String(bytes32);
        assert.equal(bytes32, '0x7269636d6f6f2e66697265666c792e6574680000000000000000000000000000', 'formatted correctly');
        assert.equal(str2, str, "parsed correctly");
    });
});
function getHex(value) {
    return hethers.utils.hexlify(hethers.utils.toUtf8Bytes(value));
}
describe("Test nameprep", function () {
    const Tests = loadTests("nameprep");
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
        it(test.comment, function () {
            let input = hethers.utils.toUtf8String(test.input);
            if (test.output) {
                let expected = hethers.utils.toUtf8String(test.output);
                let actual = hethers.utils.nameprep(input);
                assert.equal(actual, expected, `actual("${getHex(actual)}") !== expected("${getHex(expected)}")`);
            }
            else {
                let ok = true;
                let reason = "";
                try {
                    let actual = hethers.utils.nameprep(input);
                    console.log(actual);
                    reason = `should has thrown ${test.rc} - actual("${getHex(actual)}")`;
                    ok = false;
                }
                catch (error) {
                }
                assert.ok(ok, reason);
            }
        });
    });
});
// FIXME
describe("Test Signature Manipulation", function () {
    // TODO: fix by recovering PublicKey and not address (ecrecover)
    const tests = loadTests("transactions");
    tests.forEach((test) => {
        it("autofills partial signatures - " + test.name, function () {
            const address = hethers.utils.getAddress(test.accountAddress);
            const hash = hethers.utils.keccak256(test.unsignedTransaction);
            const data = hethers.utils.RLP.decode(test.signedTransaction);
            const s = data.pop(), r = data.pop(), v = parseInt(data.pop().substring(2), 16);
            const sig = hethers.utils.splitSignature({ r: r, s: s, v: v });
            {
                const addr = hethers.utils.recoverAddress(hash, {
                    r: r, s: s, v: v
                });
                assert.equal(addr, address, "Using r, s and v");
            }
            {
                const addr = hethers.utils.recoverAddress(hash, {
                    r: sig.r, _vs: sig._vs
                });
                assert.equal(addr, address, "Using r, _vs");
            }
            {
                const addr = hethers.utils.recoverAddress(hash, {
                    r: sig.r, s: sig.s, recoveryParam: sig.recoveryParam
                });
                assert.equal(addr, address, "Using r, s and recoveryParam");
            }
        });
    });
});
// FIXME
//  FileCreate requires some of the changes made in `feat/signing-and-sending-transactions`,
//  as it currently throws on FileCreate parsing
describe("Test Typed Transactions", function () {
    const sendingAccount = "0.0.101010";
    it('Should parse ContractCreate', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const initialBalance = Hbar.fromTinybars(1);
            const cc = new ContractCreateTransaction()
                .setContractMemo("memo")
                .setGas(1000)
                .setBytecodeFileId("0.0.111111")
                .setNodeAccountIds([new AccountId(0, 0, 3)])
                .setInitialBalance(initialBalance)
                .setConstructorParameters(new ContractFunctionParameters().addAddress(getAddressFromAccount(sendingAccount)))
                .setTransactionId(TransactionId.generate(sendingAccount))
                .freeze();
            const tx = yield hethers.utils.parseTransaction(cc.toBytes());
            assert(tx.gasLimit.toNumber() === 1000, "Invalid gas limit");
            assert(tx.data == hexlify(cc.constructorParameters));
            assert(tx.from === getAddressFromAccount(sendingAccount), "Invalid sending account");
            assert(tx.hash === hexlify(yield cc.getTransactionHash()), "Hash mismatch");
            assert(tx.value.toString() === "1", `Invalid initial balance tx.value(${tx.value.toString()}) != ce.initialBalance(1)`);
        });
    });
    it("Should parse ContractExecute", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const payableAmount = Hbar.fromTinybars(1);
            const ce = new ContractExecuteTransaction()
                .setGas(1000)
                .setPayableAmount(payableAmount)
                .setContractId("0.0.1112121")
                .setFunction("exec", new ContractFunctionParameters().addAddress(getAddressFromAccount(sendingAccount)))
                .setTransactionId(TransactionId.generate(sendingAccount))
                .setNodeAccountIds([new AccountId(0, 0, 3)])
                .freeze();
            const tx = yield hethers.utils.parseTransaction(ce.toBytes());
            assert(tx.gasLimit.toNumber() === 1000, "Invalid gas");
            assert(tx.from === getAddressFromAccount(sendingAccount), "Invalid sending account");
            // remove 0x prefix
            assert(tx.to.slice(2) === ce.contractId.toSolidityAddress(), "Invalid tx.to");
            assert(tx.data == hexlify(ce.functionParameters));
            assert(tx.hash === hexlify(yield ce.getTransactionHash()), "Hash mismatch");
            assert(tx.value.toString() === "1", `Invalid initial balance tx.value(${tx.value.toString()}) != ce.payableAmount(1); Tinybar value ${ce.payableAmount.toTinybars().toNumber()}`);
        });
    });
    it("Should fail parsing other transactions", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const t = new TransferTransaction()
                .addHbarTransfer("0.0.98", new Hbar(1))
                .addHbarTransfer("0.0.101010", new Hbar(-1))
                .setNodeAccountIds([new AccountId(0, 0, 3)])
                .setTransactionId(TransactionId.generate(sendingAccount))
                .freeze();
            try {
                const tx = yield hethers.utils.parseTransaction(t.toBytes());
                assert(tx == null, "unexpected tx");
            }
            catch (err) {
                assert(err !== undefined, "expected error on parsing transfer tx");
            }
        });
    });
});
describe("BigNumber", function () {
    const tests = loadTests("bignumber");
    tests.forEach((test) => {
        if (test.expectedValue == null) {
            it(test.testcase, function () {
                assert.throws(() => {
                    const value = hethers.BigNumber.from(test.value);
                    console.log("ERROR", value);
                }, (error) => {
                    return true;
                });
            });
        }
        else {
            it(test.testcase, function () {
                const value = hethers.BigNumber.from(test.value);
                assert.equal(value.toHexString(), test.expectedValue);
                const value2 = hethers.BigNumber.from(value);
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
        it(`absolute value (${test.value})`, function () {
            const value = hethers.BigNumber.from(test.value);
            const expected = hethers.BigNumber.from(test.expected);
            assert.ok(value.abs().eq(expected));
        });
    });
    // Fails to create from BN (or any junk with a length) (See: #1172)
    it("Fails on junk with a length property", function () {
        const junk = { negative: 0, words: [1000], length: 1, red: null };
        assert.throws(() => {
            const value = hethers.BigNumber.from("100").add(junk);
            console.log("ERROR", value);
        }, (error) => {
            return true;
        });
    });
    // @TODO: Add more tests here
});
describe("FixedNumber", function () {
    {
        const Tests = [
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
        Tests.forEach((test) => {
            it(`Create from=${test.value}`, function () {
                const value = hethers.FixedNumber.from(test.value);
                assert.equal(value.toString(), test.expected);
            });
        });
    }
    {
        const Tests = [
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
        Tests.forEach((test) => {
            it(`Rounding value=${test.value}, decimals=${test.round}`, function () {
                const value = hethers.FixedNumber.from(test.value).round(test.round);
                assert.equal(value.toString(), test.expected);
            });
        });
    }
    {
        const Tests = [
            { value: "1.0", ceiling: "1.0", floor: "1.0" },
            { value: "1.1", ceiling: "2.0", floor: "1.0" },
            { value: "1.9", ceiling: "2.0", floor: "1.0" },
            { value: "-1.0", ceiling: "-1.0", floor: "-1.0" },
            { value: "-1.1", ceiling: "-1.0", floor: "-2.0" },
            { value: "-1.9", ceiling: "-1.0", floor: "-2.0" },
        ];
        Tests.forEach((test) => {
            it(`Clamping value=${test.value}`, function () {
                const value = hethers.FixedNumber.from(test.value);
                assert.equal(value.floor().toString(), test.floor);
                assert.equal(value.ceiling().toString(), test.ceiling);
            });
        });
    }
});
describe("Logger", function () {
    const logger = new hethers.utils.Logger("testing/0.0");
    it("setLogLevel", function () {
        hethers.utils.Logger.setLogLevel(hethers.utils.Logger.levels.DEBUG);
        hethers.utils.Logger.setLogLevel(hethers.utils.Logger.levels.INFO);
        hethers.utils.Logger.setLogLevel(hethers.utils.Logger.levels.WARNING);
        hethers.utils.Logger.setLogLevel(hethers.utils.Logger.levels.ERROR);
        hethers.utils.Logger.setLogLevel(hethers.utils.Logger.levels.OFF);
        // Reset back to INFO when done tests
        hethers.utils.Logger.setLogLevel(hethers.utils.Logger.levels.INFO);
    });
    it("checkArgumentCount", function () {
        logger.checkArgumentCount(3, 3);
    });
    it("checkArgumentCount - too few", function () {
        assert.throws(() => {
            logger.checkArgumentCount(1, 3);
        }, (error) => {
            return error.code === hethers.utils.Logger.errors.MISSING_ARGUMENT;
        });
    });
    it("checkArgumentCount - too many", function () {
        assert.throws(() => {
            logger.checkArgumentCount(3, 1);
        }, (error) => {
            return error.code === hethers.utils.Logger.errors.UNEXPECTED_ARGUMENT;
        });
    });
});
describe("Base58 Coder", function () {
    it("decodes", function () {
        assert.equal(hethers.utils.toUtf8String(hethers.utils.base58.decode("JxF12TrwUP45BMd")), "Hello World");
    });
    it("encodes", function () {
        assert.equal(hethers.utils.base58.encode(hethers.utils.toUtf8Bytes("Hello World")), "JxF12TrwUP45BMd");
    });
});
describe("Account like to string", function () {
    it('Is usable for ethereum addresses', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const contractAddr = '0000000000000000000000000000000001b34cbb';
            const accStr = asAccountString(contractAddr);
            // should not be touched
            assert.strictEqual(accStr, '0.0.28527803');
        });
    });
    it('Is able to convert hedera account to string', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const accLike = {
                shard: BigInt(0),
                realm: BigInt(0),
                num: BigInt(420),
            };
            let accStr = asAccountString(accLike);
            const split = accStr.split('.');
            assert.notStrictEqual(accStr, "");
            assert.strictEqual(split[0], "0");
            assert.strictEqual(split[1], "0");
            assert.strictEqual(split[2], "420");
            const accLike2 = "0.0.69";
            accStr = asAccountString(accLike2);
            const split2 = accStr.split('.');
            assert.notStrictEqual(accStr, "");
            assert.strictEqual(split2[0], "0");
            assert.strictEqual(split2[1], "0");
            assert.strictEqual(split2[2], "69");
        });
    });
    it("Should throw on random string", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const notReallyAccountLike = "foo";
            try {
                asAccountString(notReallyAccountLike);
            }
            catch (e) {
                assert.strictEqual(e.code, Logger.errors.INVALID_ARGUMENT);
                assert.notStrictEqual(e, null);
            }
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
    const tests = loadTests("eip712");
    tests.forEach((test) => {
        it(`encoding ${test.name}`, function () {
            const encoder = hethers.utils._TypedDataEncoder.from(test.types);
            assert.equal(encoder.primaryType, test.primaryType, "instance.primaryType");
            assert.equal(encoder.encode(test.data), test.encoded, "instance.encode()");
            //console.log(test);
            assert.equal(hethers.utils._TypedDataEncoder.getPrimaryType(test.types), test.primaryType, "getPrimaryType");
            assert.equal(hethers.utils._TypedDataEncoder.hash(test.domain, test.types, test.data), test.digest, "digest");
        });
    });
    tests.forEach((test) => {
        if (!test.privateKey) {
            return;
        }
        it(`signing ${test.name}`, function () {
            return __awaiter(this, void 0, void 0, function* () {
                const wallet = new hethers.Wallet(test.privateKey);
                yield assert.rejects(wallet._signTypedData(test.domain, test.types, test.data), '_signTypedData not supported');
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
                gasPrice: hethers.BigNumber.from("0x65cf89a0"),
                gasLimit: hethers.BigNumber.from("0x5b68"),
                to: "0x32162F3581E88a5f62e8A61892B42C46E2c18f7b",
                value: hethers.BigNumber.from("0"),
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
                gasPrice: hethers.BigNumber.from("0x65cf89a0"),
                gasLimit: hethers.BigNumber.from("0x71ac"),
                to: "0x32162F3581E88a5f62e8A61892B42C46E2c18f7b",
                value: hethers.BigNumber.from("0"),
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
        it(`tx:${test.hash}`, function () {
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
//# sourceMappingURL=test-utils.spec.js.map