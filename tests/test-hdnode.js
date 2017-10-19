'use strict';

var assert = require('assert');

var utils = require('./utils');

describe('Test HD Node Derivation', function(test) {
    var HDNode = require('../wallet/hdnode');
    var Wallet = require('../wallet/wallet');

    var tests = utils.loadTests('hdnode');
    tests.forEach(function(test) {
        it('Derives the HD nodes - ' + test.name, function() {
            var rootNode = new HDNode.fromSeed(test.seed);
            test.hdnodes.forEach(function(nodeTest) {

                var node = rootNode.derivePath(nodeTest.path);
                assert.equal(node.privateKey, nodeTest.privateKey,
                    'Generates privateKey - ' + nodeTest.privateKey);

                var wallet = new Wallet(node.privateKey);
                assert.equal(wallet.address.toLowerCase(), nodeTest.address,
                    'Generates address - ' + nodeTest.privateKey);
            });
        });
    });
});

describe('Test HD Mnemonic Phrases', function testMnemonic() {
    var HDNode = require('../wallet/hdnode');

    var tests = utils.loadTests('hdnode');
    tests.forEach(function(test) {
        it(('converts mnemonic phrases - ' + test.name), function() {
            assert.equal(HDNode.entropyToMnemonic(test.entropy), test.mnemonic,
                'Converts entropy to mnemonic ' + test.name);
            assert.equal(HDNode.mnemonicToEntropy(test.mnemonic), test.entropy,
                'Converts mnemonic to entropy - ' + test.mnemonic);
            assert.equal(HDNode.mnemonicToSeed(test.mnemonic, test.password), test.seed,
                'Converts mnemonic to seed - ' + test.mnemonic + ':' + test.password);
        });
    });
});
