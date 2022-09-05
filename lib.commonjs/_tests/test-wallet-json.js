"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const utils_js_1 = require("./utils.js");
const index_js_1 = require("../index.js");
describe("Tests JSON Wallet Formats", function () {
    const tests = (0, utils_js_1.loadTests)("wallets");
    tests.forEach((test) => {
        if (test.type !== "crowdsale") {
            return;
        }
        it(`tests decrypting Crowdsale JSON: ${test.name}`, async function () {
            const password = Buffer.from(test.password.substring(2), "hex");
            const account = (0, index_js_1.decryptCrowdsaleJson)(test.content, password);
            assert_1.default.equal(account.address, test.address, "address");
        });
    });
    tests.forEach((test) => {
        if (test.type !== "keystore") {
            return;
        }
        it(`tests decrypting Keystore JSON (sync): ${test.name}`, function () {
            this.timeout(20000);
            const password = Buffer.from(test.password.substring(2), "hex");
            const account = (0, index_js_1.decryptKeystoreJsonSync)(test.content, password);
            //console.log(account);
            assert_1.default.equal(account.address, test.address, "address");
        });
    });
    tests.forEach((test) => {
        if (test.type !== "keystore") {
            return;
        }
        it(`tests decrypting Keystore JSON (async): ${test.name}`, async function () {
            this.timeout(20000);
            const password = Buffer.from(test.password.substring(2), "hex");
            const account = await (0, index_js_1.decryptKeystoreJson)(test.content, password);
            //console.log(account);
            assert_1.default.equal(account.address, test.address, "address");
        });
    });
    tests.forEach((test) => {
        it(`tests decrypting JSON (sync): ${test.name}`, function () {
            this.timeout(20000);
            const password = Buffer.from(test.password.substring(2), "hex");
            const wallet = index_js_1.Wallet.fromEncryptedJsonSync(test.content, password);
            //console.log(wallet);
            assert_1.default.equal(wallet.address, test.address, "address");
        });
    });
    tests.forEach((test) => {
        it(`tests decrypting JSON (async): ${test.name}`, async function () {
            this.timeout(20000);
            const password = Buffer.from(test.password.substring(2), "hex");
            const wallet = await index_js_1.Wallet.fromEncryptedJson(test.content, password);
            //console.log(wallet);
            assert_1.default.equal(wallet.address, test.address, "address");
        });
    });
});
//# sourceMappingURL=test-wallet-json.js.map