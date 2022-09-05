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

/*
describe("test registration", function() {
    let hijack = "";
    function getHijack(algo: string) {
        return function(...args: Array<any>) {
            hijack = `hijacked ${ algo }: ${ JSON.stringify(args) }`;
            return "0x42";
        }
    }

    it("hijacks keccak256", function() {
        const initial = keccak256("0x");

        keccak256.register(getHijack("kecak256"));
        assert.equal(keccak256("0x"), "0x42");
        assert.equal(hijack, 'hijacked kecak256: [{}]');

        keccak256.register(keccak256._);
        assert.equal(keccak256("0x"), initial);

        keccak256.lock();

        assert.throws(function() {
            keccak256.register(getHijack("test"));
        }, function(error) {
            return (error.message === "keccak256 is locked");
        });
    });

    it("hijacks sha256", function() {
        const initial = sha256("0x");

        sha256.register(getHijack("sha256"));
        assert.equal(sha256("0x"), "0x42");
        assert.equal(hijack, 'hijacked sha256: [{}]');

        sha256.register(sha256._);
        assert.equal(sha256("0x"), initial);

        sha256.lock();

        assert.throws(function() {
            sha256.register(getHijack("test"));
        }, function(error) {
            return (error.message === "sha256 is locked");
        });
    });

    it("hijacks sha512", function() {
        const initial = sha512("0x");

        sha512.register(getHijack("sha512"));
        assert.equal(sha512("0x"), "0x42");
        assert.equal(hijack, 'hijacked sha512: [{}]');

        sha512.register(sha512._);
        assert.equal(sha512("0x"), initial);

        sha512.lock();

        assert.throws(function() {
            sha512.register(getHijack("test"));
        }, function(error) {
            return (error.message === "sha512 is locked");
        });
    });

    it("hijacks pbkdf2", function() {
        const initial = pbkdf2("0x", "0x", 1024, 32, "sha256");

        pbkdf2.register(getHijack("pbkdf2"));
        assert.equal(pbkdf2("0x", "0x", 1024, 32, "sha256"), "0x42");
        assert.equal(hijack, 'hijacked pbkdf2: [{},{},1024,32,"sha256"]');

        pbkdf2.register(pbkdf2._);
        assert.equal(pbkdf2("0x", "0x", 1024, 32, "sha256"), initial);

        pbkdf2.lock();

        assert.throws(function() {
            pbkdf2.register(getHijack("test"));
        }, function(error) {
            return (error.message === "pbkdf2 is locked");
        });
    });

    it("hijacks scryptSync", function() {

        function getHijack(...args: Array<any>) {
            hijack = `hijacked scryptSync: ${ JSON.stringify(args) }`;
            return new Uint8Array([ 0x42 ]);
        }

        const initial = scryptSync("0x", "0x", 1024, 8, 1, 32);

        scryptSync.register(getHijack);
        assert.equal(scryptSync("0x", "0x", 1024, 8, 1, 32), "0x42");
        assert.equal(hijack, 'hijacked scryptSync: [{},{},1024,8,1,32]');

        scryptSync.register(scryptSync._);
        assert.equal(scryptSync("0x", "0x", 1024, 8, 1, 32), initial);

        scryptSync.lock();

        assert.throws(function() {
            scryptSync.register(getHijack);
        }, function(error) {
            return (error.message === "scryptSync is locked");
        });
    });

    it("hijacks scrypt", async function() {
        function getHijack(...args: Array<any>) {
            hijack = `hijacked scrypt: ${ JSON.stringify(args) }`;
            return Promise.resolve(new Uint8Array([ 0x42 ]));
        }

        const initial = await scrypt("0x", "0x", 1024, 8, 1, 32);

        scrypt.register(getHijack);
        assert.equal(await scrypt("0x", "0x", 1024, 8, 1, 32), "0x42");
        assert.equal(hijack, 'hijacked scrypt: [{},{},1024,8,1,32,null]');

        scrypt.register(scrypt._);
        assert.equal(await scrypt("0x", "0x", 1024, 8, 1, 32), initial);

        scrypt.lock();

        assert.throws(function() {
            scrypt.register(getHijack);
        }, function(error) {
            return (error.message === "scrypt is locked");
        });
    });

});
*/
