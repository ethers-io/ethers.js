'use strict';

var assert = require('assert');

var utils = require('./utils');
var ethers = utils.getEthers(__filename);

describe('Test HD Node Derivation', function(test) {

    var tests = utils.loadTests('hdnode');
    tests.forEach(function(test) {
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
