
import assert from "assert";

import { sha256 } from "../crypto/index.js";
import { toUtf8Bytes } from "../utils/utf8.js";

import { wordlists } from "../wordlists/wordlists.js";

import { Mnemonic } from "../index.js";

import { loadTests } from "./utils.js";
import type { TestCaseMnemonic } from "./types.js";

const decoder = new TextDecoder();
function fromHex(hex: string): string {
    const data = Buffer.from(hex.substring(2), "hex");
    return decoder.decode(data);
}

function repeat(text: string, length: number): Array<string> {
    const result = [ ];
    while (result.length < length) { result.push(text); }
    return result;
}

describe("Tests Mnemonics", function() {
    const tests = loadTests<TestCaseMnemonic>("mnemonics");

    function runTest(phrase: string, mnemonic: Mnemonic, test: TestCaseMnemonic): void {
        assert.ok(Mnemonic.isValidMnemonic(phrase, mnemonic.wordlist), "isValidMnemonic");
        if (test.locale === "en") {
            assert.ok(Mnemonic.isValidMnemonic(phrase), "isValidMnemonic (default)");
        }

        assert.equal(mnemonic.wordlist.locale, test.locale, "locale");

        assert.equal(mnemonic.entropy, test.entropy, "entropy");
        assert.equal(mnemonic.computeSeed(), test.seed, "seed");
        assert.equal(sha256(toUtf8Bytes(phrase)), test.phraseHash, "phraseHash")
    }

    for (const test of tests) {
        const wordlist = wordlists[test.locale];

        it(`computes mnemonic from phrase: ${ test.name }`, function() {
            if (wordlist == null) {
                this.skip();
                return;
            }

            const phrase = fromHex(test.phrase);
            const password = fromHex(test.password);
            const mnemonic = Mnemonic.fromPhrase(phrase, password, wordlist);
            runTest(phrase, mnemonic, test);
        });
    }

    for (const test of tests) {
        const wordlist = wordlists[test.locale];

        it(`computes mnemonic from entropy: ${ test.name }`, function() {
            if (wordlist == null) {
                this.skip();
                return;
            }
            const phrase = fromHex(test.phrase);
            const password = fromHex(test.password);
            const mnemonic = Mnemonic.fromEntropy(test.entropy, password, wordlist);
            runTest(phrase, mnemonic, test);
        });
    }
});

describe("Tests Bad Mnemonics Fail", function() {

    const badLengths = [
        repeat("abandon", 9),   // 9 words; too short
        repeat("abandon", 16),  // 16 words; not congruent to 0 mod 3
        repeat("abandon", 27),  // 27 words; too long
    ];

    for (const _phrase of badLengths) {
        const phrase = _phrase.join(" ");
        it(`correctly fails on invalid mnemonic length: ${ _phrase.length }`, function() {
            assert.ok(!Mnemonic.isValidMnemonic(phrase));
            assert.throws(function() {
                Mnemonic.fromPhrase(phrase);
            }, function(error: any) {
                return (error.code === "INVALID_ARGUMENT" &&
                    error.message.match(/^invalid mnemonic length/) &&
                    error.argument === "mnemonic" &&
                    error.value === "[ REDACTED ]");
            });
        });
    }

    it("correctly fails on invalid mnemonic word", function() {
        const phrase = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon wagmi";
        assert.ok(!Mnemonic.isValidMnemonic(phrase));
        assert.throws(function() {
            Mnemonic.fromPhrase(phrase);
        }, function(error: any) {
            return (error.code === "INVALID_ARGUMENT" &&
                error.message.match(/^invalid mnemonic word at index 11/) &&
                error.argument === "mnemonic" &&
                error.value === "[ REDACTED ]");
        });
    });

    it("correctly fails on invalid mnemonic checksum", function() {
        const phrase = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon";
        assert.ok(!Mnemonic.isValidMnemonic(phrase));
        assert.throws(function() {
            Mnemonic.fromPhrase(phrase);
        }, function(error: any) {
            return (error.code === "INVALID_ARGUMENT" &&
                error.message.match(/^invalid mnemonic checksum/) &&
                error.argument === "mnemonic" &&
                error.value === "[ REDACTED ]");
        });
    });


    const badEntropyLengths = [
        repeat("42", 12),   //12 bytes; too short
        repeat("42", 15),  // 16 bytes; not congruent to 0 mod 4
        repeat("42", 36),  // 36 bytes; too long
    ];

    for (const _entropy of badEntropyLengths) {
        const entropy = "0x" + _entropy.join("");
        it(`correctly fails on invalid entropy length: ${ _entropy.length }`, function() {
            assert.throws(function() {
                Mnemonic.fromEntropy(entropy);
            }, function(error: any) {
                return (error.code === "INVALID_ARGUMENT" &&
                    error.message.match(/^invalid entropy size/) &&
                    error.argument === "entropy" &&
                    error.value === "[ REDACTED ]");
            });
        });
    }
})
