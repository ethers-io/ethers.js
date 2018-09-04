'use strict';

var ethereumUtil = require('ethereumjs-util');
var ethereumTx = require('ethereumjs-tx');

ethereumTx.prototype.serializeUnsigned = function() {
    let items
    if (this._chainId > 0) {
        const raw = this.raw.slice()
        this.v = this._chainId
        this.r = 0
        this.s = 0
        items = this.raw
        this.raw = raw
    } else {
        items = this.raw.slice(0, 6)
    }

   // create hash
    return ethereumUtil.rlp.encode(items)
}

var utils = require('../utils.js');


var Output = [];


function addTransaction(privateKey, name, transaction, signature) {
    var rawTransaction = new ethereumTx(transaction);

    transaction.chainId = 5;
    var rawTransactionEip155 = new ethereumTx(transaction);
    delete transaction['chainId'];

console.log(rawTransaction, rawTransaction.serialize().toString('hex'));
console.log(rawTransactionEip155, rawTransactionEip155.serialize().toString('hex'));
console.log(rawTransactionEip155.serialize().toString('hex') === rawTransaction.serialize().toString('hex'));
console.log('------');

    var test = {
        accountAddress: '0x' + ethereumUtil.privateToAddress(privateKey).toString('hex'),
        name: name,
        privateKey: '0x' + privateKey.toString('hex'),
        unsignedTransaction: '0x' + rawTransaction.serializeUnsigned().toString('hex'),
        unsignedTransactionChainId5: '0x' + rawTransactionEip155.serializeUnsigned().toString('hex'),
    }

    rawTransaction.sign(privateKey);
    test.signedTransaction = '0x' + rawTransaction.serialize().toString('hex');

    rawTransactionEip155.sign(privateKey);
    test.signedTransactionChainId5 = '0x' + rawTransactionEip155.serialize().toString('hex');

    for (var k in transaction) {
        test[k] = transaction[k];
    }

    for (var k in (signature || {})) {
        test[k] = signature[k];
    }

    Output.push(test);
}

function trimHex(hex) {
    while (hex.substring(0, 4) === '0x00' && hex.length > 4) {
        hex = '0x' + hex.substring(4);
    }
    return hex;
}

for (var i = 0; i < 1000; i++) {
    var transaction = {
        to: utils.randomHexString('to-' + i, 20),
        data: utils.randomHexString('data-' + i, 0, 10),
        gasLimit: trimHex(utils.randomHexString('gasLimit-' + i, 0, 10)),
        gasPrice: trimHex(utils.randomHexString('gasPrice-' + i, 0, 10)),
        value: trimHex(utils.randomHexString('value-' + i, 0, 10)),
        nonce: trimHex(utils.randomHexString('nonce-' + i, 0, 4)),
    };

    var privateKey = Buffer.from(utils.randomBytes('privateKey-' + i, 32));

    addTransaction(privateKey, 'random-' + i, transaction);
}

// See: https://github.com/ethereumjs/ethereumjs-tx/blob/master/test/txs.json
addTransaction(Buffer.from('164122e5d39e9814ca723a749253663bafb07f6af91704d9754c361eb315f0c1', 'hex'),
    "ethereumjs1", {
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

addTransaction(Buffer.from('e0a462586887362a18a318b128dbc1e3a0cae6d4b0739f5d0419ec25114bc722', 'hex'),
    "ethereumjs2", {
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

addTransaction(Buffer.from('164122e5d39e9814ca723a749253663bafb07f6af91704d9754c361eb315f0c1', 'hex'),
    "ethereumjs3", {
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
var privateKey = Buffer.from('0123456789012345678901234567890123456789012345678901234567890123', 'hex');
for (var i = 0; i < 64; i++) {
    var transaction = {};
    if (i & (1 << 0)) { transaction.nonce     = '0x02'; }
    if (i & (1 << 1)) { transaction.gasPrice  = '0x03'; }
    if (i & (1 << 2)) { transaction.gasLimit  = '0x04'; }
    if (i & (1 << 3)) { transaction.to        = '0x0123456789012345678901234567890123456789'; }
    if (i & (1 << 4)) { transaction.value     = '0x05'; }
    if (i & (1 << 5)) { transaction.data      = '0x06'; }
    var bits = '';
    for (var j = 0; j < 6; j++) { bits += ((i & (1 << j)) ? '1': '0'); }
    addTransaction(privateKey, 'blank_' + bits, transaction);
}

Output.sort(function(a, b) {
    if (a.name < b.name) {
        return -1;
    } else if (a.name > b.name) {
        return 1;
    }
    return 0;
});

utils.saveTests('transactions', Output);
