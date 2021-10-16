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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var assert_1 = __importDefault(require("assert"));
var ethers_1 = require("ethers");
var testcases_1 = require("@ethersproject/testcases");
var utils = __importStar(require("./utils"));
describe('Test JSON Wallets', function () {
    var tests = (0, testcases_1.loadTests)('wallets');
    tests.forEach(function (test) {
        it(('decrypts wallet - ' + test.name), function () {
            return __awaiter(this, void 0, void 0, function () {
                var wallet, walletAddress, provider, walletConnected, wallet2, wallet2;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.timeout(1200000);
                            if (test.hasAddress) {
                                assert_1.default.ok((ethers_1.ethers.utils.getJsonWalletAddress(test.json) !== null), 'detect encrypted JSON wallet');
                            }
                            return [4 /*yield*/, ethers_1.ethers.Wallet.fromEncryptedJson(test.json, test.password)];
                        case 1:
                            wallet = _a.sent();
                            assert_1.default.equal(wallet.privateKey, test.privateKey, 'generated correct private key - ' + wallet.privateKey);
                            assert_1.default.equal(wallet.address.toLowerCase(), test.address, 'generate correct address - ' + wallet.address);
                            assert_1.default.equal(wallet.address.toLowerCase(), test.address, 'generate correct address - ' + wallet.address);
                            return [4 /*yield*/, wallet.getAddress()];
                        case 2:
                            walletAddress = _a.sent();
                            assert_1.default.equal(walletAddress.toLowerCase(), test.address, 'generate correct address - ' + wallet.address);
                            // Test connect
                            {
                                provider = new ethers_1.ethers.providers.EtherscanProvider();
                                walletConnected = wallet.connect(provider);
                                assert_1.default.equal(walletConnected.provider, provider, "provider is connected");
                                assert_1.default.ok((wallet.provider == null), "original wallet provider is null");
                                assert_1.default.equal(walletConnected.address.toLowerCase(), test.address, "connected correct address - " + wallet.address);
                            }
                            // Make sure it can accept a SigningKey
                            {
                                wallet2 = new ethers_1.ethers.Wallet(wallet._signingKey());
                                assert_1.default.equal(wallet2.privateKey, test.privateKey, 'generated correct private key - ' + wallet2.privateKey);
                            }
                            // Test the sync decryption (this wallet is light, so it is safe)
                            if (test.name === "life") {
                                wallet2 = ethers_1.ethers.Wallet.fromEncryptedJsonSync(test.json, test.password);
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
    ['one', 'two', 'three'].forEach(function (i) {
        var password = 'foobar' + i;
        var wallet = ethers_1.ethers.Wallet.createRandom({ path: "m/56'/82", extraEntropy: utils.randomHexString('test-' + i, 32) });
        it('encrypts and decrypts a random wallet - ' + i, function () {
            this.timeout(1200000);
            return wallet.encrypt(password).then(function (json) {
                return ethers_1.ethers.Wallet.fromEncryptedJson(json, password).then(function (decryptedWallet) {
                    assert_1.default.equal(decryptedWallet.address, wallet.address, 'decrypted wallet - ' + wallet.privateKey);
                    assert_1.default.equal(decryptedWallet.mnemonic.phrase, wallet.mnemonic.phrase, "decrypted wallet mnemonic - " + wallet.privateKey);
                    assert_1.default.equal(decryptedWallet.mnemonic.path, wallet.mnemonic.path, "decrypted wallet path - " + wallet.privateKey);
                    return decryptedWallet.encrypt(password).then(function (encryptedWallet) {
                        var parsedWallet = JSON.parse(encryptedWallet);
                        assert_1.default.equal(decryptedWallet.address.toLowerCase().substring(2), parsedWallet.address, 're-encrypted wallet - ' + wallet.privateKey);
                    });
                });
            });
        });
    });
});
describe('Test Transaction Signing and Parsing', function () {
    function checkTransaction(parsedTransaction, test) {
        var transaction = {};
        ['nonce', 'gasLimit', 'gasPrice', 'to', 'value', 'data'].forEach(function (key) {
            var expected = test[key];
            var value = parsedTransaction[key];
            if (["gasLimit", "gasPrice", "value"].indexOf(key) >= 0) {
                assert_1.default.ok((ethers_1.ethers.BigNumber.isBigNumber(value)), 'parsed into a big number - ' + key);
                value = value.toHexString();
                if (!expected || expected === '0x') {
                    expected = '0x00';
                }
            }
            else if (key === 'nonce') {
                assert_1.default.equal(typeof (value), 'number', 'parse into a number - nonce');
                value = ethers_1.ethers.utils.hexlify(value);
                if (!expected || expected === '0x') {
                    expected = '0x00';
                }
            }
            else if (key === 'data') {
                if (!expected) {
                    expected = '0x';
                }
            }
            else if (key === 'to') {
                if (value) {
                    // Make sure the address is valid
                    ethers_1.ethers.utils.getAddress(value);
                    value = value.toLowerCase();
                }
            }
            assert_1.default.equal(value, expected, 'parses ' + key + ' (legacy)');
            transaction[key] = test[key];
        });
        return transaction;
    }
    var tests = (0, testcases_1.loadTests)('transactions');
    tests.forEach(function (test) {
        it(('parses and signs transaction - ' + test.name), function () {
            this.timeout(120000);
            var signingKey = new ethers_1.ethers.utils.SigningKey(test.privateKey);
            var signDigest = signingKey.signDigest.bind(signingKey);
            // Legacy parsing unsigned transaction
            checkTransaction(ethers_1.ethers.utils.parseTransaction(test.unsignedTransaction), test);
            var parsedTransaction = ethers_1.ethers.utils.parseTransaction(test.signedTransaction);
            var transaction = checkTransaction(parsedTransaction, test);
            // Legacy signed transaction ecrecover
            assert_1.default.equal(parsedTransaction.from, ethers_1.ethers.utils.getAddress(test.accountAddress), 'computed from');
            // Legacy transaction chain ID
            assert_1.default.equal(parsedTransaction.chainId, 0, 'parses chainId (legacy)');
            // Legacy serializes unsigned transaction
            (function () {
                var unsignedTx = ethers_1.ethers.utils.serializeTransaction(transaction);
                assert_1.default.equal(unsignedTx, test.unsignedTransaction, 'serializes unsigned transaction (legacy)');
                // Legacy signed serialized transaction
                var signature = signDigest(ethers_1.ethers.utils.keccak256(unsignedTx));
                assert_1.default.equal(ethers_1.ethers.utils.serializeTransaction(transaction, signature), test.signedTransaction, 'signs transaction (legacy)');
            })();
            // EIP155
            // EIP-155 parsing unsigned transaction
            var parsedUnsignedTransactionChainId5 = ethers_1.ethers.utils.parseTransaction(test.unsignedTransactionChainId5);
            checkTransaction(parsedUnsignedTransactionChainId5, test);
            assert_1.default.equal(parsedUnsignedTransactionChainId5.chainId, 5, 'parses chainId (eip155)');
            // EIP-155 fields
            var parsedTransactionChainId5 = ethers_1.ethers.utils.parseTransaction(test.signedTransactionChainId5);
            ['data', 'from', 'nonce', 'to'].forEach(function (key) {
                assert_1.default.equal(parsedTransaction[key], parsedTransactionChainId5[key], 'parses ' + key + ' (eip155)');
            });
            ['gasLimit', 'gasPrice', 'value'].forEach(function (key) {
                assert_1.default.ok(parsedTransaction[key].eq(parsedTransactionChainId5[key]), 'parses ' + key + ' (eip155)');
            });
            // EIP-155 chain ID
            assert_1.default.equal(parsedTransactionChainId5.chainId, 5, 'parses chainId (eip155)');
            transaction.chainId = 5;
            (function () {
                // EIP-155 serialized unsigned transaction
                var unsignedTx = ethers_1.ethers.utils.serializeTransaction(transaction);
                assert_1.default.equal(unsignedTx, test.unsignedTransactionChainId5, 'serializes unsigned transaction (eip155) ');
                // EIP-155 signed serialized transaction
                var signature = signDigest(ethers_1.ethers.utils.keccak256(unsignedTx));
                assert_1.default.equal(ethers_1.ethers.utils.serializeTransaction(transaction, signature), test.signedTransactionChainId5, 'signs transaction (eip155)');
            })();
        });
    });
    tests.forEach(function (test) {
        it(('wallet signs transaction - ' + test.name), function () {
            return __awaiter(this, void 0, void 0, function () {
                var wallet, transaction, signedTx;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            this.timeout(120000);
                            wallet = new ethers_1.ethers.Wallet(test.privateKey);
                            transaction = {
                                to: test.to,
                                data: test.data,
                                gasLimit: test.gasLimit,
                                gasPrice: test.gasPrice,
                                value: test.value,
                                nonce: ((test.nonce) === "0x") ? 0 : test.nonce,
                                chainId: 5
                            };
                            return [4 /*yield*/, wallet.signTransaction(transaction)];
                        case 1:
                            signedTx = _a.sent();
                            assert_1.default.equal(signedTx, test.signedTransactionChainId5);
                            return [2 /*return*/];
                    }
                });
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
        // See: https://github.com/ethers-io/ethers.js/issues/80
        {
            address: '0xD351c7c627ad5531Edb9587f4150CaF393c33E87',
            name: 'bytes(0x47173285...4cb01fad)',
            message: ethers_1.ethers.utils.arrayify('0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad'),
            messageHash: '0x93100cc9477ba6522a2d7d5e83d0e075b167224ed8aa0c5860cfd47fa9f22797',
            privateKey: '0x51d1d6047622bca92272d36b297799ecc152dc2ef91b229debf84fc41e8c73ee',
            signature: '0x546f0c996fa4cfbf2b68fd413bfb477f05e44e66545d7782d87d52305831cd055fc9943e513297d0f6755ad1590a5476bf7d1761d4f9dc07dfe473824bbdec751b'
        },
        // See: https://github.com/ethers-io/ethers.js/issues/85
        {
            address: '0xe7deA7e64B62d1Ca52f1716f29cd27d4FE28e3e1',
            name: 'zero-prefixed signature',
            message: ethers_1.ethers.utils.arrayify(ethers_1.ethers.utils.id('0x7f23b5eed5bc7e89f267f339561b2697faab234a2')),
            messageHash: '0x06c9d148d268f9a13d8f94f4ce351b0beff3b9ba69f23abbf171168202b2dd67',
            privateKey: '0x09a11afa58d6014843fd2c5fd4e21e7fadf96ca2d8ce9934af6b8e204314f25c',
            signature: '0x7222038446034a0425b6e3f0cc3594f0d979c656206408f937c37a8180bb1bea047d061e4ded4aeac77fa86eb02d42ba7250964ac3eb9da1337090258ce798491c'
        }
    ];
    tests.forEach(function (test) {
        it(('signs a message "' + test.name + '"'), function () {
            this.timeout(120000);
            var wallet = new ethers_1.ethers.Wallet(test.privateKey);
            return wallet.signMessage(test.message).then(function (signature) {
                assert_1.default.equal(signature, test.signature, 'computes message signature');
            });
        });
    });
    tests.forEach(function (test) {
        it(('verifies a message "' + test.name + '"'), function () {
            this.timeout(120000);
            var address = ethers_1.ethers.utils.verifyMessage(test.message, test.signature);
            assert_1.default.equal(address, test.address, 'verifies message signature');
        });
    });
    tests.forEach(function (test) {
        it(('hashes a message "' + test.name + '"'), function () {
            this.timeout(120000);
            var hash = ethers_1.ethers.utils.hashMessage(test.message);
            assert_1.default.equal(hash, test.messageHash, 'calculates message hash');
        });
    });
});
describe("Serialize Transactions", function () {
    it("allows odd-length numeric values", function () {
        ethers_1.ethers.utils.serializeTransaction({
            gasLimit: "0x1",
            gasPrice: "0x1",
            value: "0x1"
        });
        //console.log(result);
    });
});
describe("Wallet Errors", function () {
    it("fails on privateKey/address mismatch", function () {
        assert_1.default.throws(function () {
            var wallet = new ethers_1.ethers.Wallet({
                privateKey: "0x6a73cd9b03647e83ef937888a5258a26e4c766dbf41ddd974f15e32d09cfe9c0",
                address: "0x3f4f037dfc910a3517b9a5b23cf036ffae01a5a7"
            });
            console.log(wallet);
        }, function (error) {
            return error.reason === "privateKey/address mismatch";
        });
    });
    it("fails on mnemonic/address mismatch", function () {
        assert_1.default.throws(function () {
            var wallet = new ethers_1.ethers.Wallet({
                privateKey: "0x6a73cd9b03647e83ef937888a5258a26e4c766dbf41ddd974f15e32d09cfe9c0",
                address: "0x4Dfe3BF68c80f19083FF90E6a852fC876AE7429b",
                mnemonic: {
                    phrase: "pact grief smile usage kind pledge river excess garbage mixed olive receive"
                }
            });
            console.log(wallet);
        }, function (error) {
            return error.reason === "mnemonic/address mismatch";
        });
    });
    it("fails on from mismatch", function () {
        var _this = this;
        var wallet = new ethers_1.ethers.Wallet("0x6a73cd9b03647e83ef937888a5258a26e4c766dbf41ddd974f15e32d09cfe9c0");
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, wallet.signTransaction({
                                from: "0x3f4f037dfc910a3517b9a5b23cf036ffae01a5a7"
                            })];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        if (error_1.code === ethers_1.ethers.utils.Logger.errors.INVALID_ARGUMENT && error_1.argument === "transaction.from") {
                            resolve(true);
                            return [2 /*return*/];
                        }
                        return [3 /*break*/, 3];
                    case 3:
                        reject(new Error("assert failed; did not throw"));
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
//# sourceMappingURL=test-wallet.js.map