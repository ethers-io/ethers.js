"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var bytes_1 = require("@ethersproject/bytes");
var errors = __importStar(require("@ethersproject/errors"));
var errors_1 = require("@ethersproject/errors");
var properties_1 = require("@ethersproject/properties");
;
;
//export type CallTransactionable = {
//    call(transaction: TransactionRequest): Promise<TransactionResponse>;
//};
var ForkEvent = /** @class */ (function () {
    function ForkEvent(expiry) {
        properties_1.defineReadOnly(this, "expiry", expiry || 0);
    }
    return ForkEvent;
}());
exports.ForkEvent = ForkEvent;
var BlockForkEvent = /** @class */ (function (_super) {
    __extends(BlockForkEvent, _super);
    function BlockForkEvent(blockhash, expiry) {
        var _this = this;
        if (!bytes_1.isHexString(blockhash, 32)) {
            errors.throwArgumentError("invalid blockhash", "blockhash", blockhash);
        }
        _this = _super.call(this, expiry) || this;
        properties_1.defineReadOnly(_this, "blockhash", blockhash);
        return _this;
    }
    return BlockForkEvent;
}(ForkEvent));
exports.BlockForkEvent = BlockForkEvent;
var TransactionForkEvent = /** @class */ (function (_super) {
    __extends(TransactionForkEvent, _super);
    function TransactionForkEvent(hash, expiry) {
        var _this = this;
        if (!bytes_1.isHexString(hash, 32)) {
            errors.throwArgumentError("invalid transaction hash", "hash", hash);
        }
        _this = _super.call(this, expiry) || this;
        properties_1.defineReadOnly(_this, "hash", hash);
        return _this;
    }
    return TransactionForkEvent;
}(ForkEvent));
exports.TransactionForkEvent = TransactionForkEvent;
var TransactionOrderForkEvent = /** @class */ (function (_super) {
    __extends(TransactionOrderForkEvent, _super);
    function TransactionOrderForkEvent(beforeHash, afterHash, expiry) {
        var _this = this;
        if (!bytes_1.isHexString(beforeHash, 32)) {
            errors.throwArgumentError("invalid transaction hash", "beforeHash", beforeHash);
        }
        if (!bytes_1.isHexString(afterHash, 32)) {
            errors.throwArgumentError("invalid transaction hash", "afterHash", afterHash);
        }
        _this = _super.call(this, expiry) || this;
        properties_1.defineReadOnly(_this, "beforeHash", beforeHash);
        properties_1.defineReadOnly(_this, "afterHash", afterHash);
        return _this;
    }
    return TransactionOrderForkEvent;
}(ForkEvent));
exports.TransactionOrderForkEvent = TransactionOrderForkEvent;
///////////////////////////////
// Exported Abstracts
var Provider = /** @class */ (function () {
    function Provider() {
        var _newTarget = this.constructor;
        errors_1.checkAbstract(_newTarget, Provider);
    }
    // Alias for "on"
    Provider.prototype.addListener = function (eventName, listener) {
        return this.on(eventName, listener);
    };
    // Alias for "off"
    Provider.prototype.removeListener = function (eventName, listener) {
        return this.off(eventName, listener);
    };
    return Provider;
}());
exports.Provider = Provider;
