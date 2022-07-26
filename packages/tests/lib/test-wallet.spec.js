'use strict';
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var hethers_1 = require("@hashgraph/hethers");
var testcases_1 = require("@hethers/testcases");
var utils = __importStar(require("./utils"));
var sdk_1 = require("@hashgraph/sdk");
var fs_1 = require("fs");
var abi = JSON.parse((0, fs_1.readFileSync)('packages/tests/contracts/Token.json').toString());
var abiTokenWithArgs = JSON.parse((0, fs_1.readFileSync)('packages/tests/contracts/TokenWithArgs.json').toString());
describe('Wallet.spec', function () {
    var localProvider = utils.getProviders().local[0];
    // @ts-ignore
    var testnetWalletECDSA = utils.getWallets().testnet.ecdsa[0];
    // @ts-ignore
    var localWalletECDSA = utils.getWallets().local.ecdsa[0];
    var localWalletED25519 = utils.getWallets().local.ed25519[1];
    describe('Test JSON Wallets', function () {
        var tests = (0, testcases_1.loadTests)('wallets');
        tests.forEach(function (test) {
            it(('decrypts wallet - ' + test.name), function () {
                return __awaiter(this, void 0, void 0, function () {
                    var wallet, walletAddress, walletConnected, wallet2, wallet2;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                this.timeout(1200000);
                                return [4 /*yield*/, hethers_1.hethers.Wallet.fromEncryptedJson(test.json, test.password)];
                            case 1:
                                wallet = _a.sent();
                                assert_1.default.strictEqual(wallet.privateKey, test.privateKey, 'generated correct private key - ' + wallet.privateKey);
                                if (!test.hasAddress) return [3 /*break*/, 3];
                                assert_1.default.ok((hethers_1.hethers.utils.getJsonWalletAddress(test.json) !== null), 'detect encrypted JSON wallet');
                                assert_1.default.strictEqual(wallet.address.toLowerCase(), test.address, 'generate correct address - ' + wallet.address);
                                return [4 /*yield*/, wallet.getAddress()];
                            case 2:
                                walletAddress = _a.sent();
                                assert_1.default.strictEqual(walletAddress.toLowerCase(), test.address, 'generate correct address - ' + wallet.address);
                                _a.label = 3;
                            case 3:
                                // Test connect
                                {
                                    walletConnected = wallet.connect(localProvider);
                                    assert_1.default.strictEqual(walletConnected.provider, localProvider, "provider is connected");
                                    assert_1.default.ok((wallet.provider == null), "original wallet provider is null");
                                    if (test.hasAddress) {
                                        assert_1.default.strictEqual(walletConnected.address.toLowerCase(), test.address, "connected correct address - " + wallet.address);
                                    }
                                }
                                // Make sure it can accept a SigningKey
                                {
                                    wallet2 = new hethers_1.hethers.Wallet(wallet._signingKey());
                                    assert_1.default.equal(wallet2.privateKey, test.privateKey, 'generated correct private key - ' + wallet2.privateKey);
                                }
                                // Test the sync decryption (this wallet is light, so it is safe)
                                if (test.name === "life") {
                                    wallet2 = hethers_1.hethers.Wallet.fromEncryptedJsonSync(test.json, test.password);
                                    assert_1.default.equal(wallet2.privateKey, test.privateKey, 'generated correct private key - ' + wallet2.privateKey);
                                }
                                if (test.mnemonic) {
                                    assert_1.default.equal(wallet.mnemonic.phrase, test.mnemonic, 'mnemonic enabled encrypted wallet has a mnemonic phrase');
                                }
                                return [2 /*return*/];
                        }
                    });
                });
            });
        });
        // A few extra test cases to test encrypting/decrypting
        ['one', 'two', 'three', "ed25519"].forEach(function (i) {
            var isED25519Type = i === "ed25519";
            var password = 'foobar' + i;
            var wallet = hethers_1.hethers.Wallet.createRandom({ path: "m/56'/82", extraEntropy: utils.randomHexString('test-' + i, 32), isED25519Type: isED25519Type });
            wallet = wallet.connectAccount("0.0.1001");
            it('encrypts and decrypts a random wallet - ' + i, function () {
                this.timeout(1200000);
                return wallet.encrypt(password).then(function (json) {
                    return hethers_1.hethers.Wallet.fromEncryptedJson(json, password).then(function (decryptedWallet) {
                        assert_1.default.strictEqual(decryptedWallet.address, wallet.address, 'decrypted wallet - ' + wallet.privateKey);
                        assert_1.default.strictEqual(decryptedWallet.mnemonic.phrase, wallet.mnemonic.phrase, "decrypted wallet mnemonic - " + wallet.privateKey);
                        assert_1.default.strictEqual(decryptedWallet.mnemonic.path, wallet.mnemonic.path, "decrypted wallet path - " + wallet.privateKey);
                        assert_1.default.strictEqual(decryptedWallet.isED25519Type, isED25519Type);
                        return decryptedWallet.encrypt(password).then(function (encryptedWallet) {
                            var parsedWallet = JSON.parse(encryptedWallet);
                            assert_1.default.strictEqual(decryptedWallet.address.toLowerCase().substring(2), parsedWallet.address, 're-encrypted wallet - ' + wallet.privateKey);
                        });
                    });
                });
            });
        });
    });
    describe("Test wallet(ED25519) keys", function () {
        var accountEoa = {
            account: "0.0.34100425",
            alias: "0.0.QsxEYZU82YPvQqrZ8DAfOktZjmbcfjaPwVATlsaJCCM=",
            privateKey: "06bd0453347618988f1e1c60bd3e57892a4b8603969827d65b1a87d13b463d70",
            isED25519Type: true
        };
        it("Should use curve ed25519", function () {
            var wallet = new hethers_1.hethers.Wallet(accountEoa);
            assert_1.default.strictEqual(wallet._signingKey().curve, "ed25519");
        });
        it("Should verify alias", function () {
            var wallet = new hethers_1.hethers.Wallet(accountEoa);
            assert_1.default.strictEqual(wallet.alias, accountEoa.alias);
        });
        it("Should throw error for invalid alias", function () {
            var exceptionThrown = false;
            var errorCode = null;
            try {
                new hethers_1.hethers.Wallet(__assign(__assign({}, accountEoa), { alias: "invalid alias" }));
            }
            catch (e) {
                errorCode = e.code;
                exceptionThrown = true;
            }
            assert_1.default.strictEqual(errorCode, "INVALID_ARGUMENT");
            assert_1.default.strictEqual(exceptionThrown, true);
        });
        it("Should work with signing key", function () {
            var wallet = new hethers_1.hethers.Wallet(accountEoa);
            var sk = new hethers_1.hethers.Wallet(wallet._signingKey());
            assert_1.default.strictEqual(sk._signingKey().privateKey, "0x" + sdk_1.PrivateKey.fromString(accountEoa.privateKey).toStringRaw());
            assert_1.default.strictEqual(sk.isED25519Type, true);
        });
        it("Should work with DER header", function () {
            var wallet = new hethers_1.hethers.Wallet(__assign(__assign({}, accountEoa), { privateKey: "302e020100300506032b65700422042006bd0453347618988f1e1c60bd3e57892a4b8603969827d65b1a87d13b463d70" }));
            assert_1.default.strictEqual(wallet._signingKey().privateKey, "0x" + sdk_1.PrivateKey.fromString(accountEoa.privateKey).toStringRaw());
        });
        it('Should prefix non-prefixed keys(raw)', function () {
            return __awaiter(this, void 0, void 0, function () {
                var key, wallet, privKey;
                return __generator(this, function (_a) {
                    key = 'a1eb7d5c7ef5e47026b262c973b60fa9d6317c27854eeb25aa82b67d8abc73a2';
                    wallet = new hethers_1.hethers.Wallet(key);
                    privKey = wallet._signingKey().privateKey;
                    assert_1.default.strictEqual('0x' + key, privKey);
                    return [2 /*return*/];
                });
            });
        });
        it("Should prefix @hashgraph/sdk generated keys", function () {
            return __awaiter(this, void 0, void 0, function () {
                var key, wallet, privKey;
                return __generator(this, function (_a) {
                    key = sdk_1.PrivateKey.generateED25519().toStringRaw();
                    wallet = new hethers_1.hethers.Wallet(key);
                    privKey = wallet._signingKey().privateKey;
                    assert_1.default.strictEqual('0x' + key, privKey);
                    return [2 /*return*/];
                });
            });
        });
        it('Should prefix keys when given eoa in constructor', function () {
            return __awaiter(this, void 0, void 0, function () {
                var provider, wallet, privKey;
                return __generator(this, function (_a) {
                    provider = hethers_1.hethers.providers.getDefaultProvider('testnet');
                    wallet = new hethers_1.hethers.Wallet(accountEoa, provider);
                    privKey = wallet._signingKey().privateKey;
                    assert_1.default.strictEqual('0x' + accountEoa.privateKey, privKey);
                    return [2 /*return*/];
                });
            });
        });
    });
    describe("Test wallet keys", function () {
        it('Should prefix non-prefixed keys(raw)', function () {
            return __awaiter(this, void 0, void 0, function () {
                var key, wallet, privKey;
                return __generator(this, function (_a) {
                    key = '074cc0bd198d1bc91f668c59b46a1e74fd13215661e5a7bd42ad0d324476295d';
                    wallet = new hethers_1.hethers.Wallet(key);
                    privKey = wallet._signingKey().privateKey;
                    assert_1.default.strictEqual('0x' + key, privKey);
                    return [2 /*return*/];
                });
            });
        });
        it("Should prefix @hashgraph/sdk generated keys", function () {
            return __awaiter(this, void 0, void 0, function () {
                var key, wallet, privKey;
                return __generator(this, function (_a) {
                    key = sdk_1.PrivateKey.generateECDSA().toStringRaw();
                    wallet = new hethers_1.hethers.Wallet(key);
                    privKey = wallet._signingKey().privateKey;
                    assert_1.default.strictEqual('0x' + key, privKey);
                    return [2 /*return*/];
                });
            });
        });
        it('Should prefix keys when given eoa in constructor', function () {
            return __awaiter(this, void 0, void 0, function () {
                var eoa, wallet, privKey;
                return __generator(this, function (_a) {
                    eoa = {
                        account: '1.1.1',
                        privateKey: "074cc0bd198d1bc91f668c59b46a1e74fd13215661e5a7bd42ad0d324476295d"
                    };
                    wallet = new hethers_1.hethers.Wallet(eoa, localProvider);
                    privKey = wallet._signingKey().privateKey;
                    assert_1.default.strictEqual('0x' + eoa.privateKey, privKey);
                    return [2 /*return*/];
                });
            });
        });
    });
    describe('Test Transaction Signing and Parsing', function () {
        // FIXME
        //  unit tests for this functionality is present
        //  at branches `feat/signing-and-sending-transactions` and/or `contract-interaction`
        // function checkTransaction(parsedTransaction: any, test: TestCase.SignedTransaction): any {
        //     let transaction: any = { };
        //
        //     ['nonce', 'gasLimit', 'gasPrice', 'to', 'value', 'data'].forEach((key: (keyof TestCase.SignedTransaction)) => {
        //         let expected = test[key];
        //
        //         let value = parsedTransaction[key];
        //
        //         if ([ "gasLimit", "gasPrice", "value"].indexOf(key) >= 0) {
        //             assert.ok((hethers.BigNumber.isBigNumber(value)),
        //                 'parsed into a big number - ' + key);
        //             value = value.toHexString();
        //
        //             if (!expected || expected === '0x') { expected = '0x00'; }
        //
        //         } else if (key === 'nonce') {
        //             assert.equal(typeof(value), 'number',
        //                 'parse into a number - nonce');
        //
        //             value = hethers.utils.hexlify(value);
        //
        //             if (!expected || expected === '0x') { expected = '0x00'; }
        //
        //         } else if (key === 'data') {
        //             if (!expected) { expected = '0x'; }
        //
        //         } else if (key === 'to') {
        //             if (value) {
        //                 // Make sure the address is valid
        //                 hethers.utils.getAddress(value);
        //                 value = value.toLowerCase();
        //             }
        //         }
        //
        //         assert.equal(value, expected, 'parses ' + key + ' (legacy)');
        //
        //         transaction[key] = test[key];
        //     });
        //
        //     return transaction;
        // }
        // FIXME - separate tests with `it`
        var tests = (0, testcases_1.loadTests)('transactions');
        tests.forEach(function (test) {
            // it(('parses and signs transaction - ' + test.name), function() {
            //     this.timeout(120000);
            //
            //     let signingKey = new hethers.utils.SigningKey(test.privateKey);
            //     let signDigest = signingKey.signDigest.bind(signingKey);
            //
            //     // Legacy parsing unsigned transaction
            //     checkTransaction(hethers.utils.parseTransaction(test.unsignedTransaction), test);
            //
            //     let parsedTransaction = hethers.utils.parseTransaction(test.signedTransaction);
            //     let transaction = checkTransaction(parsedTransaction, test);
            //
            //     // Legacy signed transaction ecrecover
            //     // assert.equal(parsedTransaction.from, hethers.utils.getAddress(test.accountAddress),
            //     //     'computed from');
            //
            //     // Legacy transaction chain ID
            //     // assert.equal(parsedTransaction.chainId, 0, 'parses chainId (legacy)');
            //
            //     // Legacy serializes unsigned transaction
            //     (function() {
            //         let unsignedTx = hethers.utils.serializeTransaction(transaction);
            //         assert.equal(unsignedTx, test.unsignedTransaction,
            //             'serializes unsigned transaction (legacy)');
            //
            //         // Legacy signed serialized transaction
            //         let signature = signDigest(hethers.utils.keccak256(unsignedTx));
            //         assert.equal(hethers.utils.serializeTransaction(transaction, signature), test.signedTransaction,
            //             'signs transaction (legacy)');
            //     })();
            //
            //
            //     // EIP155
            //
            //     // EIP-155 parsing unsigned transaction
            //     let parsedUnsignedTransactionChainId5 = hethers.utils.parseTransaction(test.unsignedTransactionChainId5);
            //     checkTransaction(parsedUnsignedTransactionChainId5, test);
            //     // assert.equal(parsedUnsignedTransactionChainId5.chainId, 5, 'parses chainId (eip155)');
            //
            //     // EIP-155 fields
            //     let parsedTransactionChainId5 = hethers.utils.parseTransaction(test.signedTransactionChainId5);
            //
            //     type TxStringKey = 'data' | 'from' | 'nonce' | 'to';
            //     ['data', 'from', 'nonce', 'to'].forEach((key: TxStringKey) => {
            //         assert.equal(parsedTransaction[key], parsedTransactionChainId5[key],
            //             'parses ' + key + ' (eip155)');
            //     });
            //
            //     type TxNumberKey = 'gasLimit' | 'gasPrice' | 'value';
            //     ['gasLimit', 'gasPrice', 'value'].forEach((key: TxNumberKey) => {
            //         assert.ok(parsedTransaction[key].eq(parsedTransactionChainId5[key]),
            //             'parses ' + key + ' (eip155)');
            //     });
            //
            //     // EIP-155 chain ID
            //     assert.equal(parsedTransactionChainId5.chainId, 5,
            //         'parses chainId (eip155)');
            //
            //     transaction.chainId = 5;
            //
            //     (function() {
            //         // EIP-155 serialized unsigned transaction
            //         let unsignedTx = hethers.utils.serializeTransaction(transaction);
            //         assert.equal(unsignedTx, test.unsignedTransactionChainId5,
            //             'serializes unsigned transaction (eip155) ');
            //
            //         // EIP-155 signed serialized transaction
            //         let signature = signDigest(hethers.utils.keccak256(unsignedTx));
            //         assert.equal(hethers.utils.serializeTransaction(transaction, signature), test.signedTransactionChainId5,
            //             'signs transaction (eip155)');
            //     })();
            // });
        });
        tests.forEach(function (test) {
            it(('wallet signs transaction - ' + test.name), function () {
                return __awaiter(this, void 0, void 0, function () {
                    return __generator(this, function (_a) {
                        this.timeout(120000);
                        return [2 /*return*/];
                    });
                });
            });
        });
    });
    describe("Test Signing Messages(ED25519)", function () {
        it("sign a message should throw unsupported operation", function () {
            return __awaiter(this, void 0, void 0, function () {
                var exceptionThrown, errorCode, wallet, e_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            exceptionThrown = false;
                            errorCode = null;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            wallet = new hethers_1.hethers.Wallet({
                                privateKey: "0xa1eb7d5c7ef5e47026b262c973b60fa9d6317c27854eeb25aa82b67d8abc73a2",
                                isED25519Type: true,
                            });
                            return [4 /*yield*/, wallet.signMessage("some msg")];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_1 = _a.sent();
                            errorCode = e_1.code;
                            exceptionThrown = true;
                            return [3 /*break*/, 4];
                        case 4:
                            assert_1.default.strictEqual(errorCode, 'UNSUPPORTED_OPERATION');
                            assert_1.default.strictEqual(exceptionThrown, true);
                            return [2 /*return*/];
                    }
                });
            });
        });
        it("verify a message should throw unsupported operation", function () {
            return __awaiter(this, void 0, void 0, function () {
                var exceptionThrown, errorCode;
                return __generator(this, function (_a) {
                    exceptionThrown = false;
                    errorCode = null;
                    try {
                        hethers_1.hethers.utils.verifyMessage("some msg", "signature", true);
                    }
                    catch (e) {
                        errorCode = e.code;
                        exceptionThrown = true;
                    }
                    assert_1.default.strictEqual(errorCode, 'UNSUPPORTED_OPERATION');
                    assert_1.default.strictEqual(exceptionThrown, true);
                    return [2 /*return*/];
                });
            });
        });
    });
    describe('Test Signing Messages', function () {
        var tests = [
            // See: https://etherscan.io/verifySig/57
            {
                address: '0x14791697260E4c9A71f18484C9f997B308e59325',
                name: 'string("hello world")',
                message: 'hello world',
                messageHash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
                privateKey: '0x0123456789012345678901234567890123456789012345678901234567890123',
                signature: '0xddd0a7290af9526056b4e35a077b9a11b513aa0028ec6c9880948544508f3c63265e99e47ad31bb2cab9646c504576b3abc6939a1710afc08cbf3034d73214b81c'
            },
            // See: https://github.com/hethers-io/hethers.js/issues/80
            {
                address: '0xD351c7c627ad5531Edb9587f4150CaF393c33E87',
                name: 'bytes(0x47173285...4cb01fad)',
                message: hethers_1.hethers.utils.arrayify('0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad'),
                messageHash: '0x93100cc9477ba6522a2d7d5e83d0e075b167224ed8aa0c5860cfd47fa9f22797',
                privateKey: '0x51d1d6047622bca92272d36b297799ecc152dc2ef91b229debf84fc41e8c73ee',
                signature: '0x546f0c996fa4cfbf2b68fd413bfb477f05e44e66545d7782d87d52305831cd055fc9943e513297d0f6755ad1590a5476bf7d1761d4f9dc07dfe473824bbdec751b'
            },
            // See: https://github.com/hethers-io/hethers.js/issues/85
            {
                address: '0xe7deA7e64B62d1Ca52f1716f29cd27d4FE28e3e1',
                name: 'zero-prefixed signature',
                message: hethers_1.hethers.utils.arrayify(hethers_1.hethers.utils.id('0x7f23b5eed5bc7e89f267f339561b2697faab234a2')),
                messageHash: '0x06c9d148d268f9a13d8f94f4ce351b0beff3b9ba69f23abbf171168202b2dd67',
                privateKey: '0x09a11afa58d6014843fd2c5fd4e21e7fadf96ca2d8ce9934af6b8e204314f25c',
                signature: '0x7222038446034a0425b6e3f0cc3594f0d979c656206408f937c37a8180bb1bea047d061e4ded4aeac77fa86eb02d42ba7250964ac3eb9da1337090258ce798491c'
            }
        ];
        tests.forEach(function (test) {
            it(('signs a message "' + test.name + '"'), function () {
                this.timeout(120000);
                var wallet = new hethers_1.hethers.Wallet(test.privateKey);
                return wallet.signMessage(test.message).then(function (signature) {
                    assert_1.default.equal(signature, test.signature, 'computes message signature');
                });
            });
        });
        tests.forEach(function (test) {
            it(('verifies a message "' + test.name + '"'), function () {
                this.timeout(120000);
                var wallet = new hethers_1.hethers.Wallet(test.privateKey);
                var publicKey = hethers_1.hethers.utils.verifyMessage(test.message, test.signature);
                assert_1.default.strictEqual(wallet.publicKey, publicKey);
            });
        });
        tests.forEach(function (test) {
            it(('hashes a message "' + test.name + '"'), function () {
                this.timeout(120000);
                var hash = hethers_1.hethers.utils.hashMessage(test.message);
                assert_1.default.equal(hash, test.messageHash, 'calculates message hash');
            });
        });
    });
    describe("Wallet(ED25519) Errors", function () {
        it("fails on privateKey/address mismatch", function () {
            assert_1.default.throws(function () {
                var wallet = new hethers_1.hethers.Wallet({
                    account: "0.0.34100425",
                    privateKey: "06bd0453347618988f1e1c60bd3e57892a4b8603969827d65b1a87d13b463d70",
                    isED25519Type: true,
                    alias: ""
                });
                console.log(wallet);
            }, function (error) {
                return error.reason === "privateKey/alias mismatch";
            });
        });
        it("fails on mnemonic/address mismatch", function () {
            assert_1.default.throws(function () {
                var wallet = new hethers_1.hethers.Wallet({
                    account: "0.0.34100425",
                    privateKey: "06bd0453347618988f1e1c60bd3e57892a4b8603969827d65b1a87d13b463d70",
                    isED25519Type: true,
                    mnemonic: {
                        phrase: "pact grief smile usage kind pledge river excess garbage mixed olive receive"
                    }
                });
                console.log(wallet);
            }, function (error) {
                return error.reason === "mnemonic/privateKey mismatch";
            });
        });
    });
    describe("Wallet Errors", function () {
        it("fails on privateKey/address mismatch", function () {
            assert_1.default.throws(function () {
                var wallet = new hethers_1.hethers.Wallet({
                    privateKey: "0x6a73cd9b03647e83ef937888a5258a26e4c766dbf41ddd974f15e32d09cfe9c0",
                    alias: "0.0.BLZ906RnM9t5+nzS4Cq8wkLA1uWU3tvKa+7wIqznr6zvkrdJYX+bwkUOdj/yfkp5gSrjxw/Jy7Hm7NsXWs0vRsg="
                });
                console.log(wallet);
            }, function (error) {
                return error.reason === "privateKey/alias mismatch";
            });
        });
        it("fails on mnemonic/address mismatch", function () {
            assert_1.default.throws(function () {
                var wallet = new hethers_1.hethers.Wallet({
                    privateKey: "0x6a73cd9b03647e83ef937888a5258a26e4c766dbf41ddd974f15e32d09cfe9c0",
                    mnemonic: {
                        phrase: "pact grief smile usage kind pledge river excess garbage mixed olive receive"
                    }
                });
                console.log(wallet);
            }, function (error) {
                return error.reason === "mnemonic/privateKey mismatch";
            });
        });
        // it("fails on from mismatch", function() {
        //     const wallet = new hethers.Wallet("0x6a73cd9b03647e83ef937888a5258a26e4c766dbf41ddd974f15e32d09cfe9c0");
        //     return new Promise(async (resolve, reject) => {
        //         try {
        //             await wallet.signTransaction({
        //                 from: "0x3f4f037dfc910a3517b9a5b23cf036ffae01a5a7"
        //             });
        //         } catch (error) {
        //             if (error.code === hethers.utils.Logger.errors.INVALID_ARGUMENT && error.argument === "transaction.from") {
        //                 resolve(true);
        //                 return;
        //             }
        //         }
        //
        //         reject(new Error("assert failed; did not throw"));
        //     });
        // });
    });
    describe("Wallet(ED25519) tx signing", function () {
        it("Should transfer funds between accounts", function () {
            return __awaiter(this, void 0, void 0, function () {
                var localWalletECDSA2, edBalanceBefore, ecBalanceBefore, tx, edBalanceAfter, ecBalanceAfter;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            localWalletECDSA2 = utils.getWallets().local.ecdsa[1];
                            return [4 /*yield*/, localWalletED25519.getBalance()];
                        case 1:
                            edBalanceBefore = (_a.sent());
                            return [4 /*yield*/, localWalletECDSA2.getBalance()];
                        case 2:
                            ecBalanceBefore = (_a.sent());
                            return [4 /*yield*/, localWalletED25519.sendTransaction({
                                    to: localWalletECDSA2.account,
                                    value: 1000,
                                })];
                        case 3:
                            tx = _a.sent();
                            return [4 /*yield*/, tx.wait()];
                        case 4:
                            _a.sent();
                            return [4 /*yield*/, localWalletED25519.getBalance()];
                        case 5:
                            edBalanceAfter = (_a.sent());
                            return [4 /*yield*/, localWalletECDSA2.getBalance()];
                        case 6:
                            ecBalanceAfter = (_a.sent());
                            assert_1.default.strictEqual(edBalanceBefore.gt(edBalanceAfter), true);
                            assert_1.default.strictEqual(ecBalanceBefore.lt(ecBalanceAfter), true);
                            assert_1.default.strictEqual(ecBalanceAfter.sub(ecBalanceBefore).toNumber(), 1000);
                            return [2 /*return*/];
                    }
                });
            });
        }).timeout(90000);
        it("Should sign ContractCall", function () {
            return __awaiter(this, void 0, void 0, function () {
                var data, tx, signed, fromBytes, cc;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            data = Buffer.from("\"abi\":{},\"values\":{}").toString('hex');
                            tx = {
                                to: hethers_1.hethers.utils.getAddressFromAccount("0.0.98"),
                                from: localWalletED25519.address,
                                data: '0x' + data,
                                gasLimit: 100000
                            };
                            return [4 /*yield*/, localWalletED25519.signTransaction(tx)];
                        case 1:
                            signed = _a.sent();
                            assert_1.default.ok(signed !== "", "Unexpected nil signed tx");
                            fromBytes = sdk_1.Transaction.fromBytes(hethers_1.hethers.utils.arrayify(signed));
                            cc = fromBytes;
                            assert_1.default.ok(cc.gas.toNumber() === tx.gasLimit, "Gas mismatch");
                            return [2 /*return*/];
                    }
                });
            });
        });
        it("Should sign ContractCreate", function () {
            return __awaiter(this, void 0, void 0, function () {
                var tx, signed, fromBytes, cc;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tx = {
                                from: localWalletED25519.address,
                                gasLimit: 10000,
                                customData: {
                                    bytecodeFileId: "0.0.122121"
                                }
                            };
                            return [4 /*yield*/, localWalletED25519.signTransaction(tx)];
                        case 1:
                            signed = _a.sent();
                            assert_1.default.ok(signed !== "", "Unexpected nil signed tx");
                            fromBytes = sdk_1.Transaction.fromBytes(hethers_1.hethers.utils.arrayify(signed));
                            cc = fromBytes;
                            assert_1.default.ok(cc.gas.toNumber() === tx.gasLimit, "Gas mismatch");
                            return [2 /*return*/];
                    }
                });
            });
        });
        it("Should sign FileCreate", function () {
            return __awaiter(this, void 0, void 0, function () {
                var tx, signed, fromBytes, fc;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tx = {
                                from: localWalletED25519.address,
                                gasLimit: 10000,
                                customData: {
                                    fileChunk: "Hello world! I will definitely break your smart contract experience",
                                    fileKey: sdk_1.PublicKey.fromString("302a300506032b6570032100cd1c5cd43b103bc5b30dd38d421a6a32386377b99d0d1b438359a72dc525bde1")
                                }
                            };
                            return [4 /*yield*/, localWalletED25519.signTransaction(tx)];
                        case 1:
                            signed = _a.sent();
                            assert_1.default.ok(signed !== "", "Unexpected nil signed tx");
                            fromBytes = sdk_1.Transaction.fromBytes(hethers_1.hethers.utils.arrayify(signed));
                            fc = fromBytes;
                            assert_1.default.ok(Buffer.from(fc.contents).toString() == tx.customData.fileChunk, "Contents mismatch");
                            return [2 /*return*/];
                    }
                });
            });
        });
        it("Should sign FileAppend", function () {
            return __awaiter(this, void 0, void 0, function () {
                var tx, signed, fromBytes, fa;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tx = {
                                from: localWalletED25519.address,
                                gasLimit: 10000,
                                customData: {
                                    fileChunk: "Hello world! I will definitely break your smart contract experience",
                                    fileId: "0.0.12212"
                                }
                            };
                            return [4 /*yield*/, localWalletED25519.signTransaction(tx)];
                        case 1:
                            signed = _a.sent();
                            assert_1.default.ok(signed !== "", "Unexpected nil signed tx");
                            fromBytes = sdk_1.Transaction.fromBytes(hethers_1.hethers.utils.arrayify(signed));
                            fa = fromBytes;
                            assert_1.default.ok(Buffer.from(fa.contents).toString() == tx.customData.fileChunk, "Contents mismatch");
                            assert_1.default.ok(fa.fileId.toString() == tx.customData.fileId, "FileId mismatch");
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    describe("Wallet tx signing", function () {
        it("Should sign ContractCall", function () {
            return __awaiter(this, void 0, void 0, function () {
                var data, tx, signed, fromBytes, cc;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            data = Buffer.from("\"abi\":{},\"values\":{}").toString('hex');
                            tx = {
                                to: hethers_1.hethers.utils.getAddressFromAccount("0.0.98"),
                                from: localWalletECDSA.address,
                                data: '0x' + data,
                                gasLimit: 100000
                            };
                            return [4 /*yield*/, localWalletECDSA.signTransaction(tx)];
                        case 1:
                            signed = _a.sent();
                            assert_1.default.ok(signed !== "", "Unexpected nil signed tx");
                            fromBytes = sdk_1.Transaction.fromBytes(hethers_1.hethers.utils.arrayify(signed));
                            cc = fromBytes;
                            assert_1.default.ok(cc.gas.toNumber() === tx.gasLimit, "Gas mismatch");
                            return [2 /*return*/];
                    }
                });
            });
        });
        it("Should sign ContractCreate", function () {
            return __awaiter(this, void 0, void 0, function () {
                var tx, signed, fromBytes, cc;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tx = {
                                from: localWalletECDSA.address,
                                gasLimit: 10000,
                                customData: {
                                    bytecodeFileId: "0.0.122121"
                                }
                            };
                            return [4 /*yield*/, localWalletECDSA.signTransaction(tx)];
                        case 1:
                            signed = _a.sent();
                            assert_1.default.ok(signed !== "", "Unexpected nil signed tx");
                            fromBytes = sdk_1.Transaction.fromBytes(hethers_1.hethers.utils.arrayify(signed));
                            cc = fromBytes;
                            assert_1.default.ok(cc.gas.toNumber() === tx.gasLimit, "Gas mismatch");
                            return [2 /*return*/];
                    }
                });
            });
        });
        it("Should sign FileCreate", function () {
            return __awaiter(this, void 0, void 0, function () {
                var tx, signed, fromBytes, fc;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tx = {
                                from: localWalletECDSA.address,
                                gasLimit: 10000,
                                customData: {
                                    fileChunk: "Hello world! I will definitely break your smart contract experience",
                                    fileKey: sdk_1.PublicKey.fromString("302a300506032b65700321004aed2e9e0cb6cbcd12b58476a2c39875d27e2a856444173830cc1618d32ca2f0")
                                }
                            };
                            return [4 /*yield*/, localWalletECDSA.signTransaction(tx)];
                        case 1:
                            signed = _a.sent();
                            assert_1.default.ok(signed !== "", "Unexpected nil signed tx");
                            fromBytes = sdk_1.Transaction.fromBytes(hethers_1.hethers.utils.arrayify(signed));
                            fc = fromBytes;
                            assert_1.default.ok(Buffer.from(fc.contents).toString() == tx.customData.fileChunk, "Contents mismatch");
                            return [2 /*return*/];
                    }
                });
            });
        });
        it("Should sign FileAppend", function () {
            return __awaiter(this, void 0, void 0, function () {
                var tx, signed, fromBytes, fa;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            tx = {
                                from: localWalletECDSA.address,
                                gasLimit: 10000,
                                customData: {
                                    fileChunk: "Hello world! I will definitely break your smart contract experience",
                                    fileId: "0.0.12212"
                                }
                            };
                            return [4 /*yield*/, localWalletECDSA.signTransaction(tx)];
                        case 1:
                            signed = _a.sent();
                            assert_1.default.ok(signed !== "", "Unexpected nil signed tx");
                            fromBytes = sdk_1.Transaction.fromBytes(hethers_1.hethers.utils.arrayify(signed));
                            fa = fromBytes;
                            assert_1.default.ok(Buffer.from(fa.contents).toString() == tx.customData.fileChunk, "Contents mismatch");
                            assert_1.default.ok(fa.fileId.toString() == tx.customData.fileId, "FileId mismatch");
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    describe("Wallet getters", function () {
        it("Should get proper mainnet chainId", function () {
            return __awaiter(this, void 0, void 0, function () {
                var provider, wallet, chainId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            provider = hethers_1.hethers.providers.getDefaultProvider("mainnet");
                            wallet = hethers_1.hethers.Wallet.createRandom().connect(provider);
                            return [4 /*yield*/, wallet.getChainId()];
                        case 1:
                            chainId = _a.sent();
                            assert_1.default.strictEqual(chainId, 295);
                            return [2 /*return*/];
                    }
                });
            });
        });
        it("Should get proper testnet chainId", function () {
            return __awaiter(this, void 0, void 0, function () {
                var provider, wallet, chainId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            provider = hethers_1.hethers.providers.getDefaultProvider("testnet");
                            wallet = hethers_1.hethers.Wallet.createRandom().connect(provider);
                            return [4 /*yield*/, wallet.getChainId()];
                        case 1:
                            chainId = _a.sent();
                            assert_1.default.strictEqual(chainId, 296);
                            return [2 /*return*/];
                    }
                });
            });
        });
        it("Should get proper previewnet chainId", function () {
            return __awaiter(this, void 0, void 0, function () {
                var provider, wallet, chainId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            provider = hethers_1.hethers.providers.getDefaultProvider("previewnet");
                            wallet = hethers_1.hethers.Wallet.createRandom().connect(provider);
                            return [4 /*yield*/, wallet.getChainId()];
                        case 1:
                            chainId = _a.sent();
                            assert_1.default.strictEqual(chainId, 297);
                            return [2 /*return*/];
                    }
                });
            });
        });
        it("Should get proper local chainId", function () {
            return __awaiter(this, void 0, void 0, function () {
                var provider, wallet, chainId;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            provider = hethers_1.hethers.providers.getDefaultProvider("local");
                            wallet = hethers_1.hethers.Wallet.createRandom().connect(provider);
                            return [4 /*yield*/, wallet.getChainId()];
                        case 1:
                            chainId = _a.sent();
                            assert_1.default.strictEqual(chainId, 298);
                            return [2 /*return*/];
                    }
                });
            });
        });
    });
    describe("Wallet local calls", function () {
        return __awaiter(this, void 0, void 0, function () {
            var contractAddr, contract, balanceOfParams;
            return __generator(this, function (_a) {
                contractAddr = '0000000000000000000000000000000001b34cbb';
                contract = hethers_1.hethers.ContractFactory.getContract(contractAddr, abi, testnetWalletECDSA);
                balanceOfParams = contract.interface.encodeFunctionData('balanceOf', [testnetWalletECDSA.getAddress()]);
                // skipped - no balance in account
                xit("Should be able to perform local call", function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var balanceOfTx, response;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    balanceOfTx = {
                                        to: contractAddr,
                                        gasLimit: 30000,
                                        data: hethers_1.hethers.utils.arrayify(balanceOfParams),
                                    };
                                    return [4 /*yield*/, testnetWalletECDSA.call(balanceOfTx)];
                                case 1:
                                    response = _a.sent();
                                    assert_1.default.notStrictEqual(response, null);
                                    return [2 /*return*/];
                            }
                        });
                    });
                });
                // skipped - no balance in account
                xit('should fail on contract revert', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var balanceOfTx, err_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.timeout(60000);
                                    balanceOfTx = {
                                        to: contractAddr,
                                        gasLimit: 50000,
                                        data: "0x",
                                        nodeId: "0.0.3"
                                    };
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, testnetWalletECDSA.call(balanceOfTx)];
                                case 2:
                                    _a.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    err_1 = _a.sent();
                                    assert_1.default.strictEqual(err_1.code, hethers_1.hethers.utils.Logger.errors.UNPREDICTABLE_GAS_LIMIT);
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    });
                });
                it('should fail on insufficient gas', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var balanceOfTx, err_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.timeout(60000);
                                    balanceOfTx = {
                                        to: contractAddr,
                                        gasLimit: 100,
                                        data: hethers_1.hethers.utils.arrayify(balanceOfParams),
                                        nodeId: "0.0.3"
                                    };
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, testnetWalletECDSA.call(balanceOfTx)];
                                case 2:
                                    _a.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    err_2 = _a.sent();
                                    assert_1.default.strictEqual(err_2.code, hethers_1.hethers.utils.Logger.errors.INSUFFICIENT_FUNDS);
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    });
                });
                it('should fail on invalid contract', function () {
                    return __awaiter(this, void 0, void 0, function () {
                        var balanceOfTx, err_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    this.timeout(60000);
                                    balanceOfTx = {
                                        // incorrect addr
                                        to: 'z000000000000000000000000000000001b34cbb',
                                        gasLimit: 30000,
                                        data: hethers_1.hethers.utils.arrayify(balanceOfParams),
                                        nodeId: "0.0.3"
                                    };
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, testnetWalletECDSA.call(balanceOfTx)];
                                case 2:
                                    _a.sent();
                                    return [3 /*break*/, 4];
                                case 3:
                                    err_3 = _a.sent();
                                    assert_1.default.strictEqual(err_3.code, hethers_1.hethers.utils.Logger.errors.INVALID_ARGUMENT);
                                    return [3 /*break*/, 4];
                                case 4: return [2 /*return*/];
                            }
                        });
                    });
                });
                return [2 /*return*/];
            });
        });
    });
    describe("Wallet createAccount(ED25519)", function () {
        var _this = this;
        var newAccount, newAccountPublicKey;
        var timeout = 90000;
        beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                newAccount = hethers_1.hethers.Wallet.createRandom({ isED25519Type: true });
                newAccountPublicKey = newAccount._signingKey().compressedPublicKey;
                return [2 /*return*/];
            });
        }); });
        it("Should create an account", function () {
            return __awaiter(this, void 0, void 0, function () {
                var tx;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, localWalletED25519.createAccount(newAccountPublicKey)];
                        case 1:
                            tx = _a.sent();
                            assert_1.default.ok(tx, 'tx exists');
                            assert_1.default.ok(tx.customData, 'tx.customData exists');
                            assert_1.default.ok(tx.customData.accountId, 'accountId exists');
                            assert_1.default.strictEqual(newAccount.isED25519Type, true);
                            return [2 /*return*/];
                    }
                });
            });
        }).timeout(timeout);
        it("Should add initial balance if provided", function () {
            return __awaiter(this, void 0, void 0, function () {
                var tx, newAccountAddress, newAccBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, localWalletED25519.createAccount(newAccountPublicKey, BigInt(123))];
                        case 1:
                            tx = _a.sent();
                            assert_1.default.ok(tx, 'tx exists');
                            assert_1.default.ok(tx.customData, 'tx.customData exists');
                            assert_1.default.ok(tx.customData.accountId, 'accountId exists');
                            newAccountAddress = hethers_1.hethers.utils.getAddressFromAccount(tx.customData.accountId.toString());
                            return [4 /*yield*/, localProvider.getBalance(newAccountAddress)];
                        case 2:
                            newAccBalance = _a.sent();
                            assert_1.default.strictEqual(BigInt(123).toString(), newAccBalance.toString(), 'The initial balance is correct');
                            return [2 /*return*/];
                    }
                });
            });
        }).timeout(timeout);
        it("Transaction receipt contains the account address", function () {
            return __awaiter(this, void 0, void 0, function () {
                var tx, receipt;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, localWalletED25519.createAccount(newAccountPublicKey, BigInt(123))];
                        case 1:
                            tx = _a.sent();
                            assert_1.default.notStrictEqual(tx, null, 'tx exists');
                            assert_1.default.notStrictEqual(tx.customData, null, 'tx.customData exists');
                            assert_1.default.notStrictEqual(tx.customData.accountId, null, 'accountId exists');
                            assert_1.default.strictEqual(tx.value.toString(), BigInt(123).toString(), 'InitialBalance is the same as tx.value');
                            return [4 /*yield*/, tx.wait()];
                        case 2:
                            receipt = _a.sent();
                            assert_1.default.notStrictEqual(receipt.accountAddress, null, "accountAddress exists");
                            assert_1.default.notStrictEqual(receipt.transactionId, null, "transactionId exists");
                            assert_1.default.ok(receipt.accountAddress.match(new RegExp(/^0x/)), "accountAddress has the correct format");
                            return [2 /*return*/];
                    }
                });
            });
        }).timeout(timeout);
        it("Should transfer funds to new account", function () {
            return __awaiter(this, void 0, void 0, function () {
                var clientAccountId, newWallet, newWalletBalanceBefore, oldWalletBalanceBefore, tx, newWalletBalanceAfter, oldWalletBalanceAfter;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, localWalletED25519.createAccount(newAccountPublicKey)];
                        case 1:
                            clientAccountId = (_a.sent()).customData.accountId;
                            newWallet = newAccount.connect(localProvider).connectAccount(clientAccountId.toString());
                            return [4 /*yield*/, newWallet.getBalance()];
                        case 2:
                            newWalletBalanceBefore = (_a.sent());
                            return [4 /*yield*/, localWalletED25519.getBalance()];
                        case 3:
                            oldWalletBalanceBefore = (_a.sent());
                            return [4 /*yield*/, localWalletED25519.sendTransaction({
                                    to: newWallet.account,
                                    value: 1000,
                                })];
                        case 4:
                            tx = _a.sent();
                            return [4 /*yield*/, tx.wait()];
                        case 5:
                            _a.sent();
                            return [4 /*yield*/, newWallet.getBalance()];
                        case 6:
                            newWalletBalanceAfter = (_a.sent());
                            return [4 /*yield*/, localWalletED25519.getBalance()];
                        case 7:
                            oldWalletBalanceAfter = (_a.sent());
                            assert_1.default.strictEqual(newWalletBalanceBefore.lt(newWalletBalanceAfter), true);
                            assert_1.default.strictEqual(oldWalletBalanceBefore.gt(oldWalletBalanceAfter), true);
                            assert_1.default.strictEqual(newWalletBalanceAfter.sub(newWalletBalanceBefore).toNumber(), 1000);
                            return [2 /*return*/];
                    }
                });
            });
        }).timeout(timeout);
        it("Should transfer funds from newly created account", function () {
            return __awaiter(this, void 0, void 0, function () {
                var clientAccountId, newWallet, tx1, newWalletBalanceBefore, oldWalletBalanceBefore, tx2, newWalletBalanceAfter, oldWalletBalanceAfter;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, localWalletED25519.createAccount(newAccountPublicKey)];
                        case 1:
                            clientAccountId = (_a.sent()).customData.accountId;
                            newWallet = newAccount.connect(localProvider).connectAccount(clientAccountId.toString());
                            return [4 /*yield*/, localWalletED25519.sendTransaction({
                                    to: newWallet.address,
                                    value: 100000,
                                })];
                        case 2:
                            tx1 = _a.sent();
                            return [4 /*yield*/, tx1.wait()];
                        case 3:
                            _a.sent();
                            return [4 /*yield*/, newWallet.getBalance()];
                        case 4:
                            newWalletBalanceBefore = (_a.sent());
                            return [4 /*yield*/, localWalletED25519.getBalance()];
                        case 5:
                            oldWalletBalanceBefore = (_a.sent());
                            return [4 /*yield*/, newWallet.sendTransaction({
                                    to: localWalletED25519.account,
                                    value: 1000,
                                })];
                        case 6:
                            tx2 = _a.sent();
                            return [4 /*yield*/, tx2.wait()];
                        case 7:
                            _a.sent();
                            return [4 /*yield*/, newWallet.getBalance()];
                        case 8:
                            newWalletBalanceAfter = (_a.sent());
                            return [4 /*yield*/, localWalletED25519.getBalance()];
                        case 9:
                            oldWalletBalanceAfter = (_a.sent());
                            assert_1.default.strictEqual(newWalletBalanceBefore.gt(newWalletBalanceAfter), true);
                            assert_1.default.strictEqual(oldWalletBalanceBefore.lt(oldWalletBalanceAfter), true);
                            assert_1.default.strictEqual(oldWalletBalanceAfter.sub(oldWalletBalanceBefore).toNumber(), 1000);
                            return [2 /*return*/];
                    }
                });
            });
        }).timeout(timeout);
        it("Should throw an exception if provider is not set", function () {
            return __awaiter(this, void 0, void 0, function () {
                var exceptionThrown, errorReason, clientAccountId, newWallet, e_2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            exceptionThrown = false;
                            errorReason = null;
                            return [4 /*yield*/, localWalletED25519.createAccount(newAccountPublicKey)];
                        case 1:
                            clientAccountId = (_a.sent()).customData.accountId;
                            newWallet = newAccount.connectAccount(clientAccountId.toString());
                            _a.label = 2;
                        case 2:
                            _a.trys.push([2, 4, , 5]);
                            return [4 /*yield*/, newWallet.sendTransaction({
                                    to: localWalletED25519.account,
                                    value: 1
                                })];
                        case 3:
                            _a.sent();
                            return [3 /*break*/, 5];
                        case 4:
                            e_2 = _a.sent();
                            errorReason = e_2.reason;
                            exceptionThrown = true;
                            return [3 /*break*/, 5];
                        case 5:
                            assert_1.default.strictEqual(errorReason, 'missing provider');
                            assert_1.default.strictEqual(exceptionThrown, true);
                            return [2 /*return*/];
                    }
                });
            });
        }).timeout(timeout);
    });
    describe("Wallet createAccount", function () {
        var _this = this;
        this.retries(3);
        var newAccount, newAccountPublicKey, acc1Wallet, acc2Wallet;
        var timeout = 120000;
        before(function () {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    this.timeout(timeout);
                    acc1Wallet = utils.getWallets().local.ecdsa[1];
                    acc2Wallet = utils.getWallets().local.ecdsa[2];
                    return [2 /*return*/];
                });
            });
        });
        beforeEach(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                newAccount = hethers_1.hethers.Wallet.createRandom();
                newAccountPublicKey = newAccount._signingKey().compressedPublicKey;
                return [2 /*return*/];
            });
        }); });
        it("Should create an account", function () {
            return __awaiter(this, void 0, void 0, function () {
                var tx;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, localWalletECDSA.createAccount(newAccountPublicKey)];
                        case 1:
                            tx = _a.sent();
                            assert_1.default.ok(tx, 'tx exists');
                            assert_1.default.ok(tx.customData, 'tx.customData exists');
                            assert_1.default.ok(tx.customData.accountId, 'accountId exists');
                            return [2 /*return*/];
                    }
                });
            });
        }).timeout(timeout);
        it("Should add initial balance if provided", function () {
            return __awaiter(this, void 0, void 0, function () {
                var tx, newAccountAddress, newAccBalance;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, localWalletECDSA.createAccount(newAccountPublicKey, BigInt(123))];
                        case 1:
                            tx = _a.sent();
                            assert_1.default.ok(tx, 'tx exists');
                            assert_1.default.ok(tx.customData, 'tx.customData exists');
                            assert_1.default.ok(tx.customData.accountId, 'accountId exists');
                            newAccountAddress = hethers_1.hethers.utils.getAddressFromAccount(tx.customData.accountId.toString());
                            return [4 /*yield*/, localProvider.getBalance(newAccountAddress)];
                        case 2:
                            newAccBalance = _a.sent();
                            assert_1.default.strictEqual(BigInt(123).toString(), newAccBalance.toString(), 'The initial balance is correct');
                            return [2 /*return*/];
                    }
                });
            });
        }).timeout(timeout);
        it("Transaction receipt contains the account address", function () {
            return __awaiter(this, void 0, void 0, function () {
                var tx, receipt;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, localWalletECDSA.createAccount(newAccountPublicKey, BigInt(123))];
                        case 1:
                            tx = _a.sent();
                            assert_1.default.notStrictEqual(tx, null, 'tx exists');
                            assert_1.default.notStrictEqual(tx.customData, null, 'tx.customData exists');
                            assert_1.default.notStrictEqual(tx.customData.accountId, null, 'accountId exists');
                            assert_1.default.strictEqual(tx.value.toString(), BigInt(123).toString(), 'InitialBalance is the same as tx.value');
                            return [4 /*yield*/, tx.wait()];
                        case 2:
                            receipt = _a.sent();
                            assert_1.default.notStrictEqual(receipt.accountAddress, null, "accountAddress exists");
                            assert_1.default.notStrictEqual(receipt.transactionId, null, "transactionId exists");
                            assert_1.default.ok(receipt.accountAddress.match(new RegExp(/^0x/)), "accountAddress has the correct format");
                            return [2 /*return*/];
                    }
                });
            });
        }).timeout(timeout);
        it("Should transfer funds between accounts", function () {
            return __awaiter(this, void 0, void 0, function () {
                var acc1BalanceBefore, acc2BalanceBefore, tx, acc1BalanceAfter, acc2BalanceAfter;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, acc1Wallet.getBalance()];
                        case 1:
                            acc1BalanceBefore = (_a.sent()).toNumber();
                            return [4 /*yield*/, acc2Wallet.getBalance()];
                        case 2:
                            acc2BalanceBefore = (_a.sent()).toNumber();
                            return [4 /*yield*/, acc1Wallet.sendTransaction({
                                    to: acc2Wallet.account,
                                    value: 1000,
                                })];
                        case 3:
                            tx = _a.sent();
                            return [4 /*yield*/, tx.wait()];
                        case 4:
                            _a.sent();
                            return [4 /*yield*/, acc1Wallet.getBalance()];
                        case 5:
                            acc1BalanceAfter = (_a.sent()).toNumber();
                            return [4 /*yield*/, acc2Wallet.getBalance()];
                        case 6:
                            acc2BalanceAfter = (_a.sent()).toNumber();
                            assert_1.default.strictEqual(acc1BalanceBefore > acc1BalanceAfter, true);
                            assert_1.default.strictEqual(acc2BalanceBefore < acc2BalanceAfter, true);
                            assert_1.default.strictEqual(acc2BalanceAfter - acc2BalanceBefore, 1000);
                            return [2 /*return*/];
                    }
                });
            });
        }).timeout(timeout);
        it("Should throw an error for crypto transfer with data field", function () {
            return __awaiter(this, void 0, void 0, function () {
                var exceptionThrown, errorReason, e_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            exceptionThrown = false;
                            errorReason = null;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, acc1Wallet.sendTransaction({
                                    to: acc2Wallet.account,
                                    value: 1,
                                    data: '0x'
                                })];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_3 = _a.sent();
                            errorReason = e_3.reason;
                            exceptionThrown = true;
                            return [3 /*break*/, 4];
                        case 4:
                            assert_1.default.strictEqual(errorReason, 'gasLimit is not provided. Cannot execute a Contract Call');
                            assert_1.default.strictEqual(exceptionThrown, true);
                            return [2 /*return*/];
                    }
                });
            });
        }).timeout(timeout);
        it("Should throw an error for crypto transfer with gasLimit field", function () {
            return __awaiter(this, void 0, void 0, function () {
                var exceptionThrown, errorReason, e_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            exceptionThrown = false;
                            errorReason = null;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, acc1Wallet.sendTransaction({
                                    to: acc2Wallet.account,
                                    value: 1,
                                    gasLimit: 300000
                                })];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_4 = _a.sent();
                            errorReason = e_4.reason;
                            exceptionThrown = true;
                            return [3 /*break*/, 4];
                        case 4:
                            assert_1.default.strictEqual(errorReason, 'receiver is an account. Cannot execute a Contract Call');
                            assert_1.default.strictEqual(exceptionThrown, true);
                            return [2 /*return*/];
                    }
                });
            });
        }).timeout(timeout);
        it("Should throw an error for crypto transfer with missing to field", function () {
            return __awaiter(this, void 0, void 0, function () {
                var exceptionThrown, errorCode, e_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            exceptionThrown = false;
                            errorCode = null;
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, acc1Wallet.signTransaction({
                                    value: 1,
                                })];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_5 = _a.sent();
                            errorCode = e_5.code;
                            exceptionThrown = true;
                            return [3 /*break*/, 4];
                        case 4:
                            assert_1.default.strictEqual(errorCode, 'UNPREDICTABLE_GAS_LIMIT');
                            assert_1.default.strictEqual(exceptionThrown, true);
                            return [2 /*return*/];
                    }
                });
            });
        }).timeout(timeout);
        it("Should make a contract call with 'to' and 'value' with provided contract address as 'to'", function () {
            return __awaiter(this, void 0, void 0, function () {
                var bytecodeTokenWithArgs, contractFactory, contract, exceptionThrown, e_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            bytecodeTokenWithArgs = (0, fs_1.readFileSync)('packages/tests/contracts/TokenWithArgs.bin').toString();
                            contractFactory = new hethers_1.hethers.ContractFactory(abiTokenWithArgs, bytecodeTokenWithArgs, acc1Wallet);
                            return [4 /*yield*/, contractFactory.deploy(hethers_1.hethers.BigNumber.from('10000'), { gasLimit: 3000000 })];
                        case 1:
                            contract = _a.sent();
                            return [4 /*yield*/, contract.deployed()];
                        case 2:
                            _a.sent();
                            exceptionThrown = false;
                            _a.label = 3;
                        case 3:
                            _a.trys.push([3, 5, , 6]);
                            return [4 /*yield*/, acc1Wallet.sendTransaction({
                                    to: contract.address,
                                    value: 1,
                                })];
                        case 4:
                            _a.sent();
                            return [3 /*break*/, 6];
                        case 5:
                            e_6 = _a.sent();
                            exceptionThrown = true;
                            return [3 /*break*/, 6];
                        case 6:
                            assert_1.default.strictEqual(exceptionThrown, false);
                            return [2 /*return*/];
                    }
                });
            });
        }).timeout(180000);
        it("Should throw an exception if provider is not set", function () {
            return __awaiter(this, void 0, void 0, function () {
                var exceptionThrown, errorReason, acc1WalletWithoutProvider, e_7;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            exceptionThrown = false;
                            errorReason = null;
                            acc1WalletWithoutProvider = new hethers_1.hethers.Wallet(utils.getAccounts().local.ecdsa[0]);
                            _a.label = 1;
                        case 1:
                            _a.trys.push([1, 3, , 4]);
                            return [4 /*yield*/, acc1WalletWithoutProvider.sendTransaction({
                                    to: acc2Wallet.account,
                                    value: 1
                                })];
                        case 2:
                            _a.sent();
                            return [3 /*break*/, 4];
                        case 3:
                            e_7 = _a.sent();
                            errorReason = e_7.reason;
                            exceptionThrown = true;
                            return [3 /*break*/, 4];
                        case 4:
                            assert_1.default.strictEqual(errorReason, 'missing provider');
                            assert_1.default.strictEqual(exceptionThrown, true);
                            return [2 /*return*/];
                    }
                });
            });
        }).timeout(timeout);
        it("Should be able to get a crypto transfer transaction via provider.getTransaction(tx.transactionId)", function () {
            return __awaiter(this, void 0, void 0, function () {
                var transaction, tx;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0: return [4 /*yield*/, acc1Wallet.sendTransaction({
                                to: acc2Wallet.account,
                                value: 18925
                            })];
                        case 1:
                            transaction = _a.sent();
                            return [4 /*yield*/, transaction.wait()];
                        case 2:
                            _a.sent();
                            return [4 /*yield*/, localProvider.getTransaction(transaction.transactionId)];
                        case 3:
                            tx = _a.sent();
                            assert_1.default.strictEqual(tx.hasOwnProperty('chainId'), true);
                            assert_1.default.strictEqual(tx.hasOwnProperty('hash'), true);
                            assert_1.default.strictEqual(tx.hasOwnProperty('timestamp'), true);
                            assert_1.default.strictEqual(tx.hasOwnProperty('transactionId'), true);
                            assert_1.default.strictEqual(tx.hasOwnProperty('from'), true);
                            assert_1.default.strictEqual(tx.hasOwnProperty('to'), true);
                            assert_1.default.strictEqual(tx.hasOwnProperty('data'), true);
                            assert_1.default.strictEqual(tx.hasOwnProperty('gasLimit'), true);
                            assert_1.default.strictEqual(tx.hasOwnProperty('value'), true);
                            assert_1.default.strictEqual(tx.hasOwnProperty('customData'), true);
                            assert_1.default.strictEqual(tx.customData.hasOwnProperty('result'), true);
                            assert_1.default.strictEqual(tx.customData.result, 'SUCCESS');
                            assert_1.default.strictEqual(tx.from, acc1Wallet.account);
                            assert_1.default.strictEqual(tx.to, acc2Wallet.account);
                            assert_1.default.strictEqual(tx.value.toString(), '18925');
                            return [2 /*return*/];
                    }
                });
            });
        }).timeout(timeout);
    });
});
//# sourceMappingURL=test-wallet.spec.js.map