"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const utils_js_1 = require("./utils.js");
const index_js_1 = require("../index.js");
describe("Test RLP Coder", function () {
    const tests = (0, utils_js_1.loadTests)("rlp");
    tests.forEach(({ name, encoded, decoded }) => {
        it(`encodes RLP: ${name}`, function () {
            assert_1.default.equal((0, index_js_1.encodeRlp)(decoded), encoded);
        });
    });
    tests.forEach(({ name, encoded, decoded }) => {
        it(`decodes RLP: ${name}`, function () {
            assert_1.default.deepStrictEqual((0, index_js_1.decodeRlp)(encoded), decoded);
        });
    });
});
describe("Test bad RLP Data", function () {
    it("correctly fails encoding data with invalid values", function () {
        assert_1.default.throws(() => {
            (0, index_js_1.encodeRlp)(["0x1234", 1234]);
        }, (error) => {
            return (error.code === "INVALID_ARGUMENT" &&
                error.argument === "object" &&
                error.value === 1234);
        });
    });
    it("correctlyfails decoding data with trailing junk", function () {
        assert_1.default.throws(() => {
            // Zeros_1
            (0, index_js_1.decodeRlp)("0x0042");
        }, (error) => {
            return (error.code === "INVALID_ARGUMENT" &&
                error.message.match(/^unexpected junk after rlp payload/) &&
                error.argument === "data" &&
                error.value === "0x0042");
        });
    });
    it("correctlyfails decoding short data", function () {
        assert_1.default.throws(() => {
            (0, index_js_1.decodeRlp)("0x");
        }, (error) => {
            return (error.code === "BUFFER_OVERRUN" &&
                error.message.match(/^data too short/) &&
                Buffer.from(error.buffer).toString("hex") === "" &&
                error.offset === 1 &&
                error.length === 0);
        });
    });
    it("correctlyfails decoding short data in child", function () {
        assert_1.default.throws(() => {
            (0, index_js_1.decodeRlp)("0xc8880102030405060708");
        }, (error) => {
            return (error.code === "BUFFER_OVERRUN" &&
                error.message.match(/^child data too short/) &&
                Buffer.from(error.buffer).toString("hex") === "c8880102030405060708" &&
                error.offset === 0 &&
                error.length === 8);
        });
    });
    it("correctlyfails decoding short segment data", function () {
        assert_1.default.throws(() => {
            // [["0x4243"], ["0x3145"]] = 0xc8 c3 82 4243 c3 82 3145
            //                                       XXXX
            (0, index_js_1.decodeRlp)("0xc8c382c3823145");
        }, (error) => {
            return (error.code === "BUFFER_OVERRUN" &&
                error.message.match(/^data short segment too short/) &&
                Buffer.from(error.buffer).toString("hex") === "c8c382c3823145" &&
                error.offset === 9 &&
                error.length === 7);
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
//# sourceMappingURL=test-rlp.js.map