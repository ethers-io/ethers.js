import assert from "assert";

import { loadTests } from "./utils.js";

import type { TestCaseHash, TestCaseHmac, TestCasePbkdf } from "./types.js";

import {
    computeHmac,
    keccak256, ripemd160, sha256, sha512,
    pbkdf2, scrypt, scryptSync
} from "../index.js";


describe("test hashing", function() {
    const tests = loadTests<TestCaseHash>("hashes");

    tests.forEach((test) => {
        it(`computes sha2-256: ${ test.name }`, function() {
            assert.equal(sha256(test.data), test.sha256);
        });
    });

    tests.forEach((test) => {
        it(`computes sha2-512: ${ test.name }`, function() {
            assert.equal(sha512(test.data), test.sha512);
        });
    });

    tests.forEach((test) => {
        it(`computes ripemd160: ${ test.name }`, function() {
            assert.equal(ripemd160(test.data), test.ripemd160);
        });
    });

    tests.forEach((test) => {
        it(`computes keccak256: ${ test.name }`, function() {
            assert.equal(keccak256(test.data), test.keccak256);
        });
    });
});

describe("test password-based key derivation", function() {
    const tests = loadTests<TestCasePbkdf>("pbkdf");

    tests.forEach((test) => {
        it(`computes pbkdf2: ${ test.name}`, function() {
            const password = Buffer.from(test.password.substring(2), "hex");
            const salt = Buffer.from(test.salt.substring(2), "hex");
            const { iterations, algorithm, key } = test.pbkdf2;
            const result = pbkdf2(password, salt, iterations, test.dkLen, algorithm);
            assert.equal(result, key);
        });
    });

    tests.forEach((test) => {
        it(`computes scrypt (sync): ${ test.name}`, function() {
            this.timeout(1000);

            const password = Buffer.from(test.password.substring(2), "hex");
            const salt = Buffer.from(test.salt.substring(2), "hex");
            const { N, r, p, key } = test.scrypt;
            const result = scryptSync(password, salt, N, r, p, test.dkLen);
            assert.equal(result, key);
        });
    });

    tests.forEach((test) => {
        it(`computes scrypt (async): ${ test.name}`, async function() {
            this.timeout(1000);

            const password = Buffer.from(test.password.substring(2), "hex");
            const salt = Buffer.from(test.salt.substring(2), "hex");
            const { N, r, p, key } = test.scrypt;

            let progressCount = 0, progressOk = true, lastProgress = -1;

            const result = await scrypt(password, salt, N, r, p, test.dkLen, (progress) => {
                if (progress < lastProgress) { progressOk = false; }
                lastProgress = progress;
                progressCount++;
            });

            assert.ok(progressOk, "progress was not monotonically increasing");
            assert.ok(progressCount > 100, "progress callback was called at leat 100 times");
            assert.equal(result, key);
        });
    });

});

describe("test hmac", function() {
    const tests = loadTests<TestCaseHmac>("hmac");

    tests.forEach((test) => {
        it(`computes hmac: ${ test.name}`, async function() {
            const { algorithm, key, data } = test;
            assert.equal(computeHmac(algorithm, key, data), test.hmac);
        });
    });
});
