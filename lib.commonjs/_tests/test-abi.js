"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const utils_js_1 = require("./utils.js");
const index_js_1 = require("../index.js");
function equal(actual, expected) {
    switch (expected.type) {
        case "address":
        case "boolean":
        case "hexstring":
        case "string":
            assert_1.default.equal(actual, expected.value);
            return;
        case "number":
            assert_1.default.equal(actual, BigInt(expected.value));
            return;
        case "array":
        case "object":
            assert_1.default.ok(Array.isArray(actual), "!array");
            assert_1.default.equal(actual.length, expected.value.length, ".length mismatch");
            for (let i = 0; i < actual.length; i++) {
                equal(actual[i], expected.value[i]);
            }
            return;
    }
    throw new Error(`unsupported: ${expected}`);
}
describe("Tests ABI Coder", function () {
    const tests = (0, utils_js_1.loadTests)("abi");
    for (const test of tests) {
        it(`tests ABI encoding: (${test.name})`, function () {
            const encoded = index_js_1.AbiCoder.defaultAbiCoder().encode([test.type], [test.value]);
            assert_1.default.equal(encoded, test.encoded, "encoded");
        });
    }
    for (const test of tests) {
        it(`tests ABI decoding: (${test.name})`, function () {
            const decoded = index_js_1.AbiCoder.defaultAbiCoder().decode([test.type], test.encoded)[0];
            equal(decoded, test.verbose);
        });
    }
});
describe("Test Bytes32 strings", function () {
    const tests = [
        {
            name: "ricmoo.firefly.eth",
            str: "ricmoo.firefly.eth",
            expected: '0x7269636d6f6f2e66697265666c792e6574680000000000000000000000000000'
        },
        {
            name: "empty string",
            str: "",
            expected: '0x0000000000000000000000000000000000000000000000000000000000000000'
        }
    ];
    for (const { name, str, expected } of tests) {
        it(`encodes and decodes Bytes32 strings: ${name}`, function () {
            const bytes32 = (0, index_js_1.encodeBytes32String)(str);
            const decoded = (0, index_js_1.decodeBytes32String)(bytes32);
            assert_1.default.equal(bytes32, expected, 'formatted correctly');
            assert_1.default.equal(decoded, str, "parsed correctly");
        });
    }
});
describe("Test Interface", function () {
    const iface = new index_js_1.Interface([
        "function balanceOf(address owner) returns (uint)",
        "event Transfer(address indexed from, address indexed to, uint amount)"
    ]);
    it("does interface stuff; @TODO expand this", function () {
        const addr = "0x8ba1f109551bD432803012645Ac136ddd64DBA72";
        const addr2 = "0xAC1639CF97a3A46D431e6d1216f576622894cBB5";
        const data = iface.encodeFunctionData("balanceOf", [addr]);
        assert_1.default.equal(data, "0x70a082310000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72", "encoded");
        const decoded = iface.decodeFunctionData("balanceOf", data);
        assert_1.default.equal(decoded.length, 1, "decoded.length");
        assert_1.default.equal(decoded[0], addr, "decoded[0]");
        const tx = iface.parseTransaction({ data, value: 10 });
        assert_1.default.ok(tx != null, "tx == null");
        assert_1.default.equal(tx.name, "balanceOf", "tx.balanceOf");
        assert_1.default.equal(tx.signature, "balanceOf(address)", "tx.balanceOf");
        assert_1.default.equal(tx.args.length, 1, "tx.args.length");
        assert_1.default.equal(tx.args[0], addr, "tx.args[0]");
        assert_1.default.equal(tx.selector, "0x70a08231", "tx.selector");
        assert_1.default.equal(tx.value, BigInt(10), "tx.value");
        const result = iface.encodeFunctionResult("balanceOf", [123]);
        assert_1.default.equal(result, "0x000000000000000000000000000000000000000000000000000000000000007b", "result");
        const value = iface.decodeFunctionResult("balanceOf", result);
        assert_1.default.equal(value.length, 1, "result.length");
        assert_1.default.equal(value[0], BigInt(123), "result.value[0]");
        // @TODO: parseResult
        const filter = iface.encodeFilterTopics("Transfer", [addr, addr2]);
        assert_1.default.equal(filter.length, 3);
        assert_1.default.equal(filter[0], "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef");
        assert_1.default.equal(filter[1], "0x0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72");
        assert_1.default.equal(filter[2], "0x000000000000000000000000ac1639cf97a3a46d431e6d1216f576622894cbb5");
        const eventLog = iface.encodeEventLog("Transfer", [addr, addr2, 234]);
        assert_1.default.equal(eventLog.data, "0x00000000000000000000000000000000000000000000000000000000000000ea");
        assert_1.default.deepEqual(eventLog.topics, [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72",
            "0x000000000000000000000000ac1639cf97a3a46d431e6d1216f576622894cbb5"
        ]);
        const values = iface.decodeEventLog("Transfer", eventLog.data, eventLog.topics);
        assert_1.default.equal(values.length, 3);
        assert_1.default.equal(values[0], addr);
        assert_1.default.equal(values[1], addr2);
        assert_1.default.equal(values[2], BigInt(234));
        const log = iface.parseLog(eventLog);
        assert_1.default.ok(log != null);
        assert_1.default.equal(log.name, "Transfer");
        assert_1.default.equal(log.signature, "Transfer(address,address,uint256)");
        assert_1.default.equal(log.topic, "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef");
        assert_1.default.equal(log.args.length, 3);
        assert_1.default.equal(log.args[0], "0x8ba1f109551bD432803012645Ac136ddd64DBA72");
        assert_1.default.equal(log.args[1], "0xAC1639CF97a3A46D431e6d1216f576622894cBB5");
        assert_1.default.equal(log.args[2], BigInt(234));
    });
});
//# sourceMappingURL=test-abi.js.map