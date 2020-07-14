'use strict';
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var ethers_1 = require("ethers");
var testcases_1 = require("@ethersproject/testcases");
var bnify = ethers_1.ethers.BigNumber.from;
function equals(actual, expected) {
    // Array (treat recursively)
    if (Array.isArray(actual)) {
        if (!Array.isArray(expected) || actual.length !== expected.length) {
            return false;
        }
        for (var i = 0; i < actual.length; i++) {
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
            var neg = (expected.substring(0, 1) === '-');
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
        if (!ethers_1.ethers.utils.isHexString(actual)) {
            return false;
        }
        actual = ethers_1.ethers.utils.arrayify(actual);
        if (!actual.buffer || actual.length !== expected.length) {
            return false;
        }
        for (var i = 0; i < actual.length; i++) {
            if (actual[i] !== expected[i]) {
                return false;
            }
        }
        return true;
    }
    // Maybe address?
    try {
        var actualAddress = ethers_1.ethers.utils.getAddress(actual);
        var expectedAddress = ethers_1.ethers.utils.getAddress(expected);
        return (actualAddress === expectedAddress);
    }
    catch (error) { }
    // Something else
    return (actual === expected);
}
function getValues(object, named) {
    if (Array.isArray(object)) {
        var result_1 = [];
        object.forEach(function (object) {
            result_1.push(getValues(object, named));
        });
        return result_1;
    }
    switch (object.type) {
        case 'number':
            return bnify(object.value);
        case 'boolean':
        case 'string':
            return object.value;
        case 'buffer':
            return ethers_1.ethers.utils.arrayify(object.value);
        case 'tuple':
            var result = getValues(object.value, named);
            if (named) {
                var namedResult_1 = {};
                result.forEach(function (value, index) {
                    namedResult_1['r' + String(index)] = value;
                });
                return namedResult_1;
            }
            return result;
        default:
            throw new Error('invalid type - ' + object.type);
    }
}
describe('ABI Coder Encoding', function () {
    var coder = ethers_1.ethers.utils.defaultAbiCoder;
    var tests = testcases_1.loadTests('contract-interface');
    tests.forEach(function (test) {
        var values = getValues(JSON.parse(test.normalizedValues));
        var types = JSON.parse(test.types);
        var result = test.result;
        var title = test.name + ' => (' + test.types + ') = (' + test.normalizedValues + ')';
        it(('encodes parameters - ' + test.name + ' - ' + test.types), function () {
            this.timeout(120000);
            var encoded = coder.encode(types, values);
            assert_1.default.equal(encoded, result, 'encoded data - ' + title);
        });
    });
});
describe('ABI Coder Decoding', function () {
    var coder = ethers_1.ethers.utils.defaultAbiCoder;
    var tests = testcases_1.loadTests('contract-interface');
    tests.forEach(function (test) {
        var values = getValues(JSON.parse(test.normalizedValues));
        var types = JSON.parse(test.types);
        var result = test.result;
        var title = test.name + ' => (' + test.types + ') = (' + test.normalizedValues + ')';
        it(('decodes parameters - ' + test.name + ' - ' + test.types), function () {
            this.timeout(120000);
            var decoded = coder.decode(types, result);
            assert_1.default.ok(equals(decoded, values), 'decoded parameters - ' + title);
        });
    });
});
describe('ABI Coder ABIv2 Encoding', function () {
    var coder = ethers_1.ethers.utils.defaultAbiCoder;
    var tests = testcases_1.loadTests('contract-interface-abi2');
    tests.forEach(function (test) {
        var values = getValues(JSON.parse(test.values));
        //let namedValues = getValues(JSON.parse(test.values), true);
        var types = JSON.parse(test.types);
        var expected = test.result;
        var title = test.name + ' => (' + test.types + ') = (' + test.values + ')';
        it(('encodes ABIv2 parameters - ' + test.name + ' - ' + test.types), function () {
            this.timeout(120000);
            var encoded = coder.encode(types, values);
            assert_1.default.equal(encoded, expected, 'encoded positional parameters - ' + title);
            var namedEncoded = coder.encode(types, values);
            assert_1.default.equal(namedEncoded, expected, 'encoded named parameters - ' + title);
        });
    });
});
describe('ABI Coder ABIv2 Decoding', function () {
    var coder = ethers_1.ethers.utils.defaultAbiCoder;
    var tests = testcases_1.loadTests('contract-interface-abi2');
    tests.forEach(function (test) {
        var values = getValues(JSON.parse(test.values));
        var types = JSON.parse(test.types);
        var result = test.result;
        var title = test.name + ' => (' + test.types + ') = (' + test.values + ')';
        it(('decodes ABIv2 parameters - ' + test.name + ' - ' + test.types), function () {
            this.timeout(120000);
            var decoded = coder.decode(types, result);
            assert_1.default.ok(equals(decoded, values), 'decoded positional parameters - ' + title);
        });
    });
});
describe('Test Contract Events', function () {
    var tests = testcases_1.loadTests('contract-events');
    tests.forEach(function (test, index) {
        it(('decodes event parameters - ' + test.name + ' - ' + test.types), function () {
            this.timeout(120000);
            var iface = new ethers_1.ethers.utils.Interface(test.interface);
            var parsed = iface.decodeEventLog(iface.getEvent("testEvent"), test.data, test.topics);
            test.normalizedValues.forEach(function (expected, index) {
                if (test.hashed[index]) {
                    assert_1.default.ok(equals(parsed[index].hash, expected), 'parsed event indexed parameter matches - ' + index);
                }
                else {
                    assert_1.default.ok(equals(parsed[index], expected), 'parsed event parameter matches - ' + index);
                }
            });
        });
    });
    tests.forEach(function (test, index) {
        it(('decodes event data - ' + test.name + ' - ' + test.types), function () {
            this.timeout(120000);
            var iface = new ethers_1.ethers.utils.Interface(test.interface);
            var parsed = iface.decodeEventLog(iface.getEvent("testEvent"), test.data);
            test.normalizedValues.forEach(function (expected, index) {
                if (test.indexed[index]) {
                    assert_1.default.ok((ethers_1.ethers.Contract.isIndexed(parsed[index]) && parsed[index].hash == null), 'parsed event data has empty Indexed - ' + index);
                }
                else {
                    assert_1.default.ok(equals(parsed[index], expected), 'parsed event data matches - ' + index);
                }
            });
        });
    });
});
describe('Test Interface Signatures', function () {
    var tests = testcases_1.loadTests('contract-signatures');
    tests.forEach(function (test) {
        it('derives the correct signature - ' + test.name, function () {
            var iface = new ethers_1.ethers.utils.Interface(test.abi);
            this.timeout(120000);
            assert_1.default.equal(iface.getFunction("testSig").format(), test.signature, 'derived the correct signature');
            assert_1.default.equal(iface.getSighash(iface.getFunction("testSig")), test.sigHash, 'derived the correct signature hash');
        });
    });
    it('derives correct description for human-readable ABI', function () {
        var iface = new ethers_1.ethers.utils.Interface(["function transfer(address from, uint amount)"]);
        [
            "transfer",
            "transfer(address,uint256)"
        ].forEach(function (key) {
            var descr = iface.getFunction(key);
            assert_1.default.equal(descr.name, "transfer", "incorrect name key - " + key);
            assert_1.default.equal(descr.format(), "transfer(address,uint256)", "incorrect signature key - " + key);
            assert_1.default.equal(iface.getSighash(descr), "0xa9059cbb", "incorrect sighash key - " + key);
        });
    });
    // See: https://github.com/ethers-io/ethers.js/issues/370
    it('parses transaction function', function () {
        var iface = new ethers_1.ethers.utils.Interface(["function transfer(address from, uint amount)"]);
        // Transaction: 0x820cc57bc77be44d8f4f024a18e18f64a8b6e62a82a3d7897db5970dbe181ba1
        var rawTx = "0xf8aa028502540be4008316e36094334eec1482109bd802d9e72a447848de3bcc106380b844a9059cbb000000000000000000000000851b9167b7cbf772d38efaf89705b35022880a070000000000000000000000000000000000000000000000000de0b6b3a764000026a03200bf26e5f10f7eda59c0aad9adc2334dda79e785b9b004342524d97a66fca9a0450b07a4dc450bb472e08f8370350fa365fcef6db1a95309ae4c06c9d0748092";
        var tx = ethers_1.ethers.utils.parseTransaction(rawTx);
        var descr = iface.parseTransaction(tx);
        assert_1.default.equal(descr.args[0], '0x851b9167B7cbf772D38eFaf89705b35022880A07', 'parsed tx - args[0]');
        assert_1.default.equal(descr.args[1].toString(), '1000000000000000000', 'parsed tx - args[1]');
        assert_1.default.equal(descr.name, 'transfer', 'parsed tx - name');
        assert_1.default.equal(descr.signature, 'transfer(address,uint256)', 'parsed tx - signature');
        assert_1.default.equal(descr.sighash, '0xa9059cbb', 'parsed tx - sighash');
        assert_1.default.equal(descr.value.toString(), '0', 'parsed tx - value');
    });
});
describe('Test Number Coder', function () {
    var coder = ethers_1.ethers.utils.defaultAbiCoder;
    it('null input failed', function () {
        this.timeout(120000);
        assert_1.default.throws(function () {
            var result = coder.decode(['bool'], '0x');
            console.log(result);
        }, function (error) {
            assert_1.default.equal(error.reason, 'data out-of-bounds', 'got invalid bool');
            return true;
        }, 'null bytes throws an error');
    });
    var overflowAboveHex = '0x10000000000000000000000000000000000000000000000000000000000000000';
    var overflowBelowHex = '-0x10000000000000000000000000000000000000000000000000000000000000000';
    var maxHex = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    var maxLessOneHex = '0xfffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe';
    var maxSignedHex = '0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    var maxSignedLessOneHex = '0x7ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe';
    var minSignedHex = '-0x8000000000000000000000000000000000000000000000000000000000000000';
    var minSignedHex2s = '0x8000000000000000000000000000000000000000000000000000000000000000';
    var minMoreOneSignedHex = '-0x7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
    var minMoreOneSignedHex2s = '0x8000000000000000000000000000000000000000000000000000000000000001';
    var zeroHex = '0x0000000000000000000000000000000000000000000000000000000000000000';
    var oneHex = '0x0000000000000000000000000000000000000000000000000000000000000001';
    it('encodes zero', function () {
        var ZeroValues = [
            { n: 'number zero', v: 0 },
            { n: 'hex zero', v: '0x0' },
            { n: 'hex leading even length', v: '0x0000' },
            { n: 'hex leading odd length', v: '0x00000' },
            { n: 'BigNumber', v: ethers_1.ethers.constants.Zero }
        ];
        var expected = zeroHex;
        ['uint8', 'uint256', 'int8', 'int256'].forEach(function (type) {
            ZeroValues.forEach(function (value) {
                var result = coder.encode([type], [value.v]);
                assert_1.default.equal(result, expected, value.n + ' ' + type);
            });
        });
    });
    it('encodes one', function () {
        var ZeroValues = [
            { n: 'number', v: 1 },
            { n: 'hex', v: '0x1' },
            { n: 'hex leading even length', v: '0x0001' },
            { n: 'hex leading odd length', v: '0x00001' },
            { n: 'BigNumber', v: ethers_1.ethers.constants.One }
        ];
        var expected = oneHex;
        ['uint8', 'uint256', 'int8', 'int256'].forEach(function (type) {
            ZeroValues.forEach(function (value) {
                var result = coder.encode([type], [value.v]);
                assert_1.default.equal(result, expected, value.n + ' ' + type);
            });
        });
    });
    it('encodes negative one', function () {
        var Values = [
            { n: 'number', v: -1 },
            { n: 'hex', v: '-0x1' },
            { n: 'hex leading even length', v: '-0x0001' },
            { n: 'hex leading odd length', v: '-0x00001' },
            { n: 'BigNumber', v: ethers_1.ethers.constants.NegativeOne }
        ];
        var expected = maxHex;
        ['int8', 'int256'].forEach(function (type) {
            Values.forEach(function (value) {
                var result = coder.encode([type], [value.v]);
                assert_1.default.equal(result, expected, value.n + ' ' + type);
            });
        });
    });
    it('encodes full uint8 range', function () {
        for (var i = 0; i < 256; i++) {
            var expected = '0x00000000000000000000000000000000000000000000000000000000000000';
            expected += ethers_1.ethers.utils.hexlify(i).substring(2);
            var result = coder.encode(['uint8'], [i]);
            assert_1.default.equal(result, expected, 'int8 ' + i);
        }
    });
    it('encodes full int8 range', function () {
        for (var i = -128; i < 128; i++) {
            var expected = null;
            if (i === -128) {
                expected = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff80';
            }
            else if (i < 0) {
                expected = '0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff';
                expected += ethers_1.ethers.utils.hexlify(256 + i).substring(2);
            }
            else {
                expected = '0x00000000000000000000000000000000000000000000000000000000000000';
                expected += ethers_1.ethers.utils.hexlify(i).substring(2);
            }
            var result = coder.encode(['int8'], [i]);
            assert_1.default.equal(result, expected, 'int8 ' + i);
        }
    });
    it('encodes uint256 end range', function () {
        assert_1.default.equal(coder.encode(['uint256'], [bnify(maxHex)]), maxHex, 'uint256 max');
        assert_1.default.equal(coder.encode(['uint256'], [bnify(maxLessOneHex)]), maxLessOneHex, 'uint256 max');
    });
    it('encodes int256 end ranges', function () {
        assert_1.default.equal(coder.encode(['int256'], [bnify(maxSignedHex)]), maxSignedHex, 'int256 max');
        assert_1.default.equal(coder.encode(['int256'], [bnify(maxSignedLessOneHex)]), maxSignedLessOneHex, 'int256 max');
        assert_1.default.equal(coder.encode(['int256'], [bnify(minSignedHex)]), minSignedHex2s, 'int256 max');
        assert_1.default.equal(coder.encode(['int256'], [bnify(minMoreOneSignedHex)]), minMoreOneSignedHex2s, 'int256 max');
    });
    it('fails to encode out-of-range uint8', function () {
        [-128, -127, -2, -1, 256, 1000, bnify(maxHex), bnify(maxSignedHex).add(1), bnify(minSignedHex), bnify(overflowAboveHex), bnify(overflowBelowHex)].forEach(function (value) {
            assert_1.default.throws(function () {
                var result = coder.encode(['uint8'], [value]);
                console.log('RESULT', value, result);
            }, function (error) {
                assert_1.default.equal(error.reason, 'value out-of-bounds', 'wrong error');
                return true;
            }, 'out-of-range numbers throw an error');
        });
    });
    it('fails to encode out-of-range int8', function () {
        [-129, -130, -1000, 128, 129, 1000, bnify(maxHex), bnify(maxSignedHex).add(1), bnify(minSignedHex).sub(1), bnify(overflowAboveHex), bnify(overflowBelowHex)].forEach(function (value) {
            assert_1.default.throws(function () {
                var result = coder.encode(['int8'], [value]);
                console.log('RESULT', value, result);
            }, function (error) {
                assert_1.default.equal(error.reason, 'value out-of-bounds', 'wrong error');
                return true;
            }, 'out-of-range numbers throw an error');
        });
    });
    it('fails to encode out-of-range uint256', function () {
        [-128, -127, -2, -1, bnify(maxHex).add(1), bnify('-' + maxHex), bnify(overflowAboveHex), bnify(overflowBelowHex)].forEach(function (value) {
            assert_1.default.throws(function () {
                var result = coder.encode(['uint256'], [value]);
                console.log('RESULT', value, result);
            }, function (error) {
                assert_1.default.equal(error.reason, 'value out-of-bounds', 'wrong error');
                return true;
            }, 'out-of-range numbers throw an error');
        });
    });
    it('fails to encode out-of-range int256', function () {
        [bnify(maxHex), bnify(maxSignedHex).add(1), bnify(minSignedHex).sub(1), bnify(overflowAboveHex), bnify(overflowBelowHex)].forEach(function (value, index) {
            assert_1.default.throws(function () {
                var result = coder.encode(['int256'], [value]);
                console.log('RESULT', index, value, result);
            }, function (error) {
                assert_1.default.equal(error.reason, 'value out-of-bounds', 'wrong error');
                return true;
            }, 'out-of-range numbers throw an error');
        });
    });
});
describe('Test Fixed Bytes Coder', function () {
    var coder = ethers_1.ethers.utils.defaultAbiCoder;
    var zeroHex = '0x0000000000000000000000000000000000000000000000000000000000000000';
    it('fails to encode out-of-range bytes4', function () {
        ['0x', '0x00000', '0x000', zeroHex, '0x12345', '0x123456', '0x123', '0x12'].forEach(function (value, index) {
            assert_1.default.throws(function () {
                var result = coder.encode(['bytes4'], [value]);
                console.log('RESULT', index, value, result);
            }, function (error) {
                if (value.length % 2) {
                    assert_1.default.equal(error.reason, 'hex data is odd-length', 'wrong error');
                }
                else {
                    assert_1.default.equal(error.reason, 'incorrect data length', 'wrong error');
                }
                return true;
            }, 'out-of-range fixed bytes throw an error');
        });
    });
    it('fails to encode out-of-range bytes32', function () {
        ['0x', '0x00000', '0x000', '0x12345', '0x123456', (zeroHex + '0'), (zeroHex + '00')].forEach(function (value, index) {
            assert_1.default.throws(function () {
                var result = coder.encode(['bytes32'], [value]);
                console.log('RESULT', index, value, result);
            }, function (error) {
                if (value.length % 2) {
                    assert_1.default.equal(error.reason, 'hex data is odd-length', 'wrong error');
                }
                else {
                    assert_1.default.equal(error.reason, 'incorrect data length', 'wrong error');
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
            var iface = new ethers_1.ethers.utils.Interface([test.signature]);
            var eventDescription = iface.getEvent(test.event);
            var filter = iface.encodeFilterTopics(eventDescription, test.args);
            assert_1.default.equal(filter.length, test.expected.length, 'filter length matches - ' + test.name);
            filter.forEach(function (expected, index) {
                assert_1.default.equal(expected, test.expected[index], 'signature topic matches - ' + index + ' - ' + test.name);
            });
        });
    }
    var Tests = [
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
    var Tests = [
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
    Tests.forEach(function (test) {
        it("allows correct modifiers " + JSON.stringify(test.type), function () {
            var paramType = ethers_1.ethers.utils.ParamType.from(test.type);
            //console.log(test, paramType.format("full"));
            assert_1.default.equal(paramType.format("full"), test.format);
        });
    });
});
//# sourceMappingURL=test-contract-interface.js.map