"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const wordlists_js_1 = require("../wordlists/wordlists.js");
const utils_js_1 = require("./utils.js");
const index_js_1 = require("../index.js");
const decoder = new TextDecoder();
function fromHex(hex) {
    const data = Buffer.from(hex.substring(2), "hex");
    return decoder.decode(data);
}
describe("Test HDWallets", function () {
    function checkWallet(wallet, test) {
        assert_1.default.equal(wallet.chainCode, test.chainCode, "chainCode");
        assert_1.default.equal(wallet.depth, test.depth, "depth");
        assert_1.default.equal(wallet.index, test.index, "index");
        assert_1.default.equal(wallet.fingerprint, test.fingerprint, "fingerprint");
        assert_1.default.equal(wallet.parentFingerprint, test.parentFingerprint, "parentFingerprint");
        assert_1.default.equal(wallet.publicKey, test.publicKey, "publicKey");
        if (wallet instanceof index_js_1.HDNodeWallet) {
            assert_1.default.equal(wallet.extendedKey, test.xpriv, "xpriv");
            assert_1.default.equal(wallet.privateKey, test.privateKey, "privateKey");
            assert_1.default.equal(wallet.neuter().extendedKey, test.xpub, "xpub");
        }
        else if (wallet instanceof index_js_1.HDNodeVoidWallet) {
            assert_1.default.equal(wallet.extendedKey, test.xpub, "xpub");
        }
    }
    const tests = (0, utils_js_1.loadTests)("mnemonics");
    const checks = [];
    tests.forEach((test) => {
        // The phrase and password are stored in the test as hex so they
        // are safe as ascii7 values for viewing, printing, etc.
        const phrase = fromHex(test.phrase);
        const password = fromHex(test.password);
        const wordlist = wordlists_js_1.wordlists[test.locale];
        if (wordlist == null) {
            it(`tests ${test.name}`, function () {
                this.skip();
            });
            return;
        }
        const mnemonic = index_js_1.Mnemonic.fromPhrase(phrase, password, wordlist);
        function checkMnemonic(actual) {
            assert_1.default.equal(actual.phrase, phrase, "phrase");
            assert_1.default.equal(actual.password, password, "password");
            assert_1.default.equal(actual.wordlist.locale, test.locale, "locale");
            assert_1.default.equal(actual.entropy, mnemonic.entropy, "entropy");
            assert_1.default.equal(actual.computeSeed(), mnemonic.computeSeed(), "seed");
        }
        checks.push({
            phrase, password, wordlist, mnemonic, checkMnemonic, test
        });
    });
    for (const { test, checkMnemonic, phrase, password, wordlist } of checks) {
        it(`computes the HD keys by mnemonic: ${test.name}`, function () {
            for (const subtest of test.nodes) {
                const w = index_js_1.HDNodeWallet.fromPhrase(phrase, password, subtest.path, wordlist);
                assert_1.default.ok(w instanceof index_js_1.HDNodeWallet, "instanceof HDNodeWallet");
                assert_1.default.equal(w.path, subtest.path, "path");
                checkWallet(w, subtest);
                assert_1.default.ok(!!w.mnemonic, "has mnemonic");
                checkMnemonic(w.mnemonic);
            }
        });
    }
    for (const { test } of checks) {
        it(`computes the HD keys by entropy: ${test.name}`, function () {
            const seedRoot = index_js_1.HDNodeWallet.fromSeed(test.seed);
            for (const subtest of test.nodes) {
                const w = seedRoot.derivePath(subtest.path);
                assert_1.default.ok(w instanceof index_js_1.HDNodeWallet, "instanceof HDNodeWallet");
                assert_1.default.equal(w.path, subtest.path, "path");
                checkWallet(w, subtest);
                assert_1.default.equal(w.mnemonic, null);
            }
        });
    }
    for (const { test } of checks) {
        it(`computes the HD keys by enxtended private key: ${test.name}`, function () {
            for (const subtest of test.nodes) {
                const w = index_js_1.HDNodeWallet.fromExtendedKey(subtest.xpriv);
                assert_1.default.ok(w instanceof index_js_1.HDNodeWallet, "instanceof HDNodeWallet");
                checkWallet(w, subtest);
                assert_1.default.equal(w.mnemonic, null);
            }
        });
    }
    for (const { test, phrase, password, wordlist } of checks) {
        it(`computes the neutered HD keys by paths: ${test.name}`, function () {
            const root = index_js_1.HDNodeWallet.fromPhrase(phrase, password, "m", wordlist).neuter();
            for (const subtest of test.nodes) {
                if (subtest.path.indexOf("'") >= 0) {
                    assert_1.default.throws(() => {
                        const w = root.derivePath(subtest.path);
                        console.log(w);
                    }, (error) => {
                        return (error.code === "UNSUPPORTED_OPERATION" &&
                            error.message.match(/^cannot derive child of neutered node/) &&
                            error.operation === "deriveChild");
                    });
                }
                else {
                    const w = root.derivePath(subtest.path);
                    assert_1.default.ok(w instanceof index_js_1.HDNodeVoidWallet, "instanceof HDNodeVoidWallet");
                    assert_1.default.equal(w.path, subtest.path, "path");
                    checkWallet(w, subtest);
                }
            }
        });
    }
    for (const { test } of checks) {
        it(`computes the neutered HD keys by enxtended public key: ${test.name}`, function () {
            for (const subtest of test.nodes) {
                const w = index_js_1.HDNodeWallet.fromExtendedKey(subtest.xpub);
                assert_1.default.ok(w instanceof index_js_1.HDNodeVoidWallet, "instanceof HDNodeVoidWallet");
                checkWallet(w, subtest);
            }
        });
    }
});
//# sourceMappingURL=test-wallet-hd.js.map