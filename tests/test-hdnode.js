'use strict';

var assert = require('assert');

var utils = require('./utils');
var ethers = utils.getEthers(__filename);

function skip(name) {
    var match = name.match(/^random-([0-9]+)$/);
    if (match && parseInt(match[1]) > 512) {
        return true;
    }
    return false;
}

describe('Test HD Node Derivation', function(test) {

    var tests = utils.loadTests('hdnode');
    tests.forEach(function(test) {
        if (skip(test.name)) { return; }
        it('Derives the HD nodes - ' + test.name, function() {
            this.timeout(10000);

            //var rootNode = new ethers.utils.HDNode.fromSeed(test.seed);
            var rootNode = new ethers.utils.HDNode.fromMnemonic(test.mnemonic, null, test.password || null);

            test.hdnodes.forEach(function(nodeTest) {
                var node = rootNode.derivePath(nodeTest.path);
                assert.equal(node.privateKey, nodeTest.privateKey,
                    'Generates privateKey - ' + nodeTest.privateKey);

                assert.equal(node.extendedKey, nodeTest.xpriv,
                    "Child Extended privateKey - " + nodeTest.privateKey);
                assert.equal(node.neuter().extendedKey, nodeTest.xpub,
                    "Child Extended privateKey - " + nodeTest.privateKey);

                var wallet = new ethers.Wallet(node.privateKey);
                assert.equal(wallet.address.toLowerCase(), nodeTest.address,
                    'Generates address - ' + nodeTest.privateKey);

                assert.equal(node.address, (new ethers.Wallet(node)).address,
                    'HDNode address matches - ' + nodeTest.privateKey);

                // Test public extended key derivation
                var lastHardened = nodeTest.path.match(/^(.*)'([^']*)$/);
                if (lastHardened && lastHardened[2].trim() !== "") {

                // Derive as far as we can for hardened, then derive the remaining from neutered
                var hardNode = rootNode.derivePath(lastHardened[1] + "'");
                    var neutered = hardNode.neuter();
                    var nodeXpriv = ethers.utils.HDNode.fromExtendedKey(hardNode.extendedKey);
                    nodeXpriv = nodeXpriv.derivePath(lastHardened[2].substring(1));
                    var nodeXpub = ethers.utils.HDNode.fromExtendedKey(neutered.extendedKey);
                    nodeXpub = nodeXpub.derivePath(lastHardened[2].substring(1));

                    assert.equal(neutered.privateKey, null,
                        'Neutered HDNode privateKey null - ' + nodeTest.privateKey);
                    assert.equal(neutered.xpriv, null,
                        'Neutered HDNode xpriv null - ' + nodeTest.privateKey);

                    neutered = neutered.derivePath(lastHardened[2].substring(1));

                    assert.equal(neutered.address.toLowerCase(), nodeTest.address,
                        'Derived Neutered HDNode address matches - ' + nodeTest.privateKey);

                    assert.equal(neutered.xpub, node.xpub,
                        'Derived Neutered HDNode xpub matches - ' + nodeTest.privateKey);

                    assert.equal(neutered.privateKey, null,
                        'Derived Neutered HDNode privateKey null - ' + nodeTest.privateKey);
                    assert.equal(neutered.xpriv, null,
                        'Neutered HDNode xpriv null - ' + nodeTest.privateKey);

                    // Test extended key derivation
                    assert.equal(nodeXpub.xpriv, null,
                        'Serialized Neutered HDNode xpriv null - ' + nodeTest.privateKey);
                    assert.equal(nodeXpriv.extendedKey, node.extendedKey,
                        'Serialized HDNode xpriv matches - ' + nodeTest.privateKey);
                    assert.equal(nodeXpub.extendedKey, neutered.extendedKey,
                        'Serialized Neutered HDNode xpub matches - ' + nodeTest.privateKey);
                }

                // Test serialization
                var deserializedNode = ethers.utils.HDNode.fromExtendedKey(nodeTest.xpriv);

                assert.equal(deserializedNode.extendedKey, nodeTest.xpriv,
                    'Neutered HDNode xpriv null - ' + nodeTest.privateKey);
                assert.equal(deserializedNode.neuter().extendedKey, nodeTest.xpub,
                    'Neutered HDNode xpriv null - ' + nodeTest.privateKey);

            });
        });
    });
});

describe('Test HD Mnemonic Phrases', function testMnemonic() {
    var tests = utils.loadTests('hdnode');
    tests.forEach(function(test) {
        if (skip(test.name)) { return; }
        it(('converts mnemonic phrases - ' + test.name), function() {
            this.timeout(1000000);

            assert.equal(ethers.utils.HDNode.entropyToMnemonic(test.entropy), test.mnemonic,
                'Converts entropy to mnemonic ' + test.name);
            assert.equal(ethers.utils.HDNode.mnemonicToEntropy(test.mnemonic), test.entropy,
                'Converts mnemonic to entropy - ' + test.mnemonic);
            assert.equal(ethers.utils.HDNode.mnemonicToSeed(test.mnemonic, test.password), test.seed,
                'Converts mnemonic to seed - ' + test.mnemonic + ':' + test.password);
        });
    });
});

