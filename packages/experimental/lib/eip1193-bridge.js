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
exports.Eip1193Bridge = void 0;
var events_1 = __importDefault(require("events"));
var ethers_1 = require("ethers");
var _version_1 = require("./_version");
var logger = new ethers_1.ethers.utils.Logger(_version_1.version);
/*
function getBlockTag(tag) {
    if (tag == null) { return "latest"; }
    if (tag === "earliest" || tag === "latest" || tag === "pending") {
        return tag;
    }
    return ethers.utils.hexValue(tag)
}
*/
var Eip1193Bridge = /** @class */ (function (_super) {
    __extends(Eip1193Bridge, _super);
    function Eip1193Bridge(signer, provider) {
        var _this = _super.call(this) || this;
        ethers_1.ethers.utils.defineReadOnly(_this, "signer", signer);
        ethers_1.ethers.utils.defineReadOnly(_this, "provider", provider || null);
        return _this;
    }
    Eip1193Bridge.prototype.request = function (request) {
        return this.send(request.method, request.params || []);
    };
    Eip1193Bridge.prototype.send = function (method, params) {
        return __awaiter(this, void 0, void 0, function () {
            function throwUnsupported(message) {
                return logger.throwError(message, ethers_1.ethers.utils.Logger.errors.UNSUPPORTED_OPERATION, {
                    method: method,
                    params: params
                });
            }
            var coerce, _a, result, result, address, result, result, result, result, result, req, req, result, address, req, tx, result;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        coerce = function (value) { return value; };
                        _a = method;
                        switch (_a) {
                            case "eth_gasPrice": return [3 /*break*/, 1];
                            case "eth_accounts": return [3 /*break*/, 3];
                            case "eth_blockNumber": return [3 /*break*/, 6];
                            case "eth_chainId": return [3 /*break*/, 8];
                            case "eth_getBalance": return [3 /*break*/, 10];
                            case "eth_getStorageAt": return [3 /*break*/, 12];
                            case "eth_getTransactionCount": return [3 /*break*/, 13];
                            case "eth_getBlockTransactionCountByHash": return [3 /*break*/, 15];
                            case "eth_getBlockTransactionCountByNumber": return [3 /*break*/, 15];
                            case "eth_getCode": return [3 /*break*/, 17];
                            case "eth_sendRawTransaction": return [3 /*break*/, 19];
                            case "eth_call": return [3 /*break*/, 21];
                            case "estimateGas": return [3 /*break*/, 23];
                            case "eth_getBlockByHash": return [3 /*break*/, 25];
                            case "eth_getBlockByNumber": return [3 /*break*/, 25];
                            case "eth_getTransactionByHash": return [3 /*break*/, 29];
                            case "eth_getTransactionReceipt": return [3 /*break*/, 31];
                            case "eth_sign": return [3 /*break*/, 33];
                            case "eth_sendTransaction": return [3 /*break*/, 35];
                            case "eth_getUncleCountByBlockHash": return [3 /*break*/, 37];
                            case "eth_getUncleCountByBlockNumber": return [3 /*break*/, 37];
                            case "eth_getTransactionByBlockHashAndIndex": return [3 /*break*/, 38];
                            case "eth_getTransactionByBlockNumberAndIndex": return [3 /*break*/, 38];
                            case "eth_getUncleByBlockHashAndIndex": return [3 /*break*/, 38];
                            case "eth_getUncleByBlockNumberAndIndex": return [3 /*break*/, 38];
                            case "eth_newFilter": return [3 /*break*/, 38];
                            case "eth_newBlockFilter": return [3 /*break*/, 38];
                            case "eth_newPendingTransactionFilter": return [3 /*break*/, 38];
                            case "eth_uninstallFilter": return [3 /*break*/, 38];
                            case "eth_getFilterChanges": return [3 /*break*/, 38];
                            case "eth_getFilterLogs": return [3 /*break*/, 38];
                            case "eth_getLogs": return [3 /*break*/, 38];
                        }
                        return [3 /*break*/, 39];
                    case 1: return [4 /*yield*/, this.provider.getGasPrice()];
                    case 2:
                        result = _b.sent();
                        return [2 /*return*/, result.toHexString()];
                    case 3:
                        result = [];
                        if (!this.signer) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.signer.getAddress()];
                    case 4:
                        address = _b.sent();
                        result.push(address);
                        _b.label = 5;
                    case 5: return [2 /*return*/, result];
                    case 6: return [4 /*yield*/, this.provider.getBlockNumber()];
                    case 7: return [2 /*return*/, _b.sent()];
                    case 8: return [4 /*yield*/, this.provider.getNetwork()];
                    case 9:
                        result = _b.sent();
                        return [2 /*return*/, result.chainId];
                    case 10: return [4 /*yield*/, this.provider.getBalance(params[0], params[1])];
                    case 11:
                        result = _b.sent();
                        return [2 /*return*/, result.toHexString()];
                    case 12:
                        {
                            return [2 /*return*/, this.provider.getStorageAt(params[0], params[1], params[2])];
                        }
                        _b.label = 13;
                    case 13: return [4 /*yield*/, this.provider.getTransactionCount(params[0], params[1])];
                    case 14:
                        result = _b.sent();
                        return [2 /*return*/, ethers_1.ethers.utils.hexValue(result)];
                    case 15: return [4 /*yield*/, this.provider.getBlock(params[0])];
                    case 16:
                        result = _b.sent();
                        return [2 /*return*/, ethers_1.ethers.utils.hexValue(result.transactions.length)];
                    case 17: return [4 /*yield*/, this.provider.getBlock(params[0])];
                    case 18:
                        result = _b.sent();
                        return [2 /*return*/, result];
                    case 19: return [4 /*yield*/, this.provider.sendTransaction(params[0])];
                    case 20: return [2 /*return*/, _b.sent()];
                    case 21:
                        req = ethers_1.ethers.providers.JsonRpcProvider.hexlifyTransaction(params[0]);
                        return [4 /*yield*/, this.provider.call(req, params[1])];
                    case 22: return [2 /*return*/, _b.sent()];
                    case 23:
                        if (params[1] && params[1] !== "latest") {
                            throwUnsupported("estimateGas does not support blockTag");
                        }
                        req = ethers_1.ethers.providers.JsonRpcProvider.hexlifyTransaction(params[0]);
                        return [4 /*yield*/, this.provider.estimateGas(req)];
                    case 24:
                        result = _b.sent();
                        return [2 /*return*/, result.toHexString()];
                    case 25:
                        if (!params[1]) return [3 /*break*/, 27];
                        return [4 /*yield*/, this.provider.getBlockWithTransactions(params[0])];
                    case 26: return [2 /*return*/, _b.sent()];
                    case 27: return [4 /*yield*/, this.provider.getBlock(params[0])];
                    case 28: return [2 /*return*/, _b.sent()];
                    case 29: return [4 /*yield*/, this.provider.getTransaction(params[0])];
                    case 30: return [2 /*return*/, _b.sent()];
                    case 31: return [4 /*yield*/, this.provider.getTransactionReceipt(params[0])];
                    case 32: return [2 /*return*/, _b.sent()];
                    case 33:
                        if (!this.signer) {
                            return [2 /*return*/, throwUnsupported("eth_sign requires an account")];
                        }
                        return [4 /*yield*/, this.signer.getAddress()];
                    case 34:
                        address = _b.sent();
                        if (address !== ethers_1.ethers.utils.getAddress(params[0])) {
                            logger.throwArgumentError("account mismatch or account not found", "params[0]", params[0]);
                        }
                        return [2 /*return*/, this.signer.signMessage(ethers_1.ethers.utils.arrayify(params[1]))];
                    case 35:
                        if (!this.signer) {
                            return [2 /*return*/, throwUnsupported("eth_sendTransaction requires an account")];
                        }
                        req = ethers_1.ethers.providers.JsonRpcProvider.hexlifyTransaction(params[0]);
                        return [4 /*yield*/, this.signer.sendTransaction(req)];
                    case 36:
                        tx = _b.sent();
                        return [2 /*return*/, tx.hash];
                    case 37:
                        {
                            coerce = ethers_1.ethers.utils.hexValue;
                            return [3 /*break*/, 39];
                        }
                        _b.label = 38;
                    case 38: return [3 /*break*/, 39];
                    case 39:
                        if (!(this.provider).send) return [3 /*break*/, 41];
                        return [4 /*yield*/, (this.provider).send(method, params)];
                    case 40:
                        result = _b.sent();
                        return [2 /*return*/, coerce(result)];
                    case 41: return [2 /*return*/, throwUnsupported("unsupported method: " + method)];
                }
            });
        });
    };
    return Eip1193Bridge;
}(events_1.default));
exports.Eip1193Bridge = Eip1193Bridge;
//# sourceMappingURL=eip1193-bridge.js.map