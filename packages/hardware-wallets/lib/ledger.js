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
exports.LedgerSigner = void 0;
var ethers_1 = require("ethers");
var _version_1 = require("./_version");
var logger = new ethers_1.ethers.utils.Logger(_version_1.version);
var hw_app_eth_1 = __importDefault(require("@ledgerhq/hw-app-eth"));
// We store these in a separated import so it is easier to swap them out
// at bundle time; browsers do not get HID, for example. This maps a string
// "type" to a Transport with create.
var ledger_transport_1 = require("./ledger-transport");
var defaultPath = "m/44'/60'/0'/0/0";
function waiter(duration) {
    return new Promise(function (resolve) {
        setTimeout(resolve, duration);
    });
}
var LedgerSigner = /** @class */ (function (_super) {
    __extends(LedgerSigner, _super);
    function LedgerSigner(provider, type, path) {
        var _this = _super.call(this) || this;
        if (path == null) {
            path = defaultPath;
        }
        if (type == null) {
            type = "default";
        }
        ethers_1.ethers.utils.defineReadOnly(_this, "path", path);
        ethers_1.ethers.utils.defineReadOnly(_this, "type", type);
        ethers_1.ethers.utils.defineReadOnly(_this, "provider", provider || null);
        var transport = ledger_transport_1.transports[type];
        if (!transport) {
            logger.throwArgumentError("unknown or unsupported type", "type", type);
        }
        ethers_1.ethers.utils.defineReadOnly(_this, "_eth", transport.create().then(function (transport) {
            var eth = new hw_app_eth_1.default(transport);
            return eth.getAppConfiguration().then(function (config) {
                return eth;
            }, function (error) {
                return Promise.reject(error);
            });
        }, function (error) {
            return Promise.reject(error);
        }));
        return _this;
    }
    LedgerSigner.prototype._retry = function (callback, timeout) {
        var _this = this;
        return new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
            var eth, i, result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (timeout && timeout > 0) {
                            setTimeout(function () { reject(new Error("timeout")); }, timeout);
                        }
                        return [4 /*yield*/, this._eth];
                    case 1:
                        eth = _a.sent();
                        i = 0;
                        _a.label = 2;
                    case 2:
                        if (!(i < 50)) return [3 /*break*/, 9];
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, callback(eth)];
                    case 4:
                        result = _a.sent();
                        return [2 /*return*/, resolve(result)];
                    case 5:
                        error_1 = _a.sent();
                        if (error_1.id !== "TransportLocked") {
                            return [2 /*return*/, reject(error_1)];
                        }
                        return [3 /*break*/, 6];
                    case 6: return [4 /*yield*/, waiter(100)];
                    case 7:
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        i++;
                        return [3 /*break*/, 2];
                    case 9: return [2 /*return*/, reject(new Error("timeout"))];
                }
            });
        }); });
    };
    LedgerSigner.prototype.getAddress = function () {
        return __awaiter(this, void 0, void 0, function () {
            var account;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._retry(function (eth) { return eth.getAddress(_this.path); })];
                    case 1:
                        account = _a.sent();
                        return [2 /*return*/, ethers_1.ethers.utils.getAddress(account.address)];
                }
            });
        });
    };
    LedgerSigner.prototype.signMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var messageHex, sig;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (typeof (message) === 'string') {
                            message = ethers_1.ethers.utils.toUtf8Bytes(message);
                        }
                        messageHex = ethers_1.ethers.utils.hexlify(message).substring(2);
                        return [4 /*yield*/, this._retry(function (eth) { return eth.signPersonalMessage(_this.path, messageHex); })];
                    case 1:
                        sig = _a.sent();
                        sig.r = '0x' + sig.r;
                        sig.s = '0x' + sig.s;
                        return [2 /*return*/, ethers_1.ethers.utils.joinSignature(sig)];
                }
            });
        });
    };
    LedgerSigner.prototype.signTransaction = function (transaction) {
        return __awaiter(this, void 0, void 0, function () {
            var tx, baseTx, unsignedTx, sig;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, ethers_1.ethers.utils.resolveProperties(transaction)];
                    case 1:
                        tx = _a.sent();
                        baseTx = {
                            chainId: (tx.chainId || undefined),
                            data: (tx.data || undefined),
                            gasLimit: (tx.gasLimit || undefined),
                            gasPrice: (tx.gasPrice || undefined),
                            nonce: (tx.nonce ? ethers_1.ethers.BigNumber.from(tx.nonce).toNumber() : undefined),
                            to: (tx.to || undefined),
                            value: (tx.value || undefined),
                        };
                        unsignedTx = ethers_1.ethers.utils.serializeTransaction(baseTx).substring(2);
                        return [4 /*yield*/, this._retry(function (eth) { return eth.signTransaction(_this.path, unsignedTx); })];
                    case 2:
                        sig = _a.sent();
                        return [2 /*return*/, ethers_1.ethers.utils.serializeTransaction(baseTx, {
                                v: ethers_1.ethers.BigNumber.from("0x" + sig.v).toNumber(),
                                r: ("0x" + sig.r),
                                s: ("0x" + sig.s),
                            })];
                }
            });
        });
    };
    LedgerSigner.prototype.connect = function (provider) {
        return new LedgerSigner(provider, this.type, this.path);
    };
    return LedgerSigner;
}(ethers_1.ethers.Signer));
exports.LedgerSigner = LedgerSigner;
//# sourceMappingURL=ledger.js.map