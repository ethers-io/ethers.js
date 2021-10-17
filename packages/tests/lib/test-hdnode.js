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
        if ((0, testcases_1.randomNumber)(seed + "-" + index, 0, 2)) {
            return c.toUpperCase();
        }
        return c;
    }).join("");
}
// Too many test cases are caussing issues for the CI
// Only run random cases under random-128
function checkRandom(name) {
    /*
    if (name.substring(0, 7) === "random-") {
        return (parseInt(name.substring(7)) <= 128);
    }
    */
    return true;
}
var isBrowser = (typeof (navigator) !== "undefined");
describe('Test HD Node Derivation is Case Agnostic', function () {
    var tests = (0, testcases_1.loadTests)('hdnode');
    tests.forEach(function (test) {
        if (!checkRandom(test.name)) {
            return;
        }
        if (isBrowser && test.locale !== "en") {
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
    var tests = (0, testcases_1.loadTests)('hdnode');
    tests.forEach(function (test) {
        if (!checkRandom(test.name)) {
            return;
        }
        // If there is nothing to derive, skip this portion of the test
        if (test.hdnodes.length === 0) {
            return;
        }
        if (isBrowser && test.locale !== "en") {
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
    var tests = (0, testcases_1.loadTests)('hdnode');
    tests.forEach(function (test) {
        if (!checkRandom(test.name)) {
            return;
        }
        if (isBrowser && test.locale !== "en") {
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
    var tests = (0, testcases_1.loadTests)('hdnode');
    tests.forEach(function (test) {
        if (!checkRandom(test.name)) {
            return;
        }
        if (isBrowser && test.locale !== "en") {
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
describe("HD Extended Keys", function () {
    var root = ethers_1.ethers.utils.HDNode.fromSeed("0xdeadbeefdeadbeefdeadbeefdeadbeef");
    var root42 = root.derivePath("42");
    it("exports and imports xpriv extended keys", function () {
        var xpriv = root.extendedKey;
        var node = ethers_1.ethers.utils.HDNode.fromExtendedKey(xpriv);
        assert_1.default.equal(root.address, node.address, "address matches");
        var node42 = node.derivePath("42");
        assert_1.default.equal(root42.address, node42.address, "address matches");
    });
    it("exports and imports xpub extended keys", function () {
        var xpub = root.neuter().extendedKey;
        var node = ethers_1.ethers.utils.HDNode.fromExtendedKey(xpub);
        assert_1.default.equal(root.address, node.address, "address matches");
        var node42 = node.derivePath("42");
        assert_1.default.equal(root42.address, node42.address, "address matches");
    });
});
describe("HD error cases", function () {
    var testInvalid = [
        "",
        "m/45/m",
        "m/44/foobar"
    ];
    var root = ethers_1.ethers.utils.HDNode.fromSeed("0xdeadbeefdeadbeefdeadbeefdeadbeef");
    testInvalid.forEach(function (path) {
        it("fails on path \"" + path + "\"", function () {
            assert_1.default.throws(function () {
                root.derivePath(path);
            }, function (error) {
                return true;
            });
        });
    });
    it("fails to derive child of hardened key", function () {
        // Deriving non-hardened should work...
        var node = root.neuter().derivePath("44");
        assert_1.default.throws(function () {
            // Deriving hardened should fail...
            node.derivePath("44'");
        }, function (error) {
            return true;
        });
    });
    // The zero-mnemonic, with and without correct checksum
    var zeroMnemonicCS = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about";
    var zeroMnemonic = "abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon";
    it("fails on invalid mnemonic length", function () {
        var shortMnemonic = "abandon abandon abandon abandon";
        // Test the validate functions
        assert_1.default.ok(ethers_1.ethers.utils.isValidMnemonic(zeroMnemonicCS));
        assert_1.default.ok(!ethers_1.ethers.utils.isValidMnemonic(zeroMnemonic));
        assert_1.default.ok(!ethers_1.ethers.utils.isValidMnemonic(shortMnemonic));
        assert_1.default.throws(function () {
            ethers_1.ethers.utils.mnemonicToEntropy(shortMnemonic);
        }, function (error) {
            return true;
        });
    });
    it("fails on invalid checksum", function () {
        assert_1.default.throws(function () {
            ethers_1.ethers.utils.mnemonicToEntropy(zeroMnemonic);
        }, function (error) {
            return true;
        });
    });
    it("fails on unknown locale", function () {
        assert_1.default.throws(function () {
            ethers_1.ethers.utils.HDNode.fromMnemonic(zeroMnemonicCS, "foobar", "xx");
        }, function (error) {
            return true;
        });
    });
});
//# sourceMappingURL=test-hdnode.js.map