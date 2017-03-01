'use strict';

var HDNode = require('../hdnode/index.js');

function testHDNode(test) {
    var Wallet = require('../wallet/index.js');
    var c = 0;
    var testcases = require('./tests/hdnode.json');
    testcases.forEach(function(testcase) {
        //if (c++ > 10) { return; }
        var rootNode = new HDNode.fromSeed(testcase.seed);
        testcase.hdnodes.forEach(function(hdTestcase) {

            var node = rootNode.derivePath(hdTestcase.path);
            test.equal(node.privateKey, hdTestcase.privateKey,
                       'Failed to generate privateKey - ' + testcase.name);

            var wallet = new Wallet(node.privateKey);
            test.equal(wallet.address.toLowerCase(), hdTestcase.address,
                       'Failed to generate address - ' + testcase.name);
        });
    });

    test.done();
}

function testMnemonic(test) {
    var c = 0;
    var testcases = require('./tests/hdnode.json');
    testcases.forEach(function(testcase) {
        //if (c++ > 10) { return; }
        test.equal(HDNode.entropyToMnemonic(testcase.entropy), testcase.mnemonic,
                   'Failed to convert mnemonic - ' + testcase.name);
        test.equal(HDNode.mnemonicToEntropy(testcase.mnemonic), testcase.entropy,
                   'Failed to convert entropy - ' + testcase.name);
        test.equal(HDNode.mnemonicToSeed(testcase.mnemonic, testcase.password), testcase.seed,
                   'Failed to convert seed - ' + testcase.name);
    });
    test.done();
}

module.exports = {
    "hdnode": testHDNode,
    "mnemonic": testMnemonic,
}
