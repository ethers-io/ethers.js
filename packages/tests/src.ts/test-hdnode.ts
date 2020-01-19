'use strict';

import assert from "assert";

import { ethers } from "ethers";
import { loadTests, randomNumber, TestCase } from "@ethersproject/testcases";

function randomCase(seed: string, text: string): string {
    return text.split("").map(function(c, index) {
       if (randomNumber(seed + "-" + index, 0, 2)) {
           return c.toUpperCase();
       }
       return c
    }).join("");
}

describe('Test HD Node Derivation is Case Agnostic', function() {
    let tests: Array<TestCase.HDWallet> = loadTests('hdnode');
    tests.forEach((test) => {
        it("Normalizes case - " + test.name, function() {
            this.timeout(10000);
            let wordlist = (<{ [ locale: string ]: ethers.Wordlist }>(ethers.wordlists))[test.locale];

            let rootNode = ethers.utils.HDNode.fromMnemonic(test.mnemonic, test.password || null, wordlist);

            let altMnemonic = randomCase(test.name, test.mnemonic);
            let altNode = ethers.utils.HDNode.fromMnemonic(altMnemonic, test.password || null, wordlist);

            assert.equal(altNode.privateKey, rootNode.privateKey, altMnemonic);
        });
    });
});

describe('Test HD Node Derivation from Seed', function() {

    let tests: Array<TestCase.HDWallet> = loadTests('hdnode');

    tests.forEach((test) => {

        // If there is nothing to derive, skip this portion of the test
        if (test.hdnodes.length === 0) { return; }

        it('Derives the HD nodes - ' + test.name, function() {
            this.timeout(10000);

            let rootNode = ethers.utils.HDNode.fromSeed(test.seed);
            test.hdnodes.forEach((nodeTest) => {

                let node = rootNode.derivePath(nodeTest.path);
                assert.equal(node.privateKey, nodeTest.privateKey,
                    'Generates privateKey - ' + nodeTest.privateKey);

                let wallet = new ethers.Wallet(node.privateKey);
                assert.equal(wallet.address.toLowerCase(), nodeTest.address,
                    'Generates address - ' + nodeTest.privateKey);
            });
        });
    });
});

describe('Test HD Node Derivation from Mnemonic', function() {

    let tests: Array<TestCase.HDWallet> = loadTests('hdnode');

    tests.forEach((test) => {

        // If there is nothing to derive, skip this portion of the test
        if (test.hdnodes.length === 0) { return; }

        it('Derives the HD nodes - ' + test.name, function() {
            this.timeout(10000);

            let rootNode = ethers.utils.HDNode.fromMnemonic(test.mnemonic, test.password || null);
            test.hdnodes.forEach((nodeTest) => {

                let node = rootNode.derivePath(nodeTest.path);

                assert.equal(node.privateKey, nodeTest.privateKey,
                    'Matches privateKey - ' + nodeTest.privateKey);
                assert.equal(node.path, nodeTest.path,
                    'Matches path - ' + nodeTest.privateKey);
                assert.equal(node.mnemonic.phrase, test.mnemonic,
                    'Matches mnemonic.phrase - ' + nodeTest.privateKey);
                assert.equal(node.mnemonic.path, nodeTest.path,
                    'Matches mnemonic.path - ' + nodeTest.privateKey);

                let wallet = new ethers.Wallet(node.privateKey);
                assert.equal(wallet.address.toLowerCase(), nodeTest.address,
                    'Generates address - ' + nodeTest.privateKey);
            });
        });
    });
});

describe('Test HD Mnemonic Phrases', function testMnemonic() {

    let tests: Array<TestCase.HDWallet> = loadTests('hdnode');

    tests.forEach(function(test) {
        it(('converts mnemonic phrases - ' + test.name), function() {
            this.timeout(1000000);

            assert.equal(ethers.utils.mnemonicToSeed(test.mnemonic, test.password), test.seed,
                'Converts mnemonic to seed - ' + test.mnemonic + ':' + test.password);

            // Test default english
            if (test.locale === "en") {
                assert.equal(ethers.utils.entropyToMnemonic(test.entropy), test.mnemonic,
                    "Converts entropy to mnemonic " + test.name + " (default en)");

                assert.equal(ethers.utils.mnemonicToEntropy(test.mnemonic), test.entropy,
                    "Converts mnemonic to entropy - " + test.mnemonic + " (default en)");
            }

            let wordlist = (<{ [ locale: string ]: ethers.Wordlist }>(ethers.wordlists))[test.locale];

            let mnemonic = ethers.utils.entropyToMnemonic(test.entropy, wordlist);
            assert.equal(mnemonic.normalize('NFKD'), test.mnemonic.normalize('NFKD'),
                'Converts entropy to mnemonic ' + test.name);

            assert.equal(ethers.utils.mnemonicToEntropy(test.mnemonic, wordlist), test.entropy,
                'Converts mnemonic to entropy - ' + test.mnemonic);
        });
    });
});

