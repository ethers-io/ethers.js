"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const index_js_1 = require("../crypto/index.js");
const utf8_js_1 = require("../utils/utf8.js");
const wordlists_js_1 = require("../wordlists/wordlists.js");
const index_js_2 = require("../index.js");
const utils_js_1 = require("./utils.js");
const decoder = new TextDecoder();
function fromHex(hex) {
    const data = Buffer.from(hex.substring(2), "hex");
    return decoder.decode(data);
}
function repeat(text, length) {
    const result = [];
    while (result.length < length) {
        result.push(text);
    }
    return result;
}
describe("Tests Mnemonics", function () {
    const tests = (0, utils_js_1.loadTests)("mnemonics");
    function runTest(phrase, mnemonic, test) {
        assert_1.default.ok(index_js_2.Mnemonic.isValidMnemonic(phrase, mnemonic.wordlist), "isValidMnemonic");
        if (test.locale === "en") {
            assert_1.default.ok(index_js_2.Mnemonic.isValidMnemonic(phrase), "isValidMnemonic (default)");
        }
        assert_1.default.equal(mnemonic.wordlist.locale, test.locale, "locale");
        assert_1.default.equal(mnemonic.entropy, test.entropy, "entropy");
        assert_1.default.equal(mnemonic.computeSeed(), test.seed, "seed");
        assert_1.default.equal((0, index_js_1.sha256)((0, utf8_js_1.toUtf8Bytes)(phrase)), test.phraseHash, "phraseHash");
    }
    for (const test of tests) {
        const wordlist = wordlists_js_1.wordlists[test.locale];
        it(`computes mnemonic from phrase: ${test.name}`, function () {
            if (wordlist == null) {
                this.skip();
                return;
            }
            const phrase = fromHex(test.phrase);
            const password = fromHex(test.password);
            const mnemonic = index_js_2.Mnemonic.fromPhrase(phrase, password, wordlist);
            runTest(phrase, mnemonic, test);
        });
    }
    for (const test of tests) {
        const wordlist = wordlists_js_1.wordlists[test.locale];
        it(`computes mnemonic from entropy: ${test.name}`, function () {
            if (wordlist == null) {
                this.skip();
                return;
            }
            const phrase = fromHex(test.phrase);
            const password = fromHex(test.password);
            const mnemonic = index_js_2.Mnemonic.fromEntropy(test.entropy, password, wordlist);
            runTest(phrase, mnemonic, test);
        });
    }
});
describe("Tests Bad Mnemonics Fail", function () {
    const badLengths = [
        repeat("abandon", 9),
        repeat("abandon", 16),
        repeat("abandon", 27), // 27 words; too long
    ];
    for (const _phrase of badLengths) {
        const phrase = _phrase.join(" ");
        it(`correctly fails on invalid mnemonic length: ${_phrase.length}`, function () {
            assert_1.default.ok(!index_js_2.Mnemonic.isValidMnemonic(phrase));
            assert_1.default.throws(function () {
                index_js_2.Mnemonic.fromPhrase(phrase);
            }, function (error) {
                return (error.code === "INVALID_ARGUMENT" &&
                    error.message.match(/^invalid mnemonic length/) &&
                    error.argument === "mnemonic" &&
                    error.value === "[ REDACTED ]");
            });
        });
    }
    it("correctly fails on invalid mnemonic word", function () {
        const phrase = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon wagmi";
        assert_1.default.ok(!index_js_2.Mnemonic.isValidMnemonic(phrase));
        assert_1.default.throws(function () {
            index_js_2.Mnemonic.fromPhrase(phrase);
        }, function (error) {
            return (error.code === "INVALID_ARGUMENT" &&
                error.message.match(/^invalid mnemonic word at index 11/) &&
                error.argument === "mnemonic" &&
                error.value === "[ REDACTED ]");
        });
    });
    it("correctly fails on invalid mnemonic checksum", function () {
        const phrase = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon";
        assert_1.default.ok(!index_js_2.Mnemonic.isValidMnemonic(phrase));
        assert_1.default.throws(function () {
            index_js_2.Mnemonic.fromPhrase(phrase);
        }, function (error) {
            return (error.code === "INVALID_ARGUMENT" &&
                error.message.match(/^invalid mnemonic checksum/) &&
                error.argument === "mnemonic" &&
                error.value === "[ REDACTED ]");
        });
    });
    const badEntropyLengths = [
        repeat("42", 12),
        repeat("42", 15),
        repeat("42", 36), // 36 bytes; too long
    ];
    for (const _entropy of badEntropyLengths) {
        const entropy = "0x" + _entropy.join("");
        it(`correctly fails on invalid entropy length: ${_entropy.length}`, function () {
            assert_1.default.throws(function () {
                index_js_2.Mnemonic.fromEntropy(entropy);
            }, function (error) {
                return (error.code === "INVALID_ARGUMENT" &&
                    error.message.match(/^invalid entropy size/) &&
                    error.argument === "entropy" &&
                    error.value === "[ REDACTED ]");
            });
        });
    }
});
//# sourceMappingURL=test-wallet-mnemonic.js.map