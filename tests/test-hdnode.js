'use strict';

var assert = require('assert');

if (global.ethers) {
    console.log('Using global ethers; ' + __filename);
    var ethers = global.ethers;
} else {
    var ethers = require('..');
}

var utils = require('./utils');

describe('Test HD Node Derivation', function(test) {

    var tests = utils.loadTests('hdnode');
    tests.forEach(function(test) {
        it('Derives the HD nodes - ' + test.name, function() {
            this.timeout(10000);

            var rootNode = new ethers.HDNode.fromSeed(test.seed);
            test.hdnodes.forEach(function(nodeTest) {

                var node = rootNode.derivePath(nodeTest.path);
                assert.equal(node.privateKey, nodeTest.privateKey,
                    'Generates privateKey - ' + nodeTest.privateKey);

                var wallet = new ethers.Wallet(node.privateKey);
                assert.equal(wallet.address.toLowerCase(), nodeTest.address,
                    'Generates address - ' + nodeTest.privateKey);
            });
        });
    });
});

describe('Test HD Mnemonic Phrases', function testMnemonic() {
    var tests = utils.loadTests('hdnode');
    tests.forEach(function(test) {
        it(('converts mnemonic phrases - ' + test.name), function() {
            this.timeout(1000000);

            assert.equal(ethers.HDNode.entropyToMnemonic(test.entropy), test.mnemonic,
                'Converts entropy to mnemonic ' + test.name);
            assert.equal(ethers.HDNode.mnemonicToEntropy(test.mnemonic), test.entropy,
                'Converts mnemonic to entropy - ' + test.mnemonic);
            assert.equal(ethers.HDNode.mnemonicToSeed(test.mnemonic, test.password), test.seed,
                'Converts mnemonic to seed - ' + test.mnemonic + ':' + test.password);
        });
    });
});
