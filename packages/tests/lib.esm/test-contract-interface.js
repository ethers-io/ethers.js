'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import assert from "assert";
import { ethers } from "ethers";
import { loadTests } from "@ethersproject/testcases";
const bnify = ethers.BigNumber.from;
function equals(actual, expected) {
    // Array (treat recursively)
    if (Array.isArray(actual)) {
        if (!Array.isArray(expected) || actual.length !== expected.length) {
            return false;
        }
        for (let i = 0; i < actual.length; i++) {
            if (!equals(actual[i], expected[i])) {
                return false;
            }
        }
        return true;
    }
    if (typeof (actual) === 'number') {
        actual = bnify(actual);
    }
    if (typeof (expected) === 'number') {
        expected = bnify(expected);
    }
    // BigNumber
    if (actual.eq) {
        if (typeof (expected) === 'string' && expected.match(/^-?0x[0-9A-Fa-f]*$/)) {
            let neg = (expected.substring(0, 1) === '-');
            if (neg) {
                expected = expected.substring(1);
            }
            expected = bnify(expected);
            if (neg) {
                expected = expected.mul(-1);
            }
        }
        if (!actual.eq(expected)) {
            return false;
        }
        return true;
    }
    // Uint8Array
    if (expected.buffer) {
        if (!ethers.utils.isHexString(actual)) {
            return false;
        }
        actual = ethers.utils.arrayify(actual);
        if (!actual.buffer || actual.length !== expected.length) {
            return false;
        }
        for (let i = 0; i < actual.length; i++) {
            if (actual[i] !== expected[i]) {
                return false;
            }
        }
        return true;
    }
    // Maybe address?
    try {
        let actualAddress = ethers.utils.getAddress(actual);
        let expectedAddress = ethers.utils.getAddress(expected);
        return (actualAddress === expectedAddress);
    }
    catch (error) { }
    // Something else
    return (actual === expected);
}
function getValues(object, named) {
    if (Array.isArray(object)) {
        let result = [];
        object.forEach(function (object) {
            result.push(getValues(object, named));
        });
        return result;
    }
    switch (object.type) {
        case 'number':
            return bnify(object.value);
        case 'boolean':
        case 'string':
            return object.value;
        case 'buffer':
            return ethers.utils.arrayify(object.value);
        case 'tuple':
            let result = getValues(object.value, named);
            if (named) {
                let namedResult = {};
                result.forEach((value, index) => {
                    namedResult['r' + String(index)] = value;
                });
                return namedResult;
            }
            return result;
        default:
            throw new Error('invalid type - ' + object.type);
    }
}
describe('ABI Coder Encoding', function () {
    let coder = ethers.utils.defaultAbiCoder;
    let tests = loadTests('contract-interface');
    tests.forEach((test) => {
        let values = getValues(JSON.parse(test.normalizedValues));
        let types = JSON.parse(test.types);
        let result = test.result;
        let title = test.name + ' => (' + test.types + ') = (' + test.normalizedValues + ')';
        it(('encodes parameters - ' + test.name + ' - ' + test.types), function () {
            this.timeout(120000);
            let encoded = coder.encode(types, values);
            assert.equal(encoded, result, 'encoded data - ' + title);
        });
    });
});
describe('ABI Coder Decoding', function () {
    let coder = ethers.utils.defaultAbiCoder;
    let tests = loadTests('contract-interface');
    tests.forEach((test) => {
        let values = getValues(JSON.parse(test.normalizedValues));
        let types = JSON.parse(test.types);
        let result = test.result;
        let title = test.name + ' => (' + test.types + ') = (' + test.normalizedValues + ')';
        it(('decodes parameters - ' + test.name + ' - ' + test.types), function () {
            this.timeout(120000);
            let decoded = coder.decode(types, result);
            assert.ok(equals(decoded, values), 'decoded parameters - ' + title);
        });
    });
});
describe('ABI Coder ABIv2 Encoding', function () {
    let coder = ethers.utils.defaultAbiCoder;
    let tests = loadTests('contract-interface-abi2');
    tests.forEach((test) => {
        let values = getValues(JSON.parse(test.values));
        //let namedValues = getValues(JSON.parse(test.values), true);
        let types = JSON.parse(test.types);
        let expected = test.result;
        let title = test.name + ' => (' + test.types + ') = (' + test.values + ')';
        it(('encodes ABIv2 parameters - ' + test.name + ' - ' + test.types), function () {
            this.timeout(120000);
            let encoded = coder.encode(types, values);
            assert.equal(encoded, expected, 'encoded positional parameters - ' + title);
            let namedEncoded = coder.encode(types, values);
            assert.equal(namedEncoded, expected, 'encoded named parameters - ' + title);
        });
    });
});
describe('ABI Coder ABIv2 Decoding', function () {
    let coder = ethers.utils.defaultAbiCoder;
    let tests = loadTests('contract-interface-abi2');
    tests.forEach((test) => {
        let values = getValues(JSON.parse(test.values));
        let types = JSON.parse(test.types);
        let result = test.result;
        let title = test.name + ' => (' + test.types + ') = (' + test.values + ')';
        it(('decodes ABIv2 parameters - ' + test.name + ' - ' + test.types), function () {
            this.timeout(120000);
            let decoded = coder.decode(types, result);
            assert.ok(equals(decoded, values), 'decoded positional parameters - ' + title);
        });
    });
});
describe('Test Contract Events', function () {
    let tests = loadTests('contract-events');
    tests.forEach((test, index) => {
        it(('decodes event parameters - ' + test.name + ' - ' + test.types), function () {
            this.timeout(120000);
            let iface = new ethers.utils.Interface(test.interface);
            let parsed = iface.decodeEventLog(iface.getEvent("testEvent"), test.data, test.topics);
            test.normalizedValues.forEach((expected, index) => {
                if (test.hashed[index]) {
                    assert.ok(equals(parsed[index].hash, expected), 'parsed event indexed parameter matches - ' + index);
                }
                else {
                    assert.ok(equals(parsed[index], expected), 'parsed event parameter matches - ' + index);
                }
            });
        });
    });
    tests.forEach((test, index) => {
        it(('decodes event data - ' + test.name + ' - ' + test.types), function () {
            this.timeout(120000);
            let iface = new ethers.utils.Interface(test.interface);
            let parsed = iface.decodeEventLog(iface.getEvent("testEvent"), test.data);
            test.normalizedValues.forEach((expected, index) => {
                if (test.indexed[index]) {
                    assert.ok((ethers.Contract.isIndexed(parsed[index]) && parsed[index].hash == null), 'parsed event data has empty Indexed - ' + index);
                }
                else {
                    assert.ok(equals(parsed[index], expected), 'parsed event data matches - ' + index);
                }
            });
        });
    });
});
describe('Test Interface Signatures', function () {
    let tests = loadTests('contract-signatures');
    tests.forEach((test) => {
        it('derives the correct signature - ' + test.name, function () {
            let iface = new ethers.utils.Interface(test.abi);
            this.timeout(120000);
            assert.equal(iface.getFunction("testSig").format(), test.signature, 'derived the correct signature');
            assert.equal(iface.getSighash(iface.getFunction("testSig")), test.sigHash, 'derived the correct signature hash');
        });
    });
    it('derives correct description for human-readable ABI', function () {
        let iface = new ethers.utils.Interface(["function transfer(address from, uint amount)"]);
        [
            "transfer",
            "transfer(address,uint256)"
        ].forEach(function (key) {
            let descr = iface.getFunction(key);
            assert.equal(descr.name, "transfer", "incorrect name key - " + key);
            assert.equal(descr.format(), "transfer(address,uint256)", "incorrect signature key - " + key);
            assert.equal(iface.getSighash(descr), "0xa9059cbb", "incorrect sighash key - " + key);
        });
    });
    // See: https://github.com/ethers-io/ethers.js/issues/370
    it('parses transaction function', function () {
        let iface = new ethers.utils.Interface(["function transfer(address from, uint amount)"]);
        // Transaction: 0x820cc57bc77be44d8f4f024a18e18f64a8b6e62a82a3d7897db5970dbe181ba1
        let rawTx = "0xf8aa028502540be4008316e36094334eec1482109bd802d9e72a447848de3bcc106380b844a9059cbb000000000000000000000000851b9167b7cbf772d38efaf89705b35022880a070000000000000000000000000000000000000000000000000de0b6b3a764000026a03200bf26e5f10f7eda59c0aad9adc2334dda79e785b9b004342524d97a66fca9a0450b07a4dc450bb472e08f8370350fa365fcef6db1a95309ae4c06c9d0748092";
        let tx = ethers.utils.parseTransaction(rawTx);
        let descr = iface.parseTransaction(tx);
        assert.equal(descr.args[0], '0x851b9167B7cbf772D38eFaf89705b35022880A07', 'parsed tx - args[0]');
        assert.equal(descr.args[1].toString(), '1000000000000000000', 'parsed tx - args[1]');
        assert.equal(descr.name, 'transfer', 'parsed tx - name');
        assert.equal(descr.signature, 'transfer(address,uint256)', 'parsed tx - signature');
        assert.equal(descr.sighash, '0xa9059cbb', 'parsed tx - sighash');
        assert.equal(descr.value.toString(), '0', 'parsed tx - value');
    });
});
describe('Test Number Coder', function () {
    let coder = ethers.utils.defaultAbiCoder;
    it('null input failed', function () {
        this.timeout(120000);
        assert.throws(() => {
            let result = coder.decode(['bool'], '0x');
            console.log(result);
        }, (error) => {
            assert.equal(error.reason, 'data out-of-bounds', 'got invalid bool');
            return true;
        }, 'null bytes throws an error');
    });
    let overflowAboveHex = '0x10000000000000000000000000000000000000000000000000000000000000000';
    let overflowBelowHex = '-0x10000000000000000000000000000000000000000000000000000000000000000';
    let maxHex = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    let maxLessOneHex = '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe';
    let maxSignedHex = '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    let maxSignedLessOneHex = '0x7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe';
    let minSignedHex = '-0x8000000000000000000000000000000000000000000000000000000000000000';
    let minSignedHex2s = '0x8000000000000000000000000000000000000000000000000000000000000000';
    let minMoreOneSignedHex = '-0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    let minMoreOneSignedHex2s = '0x8000000000000000000000000000000000000000000000000000000000000001';
    let zeroHex = '0x0000000000000000000000000000000000000000000000000000000000000000';
    let oneHex = '0x0000000000000000000000000000000000000000000000000000000000000001';
    it('encodes zero', function () {
        let ZeroValues = [
            { n: 'number zero', v: 0 },
            { n: 'hex zero', v: '0x0' },
            { n: 'hex leading even length', v: '0x0000' },
            { n: 'hex leading odd length', v: '0x00000' },
            { n: 'BigNumber', v: ethers.constants.Zero }
        ];
        let expected = zeroHex;
        ['uint8', 'uint256', 'int8', 'int256'].forEach(function (type) {
            ZeroValues.forEach(function (value) {
                let result = coder.encode([type], [value.v]);
                assert.equal(result, expected, value.n + ' ' + type);
            });
        });
    });
    it('encodes one', function () {
        let ZeroValues = [
            { n: 'number', v: 1 },
            { n: 'hex', v: '0x1' },
            { n: 'hex leading even length', v: '0x0001' },
            { n: 'hex leading odd length', v: '0x00001' },
            { n: 'BigNumber', v: ethers.constants.One }
        ];
        let expected = oneHex;
        ['uint8', 'uint256', 'int8', 'int256'].forEach(function (type) {
            ZeroValues.forEach(function (value) {
                let result = coder.encode([type], [value.v]);
                assert.equal(result, expected, value.n + ' ' + type);
            });
        });
    });
    it('encodes negative one', function () {
        let Values = [
            { n: 'number', v: -1 },
            { n: 'hex', v: '-0x1' },
            { n: 'hex leading even length', v: '-0x0001' },
            { n: 'hex leading odd length', v: '-0x00001' },
            { n: 'BigNumber', v: ethers.constants.NegativeOne }
        ];
        let expected = maxHex;
        ['int8', 'int256'].forEach(function (type) {
            Values.forEach(function (value) {
                let result = coder.encode([type], [value.v]);
                assert.equal(result, expected, value.n + ' ' + type);
            });
        });
    });
    it('encodes full uint8 range', function () {
        for (let i = 0; i < 256; i++) {
            let expected = '0x00000000000000000000000000000000000000000000000000000000000000';
            expected += ethers.utils.hexlify(i).substring(2);
            let result = coder.encode(['uint8'], [i]);
            assert.equal(result, expected, 'int8 ' + i);
        }
    });
    it('encodes full int8 range', function () {
        for (let i = -128; i < 128; i++) {
            let expected = null;
            if (i === -128) {
                expected = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff80';
            }
            else if (i < 0) {
                expected = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
                expected += ethers.utils.hexlify(256 + i).substring(2);
            }
            else {
                expected = '0x00000000000000000000000000000000000000000000000000000000000000';
                expected += ethers.utils.hexlify(i).substring(2);
            }
            let result = coder.encode(['int8'], [i]);
            assert.equal(result, expected, 'int8 ' + i);
        }
    });
    it('encodes uint256 end range', function () {
        assert.equal(coder.encode(['uint256'], [bnify(maxHex)]), maxHex, 'uint256 max');
        assert.equal(coder.encode(['uint256'], [bnify(maxLessOneHex)]), maxLessOneHex, 'uint256 max');
    });
    it('encodes int256 end ranges', function () {
        assert.equal(coder.encode(['int256'], [bnify(maxSignedHex)]), maxSignedHex, 'int256 max');
        assert.equal(coder.encode(['int256'], [bnify(maxSignedLessOneHex)]), maxSignedLessOneHex, 'int256 max');
        assert.equal(coder.encode(['int256'], [bnify(minSignedHex)]), minSignedHex2s, 'int256 max');
        assert.equal(coder.encode(['int256'], [bnify(minMoreOneSignedHex)]), minMoreOneSignedHex2s, 'int256 max');
    });
    it('fails to encode out-of-range uint8', function () {
        [-128, -127, -2, -1, 256, 1000, bnify(maxHex), bnify(maxSignedHex).add(1), bnify(minSignedHex), bnify(overflowAboveHex), bnify(overflowBelowHex)].forEach(function (value) {
            assert.throws(() => {
                let result = coder.encode(['uint8'], [value]);
                console.log('RESULT', value, result);
            }, (error) => {
                assert.equal(error.reason, 'value out-of-bounds', 'wrong error');
                return true;
            }, 'out-of-range numbers throw an error');
        });
    });
    it('fails to encode out-of-range int8', function () {
        [-129, -130, -1000, 128, 129, 1000, bnify(maxHex), bnify(maxSignedHex).add(1), bnify(minSignedHex).sub(1), bnify(overflowAboveHex), bnify(overflowBelowHex)].forEach(function (value) {
            assert.throws(() => {
                let result = coder.encode(['int8'], [value]);
                console.log('RESULT', value, result);
            }, (error) => {
                assert.equal(error.reason, 'value out-of-bounds', 'wrong error');
                return true;
            }, 'out-of-range numbers throw an error');
        });
    });
    it('fails to encode out-of-range uint256', function () {
        [-128, -127, -2, -1, bnify(maxHex).add(1), bnify('-' + maxHex), bnify(overflowAboveHex), bnify(overflowBelowHex)].forEach(function (value) {
            assert.throws(() => {
                let result = coder.encode(['uint256'], [value]);
                console.log('RESULT', value, result);
            }, (error) => {
                assert.equal(error.reason, 'value out-of-bounds', 'wrong error');
                return true;
            }, 'out-of-range numbers throw an error');
        });
    });
    it('fails to encode out-of-range int256', function () {
        [bnify(maxHex), bnify(maxSignedHex).add(1), bnify(minSignedHex).sub(1), bnify(overflowAboveHex), bnify(overflowBelowHex)].forEach(function (value, index) {
            assert.throws(() => {
                let result = coder.encode(['int256'], [value]);
                console.log('RESULT', index, value, result);
            }, (error) => {
                assert.equal(error.reason, 'value out-of-bounds', 'wrong error');
                return true;
            }, 'out-of-range numbers throw an error');
        });
    });
});
describe('Test Fixed Bytes Coder', function () {
    let coder = ethers.utils.defaultAbiCoder;
    let zeroHex = '0x0000000000000000000000000000000000000000000000000000000000000000';
    it('fails to encode out-of-range bytes4', function () {
        ['0x', '0x00000', '0x000', zeroHex, '0x12345', '0x123456', '0x123', '0x12'].forEach(function (value, index) {
            assert.throws(() => {
                let result = coder.encode(['bytes4'], [value]);
                console.log('RESULT', index, value, result);
            }, (error) => {
                if (value.length % 2) {
                    assert.equal(error.reason, 'hex data is odd-length', 'wrong error');
                }
                else {
                    assert.equal(error.reason, 'incorrect data length', 'wrong error');
                }
                return true;
            }, 'out-of-range fixed bytes throw an error');
        });
    });
    it('fails to encode out-of-range bytes32', function () {
        ['0x', '0x00000', '0x000', '0x12345', '0x123456', (zeroHex + '0'), (zeroHex + '00')].forEach(function (value, index) {
            assert.throws(() => {
                let result = coder.encode(['bytes32'], [value]);
                console.log('RESULT', index, value, result);
            }, (error) => {
                if (value.length % 2) {
                    assert.equal(error.reason, 'hex data is odd-length', 'wrong error');
                }
                else {
                    assert.equal(error.reason, 'incorrect data length', 'wrong error');
                }
                return true;
            }, 'out-of-range fixed bytes throw an error');
        });
    });
});
describe('Test Filters', function () {
    // @TODO: Add a LOT more tests here
    function doTest(test) {
        it(test.name, function () {
            let iface = new ethers.utils.Interface([test.signature]);
            let eventDescription = iface.getEvent(test.event);
            let filter = iface.encodeFilterTopics(eventDescription, test.args);
            assert.equal(filter.length, test.expected.length, 'filter length matches - ' + test.name);
            filter.forEach((expected, index) => {
                assert.equal(expected, test.expected[index], 'signature topic matches - ' + index + ' - ' + test.name);
            });
        });
    }
    let Tests = [
        // Skips null in non-indexed fields
        // See: https://github.com/ethers-io/ethers.js/issues/305
        {
            name: "creates correct filters for null non-indexed fields",
            args: [null, 2, null, null],
            event: "LogSomething",
            signature: "event LogSomething(int hup, int indexed two, bool three, address indexed four)",
            expected: [
                "0xf6b983969813047dce97b9ff8a48cfb0a13306eb2caae2ef186b280bc27491c8",
                "0x0000000000000000000000000000000000000000000000000000000000000002"
            ]
        },
        // https://etherscan.io/tx/0x820cc57bc77be44d8f4f024a18e18f64a8b6e62a82a3d7897db5970dbe181ba1
        {
            name: "transfer filtering from",
            args: [
                "0x59DEa134510ebce4a0c7146595dc8A61Eb9D0D79"
            ],
            event: "Transfer",
            signature: "event Transfer(address indexed from, address indexed to, uint value)",
            expected: [
                "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                "0x00000000000000000000000059dea134510ebce4a0c7146595dc8a61eb9d0d79"
            ]
        },
        {
            name: "transfer filtering to",
            args: [
                null,
                "0x851b9167B7cbf772D38eFaf89705b35022880A07"
            ],
            event: "Transfer",
            signature: "event Transfer(address indexed from, address indexed to, uint value)",
            expected: [
                "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
                null,
                "0x000000000000000000000000851b9167b7cbf772d38efaf89705b35022880a07"
            ]
        }
    ];
    Tests.forEach(function (test) {
        doTest(test);
    });
});
describe("Test ParamType Parser", function () {
    const Tests = [
        { type: "address", format: "address" },
        { type: "address foo", format: "address foo" },
        { type: "address payable", format: "address" },
        { type: "address payable foo", format: "address foo" },
        { type: "uint", format: "uint256" },
        { type: "uint16", format: "uint16" },
        { type: "uint256", format: "uint256" },
        { type: "int", format: "int256" },
        { type: "int16", format: "int16" },
        { type: "int256", format: "int256" },
        { type: "string", format: "string" },
        { type: "string memory", format: "string" },
        { type: "string calldata", format: "string" },
        { type: "string storage", format: "string" },
        { type: "string memory foo", format: "string foo" },
        { type: "string foo", format: "string foo" },
        { type: "string[]", format: "string[]" },
        { type: "string[5]", format: "string[5]" },
        { type: "uint[] memory", format: "uint256[]" },
        { type: "tuple(address a, string[] b) memory foo", format: "tuple(address a, string[] b) foo" },
    ];
    Tests.forEach((test) => {
        it(`allows correct modifiers ${JSON.stringify(test.type)}`, function () {
            const paramType = ethers.utils.ParamType.from(test.type);
            //console.log(test, paramType.format("full"));
            assert.equal(paramType.format("full"), test.format);
        });
    });
});
describe('Test EIP-838 Error Codes', function () {
    const addr = "0xbd0B4B009a76CA97766360F04f75e05A3E449f1E";
    it("testError1", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = new ethers.providers.InfuraProvider("ropsten", "49a0efa3aaee4fd99797bfa94d8ce2f1");
            const contract = new ethers.Contract(addr, [
                "function testError1(bool pass, address addr, uint256 value) pure returns (bool)",
                "function testError2(bool pass, bytes data) pure returns (bool)",
                "error TestError1(address addr, uint256 value)",
                "error TestError2(bytes data)",
            ], provider);
            try {
                const result = yield contract.testError1(false, addr, 42);
                console.log(result);
                assert.ok(false, "did not throw ");
            }
            catch (error) {
                assert.equal(error.code, ethers.utils.Logger.errors.CALL_EXCEPTION, "error.code");
                assert.equal(error.errorSignature, "TestError1(address,uint256)", "error.errorSignature");
                assert.equal(error.errorName, "TestError1", "error.errorName");
                assert.equal(error.errorArgs[0], addr, "error.errorArgs[0]");
                assert.equal(error.errorArgs.addr, addr, "error.errorArgs.addr");
                assert.equal(error.errorArgs[1], 42, "error.errorArgs[1]");
                assert.equal(error.errorArgs.value, 42, "error.errorArgs.value");
            }
        });
    });
});
describe("Additional test cases", function () {
    // See: #1906
    it("allows addresses without the 0x", function () {
        const iface = new ethers.utils.Interface([
            "function test(address foo) view returns (bool)"
        ]);
        const tx = iface.encodeFunctionData("test", ["c1912fee45d61c87cc5ea59dae31190fffff232d"]);
        console.log(tx);
    });
});
//# sourceMappingURL=test-contract-interface.js.map