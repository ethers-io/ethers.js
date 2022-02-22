'use strict';

import assert from "assert";

import {hethers} from "hethers";
import {loadTests, randomNumber, TestCase} from "@hethers/testcases";

function randomCase(seed: string, text: string): string {
    return text.split("").map(function(c, index) {
       if (randomNumber(seed + "-" + index, 0, 2)) {
           return c.toUpperCase();
       }
       return c
    }).join("");
}

const isBrowser = (typeof(navigator) !== "undefined");

describe('Test HD Node Derivation is Case Agnostic', function() {
    let tests: Array<TestCase.HDWallet> = loadTests('hdnode');

    tests.forEach((test) => {
        if (isBrowser && test.locale !== "en") { return; }

        it("Normalizes case - " + test.name, function() {
            this.timeout(10000);
            let wordlist = (<{ [ locale: string ]: hethers.Wordlist }>(hethers.wordlists))[test.locale];

            let rootNode = hethers.utils.HDNode.fromMnemonic(test.mnemonic, test.password || null, wordlist);

            let altMnemonic = randomCase(test.name, test.mnemonic);
            let altNode = hethers.utils.HDNode.fromMnemonic(altMnemonic, test.password || null, wordlist);

            assert.equal(altNode.privateKey, rootNode.privateKey, altMnemonic);
        });
    });
});

describe('Test HD Node Derivation from Seed', function() {

    let tests: Array<TestCase.HDWallet> = loadTests('hdnode');

    tests.forEach((test) => {
        // If there is nothing to derive, skip this portion of the test
        if (test.hdnodes.length === 0) { return; }

        if (isBrowser && test.locale !== "en") { return; }

        it('Derives the HD nodes - ' + test.name, function() {
            this.timeout(10000);

            let rootNode = hethers.utils.HDNode.fromSeed(test.seed);
            test.hdnodes.forEach((nodeTest) => {

                let node = rootNode.derivePath(nodeTest.path);
                assert.strictEqual(node.privateKey, nodeTest.privateKey,
                    'Generates privateKey - ' + nodeTest.privateKey);

                assert.strictEqual(node.alias, nodeTest.alias,
                            `Generates alias - ` + nodeTest.alias);
            });
        });
    });
});

describe('Test HD Node Derivation from Mnemonic', function() {

    let tests: Array<TestCase.HDWallet> = loadTests('hdnode');

    tests.forEach((test) => {
        if (isBrowser && test.locale !== "en") { return; }

        // If there is nothing to derive, skip this portion of the test
        if (test.hdnodes.length === 0) { return; }

        it('Derives the HD nodes - ' + test.name, function() {
            this.timeout(10000);

            let rootNode = hethers.utils.HDNode.fromMnemonic(test.mnemonic, test.password || null);
            test.hdnodes.forEach((nodeTest) => {

                let node = rootNode.derivePath(nodeTest.path);

                assert.strictEqual(node.privateKey, nodeTest.privateKey,
                    'Matches privateKey - ' + nodeTest.privateKey);
                assert.strictEqual(node.path, nodeTest.path,
                    'Matches path - ' + nodeTest.privateKey);
                assert.strictEqual(node.mnemonic.phrase, test.mnemonic,
                    'Matches mnemonic.phrase - ' + nodeTest.privateKey);
                assert.strictEqual(node.mnemonic.path, nodeTest.path,
                    'Matches mnemonic.path - ' + nodeTest.privateKey);
                let wallet = new hethers.Wallet(node.privateKey);
                assert.strictEqual(wallet.alias, nodeTest.alias,
                    `Generates alias - ` + nodeTest.alias);
            });
        });
    });
});

