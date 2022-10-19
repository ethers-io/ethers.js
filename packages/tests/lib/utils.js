/* istanbul ignore file */
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.equals = exports.randomNumber = exports.randomHexString = exports.randomBytes = exports.sendTransaction = exports.returnFunds = exports.fundAddress = void 0;
var ethers_1 = require("ethers");
function randomBytes(seed, lower, upper) {
    if (!upper) {
        upper = lower;
    }
    if (upper === 0 && upper === lower) {
        return new Uint8Array(0);
    }
    var result = ethers_1.ethers.utils.arrayify(ethers_1.ethers.utils.keccak256(ethers_1.ethers.utils.toUtf8Bytes(seed)));
    while (result.length < upper) {
        result = ethers_1.ethers.utils.concat([result, ethers_1.ethers.utils.keccak256(ethers_1.ethers.utils.concat([seed, result]))]);
    }
    var top = ethers_1.ethers.utils.arrayify(ethers_1.ethers.utils.keccak256(result));
    var percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;
    return result.slice(0, lower + Math.floor((upper - lower) * percent));
}
exports.randomBytes = randomBytes;
function randomHexString(seed, lower, upper) {
    return ethers_1.ethers.utils.hexlify(randomBytes(seed, lower, upper));
}
exports.randomHexString = randomHexString;
function randomNumber(seed, lower, upper) {
    var top = randomBytes(seed, 3);
    var percent = ((top[0] << 16) | (top[1] << 8) | top[2]) / 0x01000000;
    return lower + Math.floor((upper - lower) * percent);
}
exports.randomNumber = randomNumber;
function equals(a, b) {
    // Array (treat recursively)
    if (Array.isArray(a)) {
        if (!Array.isArray(b) || a.length !== b.length) {
            return false;
        }
        for (var i = 0; i < a.length; i++) {
            if (!equals(a[i], b[i])) {
                return false;
            }
        }
        return true;
    }
    // BigNumber
    if (a.eq) {
        if (!b.eq || !a.eq(b)) {
            return false;
        }
        return true;
    }
    // Uint8Array
    if (a.buffer) {
        if (!b.buffer || a.length !== b.length) {
            return false;
        }
        for (var i = 0; i < a.length; i++) {
            if (a[i] !== b[i]) {
                return false;
            }
        }
        return true;
    }
    // Something else
    return a === b;
}
exports.equals = equals;
function getWallet() {
    var provider = new ethers_1.ethers.providers.InfuraProvider("goerli", "49a0efa3aaee4fd99797bfa94d8ce2f1");
    var key = null;
    // browser
    if (key == null) {
        try {
            if (typeof window !== "undefined") {
                key = window.__karma__.config.args[0];
                if (typeof (key) !== "string") {
                    key = null;
                }
            }
        }
        catch (error) { }
    }
    // node.js
    if (key == null) {
        try {
            key = process.env.FAUCET_PRIVATEKEY;
            if (typeof (key) !== "string") {
                key = null;
            }
        }
        catch (error) { }
    }
    if (key == null) {
        throw new Error("could not find faucet private key");
    }
    return new ethers_1.ethers.Wallet(key, provider);
}
function fundAddress(address) {
    return __awaiter(this, void 0, void 0, function () {
        var faucetWallet, tx, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    faucetWallet = getWallet();
                    return [4 /*yield*/, faucetWallet.sendTransaction({
                            to: address,
                            value: "314159265358979323"
                        })];
                case 1:
                    tx = _a.sent();
                    return [2 /*return*/, tx.wait().then(function (resp) { return resp.transactionHash; })];
                case 2:
                    error_1 = _a.sent();
                    console.log("ERROR getting faucet", error_1);
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
}
exports.fundAddress = fundAddress;
function returnFunds(wallet) {
    return __awaiter(this, void 0, void 0, function () {
        var faucet, provider, gasPrice, balance, tx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    faucet = getWallet();
                    provider = faucet.provider;
                    return [4 /*yield*/, provider.getGasPrice()];
                case 1:
                    gasPrice = _a.sent();
                    return [4 /*yield*/, provider.getBalance(wallet.address)];
                case 2:
                    balance = _a.sent();
                    return [4 /*yield*/, wallet.connect(provider).sendTransaction({
                            to: faucet.address,
                            gasLimit: 21000,
                            gasPrice: gasPrice,
                            value: balance.sub(gasPrice.mul(21000))
                        })];
                case 3:
                    tx = _a.sent();
                    return [2 /*return*/, tx.hash];
            }
        });
    });
}
exports.returnFunds = returnFunds;
function sendTransaction(txObj) {
    return __awaiter(this, void 0, void 0, function () {
        var wallet, tx;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    wallet = getWallet();
                    return [4 /*yield*/, wallet.sendTransaction(txObj)];
                case 1:
                    tx = _a.sent();
                    return [2 /*return*/, tx.hash];
            }
        });
    });
}
exports.sendTransaction = sendTransaction;
//# sourceMappingURL=utils.js.map