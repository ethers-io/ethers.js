"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.randomNumBetween = exports.VoidSigner = exports.Signer = void 0;
var transactions_1 = require("@hethers/transactions");
var bytes_1 = require("@ethersproject/bytes");
var properties_1 = require("@ethersproject/properties");
var logger_1 = require("@hethers/logger");
var _version_1 = require("./_version");
var address_1 = require("@hethers/address");
var sdk_1 = require("@hashgraph/sdk");
var Long = __importStar(require("long"));
var proto_1 = require("@hashgraph/proto");
var logger = new logger_1.Logger(_version_1.version);
var allowedTransactionKeys = [
    "accessList", "chainId", "customData", "data", "from", "gasLimit", "maxFeePerGas", "maxPriorityFeePerGas", "to", "type", "value",
    "nodeId"
];
;
;
function checkError(method, error, txRequest) {
    switch (error.status._code) {
        // insufficient gas
        case 30:
            return logger.throwError("insufficient funds for gas cost", logger_1.Logger.errors.CALL_EXCEPTION, { tx: txRequest });
        // insufficient payer balance
        case 10:
            return logger.throwError("insufficient funds in payer account", logger_1.Logger.errors.INSUFFICIENT_FUNDS, { tx: txRequest });
        // insufficient tx fee
        case 9:
            return logger.throwError("transaction fee too low", logger_1.Logger.errors.INSUFFICIENT_FUNDS, { tx: txRequest });
        // invalid signature
        case 7:
            return logger.throwError("invalid transaction signature", logger_1.Logger.errors.UNKNOWN_ERROR, { tx: txRequest });
        // invalid contract id
        case 16:
            return logger.throwError("invalid contract address", logger_1.Logger.errors.INVALID_ARGUMENT, { tx: txRequest });
        // contract revert
        case 33:
            return logger.throwError("contract execution reverted", logger_1.Logger.errors.CALL_EXCEPTION, { tx: txRequest });
    }
    throw error;
}
var Signer = /** @class */ (function () {
    ///////////////////
    // Sub-classes MUST call super
    function Signer() {
        var _newTarget = this.constructor;
        logger.checkAbstract(_newTarget, Signer);
        (0, properties_1.defineReadOnly)(this, "_isSigner", true);
    }
    Signer.prototype.getGasPrice = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._checkProvider("getGasPrice");
                        return [4 /*yield*/, this.provider.getGasPrice()];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ///////////////////
    // Sub-classes MAY override these
    Signer.prototype.getBalance = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._checkProvider("getBalance");
                        return [4 /*yield*/, this.provider.getBalance(this.getAddress())];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // Populates "from" if unspecified, and estimates the gas for the transaction
    Signer.prototype.estimateGas = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var tx;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._checkProvider("estimateGas");
                        return [4 /*yield*/, (0, properties_1.resolveProperties)(this.checkTransaction(transaction))];
                    case 1:
                        tx = _a.sent();
                        return [4 /*yield*/, this.provider.estimateGas(tx)];
                    case 2: 
                    // cost-answer query on hedera
                    return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    // super classes should override this for now
    Signer.prototype.call = function (txRequest) {
        return __awaiter(this, void 0, void 0, function () {
            var tx, to, from, _a, nodeID, paymentTxId, hederaTx, cost, paymentBody, signed, walletKey, signature, transferSignedTransactionBytes, response, error_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this._checkProvider("call");
                        return [4 /*yield*/, (0, properties_1.resolveProperties)(this.checkTransaction(txRequest))];
                    case 1:
                        tx = _b.sent();
                        to = (0, address_1.asAccountString)(tx.to);
                        _a = address_1.asAccountString;
                        return [4 /*yield*/, this.getAddress()];
                    case 2:
                        from = _a.apply(void 0, [_b.sent()]);
                        nodeID = sdk_1.AccountId.fromString((0, address_1.asAccountString)(tx.nodeId));
                        paymentTxId = sdk_1.TransactionId.generate(from);
                        hederaTx = new sdk_1.ContractCallQuery()
                            .setContractId(to)
                            .setFunctionParameters((0, bytes_1.arrayify)(tx.data))
                            .setNodeAccountIds([nodeID])
                            .setGas((0, transactions_1.numberify)(tx.gasLimit))
                            .setPaymentTransactionId(paymentTxId);
                        cost = 3;
                        paymentBody = {
                            transactionID: paymentTxId._toProtobuf(),
                            nodeAccountID: nodeID._toProtobuf(),
                            transactionFee: new sdk_1.Hbar(0.005).toTinybars(),
                            transactionValidDuration: {
                                seconds: Long.fromInt(120),
                            },
                            cryptoTransfer: {
                                transfers: {
                                    accountAmounts: [
                                        {
                                            accountID: sdk_1.AccountId.fromString(from)._toProtobuf(),
                                            amount: new sdk_1.Hbar(cost).negated().toTinybars()
                                        },
                                        {
                                            accountID: nodeID._toProtobuf(),
                                            amount: new sdk_1.Hbar(cost).toTinybars()
                                        }
                                    ],
                                },
                            },
                        };
                        signed = {
                            bodyBytes: proto_1.TransactionBody.encode(paymentBody).finish(),
                            sigMap: {}
                        };
                        walletKey = sdk_1.PrivateKey.fromStringECDSA(this._signingKey().privateKey);
                        signature = walletKey.sign(signed.bodyBytes);
                        signed.sigMap = {
                            sigPair: [walletKey.publicKey._toProtobufSignature(signature)]
                        };
                        transferSignedTransactionBytes = proto_1.SignedTransaction.encode(signed).finish();
                        hederaTx._paymentTransactions.push({
                            signedTransactionBytes: transferSignedTransactionBytes
                        });
                        _b.label = 3;
                    case 3:
                        _b.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, hederaTx.execute(this.provider.getHederaClient())];
                    case 4:
                        response = _b.sent();
                        return [2 /*return*/, (0, bytes_1.hexlify)(response.bytes)];
                    case 5:
                        error_1 = _b.sent();
                        return [2 /*return*/, checkError('call', error_1, txRequest)];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Composes a transaction which is signed and sent to the provider's network.
     * @param transaction - the actual tx
     */
    Signer.prototype.sendTransaction = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var tx, signed, contractByteCode, chunks, fileCreate, signedFileCreate, resp, _i, _a, chunk, fileAppend, signedFileAppend, contractCreate, signedContractCreate;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, properties_1.resolveProperties)(transaction)];
                    case 1:
                        tx = _b.sent();
                        if (!tx.to) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.signTransaction(tx)];
                    case 2:
                        signed = _b.sent();
                        return [4 /*yield*/, this.provider.sendTransaction(signed)];
                    case 3: return [2 /*return*/, _b.sent()];
                    case 4:
                        contractByteCode = tx.data;
                        chunks = splitInChunks(Buffer.from(contractByteCode).toString(), 4096);
                        fileCreate = {
                            customData: {
                                fileChunk: chunks[0],
                                fileKey: sdk_1.PublicKey.fromString(this._signingKey().compressedPublicKey)
                            }
                        };
                        return [4 /*yield*/, this.signTransaction(fileCreate)];
                    case 5:
                        signedFileCreate = _b.sent();
                        return [4 /*yield*/, this.provider.sendTransaction(signedFileCreate)];
                    case 6:
                        resp = _b.sent();
                        _i = 0, _a = chunks.slice(1);
                        _b.label = 7;
                    case 7:
                        if (!(_i < _a.length)) return [3 /*break*/, 11];
                        chunk = _a[_i];
                        fileAppend = {
                            customData: {
                                fileId: resp.customData.fileId.toString(),
                                fileChunk: chunk
                            }
                        };
                        return [4 /*yield*/, this.signTransaction(fileAppend)];
                    case 8:
                        signedFileAppend = _b.sent();
                        return [4 /*yield*/, this.provider.sendTransaction(signedFileAppend)];
                    case 9:
                        _b.sent();
                        _b.label = 10;
                    case 10:
                        _i++;
                        return [3 /*break*/, 7];
                    case 11:
                        contractCreate = {
                            gasLimit: tx.gasLimit,
                            customData: {
                                bytecodeFileId: resp.customData.fileId.toString()
                            }
                        };
                        return [4 /*yield*/, this.signTransaction(contractCreate)];
                    case 12:
                        signedContractCreate = _b.sent();
                        return [4 /*yield*/, this.provider.sendTransaction(signedContractCreate)];
                    case 13: return [2 /*return*/, _b.sent()];
                }
            });
        });
    };
    Signer.prototype.getChainId = function () {
        return __awaiter(this, void 0, void 0, function () {
            var network;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this._checkProvider("getChainId");
                        return [4 /*yield*/, this.provider.getNetwork()];
                    case 1:
                        network = _a.sent();
                        return [2 /*return*/, network.chainId];
                }
            });
        });
    };
    /**
     * Checks if the given transaction is usable.
     * Properties - `from`, `nodeId`, `gasLimit`
     * @param transaction - the tx to be checked
     */
    Signer.prototype.checkTransaction = function (transaction) {
        for (var key in transaction) {
            if (allowedTransactionKeys.indexOf(key) === -1) {
                logger.throwArgumentError("invalid transaction key: " + key, "transaction", transaction);
            }
        }
        var tx = (0, properties_1.shallowCopy)(transaction);
        if (!tx.nodeId) {
            this._checkProvider();
            // provider present, we can go on
            var submittableNodeIDs = this.provider.getHederaNetworkConfig();
            if (submittableNodeIDs.length > 0) {
                tx.nodeId = submittableNodeIDs[randomNumBetween(0, submittableNodeIDs.length - 1)].toString();
            }
            else {
                logger.throwError("Unable to find submittable node ID. The signer's provider is not connected to any usable network");
            }
        }
        if (tx.from == null) {
            tx.from = this.getAddress();
        }
        else {
            // Make sure any provided address matches this signer
            tx.from = Promise.all([
                Promise.resolve(tx.from),
                this.getAddress()
            ]).then(function (result) {
                if (result[0].toString().toLowerCase() !== result[1].toLowerCase()) {
                    logger.throwArgumentError("from address mismatch", "transaction", transaction);
                }
                return result[0];
            });
        }
        tx.gasLimit = transaction.gasLimit;
        return tx;
    };
    /**
     * Populates any missing properties in a transaction request.
     * Properties affected - `to`, `chainId`
     * @param transaction
     */
    Signer.prototype.populateTransaction = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var tx, isCryptoTransfer, customData, isFileCreateOrAppend, isCreateAccount;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, properties_1.resolveProperties)(this.checkTransaction(transaction))];
                    case 1:
                        tx = _a.sent();
                        if (tx.to != null) {
                            tx.to = Promise.resolve(tx.to).then(function (to) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    if (to == null) {
                                        return [2 /*return*/, null];
                                    }
                                    return [2 /*return*/, (0, address_1.getChecksumAddress)((0, address_1.getAddressFromAccount)(to))];
                                });
                            }); });
                            // Prevent this error from causing an UnhandledPromiseException
                            tx.to.catch(function (error) { });
                        }
                        isCryptoTransfer = false;
                        if (!(tx.to && tx.value)) return [3 /*break*/, 5];
                        if (!(!tx.data && !tx.gasLimit)) return [3 /*break*/, 2];
                        isCryptoTransfer = true;
                        return [3 /*break*/, 5];
                    case 2:
                        if (!(tx.data && !tx.gasLimit)) return [3 /*break*/, 3];
                        logger.throwError("gasLimit is not provided. Cannot execute a Contract Call");
                        return [3 /*break*/, 5];
                    case 3:
                        if (!(!tx.data && tx.gasLimit)) return [3 /*break*/, 5];
                        this._checkProvider();
                        return [4 /*yield*/, this.provider.getCode(tx.to)];
                    case 4:
                        if ((_a.sent()) === '0x') {
                            logger.throwError("receiver is an account. Cannot execute a Contract Call");
                        }
                        _a.label = 5;
                    case 5:
                        tx.customData = __assign(__assign({}, tx.customData), { isCryptoTransfer: isCryptoTransfer });
                        return [4 /*yield*/, tx.customData];
                    case 6:
                        customData = _a.sent();
                        isFileCreateOrAppend = customData && customData.fileChunk;
                        isCreateAccount = customData && customData.publicKey;
                        if (!isFileCreateOrAppend && !isCreateAccount && !tx.customData.isCryptoTransfer && tx.gasLimit == null) {
                            return [2 /*return*/, logger.throwError("cannot estimate gas; transaction requires manual gas limit", logger_1.Logger.errors.UNPREDICTABLE_GAS_LIMIT, { tx: tx })];
                        }
                        return [4 /*yield*/, (0, properties_1.resolveProperties)(tx)];
                    case 7: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ///////////////////
    // Sub-classes SHOULD leave these alone
    Signer.prototype._checkProvider = function (operation) {
        if (!this.provider) {
            logger.throwError("missing provider", logger_1.Logger.errors.UNSUPPORTED_OPERATION, {
                operation: (operation || "_checkProvider")
            });
        }
    };
    Signer.isSigner = function (value) {
        return !!(value && value._isSigner);
    };
    return Signer;
}());
exports.Signer = Signer;
var VoidSigner = /** @class */ (function (_super) {
    __extends(VoidSigner, _super);
    function VoidSigner(address, provider) {
        var _newTarget = this.constructor;
        var _this = this;
        logger.checkNew(_newTarget, VoidSigner);
        _this = _super.call(this) || this;
        (0, properties_1.defineReadOnly)(_this, "address", address);
        (0, properties_1.defineReadOnly)(_this, "provider", provider || null);
        return _this;
    }
    VoidSigner.prototype.getAddress = function () {
        return Promise.resolve(this.address);
    };
    VoidSigner.prototype._fail = function (message, operation) {
        return Promise.resolve().then(function () {
            logger.throwError(message, logger_1.Logger.errors.UNSUPPORTED_OPERATION, { operation: operation });
        });
    };
    VoidSigner.prototype.signMessage = function (message) {
        return this._fail("VoidSigner cannot sign messages", "signMessage");
    };
    VoidSigner.prototype.signTransaction = function (transaction) {
        return this._fail("VoidSigner cannot sign transactions", "signTransaction");
    };
    VoidSigner.prototype.createAccount = function (pubKey, initialBalance) {
        return this._fail("VoidSigner cannot create accounts", "createAccount");
    };
    VoidSigner.prototype._signTypedData = function (domain, types, value) {
        return this._fail("VoidSigner cannot sign typed data", "signTypedData");
    };
    VoidSigner.prototype.connect = function (provider) {
        return new VoidSigner(this.address, provider);
    };
    return VoidSigner;
}(Signer));
exports.VoidSigner = VoidSigner;
/**
 * Generates a random integer in the given range
 * @param min - range start
 * @param max - range end
 */
function randomNumBetween(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
exports.randomNumBetween = randomNumBetween;
/**
 * Splits data (utf8) into chunks with the given size
 * @param data
 * @param chunkSize
 */
function splitInChunks(data, chunkSize) {
    var chunks = [];
    var num = 0;
    while (num <= data.length) {
        var slice = data.slice(num, chunkSize + num);
        num += chunkSize;
        chunks.push(slice);
    }
    return chunks;
}
//# sourceMappingURL=index.js.map