import assert from "assert";
import { decodeBase64, encodeBase64, toUtf8Bytes } from "../index.js";
describe("Base64 Coding", function () {
    const tests = [
        {
            name: "wikipedia",
            plaintext: toUtf8Bytes("Many hands make light work."),
            encoded: "TWFueSBoYW5kcyBtYWtlIGxpZ2h0IHdvcmsu"
        }
    ];
    for (const test of tests) {
        it(`encodes base64: ${test.name}`, function () {
            assert.equal(encodeBase64(test.plaintext), test.encoded);
        });
    }
    for (const test of tests) {
        it(`decodes base64: ${test.name}`, function () {
            const decoded = decodeBase64(test.encoded);
            assert.equal(decoded.length, test.plaintext.length, "data.length");
            for (let i = 0; i < decoded.length; i++) {
                assert.equal(decoded[i], test.plaintext[i]);
            }
        });
    }
});
//# sourceMappingURL=test-utils-misc.js.map