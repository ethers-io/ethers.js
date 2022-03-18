'use strict';
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var hethers_1 = require("@hashgraph/hethers");
var fs_1 = __importStar(require("fs"));
var logger_1 = require("@hethers/logger");
var bytes_1 = require("@ethersproject/bytes");
var abiToken = JSON.parse((0, fs_1.readFileSync)('packages/tests/contracts/Token.json').toString());
var abiTokenWithArgs = JSON.parse((0, fs_1.readFileSync)('packages/tests/contracts/TokenWithArgs.json').toString());
var bytecodeToken = fs_1.default.readFileSync('packages/tests/contracts/Token.bin').toString();
var bytecodeTokenWithArgs = (0, fs_1.readFileSync)('packages/tests/contracts/TokenWithArgs.bin').toString();
var iUniswapV2PairAbi = JSON.parse(fs_1.default.readFileSync('packages/tests/contracts/IUniswapV2Pair.abi.json').toString());
var TIMEOUT_PERIOD = 120000;
var hederaEoa = {
    account: '0.0.29562194',
    privateKey: '0x3b6cd41ded6986add931390d5d3efa0bb2b311a8415cfe66716cac0234de035d'
};
describe("Test Contract Transaction Population", function () {
    var provider = hethers_1.hethers.providers.getDefaultProvider('testnet');
    // @ts-ignore
    var wallet = new hethers_1.hethers.Wallet(hederaEoa, provider);
    it("should return an array of transactions on getDeployTransaction call", function () {
        return __awaiter(this, void 0, void 0, function () {
            var contractFactory, transaction;
            return __generator(this, function (_a) {
                contractFactory = new hethers_1.hethers.ContractFactory(abiTokenWithArgs, bytecodeTokenWithArgs, wallet);
                transaction = contractFactory.getDeployTransaction(hethers_1.hethers.BigNumber.from("1000000"), {
                    gasLimit: 300000
                });
                (0, assert_1.default)('data' in transaction);
                (0, assert_1.default)('customData' in transaction);
                (0, assert_1.default)('gasLimit' in transaction);
                assert_1.default.strictEqual(300000, transaction.gasLimit);
                return [2 /*return*/];
            });
        });
    });
    it("should be able to deploy a contract", function () {
        return __awaiter(this, void 0, void 0, function () {
            var contractFactory, contract, balance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contractFactory = new hethers_1.hethers.ContractFactory(abiTokenWithArgs, bytecodeTokenWithArgs, wallet);
                        return [4 /*yield*/, contractFactory.deploy(hethers_1.hethers.BigNumber.from("10000"), { gasLimit: 300000 })];
                    case 1:
                        contract = _a.sent();
                        assert_1.default.notStrictEqual(contract, null, "nullified contract");
                        assert_1.default.notStrictEqual(contract.deployTransaction, "missing deploy transaction");
                        assert_1.default.notStrictEqual(contract.address, null, 'missing address');
                        return [4 /*yield*/, contract.balanceOf(wallet.address, { gasLimit: 300000 })];
                    case 2:
                        balance = _a.sent();
                        assert_1.default.strictEqual(hethers_1.BigNumber.from(balance).toNumber(), 10000, 'balance mismatch');
                        return [2 /*return*/];
                }
            });
        });
    }).timeout(300000);
    it("should be able to call contract methods", function () {
        return __awaiter(this, void 0, void 0, function () {
            var contractFactory, contract, clientWallet, clientAccountId, _a, _b, viewMethodCall, populatedTx, signedTransaction, tx, _c, _d, transferMethodCall, _e, _f;
            return __generator(this, function (_g) {
                switch (_g.label) {
                    case 0:
                        contractFactory = new hethers_1.hethers.ContractFactory(abiTokenWithArgs, bytecodeTokenWithArgs, wallet);
                        return [4 /*yield*/, contractFactory.deploy(hethers_1.hethers.BigNumber.from('10000'), { gasLimit: 3000000 })];
                    case 1:
                        contract = _g.sent();
                        return [4 /*yield*/, contract.deployed()];
                    case 2:
                        _g.sent();
                        clientWallet = hethers_1.hethers.Wallet.createRandom();
                        return [4 /*yield*/, wallet.createAccount(clientWallet._signingKey().compressedPublicKey)];
                    case 3:
                        clientAccountId = (_g.sent()).customData.accountId;
                        clientWallet = clientWallet.connect(provider).connectAccount(clientAccountId.toString());
                        // test sending hbars to the contract
                        return [4 /*yield*/, wallet.sendTransaction({
                                to: contract.address,
                                from: wallet.address,
                                value: 30,
                                gasLimit: 300000
                            })];
                    case 4:
                        // test sending hbars to the contract
                        _g.sent();
                        // test if initial balance of the client is zero
                        _b = (_a = assert_1.default).strictEqual;
                        return [4 /*yield*/, contract.balanceOf(clientWallet.address, { gasLimit: 300000 })];
                    case 5:
                        // test if initial balance of the client is zero
                        _b.apply(_a, [(_g.sent()).toString(), '0']);
                        return [4 /*yield*/, contract.getInternalCounter({ gasLimit: 300000 })];
                    case 6:
                        viewMethodCall = _g.sent();
                        assert_1.default.strictEqual(viewMethodCall.toString(), '29');
                        return [4 /*yield*/, contract.populateTransaction.transfer(clientWallet.address, 10, { gasLimit: 300000 })];
                    case 7:
                        populatedTx = _g.sent();
                        return [4 /*yield*/, wallet.signTransaction(populatedTx)];
                    case 8:
                        signedTransaction = _g.sent();
                        return [4 /*yield*/, wallet.provider.sendTransaction(signedTransaction)];
                    case 9:
                        tx = _g.sent();
                        return [4 /*yield*/, tx.wait()];
                    case 10:
                        _g.sent();
                        _d = (_c = assert_1.default).strictEqual;
                        return [4 /*yield*/, contract.balanceOf(clientWallet.address, { gasLimit: 300000 })];
                    case 11:
                        _d.apply(_c, [(_g.sent()).toString(), '10']);
                        return [4 /*yield*/, contract.transfer(clientWallet.address, 10, { gasLimit: 300000 })];
                    case 12:
                        transferMethodCall = _g.sent();
                        return [4 /*yield*/, transferMethodCall.wait()];
                    case 13:
                        _g.sent();
                        _f = (_e = assert_1.default).strictEqual;
                        return [4 /*yield*/, contract.balanceOf(clientWallet.address, { gasLimit: 300000 })];
                    case 14:
                        _f.apply(_e, [(_g.sent()).toString(), '20']);
                        return [2 /*return*/];
                }
            });
        });
    }).timeout(300000);
    it('should have a .wait function', function () {
        return __awaiter(this, void 0, void 0, function () {
            var contractFactory, contract, err_1, deployTx, receipt, events, i, log, event_1, eventTx, eventRc;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contractFactory = new hethers_1.hethers.ContractFactory(abiToken, bytecodeToken, wallet);
                        return [4 /*yield*/, contractFactory.deploy({ gasLimit: 300000 })];
                    case 1:
                        contract = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, contract.deployTransaction.wait(10)];
                    case 3:
                        _a.sent();
                        assert_1.default.notStrictEqual(true, false, "It should go in the catch block");
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        assert_1.default.notStrictEqual(err_1, null, "An error is thrown when the specified timeout is exceeded");
                        assert_1.default.strictEqual(err_1.code, 'TIMEOUT');
                        return [3 /*break*/, 5];
                    case 5:
                        deployTx = contract.deployTransaction;
                        return [4 /*yield*/, deployTx.wait()];
                    case 6:
                        receipt = _a.sent();
                        assert_1.default.notStrictEqual(receipt, null, "wait returns a receipt");
                        assert_1.default.strictEqual(receipt.transactionId, deployTx.transactionId, "receipt.transactionId is correct");
                        assert_1.default.strictEqual(receipt.transactionHash, deployTx.hash, "receipt.transactionHash is correct");
                        assert_1.default.notStrictEqual(receipt.logs, null, "receipt.logs exists");
                        assert_1.default.strictEqual(receipt.logs.length, 2);
                        events = receipt.events;
                        assert_1.default.notStrictEqual(events, null, "receipt.events exists");
                        assert_1.default.strictEqual(events.length, 2);
                        assert_1.default.strictEqual(events[0].event, 'Mint');
                        assert_1.default.strictEqual(events[0].eventSignature, 'Mint(address,uint256)');
                        assert_1.default.strictEqual(events[1].event, 'Transfer');
                        assert_1.default.strictEqual(events[1].eventSignature, 'Transfer(address,address,uint256)');
                        i = 0;
                        _a.label = 7;
                    case 7:
                        if (!(i < events.length)) return [3 /*break*/, 11];
                        log = receipt.logs[i];
                        event_1 = events[i];
                        assert_1.default.strictEqual(log.timestamp, receipt.timestamp, 'timestamp is correct');
                        assert_1.default.strictEqual(log.address, receipt.contractAddress, 'address is correct');
                        assert_1.default.notStrictEqual(log.data, null, 'data exists');
                        assert_1.default.strictEqual(log.logIndex, i, 'logIndex is correct');
                        assert_1.default.strictEqual(log.transactionHash, receipt.transactionHash, 'transactionHash is correct');
                        assert_1.default.strictEqual(event_1.timestamp, receipt.timestamp, 'event.timestamp is correct');
                        assert_1.default.strictEqual(event_1.address, receipt.contractAddress, 'event.address is correct');
                        assert_1.default.notStrictEqual(event_1.data, 'event.data exists');
                        assert_1.default.strictEqual(event_1.logIndex, i, 'event.logIndex is correct');
                        assert_1.default.strictEqual(event_1.transactionHash, receipt.transactionHash, 'event.transactionHash is correct');
                        assert_1.default.notStrictEqual(event_1.getTransaction, null, 'events have a method `getTransaction`');
                        assert_1.default.notStrictEqual(event_1.getTransactionReceipt, null, 'events have a method `getTransactionReceipt`');
                        return [4 /*yield*/, event_1.getTransaction()];
                    case 8:
                        eventTx = _a.sent();
                        assert_1.default.notStrictEqual(eventTx, null, 'event.getTransaction() returns a result');
                        assert_1.default.notStrictEqual(eventTx.chainId, null, 'eventTx.chainId is correct');
                        assert_1.default.strictEqual(eventTx.hash, receipt.transactionHash, 'eventTx.hash is correct');
                        assert_1.default.strictEqual(eventTx.timestamp, receipt.timestamp, 'eventTx.timestamp is correct');
                        assert_1.default.strictEqual(eventTx.transactionId, receipt.transactionId, 'eventTx.transactionId is correct');
                        assert_1.default.strictEqual(eventTx.from, receipt.from, 'eventTx.from is correct');
                        assert_1.default.strictEqual(eventTx.to, receipt.contractAddress, 'eventTx.contractAddress is correct');
                        assert_1.default.strictEqual(eventTx.value.toString(), hethers_1.BigNumber.from(0).toString(), 'eventTx.value is correct');
                        return [4 /*yield*/, event_1.getTransactionReceipt()];
                    case 9:
                        eventRc = _a.sent();
                        assert_1.default.strictEqual(eventRc, receipt, "getTransactionReceipt returns the same receipt");
                        _a.label = 10;
                    case 10:
                        i++;
                        return [3 /*break*/, 7];
                    case 11: return [2 /*return*/];
                }
            });
        });
    }).timeout(300000);
});
describe('Contract Events', function () {
    var _this = this;
    var provider = hethers_1.hethers.providers.getDefaultProvider('testnet');
    // @ts-ignore
    var wallet = new hethers_1.hethers.Wallet(hederaEoa, provider);
    var contract = hethers_1.hethers.ContractFactory.getContract('0x0000000000000000000000000000000001c42805', abiTokenWithArgs, wallet);
    var sleep = function (timeout) { return __awaiter(_this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, new Promise(function (resolve) {
                        setTimeout(resolve, timeout);
                    })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); };
    var enoughEventsCaptured = function (n, expectedN) { return n >= expectedN; };
    var mintCount = 5;
    it("should be able to capture events via contract", function () {
        return __awaiter(this, void 0, void 0, function () {
            var capturedMints, i, mint, _i, capturedMints_1, mint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        capturedMints = [];
                        contract.on('Mint', function () {
                            var args = [];
                            for (var _i = 0; _i < arguments.length; _i++) {
                                args[_i] = arguments[_i];
                            }
                            assert_1.default.strictEqual(args.length, 3, "expected 3 arguments - [address, unit256, log].");
                            capturedMints.push(__spreadArray([], args, true));
                        });
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i <= mintCount)) return [3 /*break*/, 5];
                        return [4 /*yield*/, contract.mint(hethers_1.BigNumber.from("1"), { gasLimit: 300000 })];
                    case 2:
                        mint = _a.sent();
                        return [4 /*yield*/, mint.wait()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 1];
                    case 5: return [4 /*yield*/, sleep(mintCount * 5000)];
                    case 6:
                        _a.sent();
                        contract.removeAllListeners();
                        assert_1.default.strictEqual(enoughEventsCaptured(capturedMints.length, mintCount), true, "expected " + mintCount + " captured events (Mint). Got " + capturedMints.length);
                        for (_i = 0, capturedMints_1 = capturedMints; _i < capturedMints_1.length; _i++) {
                            mint = capturedMints_1[_i];
                            assert_1.default.strictEqual(mint[0].toLowerCase(), wallet.address.toLowerCase(), "address mismatch - mint");
                        }
                        return [2 /*return*/];
                }
            });
        });
    }).timeout(TIMEOUT_PERIOD * 3);
    it('should be able to capture events via provider', function () {
        return __awaiter(this, void 0, void 0, function () {
            var capturedMints, i, mint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        capturedMints = [];
                        provider.on({ address: contract.address, topics: [
                                '0x0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d4121396885'
                            ] }, function (args) {
                            assert_1.default.notStrictEqual(args, null, "expected 1 argument - log");
                            capturedMints.push([args]);
                        });
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i <= mintCount)) return [3 /*break*/, 5];
                        return [4 /*yield*/, contract.mint(hethers_1.BigNumber.from("1"), { gasLimit: 300000 })];
                    case 2:
                        mint = _a.sent();
                        return [4 /*yield*/, mint.wait()];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4:
                        i++;
                        return [3 /*break*/, 1];
                    case 5: return [4 /*yield*/, sleep(mintCount * 5000)];
                    case 6:
                        _a.sent();
                        provider.removeAllListeners();
                        assert_1.default.strictEqual(enoughEventsCaptured(capturedMints.length, mintCount), true, "expected " + mintCount + " captured events (Mint). Got " + capturedMints.length);
                        return [2 /*return*/];
                }
            });
        });
    }).timeout(TIMEOUT_PERIOD * 3);
    it('should throw on OR topics filter', function () {
        return __awaiter(this, void 0, void 0, function () {
            var filter, noop, capturedErrors, filtered;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        filter = {
                            address: contract.address,
                            topics: [
                                '0x0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d4121396885',
                                null,
                                ['0x0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d4121396885', '0x0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d4121396885'],
                            ]
                        };
                        noop = function () { };
                        capturedErrors = [];
                        provider.on(filter, noop);
                        provider.on('error', function (error) {
                            assert_1.default.notStrictEqual(error, null);
                            capturedErrors.push(error);
                        });
                        return [4 /*yield*/, sleep(20000)];
                    case 1:
                        _a.sent();
                        filtered = capturedErrors.filter(function (e) { return e.code === logger_1.Logger.errors.INVALID_ARGUMENT; });
                        assert_1.default.strictEqual(filtered.length > 0, true, "expected atleast 1 INVALID_AGRUMENT error");
                        provider.removeAllListeners();
                        return [2 /*return*/];
                }
            });
        });
    }).timeout(TIMEOUT_PERIOD);
});
describe('Contract Aliases', function () {
    return __awaiter(this, void 0, void 0, function () {
        var provider, wallet;
        return __generator(this, function (_a) {
            provider = hethers_1.hethers.providers.getDefaultProvider('testnet');
            wallet = new hethers_1.hethers.Wallet(hederaEoa, provider);
            it('Should detect contract aliases', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var contractAlias, c1, token0, token1, symbol;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                contractAlias = '0xbd438E8416b13e962781eBAfE344d45DC0DBBc0c';
                                c1 = hethers_1.hethers.ContractFactory.getContract(contractAlias, iUniswapV2PairAbi.abi, wallet);
                                return [4 /*yield*/, c1.token0({ gasLimit: 300000 })];
                            case 1:
                                token0 = _a.sent();
                                assert_1.default.notStrictEqual(token0, "");
                                assert_1.default.notStrictEqual(token0, null);
                                return [4 /*yield*/, c1.token1({ gasLimit: 300000 })];
                            case 2:
                                token1 = _a.sent();
                                assert_1.default.notStrictEqual(token1, "");
                                assert_1.default.notStrictEqual(token1, null);
                                return [4 /*yield*/, c1.symbol({ gasLimit: 300000 })];
                            case 3:
                                symbol = _a.sent();
                                assert_1.default.notStrictEqual(symbol, "");
                                assert_1.default.notStrictEqual(symbol, null);
                                return [2 /*return*/];
                        }
                    });
                });
            }).timeout(300000);
            it('create2 tests', function () {
                return __awaiter(this, void 0, void 0, function () {
                    var factoryBytecode, accBytecode, factoryAbi, accAbi, salt, factoryCFactory, _factory, factory, deployArgs, deployTx;
                    var _this = this;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.timeout(300000);
                                factoryBytecode = fs_1.default.readFileSync('packages/tests/contracts/Factory.bin').toString();
                                accBytecode = fs_1.default.readFileSync('packages/tests/contracts/Account.bin').toString();
                                factoryAbi = JSON.parse(fs_1.default.readFileSync('packages/tests/contracts/Factory.abi.json').toString());
                                accAbi = JSON.parse(fs_1.default.readFileSync('packages/tests/contracts/Account.abi.json').toString());
                                salt = 1111;
                                factoryCFactory = new hethers_1.hethers.ContractFactory(factoryAbi, factoryBytecode, wallet);
                                return [4 /*yield*/, factoryCFactory.deploy({ gasLimit: 300000 })];
                            case 1:
                                _factory = _a.sent();
                                factory = hethers_1.hethers.ContractFactory.getContract(_factory.address, factoryAbi, wallet);
                                // the second argument is the salt we have used, and we can skip it as we defined it above
                                factory.on('Deployed', function (addr, _) { return __awaiter(_this, void 0, void 0, function () {
                                    var account, owner, resp;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0:
                                                account = hethers_1.hethers.ContractFactory.getContract(addr, accAbi, wallet);
                                                return [4 /*yield*/, account.getOwner({ gasLimit: 300000 })];
                                            case 1:
                                                owner = _a.sent();
                                                assert_1.default.strictEqual(owner, hethers_1.hethers.constants.AddressZero);
                                                return [4 /*yield*/, account.setOwner(wallet.address, { gasLimit: 300000 })];
                                            case 2:
                                                resp = _a.sent();
                                                assert_1.default.notStrictEqual(resp, null, 'expected a defined tx response');
                                                return [4 /*yield*/, account.getOwner({ gasLimit: 300000 })];
                                            case 3:
                                                owner = _a.sent();
                                                assert_1.default.strictEqual(owner, wallet.address, "expected owner to be changed after `setOwner` call");
                                                factory.removeAllListeners();
                                                return [2 /*return*/];
                                        }
                                    });
                                }); });
                                deployArgs = (0, bytes_1.hexlify)("0x" + accBytecode);
                                return [4 /*yield*/, factory.deploy(deployArgs, salt, { gasLimit: 300000 })];
                            case 2:
                                deployTx = _a.sent();
                                return [4 /*yield*/, deployTx.wait()];
                            case 3:
                                _a.sent();
                                return [4 /*yield*/, new Promise((function (resolve) { return setTimeout(resolve, 10000); }))];
                            case 4:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                });
            });
            return [2 /*return*/];
        });
    });
});
describe("contract.deployed", function () {
    var hederaEoa = {
        account: '0.0.29562194',
        privateKey: '0x3b6cd41ded6986add931390d5d3efa0bb2b311a8415cfe66716cac0234de035d'
    };
    var provider = hethers_1.hethers.providers.getDefaultProvider('testnet');
    // @ts-ignore
    var wallet = new hethers_1.hethers.Wallet(hederaEoa, provider);
    it("should work for already deployed contracts", function () {
        return __awaiter(this, void 0, void 0, function () {
            var contract, contractDeployed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contract = hethers_1.hethers.ContractFactory.getContract('0000000000000000000000000000000001c3903b', abiToken, wallet);
                        return [4 /*yield*/, contract.deployed()];
                    case 1:
                        contractDeployed = _a.sent();
                        assert_1.default.notStrictEqual(contractDeployed, null, "deployed returns the contract");
                        assert_1.default.strictEqual(contractDeployed.address, contract.address, "deployed returns the same contract instance");
                        return [2 /*return*/];
                }
            });
        });
    }).timeout(60000);
    it("should work if contract is just now deployed", function () {
        return __awaiter(this, void 0, void 0, function () {
            var contractFactory, contract, contractDeployed;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contractFactory = new hethers_1.hethers.ContractFactory(abiToken, bytecodeToken, wallet);
                        return [4 /*yield*/, contractFactory.deploy({ gasLimit: 300000 })];
                    case 1:
                        contract = _a.sent();
                        assert_1.default.notStrictEqual(contract, null, "nullified contract");
                        assert_1.default.notStrictEqual(contract.deployTransaction, "missing deploy transaction");
                        assert_1.default.notStrictEqual(contract.address, null, 'missing address');
                        return [4 /*yield*/, contract.deployed()];
                    case 2:
                        contractDeployed = _a.sent();
                        assert_1.default.notStrictEqual(contractDeployed, null, "deployed returns the contract");
                        assert_1.default.strictEqual(contractDeployed.address, contract.address, "deployed returns the same contract instance");
                        return [2 /*return*/];
                }
            });
        });
    }).timeout(60000);
});
describe("Test Contract Query Filter", function () {
    var hederaEoa = {
        account: '0.0.29562194',
        privateKey: '0x3b6cd41ded6986add931390d5d3efa0bb2b311a8415cfe66716cac0234de035d'
    };
    var provider = hethers_1.hethers.providers.getDefaultProvider('testnet');
    // @ts-ignore
    var wallet = new hethers_1.hethers.Wallet(hederaEoa, provider);
    it("should filter contract events by timestamp string", function () {
        return __awaiter(this, void 0, void 0, function () {
            var contractAddress, fromTimestamp, toTimestamp, contract, filter, events;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contractAddress = '0x000000000000000000000000000000000186fb1a';
                        fromTimestamp = '1642065156.264170833';
                        toTimestamp = '1642080642.176149864';
                        contract = hethers_1.hethers.ContractFactory.getContract(contractAddress, abiToken, wallet);
                        filter = {
                            address: contractAddress,
                        };
                        return [4 /*yield*/, contract.queryFilter(filter, fromTimestamp, toTimestamp)];
                    case 1:
                        events = _a.sent();
                        assert_1.default.strictEqual(events.length, 2, "queryFilter returns the contract events");
                        assert_1.default.strictEqual(events[0].address.toLowerCase(), contractAddress.toLowerCase(), "result address matches contract address");
                        assert_1.default.notStrictEqual(events[0].data, null, "result data exists");
                        assert_1.default.strict(events[0].topics.length > 0, "result topics not empty");
                        assert_1.default.strict(events[0].timestamp >= fromTimestamp, "result timestamp is greater or equal fromTimestamp");
                        assert_1.default.strict(events[0].timestamp <= toTimestamp, "result is less or equal toTimestamp");
                        assert_1.default.strictEqual(events[1].address.toLowerCase(), contractAddress.toLowerCase(), "result address matches contract address");
                        assert_1.default.notStrictEqual(events[1].data, null, "result data exists");
                        assert_1.default.strict(events[1].topics.length > 0, "result topics not empty");
                        assert_1.default.strict(events[1].timestamp >= fromTimestamp, "result timestamp is greater or equal fromTimestamp");
                        assert_1.default.strict(events[1].timestamp <= toTimestamp, "result is less or equal toTimestamp");
                        return [2 /*return*/];
                }
            });
        });
    }).timeout(60000);
    it("should filter contract events by timestamp number", function () {
        return __awaiter(this, void 0, void 0, function () {
            var contractAddress, fromTimestamp, toTimestamp, contract, filter, events;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        contractAddress = '0x000000000000000000000000000000000186fb1a';
                        fromTimestamp = 1642065156264170;
                        toTimestamp = 1642080642176150;
                        contract = hethers_1.hethers.ContractFactory.getContract(contractAddress, abiToken, wallet);
                        filter = {
                            address: contractAddress,
                        };
                        return [4 /*yield*/, contract.queryFilter(filter, fromTimestamp, toTimestamp)];
                    case 1:
                        events = _a.sent();
                        assert_1.default.strictEqual(events.length, 2, "queryFilter returns the contract events");
                        assert_1.default.strictEqual(events[0].address.toLowerCase(), contractAddress.toLowerCase(), "result address matches contract address");
                        assert_1.default.notStrictEqual(events[0].data, null, "result data exists");
                        assert_1.default.strict(events[0].topics.length > 0, "result topics not empty");
                        assert_1.default.strictEqual(events[1].address.toLowerCase(), contractAddress.toLowerCase(), "result address matches contract address");
                        assert_1.default.notStrictEqual(events[1].data, null, "result data exists");
                        assert_1.default.strict(events[1].topics.length > 0, "result topics not empty");
                        return [2 /*return*/];
                }
            });
        });
    }).timeout(60000);
});
//# sourceMappingURL=test-contract.spec.js.map