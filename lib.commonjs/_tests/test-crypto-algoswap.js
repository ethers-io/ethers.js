"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const index_js_1 = require("../index.js");
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
            algorithm: index_js_1.keccak256
        },
        {
            name: "sha256",
            params: ["0x"],
            hijackTag: 'hijacked sha256: [{}]',
            algorithm: index_js_1.sha256
        },
        {
            name: "sha512",
            params: ["0x"],
            hijackTag: 'hijacked sha512: [{}]',
            algorithm: index_js_1.sha512
        },
        {
            name: "ripemd160",
            params: ["0x"],
            hijackTag: 'hijacked ripemd160: [{}]',
            algorithm: index_js_1.ripemd160
        },
        {
            name: "pbkdf2",
            params: ["0x", "0x", 1024, 32, "sha256"],
            hijackTag: 'hijacked pbkdf2: [{},{},1024,32,"sha256"]',
            algorithm: index_js_1.pbkdf2
        },
        {
            name: "scryptSync",
            params: ["0x", "0x", 1024, 8, 1, 32],
            hijackTag: 'hijacked scryptSync: [{},{},1024,8,1,32]',
            algorithm: index_js_1.scryptSync
        },
        {
            name: "scrypt",
            params: ["0x", "0x", 1024, 8, 1, 32],
            hijackTag: 'hijacked scrypt: [{},{},1024,8,1,32,null]',
            algorithm: index_js_1.scrypt
        },
        {
            name: "computeHmac",
            params: ["sha256", "0x", "0x"],
            hijackTag: 'hijacked computeHmac: ["sha256",{},{}]',
            algorithm: index_js_1.computeHmac
        },
        {
            name: "randomBytes",
            params: [32],
            hijackTag: "hijacked randomBytes: [32]",
            algorithm: index_js_1.randomBytes,
            postCheck: (value) => {
                return (value instanceof Uint8Array && value.length === 32);
            }
        }
    ];
    tests.forEach(({ name, params, hijackTag, algorithm, postCheck }) => {
        it(`swaps in hijacked callback: ${name}`, async function () {
            const initial = await algorithm(...params);
            algorithm.register(getHijack(name));
            assert_1.default.equal(await algorithm(...params), "0x42");
            assert_1.default.equal(hijack, hijackTag);
            algorithm.register(algorithm._);
            if (postCheck) {
                assert_1.default.ok(postCheck(await algorithm(...params)));
            }
            else {
                assert_1.default.equal(await algorithm(...params), initial);
            }
        });
    });
    it("prevents swapping after locked", function () {
        (0, index_js_1.lock)();
        tests.forEach(({ name, params, hijackTag, algorithm }) => {
            assert_1.default.throws(function () {
                algorithm.register(getHijack("test"));
            }, function (error) {
                return (error.message === `${name} is locked`);
            });
        });
    });
});
//# sourceMappingURL=test-crypto-algoswap.js.map