'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = __importDefault(require("fs"));
var path_1 = require("path");
var bip39 = __importStar(require("bip39"));
var bitcoinjs_lib_1 = require("bitcoinjs-lib");
var ethereumUtil = __importStar(require("ethereumjs-util"));
var __1 = require("..");
function getPath(seed) {
    var path = "m";
    var count = __1.randomNumber(seed + "-getPath-1", 1, 7);
    var hardened = __1.randomNumber(seed + "-getPath-2", 0, count + 2);
    for (var i = 0; i < count; i++) {
        path += "/" + __1.randomNumber(seed + "-getPath-3" + i, 0, 12);
        if (i < hardened) {
            path += "'";
        }
    }
    return path;
}
function getHD(seed) {
    var rootNode = bitcoinjs_lib_1.HDNode.fromSeedHex(seed);
    var privateKey = rootNode.keyPair.d.toBuffer(32);
    var hdnodes = [{
            path: 'm',
            privateKey: '0x' + privateKey.toString('hex'),
            address: '0x' + ethereumUtil.privateToAddress(privateKey).toString('hex'),
        }];
    for (var j = 0; j < 5; j++) {
        var path = getPath(seed + '-hdnode-' + j);
        var node = rootNode.derivePath(path);
        var privateKey_1 = node.keyPair.d.toBuffer(32);
        hdnodes.push({
            path: path,
            privateKey: '0x' + privateKey_1.toString('hex'),
            address: '0x' + ethereumUtil.privateToAddress(privateKey_1).toString('hex'),
        });
    }
    return hdnodes;
}
var testcases = [];
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
["en", "es", "fr", "it", "ja", "ko", "zh_cn", "zh_tw"].forEach(function (locale) {
    var tests = JSON.parse(fs_1.default.readFileSync(path_1.resolve(__dirname, "../input/easyseed-bip39/bip39_vectors." + locale + ".json")).toString());
    tests.forEach(function (test, index) {
        testcases.push({
            name: ("easyseed-" + locale + "-" + index),
            entropy: "0x" + test.entropy,
            locale: locale,
            mnemonic: test.mnemonic,
            password: (test.passphrase || ''),
            seed: "0x" + test.seed,
            hdnodes: []
        });
    });
});
console.log("@TODO: This should be 1024");
for (var i = 0; i < 10; i++) {
    var strength = 16 + 4 * __1.randomNumber('random-1-' + i, 0, 5);
    var entropy = __1.randomHexString('random-2-' + i, strength);
    var mnemonic = bip39.entropyToMnemonic(entropy.substring(2));
    var seed = bip39.mnemonicToSeedHex(mnemonic);
    testcases.push({
        name: "random-" + i,
        locale: "en",
        entropy: entropy,
        mnemonic: mnemonic,
        seed: '0x' + seed,
        hdnodes: getHD(seed),
    });
}
var trezor = require('../input/tests-trezor-bip39.json');
trezor.english.forEach(function (testcase, i) {
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
__1.saveTests('hdnode', testcases);
