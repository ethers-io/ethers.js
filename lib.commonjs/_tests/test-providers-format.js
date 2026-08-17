"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const index_js_1 = require("../index.js");
const format_js_1 = require("../providers/format.js");
describe("Tests provider response formatting", function () {
    it("treats empty string as empty hex data", function () {
        assert_1.default.equal((0, format_js_1.formatData)(""), "0x");
        assert_1.default.equal((0, format_js_1.formatData)("0x"), "0x");
        assert_1.default.equal((0, format_js_1.formatData)("0x1234"), "0x1234");
    });
    it("still rejects non-hex data", function () {
        assert_1.default.throws(() => {
            (0, format_js_1.formatData)("not-hex");
        }, (error) => {
            return (0, index_js_1.isError)(error, "INVALID_ARGUMENT");
        });
    });
    // https://github.com/ethers-io/ethers.js/issues/4853
    it("formats a transaction whose RPC input is an empty string", function () {
        const formatted = (0, format_js_1.formatTransactionResponse)({
            accessList: [],
            blockHash: null,
            blockNumber: null,
            chainId: "0x1",
            from: "0x2B4E3Df272E05b5318C69C95274055973C36fE1D",
            gas: "0x5208",
            gasPrice: "0x77850d4a0",
            hash: "0x9772deb5d7f3969ed4dd62a198c674e3a2b14d1517fef84e47cde962ed5eb9a3",
            input: "",
            maxFeePerGas: "0x77850d4a0",
            maxPriorityFeePerGas: "0xf4240",
            nonce: "0x66",
            r: "0x0",
            s: "0x0",
            to: "0x95FD6074659D4aC99Fd7B5D5cae6afAcFb211a07",
            transactionIndex: null,
            type: "0x2",
            v: "0x0",
            value: "0x38d7ea4c68000"
        });
        assert_1.default.equal(formatted.data, "0x");
        assert_1.default.equal(formatted.hash, "0x9772deb5d7f3969ed4dd62a198c674e3a2b14d1517fef84e47cde962ed5eb9a3");
        assert_1.default.equal(formatted.from, "0x2B4E3Df272E05b5318C69C95274055973C36fE1D");
        assert_1.default.equal(formatted.to, "0x95FD6074659D4aC99Fd7B5D5cae6afAcFb211a07");
        assert_1.default.equal(formatted.value, BigInt("0x38d7ea4c68000"));
        assert_1.default.equal(formatted.type, 2);
        assert_1.default.equal(formatted.nonce, 0x66);
    });
});
//# sourceMappingURL=test-providers-format.js.map