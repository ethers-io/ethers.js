"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const utils_js_1 = require("./utils.js");
const index_js_1 = require("../index.js");
describe("test hashing", function () {
    const tests = (0, utils_js_1.loadTests)("hashes");
    tests.forEach((test) => {
        it(`computes sha2-256: ${test.name}`, function () {
            assert_1.default.equal((0, index_js_1.sha256)(test.data), test.sha256);
        });
    });
    tests.forEach((test) => {
        it(`computes sha2-512: ${test.name}`, function () {
            assert_1.default.equal((0, index_js_1.sha512)(test.data), test.sha512);
        });
    });
    tests.forEach((test) => {
        it(`computes ripemd160: ${test.name}`, function () {
            assert_1.default.equal((0, index_js_1.ripemd160)(test.data), test.ripemd160);
        });
    });
    tests.forEach((test) => {
        it(`computes keccak256: ${test.name}`, function () {
            assert_1.default.equal((0, index_js_1.keccak256)(test.data), test.keccak256);
        });
    });
});
describe("test password-based key derivation", function () {
    const tests = (0, utils_js_1.loadTests)("pbkdf");
    tests.forEach((test) => {
        it(`computes pbkdf2: ${test.name}`, function () {
            const password = Buffer.from(test.password.substring(2), "hex");
            const salt = Buffer.from(test.salt.substring(2), "hex");
            const { iterations, algorithm, key } = test.pbkdf2;
            const result = (0, index_js_1.pbkdf2)(password, salt, iterations, test.dkLen, algorithm);
            assert_1.default.equal(result, key);
        });
    });
    tests.forEach((test) => {
        it(`computes scrypt (sync): ${test.name}`, function () {
            this.timeout(1000);
            const password = Buffer.from(test.password.substring(2), "hex");
            const salt = Buffer.from(test.salt.substring(2), "hex");
            const { N, r, p, key } = test.scrypt;
            const result = (0, index_js_1.scryptSync)(password, salt, N, r, p, test.dkLen);
            assert_1.default.equal(result, key);
        });
    });
    tests.forEach((test) => {
        it(`computes scrypt (async): ${test.name}`, async function () {
            this.timeout(1000);
            const password = Buffer.from(test.password.substring(2), "hex");
            const salt = Buffer.from(test.salt.substring(2), "hex");
            const { N, r, p, key } = test.scrypt;
            let progressCount = 0, progressOk = true, lastProgress = -1;
            const result = await (0, index_js_1.scrypt)(password, salt, N, r, p, test.dkLen, (progress) => {
                if (progress < lastProgress) {
                    progressOk = false;
                }
                lastProgress = progress;
                progressCount++;
            });
            assert_1.default.ok(progressOk, "progress was not monotonically increasing");
            assert_1.default.ok(progressCount > 100, "progress callback was called at leat 100 times");
            assert_1.default.equal(result, key);
        });
    });
});
describe("test hmac", function () {
    const tests = (0, utils_js_1.loadTests)("hmac");
    tests.forEach((test) => {
        it(`computes hmac: ${test.name}`, async function () {
            const { algorithm, key, data } = test;
            assert_1.default.equal((0, index_js_1.computeHmac)(algorithm, key, data), test.hmac);
        });
    });
});
//# sourceMappingURL=test-crypto.js.map