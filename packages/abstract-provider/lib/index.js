"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Provider = void 0;
var properties_1 = require("@ethersproject/properties");
var logger_1 = require("@hethers/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
///////////////////////////////
// Exported Abstracts
var Provider = /** @class */ (function () {
    function Provider() {
        var _newTarget = this.constructor;
        logger.checkAbstract(_newTarget, Provider);
        (0, properties_1.defineReadOnly)(this, "_isProvider", true);
    }
    Provider.prototype.getHederaClient = function () {
        return logger.throwError("getHederaClient not implemented", logger_1.Logger.errors.NOT_IMPLEMENTED, {
            operation: 'getHederaClient'
        });
    };
    Provider.prototype.getHederaNetworkConfig = function () {
        return logger.throwError("getHederaNetworkConfig not implemented", logger_1.Logger.errors.NOT_IMPLEMENTED, {
            operation: 'getHederaNetworkConfig'
        });
    };
    // Latest State
    Provider.prototype.getGasPrice = function () {
        return logger.throwArgumentError("getGasPrice not implemented", logger_1.Logger.errors.NOT_IMPLEMENTED, {
            operation: "getGasPrice"
        });
    };
    // Alias for "on"
    Provider.prototype.addListener = function (eventName, listener) {
        return this.on(eventName, listener);
    };
    // Alias for "off"
    Provider.prototype.removeListener = function (eventName, listener) {
        return this.off(eventName, listener);
    };
    Provider.isProvider = function (value) {
        return !!(value && value._isProvider);
    };
    return Provider;
}());
exports.Provider = Provider;
//# sourceMappingURL=index.js.map