'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var ethers_1 = require("ethers");
var testcases_1 = require("@ethersproject/testcases");
function randomCase(seed, text) {
    return text.split("").map(function (c, index) {
        if (testcases_1.randomNumber(seed + "-" + index, 0, 2)) {
            return c.toUpperCase();
        }
        return c;
    }).join("");
}
// Too many test cases are caussing issues for the CI
// Only run random cases under random-128
function checkRandom(name) {
    if (name.substring(0, 7) === "random-") {
        return (parseInt(name.substring(7)) <= 128);
    }
    return true;
}
describe('Test HD Node Derivation is Case Agnostic', function () {
    var tests = testcases_1.loadTests('hdnode');
    tests.forEach(function (test) {
        if (!checkRandom(test.name)) {
            return;
        }
        it("Normalizes case - " + test.name, function () {
            this.timeout(10000);
            var wordlist = (ethers_1.ethers.wordlists)[test.locale];
            var rootNode = ethers_1.ethers.utils.HDNode.fromMnemonic(test.mnemonic, test.password || null, wordlist);
            var altMnemonic = randomCase(test.name, test.mnemonic);
            var altNode = ethers_1.ethers.utils.HDNode.fromMnemonic(altMnemonic, test.password || null, wordlist);
            assert_1.default.equal(altNode.privateKey, rootNode.privateKey, altMnemonic);
        });
    });
});
describe('Test HD Node Derivation from Seed', function () {
    var tests = testcases_1.loadTests('hdnode');
    tests.forEach(function (test) {
        if (!checkRandom(test.name)) {
            return;
        }
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
        if (!checkRandom(test.name)) {
            return;
        }
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
                assert_1.default.equal(node.path, nodeTest.path, 'Matches path - ' + nodeTest.privateKey);
                assert_1.default.equal(node.mnemonic.phrase, test.mnemonic, 'Matches mnemonic.phrase - ' + nodeTest.privateKey);
                assert_1.default.equal(node.mnemonic.path, nodeTest.path, 'Matches mnemonic.path - ' + nodeTest.privateKey);
                var wallet = new ethers_1.ethers.Wallet(node.privateKey);
                assert_1.default.equal(wallet.address.toLowerCase(), nodeTest.address, 'Generates address - ' + nodeTest.privateKey);
            });
        });
    });
});
describe('Test HD Mnemonic Phrases', function testMnemonic() {
    var tests = testcases_1.loadTests('hdnode');
    tests.forEach(function (test) {
        if (!checkRandom(test.name)) {
            return;
        }
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