describe('Test HD Mnemonic Phrases', function testMnemonic() {

    let tests: Array<TestCase.HDWallet> = loadTests('hdnode');

    tests.forEach(function(test) {
        if (isBrowser && test.locale !== "en") { return; }

        it(('converts mnemonic phrases - ' + test.name), function() {
            this.timeout(1000000);

            assert.strictEqual(hethers.utils.mnemonicToSeed(test.mnemonic, test.password), test.seed,
                'Converts mnemonic to seed - ' + test.mnemonic + ':' + test.password);

            // Test default english
            if (test.locale === "en") {
                assert.strictEqual(hethers.utils.entropyToMnemonic(test.entropy), test.mnemonic,
                    "Converts entropy to mnemonic " + test.name + " (default en)");

                assert.strictEqual(hethers.utils.mnemonicToEntropy(test.mnemonic), test.entropy,
                    "Converts mnemonic to entropy - " + test.mnemonic + " (default en)");
            }

            let wordlist = (<{ [ locale: string ]: hethers.Wordlist }>(hethers.wordlists))[test.locale];

            let mnemonic = hethers.utils.entropyToMnemonic(test.entropy, wordlist);
            assert.strictEqual(mnemonic.normalize('NFKD'), test.mnemonic.normalize('NFKD'),
                'Converts entropy to mnemonic ' + test.name);

            assert.strictEqual(hethers.utils.mnemonicToEntropy(test.mnemonic, wordlist), test.entropy,
                'Converts mnemonic to entropy - ' + test.mnemonic);
        });
    });
});

describe("HD Extended Keys", function() {
    const root = hethers.utils.HDNode.fromSeed("0xdeadbeefdeadbeefdeadbeefdeadbeef");
    const root42 = root.derivePath("42");

    it("exports and imports xpriv extended keys", function() {
        const xpriv = root.extendedKey;
        const node = hethers.utils.HDNode.fromExtendedKey(xpriv);
        if (node.privateKey) {
            assert.strictEqual(root.alias, node.alias, "alias matches");
        }

        const node42 = node.derivePath("42");
        if (node42.privateKey) {
            assert.strictEqual(root42.alias, node42.alias, "alias matches");
        }
    });

    it("exports and imports xpub extended keys", function() {
        const xpub = root.neuter().extendedKey;
        const node = hethers.utils.HDNode.fromExtendedKey(xpub);
        if (node.privateKey) {
            assert.strictEqual(root.alias, node.alias, "address matches");
        }

        const node42 = node.derivePath("42");
        if (node.privateKey) {
            assert.strictEqual(root42.alias, node42.alias, "address matches");
        }
    });
});

describe("HD error cases", function() {
    const testInvalid = [
        "",
        "m/45/m",
        "m/44/foobar"
    ];

    const root = hethers.utils.HDNode.fromSeed("0xdeadbeefdeadbeefdeadbeefdeadbeef");

    testInvalid.forEach((path) => {
        it(`fails on path "${ path }"`, function() {
            assert.throws(() => {
                root.derivePath(path);
            }, (error: any) => {
                return true;
            });
        });
    });

    it("fails to derive child of hardened key", function() {
        // Deriving non-hardened should work...
        const node = root.neuter().derivePath("44");

        assert.throws(() => {
            // Deriving hardened should fail...
            node.derivePath("44'");
        }, (error: any) => {
            return true;
        });
    });

    // The zero-mnemonic, with and without correct checksum
    const zeroMnemonicCS = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
    const zeroMnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon";

    it("fails on invalid mnemonic length", function() {
        const shortMnemonic = "abandon abandon abandon abandon";

        // Test the validate functions
        assert.ok(hethers.utils.isValidMnemonic(zeroMnemonicCS));
        assert.ok(!hethers.utils.isValidMnemonic(zeroMnemonic));
        assert.ok(!hethers.utils.isValidMnemonic(shortMnemonic));

        assert.throws(() => {
            hethers.utils.mnemonicToEntropy(shortMnemonic);
        }, (error: any) => {
            return true;
        });
    });

    it("fails on invalid checksum", function() {
        assert.throws(() => {
            hethers.utils.mnemonicToEntropy(zeroMnemonic);
        }, (error: any) => {
            return true;
        });
    });

    it("fails on unknown locale", function() {
        assert.throws(() => {
            hethers.utils.HDNode.fromMnemonic(zeroMnemonicCS, "foobar", "xx");
        }, (error: any) => {
            return true;
        });
    });
});
