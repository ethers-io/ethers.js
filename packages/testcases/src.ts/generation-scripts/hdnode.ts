'use strict';

import fs from "fs";
import { resolve } from "path";

import * as bip39 from "bip39";
import { HDNode } from "bitcoinjs-lib";

import * as ethereumUtil from "ethereumjs-util";

import { randomHexString, randomNumber, saveTests, TestCase } from "..";


function getPath(seed: string): string {
    let path = "m";

    let count = randomNumber(seed + "-getPath-1", 1, 7);
    let hardened = randomNumber(seed + "-getPath-2", 0, count + 2);
    for (let i = 0; i < count; i++) {
        path += "/" + randomNumber(seed + "-getPath-3" + i, 0, 12);
        if (i < hardened) {
            path += "'";
        }
    }

    return path;
}

function getHD(seed: string): Array<TestCase.HDWalletNode> {
    let rootNode = HDNode.fromSeedHex(seed);

    let privateKey = rootNode.keyPair.d.toBuffer(32);
    let hdnodes: Array<TestCase.HDWalletNode> = [{
        path: 'm',
        privateKey: '0x' + privateKey.toString('hex'),
        address: '0x' + ethereumUtil.privateToAddress(privateKey).toString('hex'),
    }];

    for (let j = 0; j < 5; j++) {
        let path = getPath(seed + '-hdnode-' + j);
        let node = rootNode.derivePath(path);
        let privateKey = node.keyPair.d.toBuffer(32);
        hdnodes.push({
            path: path,
            privateKey: '0x' + privateKey.toString('hex'),
            address: '0x' + ethereumUtil.privateToAddress(privateKey).toString('hex'),
        });
    }

    return hdnodes;
}

const testcases: Array<TestCase.HDWallet> = [];

// https://medium.com/@alexberegszaszi/why-do-my-bip32-wallets-disagree-6f3254cc5846#.6tqszlvf4
testcases.push({
    name: "axic",
    locale: "en",
    entropy: '0xb0a30c7e93a58094d213c4c0aaba22da',
    mnemonic: 'radar blur cabbage chef fix engine embark joy scheme fiction master release',
    seed: '0xed37b3442b3d550d0fbb6f01f20aac041c245d4911e13452cac7b1676a070eda66771b71c0083b34cc57ca9c327c459a0ec3600dbaf7f238ff27626c8430a806',
    hdnodes: [
        {
            path: "m/44'/60'/0'/0/0",
            address: '0xac39b311dceb2a4b2f5d8461c1cdaf756f4f7ae9',
            privateKey: '0xb96e9ccb774cc33213cbcb2c69d3cdae17b0fe4888a1ccd343cbd1a17fd98b18',
        }
    ]
});

["en", "es", "fr", "it", "ja", "ko", "zh_cn", "zh_tw"].forEach((locale) => {
    type EasyseedTest = {
        entropy: string;
        seed: string;
        mnemonic: string;
        passphrase: string;
    };

    let tests: Array<EasyseedTest> = JSON.parse(fs.readFileSync(resolve(__dirname, "../input/easyseed-bip39/bip39_vectors." + locale + ".json")).toString());
    tests.forEach((test, index) => {
        testcases.push({
            name: ("easyseed-" + locale + "-" + index),
            entropy: "0x" + test.entropy,
            locale: locale,
            mnemonic: test.mnemonic,
            password: (test.passphrase || ''),
            seed: "0x" + test.seed,
            hdnodes: [ ]
        });
    });
});

console.log("@TODO: This should be 1024");
for (let i = 0; i < 10; i++) {
    let strength = 16 + 4 * randomNumber('random-1-' + i, 0, 5);
    let entropy = randomHexString('random-2-' + i, strength);

    let mnemonic = bip39.entropyToMnemonic(entropy.substring(2));
    let seed = bip39.mnemonicToSeedHex(mnemonic);

    testcases.push({
        name: "random-" + i,
        locale: "en",
        entropy: entropy,
        mnemonic: mnemonic,
        seed: '0x' + seed,
        hdnodes: getHD(seed),
    });
}

let trezor: { english: Array<Array<string>> } = require('../input/tests-trezor-bip39.json');
trezor.english.forEach((testcase, i) => {
    testcases.push({
        name: "trezor-" + i,
        locale: "en",
        entropy: '0x' + testcase[0],
        mnemonic: testcase[1],
        seed: '0x' + testcase[2],
        hdnodes: getHD(testcase[2]),
        password: 'TREZOR',
    });
});


/*
let seed = bip39.mnemonicToSeedHex('radar blur cabbage chef fix engine embark joy scheme fiction master release');
console.log('Seed', seed);
let entropy = bip39.mnemonicToEntropy('radar blur cabbage chef fix engine embark joy scheme fiction master release');
console.log('Entropy', entropy);
let rootNode = HDNode.fromSeedHex(seed);
let node = rootNode.derivePath("m/44'/60'/0'/0/0");
console.log('PrivateKey', node.keyPair.d.toBuffer(32).toString('hex')),
*/

saveTests('hdnode', testcases);
