'use strict';

var bip39 = require('bip39');
var HDNode = require('bitcoinjs-lib').HDNode;
var ethereumUtil = require('ethereumjs-util');

var utils = require('../utils.js');

function getPath(seed) {
    var path = 'm';

    var count = utils.randomNumber(seed + '-getPath-1', 1, 7);
    var hardened = utils.randomNumber(seed + '-getPath-2', 0, count + 2);
    for (var i = 0; i < count; i++) {
        path += '/' + utils.randomNumber(seed + '-getPath-3' + i, 0, 12);
        if (i < hardened) {
            path += "'";
        }
    }

    return path;
}

function getPrivateKey() {
}

function getHD(seed) {
    var rootNode = HDNode.fromSeedHex(seed);

    var privateKey = rootNode.keyPair.d.toBuffer(32);
    var hdnodes = [{
        path: 'm',
        privateKey: '0x' + privateKey.toString('hex'),
        address: '0x' + ethereumUtil.privateToAddress(privateKey).toString('hex'),
        parentFingerprint: rootNode.parentFingerprint,
        xpriv: rootNode.toBase58(),
        xpub: rootNode.neutered().toBase58(),
    }];

    for (var j = 0; j < 5; j++) {
        var path = getPath(seed + '-hdnode-' + i + '-' + j);
        var node = rootNode.derivePath(path);
        var privateKey = node.keyPair.d.toBuffer(32);
        hdnodes.push({
            path: path,
            privateKey: '0x' + privateKey.toString('hex'),
            address: '0x' + ethereumUtil.privateToAddress(privateKey).toString('hex'),
            parentFingerprint: node.parentFingerprint,
            xpriv: node.toBase58(),
            xpub: node.neutered().toBase58(),
        });
    }

    return hdnodes;
}

var Testcases = {};

var trezor = require('./test-mnemonics/tests-trezor-bip39.json');
trezor.english.forEach(function(testcase, i) {
    Testcases['trezor-' + i] = {
        entropy: '0x' + testcase[0],
        mnemonic: testcase[1],
        seed: '0x' + testcase[2],
        hdnodes: getHD(testcase[2]),
        password: 'TREZOR',
    };
});

for (var i = 0; i < 1024; i++) {
    var strength = 16 + 4 * utils.randomNumber('random-1-' + i, 0, 5);
    var entropy = utils.randomHexString('random-2-' + i, strength);

    var mnemonic = bip39.entropyToMnemonic(entropy.substring(2));
    var seed = bip39.mnemonicToSeedHex(mnemonic);

    Testcases['random-' + i] = {
        entropy: entropy,
        mnemonic: mnemonic,
        seed: '0x' + seed,
        hdnodes: getHD(seed),
    }
}

/*
var seed = bip39.mnemonicToSeedHex('radar blur cabbage chef fix engine embark joy scheme fiction master release');
console.log('Seed', seed);
var entropy = bip39.mnemonicToEntropy('radar blur cabbage chef fix engine embark joy scheme fiction master release');
console.log('Entropy', entropy);
var rootNode = HDNode.fromSeedHex(seed);
var node = rootNode.derivePath("m/44'/60'/0'/0/0");
console.log('PrivateKey', node.keyPair.d.toBuffer(32).toString('hex')),
*/

// https://medium.com/@alexberegszaszi/why-do-my-bip32-wallets-disagree-6f3254cc5846#.6tqszlvf4
Testcases['axic'] = {
    entropy: '0xb0a30c7e93a58094d213c4c0aaba22da',
    mnemonic: 'radar blur cabbage chef fix engine embark joy scheme fiction master release',
    seed: '0xed37b3442b3d550d0fbb6f01f20aac041c245d4911e13452cac7b1676a070eda66771b71c0083b34cc57ca9c327c459a0ec3600dbaf7f238ff27626c8430a806',
    hdnodes: [
        {
            path: "m/44'/60'/0'/0/0",
            address: '0xac39b311dceb2a4b2f5d8461c1cdaf756f4f7ae9',
            privateKey: '0xb96e9ccb774cc33213cbcb2c69d3cdae17b0fe4888a1ccd343cbd1a17fd98b18',
            xpriv: "xprvA2xEQ2iTe9QB22rvf5cbfpUxEBmMdvc7stEFxLhiMXmdLrwLbqugPCHRZiRfEq2puC5vTgwyFneV38hppF8oTf9aoaUv7M8u2XvnACTe6r4",
            xpub: "xpub6FwaoYFMUWxUEWwPm79c2xRgnDbr3PKyF79rkj7KusJcDfGV9PDvvzbuQz32JYu3y2EpqY7xUag5Zw89YXokCKVtWLrfJ1RDUAYLLzTR8En"
        }
    ]
}

var Output = [];
var TestcaseNames = Object.keys(Testcases);
TestcaseNames.sort();
TestcaseNames.forEach(function(testcase) {
    Testcases[testcase].name = testcase;
    Output.push(Testcases[testcase]);
});

utils.saveTests('hdnode', Output);
