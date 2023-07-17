import assert from "assert";
import { loadTests } from "./utils.js";

import type { TestCaseAbi, TestCaseAbiVerbose } from "./types.js";

import {
    AbiCoder, Interface,
    decodeBytes32String, encodeBytes32String
} from "../index.js";

function equal(actual: any, expected: TestCaseAbiVerbose): void {
    switch (expected.type) {
        case "address": case "boolean": case "hexstring": case "string":
            assert.equal(actual, expected.value);
            return;
        case "number":
            assert.equal(actual, BigInt(expected.value));
            return
        case "array": case "object":
            assert.ok(Array.isArray(actual), "!array");
            assert.equal(actual.length, expected.value.length, ".length mismatch");
            for (let i = 0; i < actual.length; i++) {
                equal(actual[i], expected.value[i]);
            }
            return;
    }
    throw new Error(`unsupported: ${ expected }`);
}

describe("Tests ABI Coder", function() {
    const tests = loadTests<TestCaseAbi>("abi");

    for (const test of tests) {
        it(`tests ABI encoding: (${ test.name })`, function() {
            const encoded = AbiCoder.defaultAbiCoder().encode([ test.type ], [ test.value ]);
            assert.equal(encoded, test.encoded, "encoded");
        });
    }

    for (const test of tests) {
        it(`tests ABI decoding: (${ test.name })`, function() {
            const decoded = AbiCoder.defaultAbiCoder().decode([ test.type ], test.encoded)[0];
            equal(decoded, test.verbose);
        });
    }
});

describe("Test Bytes32 strings", function() {
    const tests: Array<{ name: string, str: string, expected: string }> = [
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
        it(`encodes and decodes Bytes32 strings: ${ name }`, function() {
            const bytes32 = encodeBytes32String(str);
            const decoded = decodeBytes32String(bytes32);
            assert.equal(bytes32, expected, 'formatted correctly');
            assert.equal(decoded, str, "parsed correctly");
        });
    }

});

describe("Test Interface", function() {
    const eventABI = {
        anonymous: false,
        inputs: [
          {
            indexed: true,
            internalType: "bytes20",
            name: "walletPubKeyHash",
            type: "bytes20",
          },
          {
            indexed: false,
            internalType: "bytes",
            name: "redeemerOutputScript",
            type: "bytes",
          },
          {
            indexed: true,
            internalType: "address",
            name: "redeemer",
            type: "address",
          },
          {
            indexed: false,
            internalType: "uint64",
            name: "requestedAmount",
            type: "uint64",
          },
          {
            indexed: false,
            internalType: "uint64",
            name: "treasuryFee",
            type: "uint64",
          },
          {
            indexed: false,
            internalType: "uint64",
            name: "txMaxFee",
            type: "uint64",
          },
        ],
        name: "RedemptionRequested",
        type: "event",
    };

    const iface = new Interface([
        "function balanceOf(address owner) returns (uint)",
        "event Transfer(address indexed from, address indexed to, uint amount)",
        eventABI,
    ]);

    it("does interface stuff; @TODO expand this", function() {
        const addr = "0x8ba1f109551bD432803012645Ac136ddd64DBA72";
        const addr2 = "0xAC1639CF97a3A46D431e6d1216f576622894cBB5";

        const data = iface.encodeFunctionData("balanceOf", [ addr ]);
        assert.equal(data, "0x70a082310000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72", "encoded");

        const decoded = iface.decodeFunctionData("balanceOf", data);
        assert.equal(decoded.length, 1, "decoded.length");
        assert.equal(decoded[0], addr, "decoded[0]");

        const tx = iface.parseTransaction({ data, value: 10 });
        assert.ok(tx != null, "tx == null");
        assert.equal(tx.name, "balanceOf", "tx.balanceOf");
        assert.equal(tx.signature, "balanceOf(address)", "tx.balanceOf");
        assert.equal(tx.args.length, 1, "tx.args.length");
        assert.equal(tx.args[0], addr, "tx.args[0]");
        assert.equal(tx.selector, "0x70a08231", "tx.selector");
        assert.equal(tx.value, BigInt(10), "tx.value");

        const result = iface.encodeFunctionResult("balanceOf", [ 123 ]);
        assert.equal(result, "0x000000000000000000000000000000000000000000000000000000000000007b", "result");

        const value = iface.decodeFunctionResult("balanceOf", result);
        assert.equal(value.length, 1, "result.length");
        assert.equal(value[0], BigInt(123), "result.value[0]");

        // @TODO: parseResult

        const filter = iface.encodeFilterTopics("Transfer", [ addr, addr2 ]);
        assert.equal(filter.length, 3);
        assert.equal(filter[0], "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef");
        assert.equal(filter[1], "0x0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72");
        assert.equal(filter[2], "0x000000000000000000000000ac1639cf97a3a46d431e6d1216f576622894cbb5");

        // Data from:
        // https://goerli.etherscan.io/tx/0xe61cef4cd706db8e23114717a207d76cc6b0df0b74ec52805551c4d1bf347a27#eventlog
        // see `RedemptionRequested` event.
        const walletPubKeyHash = "0x03b74d6893ad46dfdd01b9e0e3b3385f4fce2d1e"
        const redeemer = "0x086813525A7dC7dafFf015Cdf03896Fd276eab60"
        const filterWithBytes20 = iface.encodeFilterTopics("RedemptionRequested", [ walletPubKeyHash, undefined, redeemer ]);
        assert.equal(filterWithBytes20.length, 3);
        assert.equal(filterWithBytes20[0], "0x97a0199072f487232635d50ab75860891afe0b91c976ed2fc76502c4d82d0d95");
        assert.equal(filterWithBytes20[1], "0x03b74d6893ad46dfdd01b9e0e3b3385f4fce2d1e000000000000000000000000");
        assert.equal(filterWithBytes20[2], "0x000000000000000000000000086813525a7dc7dafff015cdf03896fd276eab60");

        const eventLog = iface.encodeEventLog("Transfer", [ addr, addr2, 234 ]);
        assert.equal(eventLog.data, "0x00000000000000000000000000000000000000000000000000000000000000ea");
        assert.deepEqual(eventLog.topics, [
            "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
            "0x0000000000000000000000008ba1f109551bd432803012645ac136ddd64dba72",
            "0x000000000000000000000000ac1639cf97a3a46d431e6d1216f576622894cbb5"
        ]);

        const values = iface.decodeEventLog("Transfer", eventLog.data, eventLog.topics);
        assert.equal(values.length, 3);
        assert.equal(values[0], addr);
        assert.equal(values[1], addr2);
        assert.equal(values[2], BigInt(234));

        const log = iface.parseLog(eventLog);
        assert.ok(log != null);
        assert.equal(log.name, "Transfer");
        assert.equal(log.signature, "Transfer(address,address,uint256)");
        assert.equal(log.topic, "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef");
        assert.equal(log.args.length, 3);
        assert.equal(log.args[0], "0x8ba1f109551bD432803012645Ac136ddd64DBA72");
        assert.equal(log.args[1], "0xAC1639CF97a3A46D431e6d1216f576622894cBB5");
        assert.equal(log.args[2], BigInt(234));
    });
});

