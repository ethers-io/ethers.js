"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const index_js_1 = require("../index.js");
describe("Base64 Coding", function () {
    const tests = [
        {
            name: "wikipedia",
            plaintext: (0, index_js_1.toUtf8Bytes)("Many hands make light work."),
            encoded: "TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu"
        }
    ];
    for (const test of tests) {
        it(`encodes base64: ${test.name}`, function () {
            assert_1.default.equal((0, index_js_1.encodeBase64)(test.plaintext), test.encoded);
        });
    }
    for (const test of tests) {
        it(`decodes base64: ${test.name}`, function () {
            const decoded = (0, index_js_1.decodeBase64)(test.encoded);
            assert_1.default.equal(decoded.length, test.plaintext.length, "data.length");
            for (let i = 0; i < decoded.length; i++) {
                assert_1.default.equal(decoded[i], test.plaintext[i]);
            }
        });
    }
});
//# sourceMappingURL=test-utils-misc.js.map