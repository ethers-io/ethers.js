"use strict";
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
exports.parse = exports.serializeHederaTransaction = exports.accessListify = exports.computeAliasFromPubKey = exports.computeAlias = exports.TransactionTypes = void 0;
var address_1 = require("@hethers/address");
var bignumber_1 = require("@ethersproject/bignumber");
var bytes_1 = require("@ethersproject/bytes");
var constants_1 = require("@hethers/constants");
var signing_key_1 = require("@ethersproject/signing-key");
var logger_1 = require("@hethers/logger");
var _version_1 = require("./_version");
var base64 = __importStar(require("@ethersproject/base64"));
var sdk_1 = require("@hashgraph/sdk");
var proto_1 = require("@hashgraph/proto");
var long_1 = __importDefault(require("long"));
var logger = new logger_1.Logger(_version_1.version);
var TransactionTypes;
(function (TransactionTypes) {
    TransactionTypes[TransactionTypes["legacy"] = 0] = "legacy";
    TransactionTypes[TransactionTypes["eip2930"] = 1] = "eip2930";
    TransactionTypes[TransactionTypes["eip1559"] = 2] = "eip1559";
})(TransactionTypes = exports.TransactionTypes || (exports.TransactionTypes = {}));
///////////////////////////////
function handleNumber(value) {
    if (value === "0x") {
        return constants_1.Zero;
    }
    return bignumber_1.BigNumber.from(value);
}
function computeAlias(key) {
    var publicKey = (0, signing_key_1.computePublicKey)(key);
    return computeAliasFromPubKey(publicKey);
}
exports.computeAlias = computeAlias;
function computeAliasFromPubKey(pubKey) {
    return "0.0." + base64.encode(pubKey);
}
exports.computeAliasFromPubKey = computeAliasFromPubKey;
function accessSetify(addr, storageKeys) {
    return {
        address: (0, address_1.getAddress)(addr),
        storageKeys: (storageKeys || []).map(function (storageKey, index) {
            if ((0, bytes_1.hexDataLength)(storageKey) !== 32) {
                logger.throwArgumentError("invalid access list storageKey", "accessList[" + addr + ":" + index + "]", storageKey);
            }
            return storageKey.toLowerCase();
        })
    };
}
function accessListify(value) {
    if (Array.isArray(value)) {
        return value.map(function (set, index) {
            if (Array.isArray(set)) {
                if (set.length > 2) {
                    logger.throwArgumentError("access list expected to be [ address, storageKeys[] ]", "value[" + index + "]", set);
                }
                return accessSetify(set[0], set[1]);
            }
            return accessSetify(set.address, set.storageKeys);
        });
    }
    var result = Object.keys(value).map(function (addr) {
        var storageKeys = value[addr].reduce(function (accum, storageKey) {
            accum[storageKey] = true;
            return accum;
        }, {});
        return accessSetify(addr, Object.keys(storageKeys).sort());
    });
    result.sort(function (a, b) { return (a.address.localeCompare(b.address)); });
    return result;
}
exports.accessListify = accessListify;
function isAccountLike(str) {
    str = str.toString();
    var m = str.split('.').map(function (e) { return parseInt(e); }).filter(function (e) { return e >= 0; }).length;
    return m == 3;
}
function validateMemo(memo, memoType) {
    if (memo.length > 100 || memo.length === 0) {
        logger.throwArgumentError("invalid " + memoType + " memo", logger_1.Logger.errors.INVALID_ARGUMENT, {
            memo: memo
        });
    }
}
function serializeHederaTransaction(transaction, pubKey) {
    var _a, _b;
    var tx;
    var arrayifiedData = transaction.data ? (0, bytes_1.arrayify)(transaction.data) : new Uint8Array();
    var gas = numberify(transaction.gasLimit ? transaction.gasLimit : 0);
    if (transaction.customData.isCryptoTransfer) {
        tx = new sdk_1.TransferTransaction()
            .addHbarTransfer(transaction.from.toString(), new sdk_1.Hbar(transaction.value.toString(), sdk_1.HbarUnit.Tinybar).negated())
            .addHbarTransfer(transaction.to.toString(), new sdk_1.Hbar(transaction.value.toString(), sdk_1.HbarUnit.Tinybar));
    }
    else if (transaction.to) {
        tx = new sdk_1.ContractExecuteTransaction()
            .setContractId(sdk_1.ContractId.fromSolidityAddress((0, address_1.getAddressFromAccount)(transaction.to)))
            .setFunctionParameters(arrayifiedData)
            .setGas(gas);
        if (transaction.value) {
            tx.setPayableAmount((_a = transaction.value) === null || _a === void 0 ? void 0 : _a.toString());
        }
    }
    else {
        if (transaction.customData.bytecodeFileId) {
            tx = new sdk_1.ContractCreateTransaction()
                .setBytecodeFileId(transaction.customData.bytecodeFileId)
                .setConstructorParameters(arrayifiedData)
                .setInitialBalance((_b = transaction.value) === null || _b === void 0 ? void 0 : _b.toString())
                .setGas(gas);
            if (transaction.customData.contractAdminKey) {
                var inputKey = transaction.customData.contractAdminKey;
                var keyInitializer = {};
                if (inputKey.toString().startsWith('0x')) {
                    if ((0, address_1.isAddress)(inputKey)) {
                        var account_1 = (0, address_1.getAccountFromAddress)(inputKey);
                        keyInitializer.contractID = {
                            shardNum: new long_1.default(numberify(account_1.shard)),
                            realmNum: new long_1.default(numberify(account_1.realm)),
                            contractNum: new long_1.default(numberify(account_1.num))
                        };
                    }
                    else {
                        keyInitializer.ECDSASecp256k1 = (0, bytes_1.arrayify)(inputKey);
                    }
                }
                if (isAccountLike(inputKey)) {
                    var account_2 = inputKey.split('.').map(function (e) { return parseInt(e); });
                    keyInitializer.contractID = {
                        shardNum: new long_1.default(account_2[0]),
                        realmNum: new long_1.default(account_2[1]),
                        contractNum: new long_1.default(account_2[2])
                    };
                }
                var key = sdk_1.PublicKey._fromProtobufKey(proto_1.Key.create(keyInitializer));
                tx.setAdminKey(key);
            }
            if (transaction.customData.contractMemo) {
                validateMemo(transaction.customData.contractMemo, 'contract');
                tx.setContractMemo(transaction.customData.contractMemo);
            }
        }
        else {
            if (transaction.customData.fileChunk && transaction.customData.fileId) {
                tx = new sdk_1.FileAppendTransaction()
                    .setContents(transaction.customData.fileChunk)
                    .setFileId(transaction.customData.fileId);
            }
            else if (!transaction.customData.fileId && transaction.customData.fileChunk) {
                // only a chunk, thus the first one
                tx = new sdk_1.FileCreateTransaction()
                    .setContents(transaction.customData.fileChunk)
                    .setKeys([transaction.customData.fileKey ?
                        transaction.customData.fileKey :
                        pubKey
                ]);
            }
            else if (transaction.customData.publicKey) {
                var _c = transaction.customData, publicKey = _c.publicKey, initialBalance = _c.initialBalance;
                tx = new sdk_1.AccountCreateTransaction()
                    .setKey(sdk_1.PublicKey.fromString(publicKey.toString()))
                    .setInitialBalance(sdk_1.Hbar.fromTinybars(initialBalance.toString()));
            }
            else {
                logger.throwArgumentError("Cannot determine transaction type from given custom data. Need either `to`, `fileChunk`, `fileId` or `bytecodeFileId`", logger_1.Logger.errors.INVALID_ARGUMENT, transaction);
            }
        }
    }
    if (transaction.customData.memo) {
        validateMemo(transaction.customData.memo, 'tx');
        tx.setTransactionMemo(transaction.customData.memo);
    }
    var account = (0, address_1.getAccountFromAddress)(transaction.from.toString());
    tx.setTransactionId(sdk_1.TransactionId.generate(new sdk_1.AccountId({
        shard: numberify(account.shard),
        realm: numberify(account.realm),
        num: numberify(account.num)
    })))
        .setNodeAccountIds([sdk_1.AccountId.fromString(transaction.nodeId.toString())])
        .freeze();
    return tx;
}
exports.serializeHederaTransaction = serializeHederaTransaction;
function parse(rawTransaction) {
    var _a;
    return __awaiter(this, void 0, void 0, function () {
        var payload, parsed, tx, nanos, seconds, contents, _b;
        var _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    payload = (0, bytes_1.arrayify)(rawTransaction);
                    try {
                        parsed = sdk_1.Transaction.fromBytes(payload);
                    }
                    catch (error) {
                        logger.throwArgumentError(error.message, "rawTransaction", rawTransaction);
                    }
                    tx = parsed.transactionId;
                    nanos = tx.validStart.nanos.toString().padStart(9, '0');
                    seconds = tx.validStart.seconds.toString().padStart(10, '0');
                    _c = {
                        transactionId: tx.accountId.toString() + "-" + seconds + "-" + nanos
                    };
                    _b = bytes_1.hexlify;
                    return [4 /*yield*/, parsed.getTransactionHash()];
                case 1:
                    contents = (_c.hash = _b.apply(void 0, [_d.sent()]),
                        _c.from = (0, address_1.getAddressFromAccount)(parsed.transactionId.accountId.toString()),
                        _c);
                    if (parsed instanceof sdk_1.ContractExecuteTransaction) {
                        parsed = parsed;
                        contents.to = (0, address_1.getAddressFromAccount)((_a = parsed.contractId) === null || _a === void 0 ? void 0 : _a.toString());
                        contents.gasLimit = handleNumber(parsed.gas.toString());
                        contents.value = parsed.payableAmount ?
                            handleNumber(parsed.payableAmount.toBigNumber().toString()) : handleNumber('0');
                        contents.data = parsed.functionParameters ? (0, bytes_1.hexlify)(parsed.functionParameters) : '0x';
                    }
                    else if (parsed instanceof sdk_1.ContractCreateTransaction) {
                        parsed = parsed;
                        contents.gasLimit = handleNumber(parsed.gas.toString());
                        contents.value = parsed.initialBalance ?
                            handleNumber(parsed.initialBalance.toBigNumber().toString()) : handleNumber('0');
                        // TODO IMPORTANT! We are setting only the constructor arguments and not the whole bytecode + constructor args
                        contents.data = parsed.constructorParameters ? (0, bytes_1.hexlify)(parsed.constructorParameters) : '0x';
                    }
                    else if (parsed instanceof sdk_1.FileCreateTransaction) {
                        parsed = parsed;
                        contents.data = (0, bytes_1.hexlify)(Buffer.from(parsed.contents));
                    }
                    else if (parsed instanceof sdk_1.FileAppendTransaction) {
                        parsed = parsed;
                        contents.data = (0, bytes_1.hexlify)(Buffer.from(parsed.contents));
                    }
                    else if (parsed instanceof sdk_1.TransferTransaction) {
                        // TODO populate value / to?
                    }
                    else if (parsed instanceof sdk_1.AccountCreateTransaction) {
                        parsed = parsed;
                        contents.value = parsed.initialBalance ?
                            handleNumber(parsed.initialBalance.toBigNumber().toString()) : handleNumber('0');
                    }
                    else {
                        return [2 /*return*/, logger.throwError("unsupported transaction", logger_1.Logger.errors.UNSUPPORTED_OPERATION, { operation: "parse" })];
                    }
                    // TODO populate r, s ,v
                    return [2 /*return*/, __assign(__assign({}, contents), { chainId: 0, r: '', s: '', v: 0 })];
            }
        });
    });
}
exports.parse = parse;
function numberify(num) {
    return bignumber_1.BigNumber.from(num).toNumber();
}
//# sourceMappingURL=index.js.map