import assert from "assert";

import { loadTests } from "./utils.js";

import { decodeRlp, encodeRlp, hexlify } from "../index.js";

import type { TestCaseRlp } from "./types.js";

describe("Test RLP Coder", function() {

    const tests = loadTests<TestCaseRlp>("rlp");

    tests.forEach(({ name, encoded, decoded }) => {
        it(`encodes RLP: ${ name }`, function() {
            assert.equal(encodeRlp(decoded), encoded);
        });
    });

    tests.forEach(({ name, encoded, decoded }) => {
        it(`decodes RLP: ${ name }`, function() {
            assert.deepEqual(decodeRlp(encoded), decoded);
        });
    });
});

describe("Test bad RLP Data", function() {
    it("correctly fails encoding data with invalid values", function() {
        assert.throws(() => {
            encodeRlp([ "0x1234", <string><unknown>1234 ]);
        }, (error: any) => {
            return (error.code === "INVALID_ARGUMENT" &&
                error.argument === "object" &&
                error.value === 1234)
        });
    });

    it("correctlyfails decoding data with trailing junk", function() {
        assert.throws(() => {
            // Zeros_1
            decodeRlp("0x0042");
        }, (error: any) => {
            return (error.code === "INVALID_ARGUMENT" &&
                error.message.match(/^unexpected junk after rlp payload/) &&
                error.argument === "data" &&
                error.value === "0x0042")
        });
    });

    it ("correctlyfails decoding short data", function() {
        assert.throws(() => {
            decodeRlp("0x");
        }, (error: any) => {
            return (error.code === "BUFFER_OVERRUN" &&
                error.message.match(/^data too short/) &&
                hexlify(error.buffer) === "0x" &&
                error.offset === 1 &&
                error.length === 0)
        });
    });

    it ("correctlyfails decoding short data in child", function() {
        assert.throws(() => {
            decodeRlp("0xc8880102030405060708");
        }, (error: any) => {
            return (error.code === "BUFFER_OVERRUN" &&
                error.message.match(/^child data too short/) &&
                hexlify(error.buffer) === "0xc8880102030405060708" &&
                error.offset === 0 &&
                error.length === 8)
        });
    });

    it ("correctlyfails decoding short segment data", function() {
        assert.throws(() => {
            // [["0x4243"], ["0x3145"]] = 0xc8 c3 82 4243 c3 82 3145
            //                                       XXXX
            decodeRlp("0xc8c382c3823145");
        }, (error: any) => {
            return (error.code === "BUFFER_OVERRUN" &&
                error.message.match(/^data short segment too short/) &&
                hexlify(error.buffer) === "0xc8c382c3823145" &&
                error.offset === 9 &&
                error.length === 7)
        });
    });

    it ("correctlyfails decoding non-canonical long-form list length", function() {
        assert.throws(() => {
            // f9 0000: long-form list header encoding length 0; must be 0xc0
            decodeRlp("0xf90000");
        }, (error: any) => {
            return (error.code === "INVALID_ARGUMENT" &&
                error.message.match(/^non-canonical rlp/) &&
                error.argument === "data")
        });
    });

    it ("correctlyfails decoding non-canonical long-form string length", function() {
        assert.throws(() => {
            // b8 01 42: long-form string header encoding length 1; must be 0x8142
            decodeRlp("0xb80142");
        }, (error: any) => {
            return (error.code === "INVALID_ARGUMENT" &&
                error.message.match(/^non-canonical rlp/) &&
                error.argument === "data")
        });
    });

    it ("correctlyfails decoding length with leading zero byte", function() {
        assert.throws(() => {
            // f9 0038 ...: length-of-length has a leading zero byte
            decodeRlp("0xf90038" + "00".repeat(56));
        }, (error: any) => {
            return (error.code === "INVALID_ARGUMENT" &&
                error.message.match(/^non-canonical rlp/) &&
                error.argument === "data")
        });
    });
});

/*
  utils.RLP.encode([["0x4243"], ["0x3145"]])

  0xc8 c3 82 4243 c3 82 3145

 {
  "name": "arrayShort2",
  "decoded": [
   "0x48656c6c6f20576f726c64",
   "0x48656c6c6f20576f726c64"
  ],
  "encoded": "0xd8 8b 48656c6c6f20576f726c64 8b 48656c6c6f20576f726c64"
 },
*/