// See: https://github.com/nym-zone/easyseed
function testEasySeed(lang, locale) {
    describe('Test easyseed BIP39 Test cases - ' + locale, function() {
        var tests = utils.loadJson('easyseed-bip39/bip39_vectors.' + locale + '.json');
        tests.forEach(function(test) {
            it('test - ' + test.entropy, function() {
                this.timeout(100000);
                var seed = ethers.utils.HDNode.mnemonicToSeed(test.mnemonic, test.passphrase);
                assert.equal(seed, '0x' + test.seed, 'seeds match');

                var entropy = ethers.utils.HDNode.mnemonicToEntropy(test.mnemonic, lang);
                assert.equal(entropy, '0x' + test.entropy, 'entropy match');

                var mnemonic = ethers.utils.HDNode.entropyToMnemonic('0x' + test.entropy, lang);
                assert.equal(mnemonic.normalize('NFKD'), test.mnemonic.normalize('NFKD'), 'mnemonic match');
            });
        });
    });
}

testEasySeed(ethers.wordlists.en, 'en');
testEasySeed(ethers.wordlists.es, 'es');
testEasySeed(ethers.wordlists.fr, 'fr');
testEasySeed(ethers.wordlists.ja, 'ja');
testEasySeed(ethers.wordlists.zh_cn, 'zh_cn');
testEasySeed(ethers.wordlists.zh_tw, 'zh_tw');
testEasySeed(ethers.wordlists.it, 'it');
testEasySeed(ethers.wordlists.ko, 'ko');

describe('Testnet Extended Key (#553)', function testMnemonic() {
    var tests = [
        {
            name: "testnet extended public key",
            extended: "tpubD6NzVbkrYhZ4Xbv9K5Ajt49a8XEPydLyfyFBNvqt3TRBa9S8L3PVoKBthRS8gimY2ZU2LQ3gXQKpXHRR6fu9W1rWp6jaBToyZ5ar7wbRNYs",
            node: {
                publicKey: "0x02ead6f326f28baf5af54ab4a1688d5784f92848bba73c004365da8871b1e8677e",
                parentFingerprint: "0x00000000",
                fingerprint: "0x68ff1104",
                address: "0xc17Ee49BA46A41FBdA2306d00DA5Ce410925a7cb",
                chainCode: "0x7eee1a867c6938de05f0677d290769a6db3d135d4c1b5ba84c753b56b027cfb7",
                index: 0,
                depth: 0
            }
        },
        {
            name: "testnet extended private key",
            extended: "tprv8ZgxMBicQKsPe8tMRRW9UeVTZViTpJA56feQ6QoadBcnjfBMheZucpa2XHqF6iuRJSngkasg1yXD7VpGgGafFJwhY5RoETMSbiyEDBzxdCd",
            node: {
                privateKey: "0x949219063180d462349e358ec93cec1067fc346b37530e44b592a8a6dbe96d4c",
                publicKey: "0x02ead6f326f28baf5af54ab4a1688d5784f92848bba73c004365da8871b1e8677e",
                parentFingerprint: "0x00000000",
                fingerprint: "0x68ff1104",
                address: "0xc17Ee49BA46A41FBdA2306d00DA5Ce410925a7cb",
                chainCode: "0x7eee1a867c6938de05f0677d290769a6db3d135d4c1b5ba84c753b56b027cfb7",
                index: 0,
                depth: 0
            }
        }
    ];

    tests.forEach(function(test) {
        it(test.name, function() {
            var node = ethers.utils.HDNode.fromExtendedKey(test.extended);
            Object.keys(test.node).forEach(function(key) {
                assert.equal(node[key], test.node[key], "does not match " + key);
            });
        });
    });
});

describe("Test Mnemonic is Case Agnostic", function() {
    function randomCase(seed, text) {
        return text.split("").map(function(c, index) {
           if (utils.randomNumber(seed + "-" + index, 0, 1000) > 500) {
               return c.toUpperCase();
           }
           return c
        }).join("");
    }

    function addTest(mnemonic, altMnemonic) {
        it(altMnemonic, function() {
            var node = ethers.utils.HDNode.fromMnemonic(mnemonic);
            var altNode = ethers.utils.HDNode.fromMnemonic(altMnemonic);
            assert.equal(node.privateKey, altNode.privateKey, altMnemonic);
        });
    }

    for (var i = 0; i < 128; i++) {
        var seed = "test-" + i;
        var entropy = utils.randomBytes(seed, 16, 16);
        var mnemonic = ethers.utils.HDNode.entropyToMnemonic(entropy);
        var altMnemonic = randomCase(seed, mnemonic);
        addTest(mnemonic, altMnemonic);
    }
});
