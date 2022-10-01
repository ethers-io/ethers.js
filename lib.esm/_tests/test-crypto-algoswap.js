import assert from "assert";
import { lock, computeHmac, keccak256, ripemd160, sha256, sha512, pbkdf2, scrypt, scryptSync, randomBytes } from "../index.js";
describe("test registration", function () {
    let hijack = "";
    function getHijack(algo) {
        return function (...args) {
            hijack = `hijacked ${algo}: ${JSON.stringify(args)}`;
            return "0x42";
        };
    }
    const tests = [
        {
            name: "keccak256",
            params: ["0x"],
            hijackTag: 'hijacked keccak256: [{}]',
            algorithm: keccak256
        },
        {
            name: "sha256",
            params: ["0x"],
            hijackTag: 'hijacked sha256: [{}]',
            algorithm: sha256
        },
        {
            name: "sha512",
            params: ["0x"],
            hijackTag: 'hijacked sha512: [{}]',
            algorithm: sha512
        },
        {
            name: "ripemd160",
            params: ["0x"],
            hijackTag: 'hijacked ripemd160: [{}]',
            algorithm: ripemd160
        },
        {
            name: "pbkdf2",
            params: ["0x", "0x", 1024, 32, "sha256"],
            hijackTag: 'hijacked pbkdf2: [{},{},1024,32,"sha256"]',
            algorithm: pbkdf2
        },
        {
            name: "scryptSync",
            params: ["0x", "0x", 1024, 8, 1, 32],
            hijackTag: 'hijacked scryptSync: [{},{},1024,8,1,32]',
            algorithm: scryptSync
        },
        {
            name: "scrypt",
            params: ["0x", "0x", 1024, 8, 1, 32],
            hijackTag: 'hijacked scrypt: [{},{},1024,8,1,32,null]',
            algorithm: scrypt
        },
        {
            name: "computeHmac",
            params: ["sha256", "0x", "0x"],
            hijackTag: 'hijacked computeHmac: ["sha256",{},{}]',
            algorithm: computeHmac
        },
        {
            name: "randomBytes",
            params: [32],
            hijackTag: "hijacked randomBytes: [32]",
            algorithm: randomBytes,
            postCheck: (value) => {
                return (value instanceof Uint8Array && value.length === 32);
            }
        }
    ];
    tests.forEach(({ name, params, hijackTag, algorithm, postCheck }) => {
        it(`swaps in hijacked callback: ${name}`, async function () {
            const initial = await algorithm(...params);
            algorithm.register(getHijack(name));
            assert.equal(await algorithm(...params), "0x42");
            assert.equal(hijack, hijackTag);
            algorithm.register(algorithm._);
            if (postCheck) {
                assert.ok(postCheck(await algorithm(...params)));
            }
            else {
                assert.equal(await algorithm(...params), initial);
            }
        });
    });
    it("prevents swapping after locked", function () {
        lock();
        tests.forEach(({ name, params, hijackTag, algorithm }) => {
            assert.throws(function () {
                algorithm.register(getHijack("test"));
            }, function (error) {
                return (error.message === `${name} is locked`);
            });
        });
    });
});
//# sourceMappingURL=test-crypto-algoswap.js.map