'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var ethers_1 = require("ethers");
var testcases_1 = require("@ethersproject/testcases");
describe('Test HD Node Derivation from Seed', function () {
    var tests = testcases_1.loadTests('hdnode');
    tests.forEach(function (test) {
        // If there is nothing to derive, skip this portion of the test
        if (test.hdnodes.length === 0) {
            return;
        }
        it('Derives the HD nodes - ' + test.name, function () {
            this.timeout(10000);
            var rootNode = ethers_1.ethers.utils.HDNode.fromSeed(test.seed);
            test.hdnodes.forEach(function (nodeTest) {
                var node = rootNode.derivePath(nodeTest.path);
                assert_1.default.equal(node.privateKey, nodeTest.privateKey, 'Generates privateKey - ' + nodeTest.privateKey);
                var wallet = new ethers_1.ethers.Wallet(node.privateKey);
                assert_1.default.equal(wallet.address.toLowerCase(), nodeTest.address, 'Generates address - ' + nodeTest.privateKey);
            });
        });
    });
});
describe('Test HD Node Derivation from Mnemonic', function () {
    var tests = testcases_1.loadTests('hdnode');
    tests.forEach(function (test) {
        // If there is nothing to derive, skip this portion of the test
        if (test.hdnodes.length === 0) {
            return;
        }
        it('Derives the HD nodes - ' + test.name, function () {
            this.timeout(10000);
            var rootNode = ethers_1.ethers.utils.HDNode.fromMnemonic(test.mnemonic, test.password || null);
            test.hdnodes.forEach(function (nodeTest) {
                var node = rootNode.derivePath(nodeTest.path);
                assert_1.default.equal(node.privateKey, nodeTest.privateKey, 'Matches privateKey - ' + nodeTest.privateKey);
                assert_1.default.equal(node.mnemonic, test.mnemonic, 'Matches mnemonic - ' + nodeTest.privateKey);
                assert_1.default.equal(node.path, nodeTest.path, 'Matches path - ' + nodeTest.privateKey);
                var wallet = new ethers_1.ethers.Wallet(node.privateKey);
                assert_1.default.equal(wallet.address.toLowerCase(), nodeTest.address, 'Generates address - ' + nodeTest.privateKey);
            });
        });
    });
});
describe('Test HD Mnemonic Phrases', function testMnemonic() {
    var tests = testcases_1.loadTests('hdnode');
    tests.forEach(function (test) {
        it(('converts mnemonic phrases - ' + test.name), function () {
            this.timeout(1000000);
            assert_1.default.equal(ethers_1.ethers.utils.mnemonicToSeed(test.mnemonic, test.password), test.seed, 'Converts mnemonic to seed - ' + test.mnemonic + ':' + test.password);
            // Test default english
            if (test.locale === "en") {
                assert_1.default.equal(ethers_1.ethers.utils.entropyToMnemonic(test.entropy), test.mnemonic, "Converts entropy to mnemonic " + test.name + " (default en)");
                assert_1.default.equal(ethers_1.ethers.utils.mnemonicToEntropy(test.mnemonic), test.entropy, "Converts mnemonic to entropy - " + test.mnemonic + " (default en)");
            }
            var wordlist = (ethers_1.ethers.wordlists)[test.locale];
            var mnemonic = ethers_1.ethers.utils.entropyToMnemonic(test.entropy, wordlist);
            assert_1.default.equal(mnemonic.normalize('NFKD'), test.mnemonic.normalize('NFKD'), 'Converts entropy to mnemonic ' + test.name);
            assert_1.default.equal(ethers_1.ethers.utils.mnemonicToEntropy(test.mnemonic, wordlist), test.entropy, 'Converts mnemonic to entropy - ' + test.mnemonic);
        });
    });
});
