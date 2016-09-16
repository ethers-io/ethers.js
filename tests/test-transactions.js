'use strict';
var Wallet = require('../index.js');

var ethereumTx = require('ethereumjs-tx');

var utils = require('./utils.js');


function randomHexString(lowerRandomInterval, upperOpenInterval) {
    return utils.randomHexString(utils.random(lowerRandomInterval, upperOpenInterval));
}

module.exports = function(test) {

    function testTransaction(privateKey, transaction, signature) {
        var rawTransaction = new ethereumTx(transaction);
        rawTransaction.sign(privateKey);
        var ethereumLib = '0x' + rawTransaction.serialize().toString('hex');

        var wallet = new Wallet(privateKey);
        var ethers = wallet.sign(transaction);

        test.equal(ethers, ethereumLib, 'invalid transaction');

        test.equal(wallet.address, Wallet.parseTransaction(ethers).from, 'invalid parseTransaction');
    }

    for (var i = 0; i < 10000; i++) {
        var transaction = {
            to: utils.randomHexString(20),
            data: randomHexString(0, 10),
            gasLimit: randomHexString(0, 10),
            gasPrice: randomHexString(0, 10),
            value: randomHexString(0, 10),
            nonce: randomHexString(0, 10),
        };

        testTransaction(utils.randomBuffer(32), transaction);
    }

    // See: https://github.com/ethereumjs/ethereumjs-tx/blob/master/test/txs.json
    testTransaction(new Buffer('164122e5d39e9814ca723a749253663bafb07f6af91704d9754c361eb315f0c1', 'hex'), {
        nonce: "0x",
        gasPrice: "0x09184e72a000",
        gasLimit: "0x2710",
        to: "0x0000000000000000000000000000000000000000",
        value: "0x",
        data: "0x7f7465737432000000000000000000000000000000000000000000000000000000600057",
    }, {
        v: "0x1c",
        r: "0x5e1d3a76fbf824220eafc8c79ad578ad2b67d01b0c2425eb1f1347e8f50882ab",
        s: "0x5bd428537f05f9830e93792f90ea6a3e2d1ee84952dd96edbae9f658f831ab13"
    });

    testTransaction(new Buffer('e0a462586887362a18a318b128dbc1e3a0cae6d4b0739f5d0419ec25114bc722', 'hex'), {
        nonce: "0x06",
        gasPrice: "0x09184e72a000",
        gasLimit: "0x01f4",
        to: "0xbe862ad9abfe6f22bcb087716c7d89a26051f74c",
        value: "0x016345785d8a0000",
        data: "0x",
    }, {
        v: "0x1c",
        r: "0x24a484bfa7380860e9fa0a9f5e4b64b985e860ca31abd36e66583f9030c2e29d",
        s: "0x4d5ef07d9e73fa2fbfdad059591b4f13d0aa79e7634a2bb00174c9200cabb04d"
    });

    testTransaction(new Buffer('164122e5d39e9814ca723a749253663bafb07f6af91704d9754c361eb315f0c1', 'hex'), {
        nonce: "0x06",
        gasPrice: "0x09184e72a000",
        gasLimit: "0x0974",
        to: "0xbe862ad9abfe6f22bcb087716c7d89a26051f74c",
        value: "0x016345785d8a0000",
        data: "0x00000000000000000000000000000000000000000000000000000000000000ad000000000000000000000000000000000000000000000000000000000000fafa0000000000000000000000000000000000000000000000000000000000000dfa0000000000000000000000000000000000000000000000000000000000000dfa00000000000000000000000000000000000000000000000000000000000000ad000000000000000000000000000000000000000000000000000000000000000f000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000df000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000df000000000000000000000000000000000000000000000000000000000000000a000000000000000000000000000000000000000000000000000000000000000d",
    }, {
        v: "0x1c",
        r: "0x5e9361ca27e14f3af0e6b28466406ad8be026d3b0f2ae56e3c064043fb73ec77",
        s: "0x29ae9893dac4f9afb1af743e25fbb6a63f7879a61437203cb48c997b0fcefc3a"
    });

    // Test all possible blank fields
    var privateKey = new Buffer('0123456789012345678901234567890123456789012345678901234567890123', 'hex');
    for (var i = 0; i < 64; i++) {
        var transaction = {};
        if (i & (1 << 0)) { transaction.nonce     = '0x02'; }
        if (i & (1 << 1)) { transaction.gasPrice  = '0x03'; }
        if (i & (1 << 2)) { transaction.gasLimit  = '0x04'; }
        if (i & (1 << 3)) { transaction.to        = '0x0123456789012345678901234567890123456789'; }
        if (i & (1 << 4)) { transaction.value     = '0x05'; }
        if (i & (1 << 5)) { transaction.data      = '0x06'; }
        testTransaction(privateKey, transaction);
    }

    test.done();
};

module.exports.testSelf = module.exports;

