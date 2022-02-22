'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var hethers_1 = require("hethers");
var testcases_1 = require("@hethers/testcases");
function randomCase(seed, text) {
    return text.split("").map(function (c, index) {
        if ((0, testcases_1.randomNumber)(seed + "-" + index, 0, 2)) {
            return c.toUpperCase();
        }
        return c;
    }).join("");
}
var isBrowser = (typeof (navigator) !== "undefined");
describe('Test HD Node Derivation is Case Agnostic', function () {
    var tests = (0, testcases_1.loadTests)('hdnode');
    tests.forEach(function (test) {
        if (isBrowser && test.locale !== "en") {
            return;
        }
        it("Normalizes case - " + test.name, function () {
            this.timeout(10000);
            var wordlist = (hethers_1.hethers.wordlists)[test.locale];
            var rootNode = hethers_1.hethers.utils.HDNode.fromMnemonic(test.mnemonic, test.password || null, wordlist);
            var altMnemonic = randomCase(test.name, test.mnemonic);
            var altNode = hethers_1.hethers.utils.HDNode.fromMnemonic(altMnemonic, test.password || null, wordlist);
            assert_1.default.equal(altNode.privateKey, rootNode.privateKey, altMnemonic);
        });
    });
});
describe('Test HD Node Derivation from Seed', function () {
    var tests = (0, testcases_1.loadTests)('hdnode');
    tests.forEach(function (test) {
        // If there is nothing to derive, skip this portion of the test
        if (test.hdnodes.length === 0) {
            return;
        }
        if (isBrowser && test.locale !== "en") {
            return;
        }
        it('Derives the HD nodes - ' + test.name, function () {
            this.timeout(10000);
            var rootNode = hethers_1.hethers.utils.HDNode.fromSeed(test.seed);
            test.hdnodes.forEach(function (nodeTest) {
                var node = rootNode.derivePath(nodeTest.path);
                assert_1.default.strictEqual(node.privateKey, nodeTest.privateKey, 'Generates privateKey - ' + nodeTest.privateKey);
                assert_1.default.strictEqual(node.alias, nodeTest.alias, "Generates alias - " + nodeTest.alias);
            });
        });
    });
});
describe('Test HD Node Derivation from Mnemonic', function () {
    var tests = (0, testcases_1.loadTests)('hdnode');
    tests.forEach(function (test) {
        if (isBrowser && test.locale !== "en") {
            return;
        }
        // If there is nothing to derive, skip this portion of the test
        if (test.hdnodes.length === 0) {
            return;
        }
        it('Derives the HD nodes - ' + test.name, function () {
            this.timeout(10000);
            var rootNode = hethers_1.hethers.utils.HDNode.fromMnemonic(test.mnemonic, test.password || null);
            test.hdnodes.forEach(function (nodeTest) {
                var node = rootNode.derivePath(nodeTest.path);
                assert_1.default.strictEqual(node.privateKey, nodeTest.privateKey, 'Matches privateKey - ' + nodeTest.privateKey);
                assert_1.default.strictEqual(node.path, nodeTest.path, 'Matches path - ' + nodeTest.privateKey);
                assert_1.default.strictEqual(node.mnemonic.phrase, test.mnemonic, 'Matches mnemonic.phrase - ' + nodeTest.privateKey);
                assert_1.default.strictEqual(node.mnemonic.path, nodeTest.path, 'Matches mnemonic.path - ' + nodeTest.privateKey);
                var wallet = new hethers_1.hethers.Wallet(node.privateKey);
                assert_1.default.strictEqual(wallet.alias, nodeTest.alias, "Generates alias - " + nodeTest.alias);
            });
        });
    });
});
describe('Test HD Mnemonic Phrases', function testMnemonic() {
    var tests = (0, testcases_1.loadTests)('hdnode');
    tests.forEach(function (test) {
        if (isBrowser && test.locale !== "en") {
            return;
        }
        it(('converts mnemonic phrases - ' + test.name), function () {
            this.timeout(1000000);
            assert_1.default.strictEqual(hethers_1.hethers.utils.mnemonicToSeed(test.mnemonic, test.password), test.seed, 'Converts mnemonic to seed - ' + test.mnemonic + ':' + test.password);
            // Test default english
            if (test.locale === "en") {
                assert_1.default.strictEqual(hethers_1.hethers.utils.entropyToMnemonic(test.entropy), test.mnemonic, "Converts entropy to mnemonic " + test.name + " (default en)");
                assert_1.default.strictEqual(hethers_1.hethers.utils.mnemonicToEntropy(test.mnemonic), test.entropy, "Converts mnemonic to entropy - " + test.mnemonic + " (default en)");
            }
            var wordlist = (hethers_1.hethers.wordlists)[test.locale];
            var mnemonic = hethers_1.hethers.utils.entropyToMnemonic(test.entropy, wordlist);
            assert_1.default.strictEqual(mnemonic.normalize('NFKD'), test.mnemonic.normalize('NFKD'), 'Converts entropy to mnemonic ' + test.name);
            assert_1.default.strictEqual(hethers_1.hethers.utils.mnemonicToEntropy(test.mnemonic, wordlist), test.entropy, 'Converts mnemonic to entropy - ' + test.mnemonic);
        });
    });
});
describe("HD Extended Keys", function () {
    var root = hethers_1.hethers.utils.HDNode.fromSeed("0xdeadbeefdeadbeefdeadbeefdeadbeef");
    var root42 = root.derivePath("42");
    it("exports and imports xpriv extended keys", function () {
        var xpriv = root.extendedKey;
        var node = hethers_1.hethers.utils.HDNode.fromExtendedKey(xpriv);
        if (node.privateKey) {
            assert_1.default.strictEqual(root.alias, node.alias, "alias matches");
        }
        var node42 = node.derivePath("42");
        if (node42.privateKey) {
            assert_1.default.strictEqual(root42.alias, node42.alias, "alias matches");
        }
    });
    it("exports and imports xpub extended keys", function () {
        var xpub = root.neuter().extendedKey;
        var node = hethers_1.hethers.utils.HDNode.fromExtendedKey(xpub);
        if (node.privateKey) {
            assert_1.default.strictEqual(root.alias, node.alias, "address matches");
        }
        var node42 = node.derivePath("42");
        if (node.privateKey) {
            assert_1.default.strictEqual(root42.alias, node42.alias, "address matches");
        }
    });
});
describe("HD error cases", function () {
    var testInvalid = [
        "",
        "m/45/m",
        "m/44/foobar"
    ];
    var root = hethers_1.hethers.utils.HDNode.fromSeed("0xdeadbeefdeadbeefdeadbeefdeadbeef");
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
        assert_1.default.ok(hethers_1.hethers.utils.isValidMnemonic(zeroMnemonicCS));
        assert_1.default.ok(!hethers_1.hethers.utils.isValidMnemonic(zeroMnemonic));
        assert_1.default.ok(!hethers_1.hethers.utils.isValidMnemonic(shortMnemonic));
        assert_1.default.throws(function () {
            hethers_1.hethers.utils.mnemonicToEntropy(shortMnemonic);
        }, function (error) {
            return true;
        });
    });
    it("fails on invalid checksum", function () {
        assert_1.default.throws(function () {
            hethers_1.hethers.utils.mnemonicToEntropy(zeroMnemonic);
        }, function (error) {
            return true;
        });
    });
    it("fails on unknown locale", function () {
        assert_1.default.throws(function () {
            hethers_1.hethers.utils.HDNode.fromMnemonic(zeroMnemonicCS, "foobar", "xx");
        }, function (error) {
            return true;
        });
    });
});
//# sourceMappingURL=test-hdnode.spec.js.map