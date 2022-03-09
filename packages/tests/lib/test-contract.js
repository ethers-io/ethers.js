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
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var ethers_1 = require("ethers");
var test_contract_json_1 = __importDefault(require("./test-contract.json"));
var provider = new ethers_1.ethers.providers.InfuraProvider("rinkeby", "49a0efa3aaee4fd99797bfa94d8ce2f1");
//const provider = ethers.getDefaultProvider("rinkeby");
var TIMEOUT_PERIOD = 120000;
var contract = (function () {
    return new ethers_1.ethers.Contract(test_contract_json_1.default.contractAddress, test_contract_json_1.default.interface, provider);
})();
function equals(name, actual, expected) {
    if (Array.isArray(expected)) {
        assert_1.default.equal(actual.length, expected.length, 'array length mismatch - ' + name);
        expected.forEach(function (expected, index) {
            equals(name + ':' + index, actual[index], expected);
        });
        return;
    }
    if (typeof (actual) === 'object') {
        if (expected.indexed) {
            assert_1.default.ok(ethers_1.ethers.Contract.isIndexed(actual), 'index property has index - ' + name);
            if (expected.hash) {
                assert_1.default.equal(actual.hash, expected.hash, 'index property with known hash matches - ' + name);
            }
            return;
        }
        if (actual.eq) {
            assert_1.default.ok(actual.eq(expected), 'numeric value matches - ' + name);
        }
    }
    assert_1.default.equal(actual, expected, 'value matches - ' + name);
}
function TestContractEvents() {
    return __awaiter(this, void 0, void 0, function () {
        function waitForEvent(eventName, expected) {
            return new Promise(function (resolve, reject) {
                var done = false;
                contract.on("error", function (error) {
                    if (done) {
                        return;
                    }
                    done = true;
                    contract.removeAllListeners();
                    reject(error);
                });
                contract.on(eventName, function () {
                    if (done) {
                        return;
                    }
                    done = true;
                    var args = Array.prototype.slice.call(arguments);
                    var event = args[args.length - 1];
                    event.removeListener();
                    equals(event.event, args.slice(0, args.length - 1), expected);
                    resolve();
                });
                var timer = setTimeout(function () {
                    if (done) {
                        return;
                    }
                    done = true;
                    contract.removeAllListeners();
                    reject(new Error("timeout"));
                }, TIMEOUT_PERIOD);
                if (timer.unref) {
                    timer.unref();
                }
            });
        }
        var running, data;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    running = new Promise(function (resolve, reject) {
                        var p0 = '0x06B5955A67D827CDF91823E3bB8F069e6c89c1D6';
                        var p0_1 = '0x06b5955A67d827CdF91823e3Bb8F069e6C89C1d7';
                        var p1 = 0x42;
                        var p1_1 = 0x43;
                        return Promise.all([
                            waitForEvent('Test', [p0, p1]),
                            waitForEvent('TestP0', [p0, p1]),
                            waitForEvent('TestP0P1', [p0, p1]),
                            waitForEvent('TestIndexedString', [{ indexed: true, hash: '0x7c5ea36004851c764c44143b1dcb59679b11c9a68e5f41497f6cf3d480715331' }, p1]),
                            waitForEvent('TestV2', [{ indexed: true }, [p0, p1]]),
                            waitForEvent('TestV2Nested', [{ indexed: true }, [p0_1, p1_1, [p0, p1]]]),
                        ]).then(function (result) {
                            resolve(result);
                        });
                    });
                    return [4 /*yield*/, ethers_1.ethers.utils.fetchJson('https://api.ethers.io/api/v1/?action=triggerTest&address=' + contract.address)];
                case 1:
                    data = _a.sent();
                    console.log('*** Triggered Transaction Hash: ' + data.hash);
                    return [2 /*return*/, running];
            }
        });
    });
}
describe('Test Contract Objects', function () {
    it('parses events', function () {
        this.timeout(TIMEOUT_PERIOD);
        return TestContractEvents();
    });
    it('ABIv2 parameters and return types work', function () {
        this.timeout(TIMEOUT_PERIOD);
        var p0 = '0x06B5955A67D827CDF91823E3bB8F069e6c89c1D6';
        var p0_0f = '0x06B5955a67d827cDF91823e3bB8F069E6c89c1e5';
        var p0_f0 = '0x06b5955a67D827CDF91823e3Bb8F069E6C89c2C6';
        var p1 = 0x42;
        var p1_0f = 0x42 + 0x0f;
        var p1_f0 = 0x42 + 0xf0;
        var expectedPosStruct = [p0_f0, p1_f0, [p0_0f, p1_0f]];
        var seq = Promise.resolve();
        [
            [p0, p1, [p0, p1]],
            { p0: p0, p1: p1, child: [p0, p1] },
            [p0, p1, { p0: p0, p1: p1 }],
            { p0: p0, p1: p1, child: { p0: p0, p1: p1 } }
        ].forEach(function (struct) {
            seq = seq.then(function () {
                return contract.testV2(struct).then(function (result) {
                    equals('position input', result, expectedPosStruct);
                    equals('keyword input p0', result.p0, expectedPosStruct[0]);
                    equals('keyword input p1', result.p1, expectedPosStruct[1]);
                    equals('keyword input child.p0', result.child.p0, expectedPosStruct[2][0]);
                    equals('keyword input child.p1', result.child.p1, expectedPosStruct[2][1]);
                });
            });
        });
        return seq;
    });
    it('collapses single argument solidity methods', function () {
        this.timeout(TIMEOUT_PERIOD);
        return contract.testSingleResult(4).then(function (result) {
            assert_1.default.equal(result, 5, 'single value returned');
        });
    });
    it('does not collapses multi argument solidity methods', function () {
        this.timeout(TIMEOUT_PERIOD);
        return contract.testMultiResult(6).then(function (result) {
            assert_1.default.equal(result[0], 7, 'multi value [0] returned');
            assert_1.default.equal(result[1], 8, 'multi value [1] returned');
            assert_1.default.equal(result.r0, 7, 'multi value [r0] returned');
            assert_1.default.equal(result.r1, 8, 'multi value [r1] returned');
        });
    });
});
// @TODO: Exapnd this
describe("Test Contract Transaction Population", function () {
    var abi = [
        "function transfer(address to, uint amount)",
        "function unstake() nonpayable",
        "function mint() payable",
        "function balanceOf(address owner) view returns (uint)"
    ];
    var testAddress = "0xdeadbeef00deadbeef01deadbeef02deadbeef03";
    var testAddressCheck = "0xDEAdbeeF00deAdbeEF01DeAdBEEF02DeADBEEF03";
    var fireflyAddress = "0x8ba1f109551bD432803012645Ac136ddd64DBA72";
    var contract = new ethers_1.ethers.Contract(testAddress, abi);
    var contractConnected = contract.connect(ethers_1.ethers.getDefaultProvider());
    it("standard population", function () {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, contract.populateTransaction.balanceOf(testAddress)];
                    case 1:
                        tx = _a.sent();
                        //console.log(tx);
                        assert_1.default.equal(Object.keys(tx).length, 2, "correct number of keys");
                        assert_1.default.equal(tx.data, "0x70a08231000000000000000000000000deadbeef00deadbeef01deadbeef02deadbeef03", "data matches");
                        assert_1.default.equal(tx.to, testAddressCheck, "to address matches");
                        return [2 /*return*/];
                }
            });
        });
    });
    it("allows 'from' overrides", function () {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, contract.populateTransaction.balanceOf(testAddress, {
                            from: testAddress
                        })];
                    case 1:
                        tx = _a.sent();
                        //console.log(tx);
                        assert_1.default.equal(Object.keys(tx).length, 3, "correct number of keys");
                        assert_1.default.equal(tx.data, "0x70a08231000000000000000000000000deadbeef00deadbeef01deadbeef02deadbeef03", "data matches");
                        assert_1.default.equal(tx.to, testAddressCheck, "to address matches");
                        assert_1.default.equal(tx.from, testAddressCheck, "from address matches");
                        return [2 /*return*/];
                }
            });
        });
    });
    it("allows ENS 'from' overrides", function () {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.timeout(20000);
                        return [4 /*yield*/, contractConnected.populateTransaction.balanceOf(testAddress, {
                                from: "ricmoo.firefly.eth"
                            })];
                    case 1:
                        tx = _a.sent();
                        //console.log(tx);
                        assert_1.default.equal(Object.keys(tx).length, 3, "correct number of keys");
                        assert_1.default.equal(tx.data, "0x70a08231000000000000000000000000deadbeef00deadbeef01deadbeef02deadbeef03", "data matches");
                        assert_1.default.equal(tx.to, testAddressCheck, "to address matches");
                        assert_1.default.equal(tx.from, fireflyAddress, "from address matches");
                        return [2 /*return*/];
                }
            });
        });
    });
    it("allows send overrides", function () {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, contract.populateTransaction.mint({
                            gasLimit: 150000,
                            gasPrice: 1900000000,
                            nonce: 5,
                            value: 1234,
                            from: testAddress
                        })];
                    case 1:
                        tx = _a.sent();
                        //console.log(tx);
                        assert_1.default.equal(Object.keys(tx).length, 7, "correct number of keys");
                        assert_1.default.equal(tx.data, "0x1249c58b", "data matches");
                        assert_1.default.equal(tx.to, testAddressCheck, "to address matches");
                        assert_1.default.equal(tx.nonce, 5, "nonce address matches");
                        assert_1.default.ok(tx.gasLimit.eq(150000), "gasLimit matches");
                        assert_1.default.ok(tx.gasPrice.eq(1900000000), "gasPrice matches");
                        assert_1.default.ok(tx.value.eq(1234), "value matches");
                        assert_1.default.equal(tx.from, testAddressCheck, "from address matches");
                        return [2 /*return*/];
                }
            });
        });
    });
    it("allows zero 'value' to non-payable", function () {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, contract.populateTransaction.unstake({
                            from: testAddress,
                            value: 0
                        })];
                    case 1:
                        tx = _a.sent();
                        //console.log(tx);
                        assert_1.default.equal(Object.keys(tx).length, 3, "correct number of keys");
                        assert_1.default.equal(tx.data, "0x2def6620", "data matches");
                        assert_1.default.equal(tx.to, testAddressCheck, "to address matches");
                        assert_1.default.equal(tx.from, testAddressCheck, "from address matches");
                        return [2 /*return*/];
                }
            });
        });
    });
    // @TODO: Add test cases to check for fault cases
    // - cannot send non-zero value to non-payable
    // - using the wrong from for a Signer-connected contract
    it("forbids non-zero 'value' to non-payable", function () {
        return __awaiter(this, void 0, void 0, function () {
            var tx, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, contract.populateTransaction.unstake({
                                value: 1
                            })];
                    case 1:
                        tx = _a.sent();
                        console.log("Tx", tx);
                        assert_1.default.ok(false, "throws on non-zero value to non-payable");
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        assert_1.default.ok(error_1.operation === "overrides.value");
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    });
    it("allows overriding same 'from' with a Signer", function () {
        return __awaiter(this, void 0, void 0, function () {
            var contractSigner, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contractSigner = contract.connect(testAddress);
                        return [4 /*yield*/, contractSigner.populateTransaction.unstake({
                                from: testAddress
                            })];
                    case 1:
                        tx = _a.sent();
                        //console.log(tx);
                        assert_1.default.equal(Object.keys(tx).length, 3, "correct number of keys");
                        assert_1.default.equal(tx.data, "0x2def6620", "data matches");
                        assert_1.default.equal(tx.to, testAddressCheck, "to address matches");
                        assert_1.default.equal(tx.from, testAddressCheck, "from address matches");
                        return [2 /*return*/];
                }
            });
        });
    });
    it("forbids overriding 'from' with a Signer", function () {
        return __awaiter(this, void 0, void 0, function () {
            var contractSigner, tx, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contractSigner = contract.connect(testAddress);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, contractSigner.populateTransaction.unstake({
                                from: fireflyAddress
                            })];
                    case 2:
                        tx = _a.sent();
                        console.log("Tx", tx);
                        assert_1.default.ok(false, "throws on non-zero value to non-payable");
                        return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        assert_1.default.ok(error_2.operation === "overrides.from");
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    });
    it("allows overriding with invalid, but nullish values", function () {
        return __awaiter(this, void 0, void 0, function () {
            var contractSigner, tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contractSigner = contract.connect(testAddress);
                        return [4 /*yield*/, contractSigner.populateTransaction.unstake({
                                blockTag: null,
                                from: null
                            })];
                    case 1:
                        tx = _a.sent();
                        //console.log("Tx", tx);
                        assert_1.default.equal(Object.keys(tx).length, 3, "correct number of keys");
                        assert_1.default.equal(tx.data, "0x2def6620", "data matches");
                        assert_1.default.equal(tx.to, testAddressCheck, "to address matches");
                        assert_1.default.equal(tx.from, testAddressCheck.toLowerCase(), "from address matches");
                        return [2 /*return*/];
                }
            });
        });
    });
});
//# sourceMappingURL=test-contract.js.map