describe("Tests Legacy ABI formats", function() {

    // See: #3932
    const iface = new Interface([
        {
            name: "implicitView",
            outputs: [ ],
            inputs: [
                { type: "int128", name: "arg0" }
            ],
            "constant": true,
            "payable": false,
            "type": "function"
        },
        {
            name: "implicitSendNonpay",
            outputs: [ ],
            inputs: [
                { type: "int128", name: "arg0" }
            ],
            "constant": false,
            "payable": false,
            "type": "function"
        },
        {
            name: "implicitSendPay",
            outputs: [ ],
            inputs: [
                { type: "int128", name: "arg0" }
            ],
            "constant": false,
            "payable": true,
            "type": "function"
        },
        {
            name: "implicitSendImplicitPay",
            outputs: [ ],
            inputs: [
                { type: "int128", name: "arg0" }
            ],
            "constant": false,
            "type": "function"
        },
        {
            name: "implicitSendExplicitPay",
            outputs: [ ],
            inputs: [
                { type: "int128", name: "arg0" }
            ],
            payable: true,
            type: "function"
        },
        {
            name: "implicitSendExplicitNonpay",
            outputs: [ ],
            inputs: [
                { type: "int128", name: "arg0" }
            ],
            payable: false,
            type: "function"
        },
        {
            name: "implicitAll",
            outputs: [ ],
            inputs: [
                { type: "int128", name: "arg0" }
            ],
            "type": "function"
        },
        {
            name: "explicitView",
            outputs: [ ],
            inputs: [
                { type: "int128", name: "arg0" }
            ],
            "stateMutability": "view",
            "constant": true,
            "payable": false,
            "type": "function"
        },
        {
            name: "explicitPure",
            outputs: [ ],
            inputs: [
                { type: "int128", name: "arg0" }
            ],
            "stateMutability": "pure",
            "constant": true,
            "payable": false,
            "type": "function"
        },
        {
            name: "explicitPay",
            outputs: [ ],
            inputs: [
                { type: "int128", name: "arg0" }
            ],
            "stateMutability": "payable",
            "constant": true,
            "payable": true,
            "type": "function"
        },
        {
            name: "explicitNonpay",
            outputs: [ ],
            inputs: [
                { type: "int128", name: "arg0" }
            ],
            "stateMutability": "nonpayable",
            "constant": true,
            "payable": false,
            "type": "function"
        },
    ]);

    function test(name: string, isConst: boolean, payable: boolean, stateMutability: string): void {
        it(`tests ABI configuration: ${ name }`, function() {
            const f = iface.getFunction(name);
            assert.ok(!!f, `missing ${ name }`);
            assert.equal(f.constant, isConst, `${ name }.constant`);
            assert.equal(f.stateMutability, stateMutability, `${ name }.stateMutability`);
            assert.equal(f.payable, payable, `${ name }.payable`);
        });
    }

    test("explicitView", true, false, "view");
    test("explicitPure", true, false, "pure");
    test("explicitPay", false, true, "payable");
    test("explicitNonpay", false, false, "nonpayable");

    test("implicitView", true, false, "view");
    test("implicitSendNonpay", false, false, "nonpayable");
    test("implicitSendPay", false, true, "payable");
    test("implicitSendImplicitPay", false, true, "payable");
    test("implicitSendExplicitPay", false, true, "payable");
    test("implicitSendExplicitNonpay", false, false, "nonpayable");
    test("implicitAll", false, true, "payable");
});
