"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _permanentCensorErrors = false;
var _censorErrors = false;
var LogLevels = { debug: 1, "default": 2, info: 2, warn: 3, error: 4, off: 5 };
var LogLevel = LogLevels["default"];
var _version_1 = require("./_version");
var _globalLogger = null;
function _checkNormalize() {
    try {
        var missing_1 = [];
        // Make sure all forms of normalization are supported
        ["NFD", "NFC", "NFKD", "NFKC"].forEach(function (form) {
            try {
                if ("test".normalize(form) !== "test") {
                    throw new Error("bad normalize");
                }
                ;
            }
            catch (error) {
                missing_1.push(form);
            }
        });
        if (missing_1.length) {
            throw new Error("missing " + missing_1.join(", "));
        }
        if (String.fromCharCode(0xe9).normalize("NFD") !== String.fromCharCode(0x65, 0x0301)) {
            throw new Error("broken implementation");
        }
    }
    catch (error) {
        return error.message;
    }
    return null;
}
var _normalizeError = _checkNormalize();
var Logger = /** @class */ (function () {
    function Logger(version) {
        Object.defineProperty(this, "version", {
            enumerable: true,
            value: version,
            writable: false
        });
    }
    Logger.prototype.setLogLevel = function (logLevel) {
        var level = LogLevels[logLevel];
        if (level == null) {
            this.warn("invliad log level - " + logLevel);
            return;
        }
        LogLevel = level;
    };
    Logger.prototype._log = function (logLevel, args) {
        if (LogLevel > LogLevels[logLevel]) {
            return;
        }
        console.log.apply(console, args);
    };
    Logger.prototype.debug = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._log(Logger.levels.DEBUG, args);
    };
    Logger.prototype.info = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._log(Logger.levels.INFO, args);
    };
    Logger.prototype.warn = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        this._log(Logger.levels.WARNING, args);
    };
    Logger.prototype.makeError = function (message, code, params) {
        if (_censorErrors) {
            return new Error("unknown error");
        }
        if (!code) {
            code = Logger.errors.UNKNOWN_ERROR;
        }
        if (!params) {
            params = {};
        }
        var messageDetails = [];
        Object.keys(params).forEach(function (key) {
            try {
                messageDetails.push(key + "=" + JSON.stringify(params[key]));
            }
            catch (error) {
                messageDetails.push(key + "=" + JSON.stringify(params[key].toString()));
            }
        });
        messageDetails.push("version=" + this.version);
        var reason = message;
        if (messageDetails.length) {
            message += " (" + messageDetails.join(", ") + ")";
        }
        // @TODO: Any??
        var error = new Error(message);
        error.reason = reason;
        error.code = code;
        Object.keys(params).forEach(function (key) {
            error[key] = params[key];
        });
        return error;
    };
    Logger.prototype.throwError = function (message, code, params) {
        throw this.makeError(message, code, params);
    };
    Logger.prototype.throwArgumentError = function (message, name, value) {
        return this.throwError(message, Logger.errors.INVALID_ARGUMENT, {
            argument: name,
            value: value
        });
    };
    Logger.prototype.checkNormalize = function (message) {
        if (message == null) {
            message = "platform missing String.prototype.normalize";
        }
        if (_normalizeError) {
            this.throwError("platform missing String.prototype.normalize", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "String.prototype.normalize", form: _normalizeError
            });
        }
    };
    Logger.prototype.checkSafeUint53 = function (value, message) {
        if (typeof (value) !== "number") {
            return;
        }
        if (message == null) {
            message = "value not safe";
        }
        if (value < 0 || value >= 0x1fffffffffffff) {
            this.throwError(message, Logger.errors.NUMERIC_FAULT, {
                operation: "checkSafeInteger",
                fault: "out-of-safe-range",
                value: value
            });
        }
        if (value % 1) {
            this.throwError(message, Logger.errors.NUMERIC_FAULT, {
                operation: "checkSafeInteger",
                fault: "non-integer",
                value: value
            });
        }
    };
    Logger.prototype.checkArgumentCount = function (count, expectedCount, message) {
        if (message) {
            message = ": " + message;
        }
        else {
            message = "";
        }
        if (count < expectedCount) {
            this.throwError("missing argument" + message, Logger.errors.MISSING_ARGUMENT, {
                count: count,
                expectedCount: expectedCount
            });
        }
        if (count > expectedCount) {
            this.throwError("too many arguments" + message, Logger.errors.UNEXPECTED_ARGUMENT, {
                count: count,
                expectedCount: expectedCount
            });
        }
    };
    Logger.prototype.checkNew = function (target, kind) {
        if (target === Object || target == null) {
            this.throwError("missing new", Logger.errors.MISSING_NEW, { name: kind.name });
        }
    };
    Logger.prototype.checkAbstract = function (target, kind) {
        if (target === kind) {
            this.throwError("cannot instantiate abstract class " + JSON.stringify(kind.name) + " directly; use a sub-class", Logger.errors.UNSUPPORTED_OPERATION, { name: target.name, operation: "new" });
        }
        else if (target === Object || target == null) {
            this.throwError("missing new", Logger.errors.MISSING_NEW, { name: kind.name });
        }
    };
    Logger.globalLogger = function () {
        if (!_globalLogger) {
            _globalLogger = new Logger(_version_1.version);
        }
        return _globalLogger;
    };
    Logger.setCensorship = function (censorship, permanent) {
        if (_permanentCensorErrors) {
            if (!censorship) {
                return;
            }
            this.globalLogger().throwError("error censorship permanent", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "setCensorship"
            });
        }
        _censorErrors = !!censorship;
        _permanentCensorErrors = !!permanent;
    };
    Logger.errors = {
        ///////////////////
        // Generic Errors
        // Unknown Error
        UNKNOWN_ERROR: "UNKNOWN_ERROR",
        // Not Implemented
        NOT_IMPLEMENTED: "NOT_IMPLEMENTED",
        // Unsupported Operation
        //   - operation
        UNSUPPORTED_OPERATION: "UNSUPPORTED_OPERATION",
        // Network Error (i.e. Ethereum Network, such as an invalid chain ID)
        NETWORK_ERROR: "NETWORK_ERROR",
        // Some sort of bad response from the server
        SERVER_ERROR: "SERVER_ERROR",
        // Timeout
        TIMEOUT: "TIMEOUT",
        ///////////////////
        // Operational  Errors
        // Buffer Overrun
        BUFFER_OVERRUN: "BUFFER_OVERRUN",
        // Numeric Fault
        //   - operation: the operation being executed
        //   - fault: the reason this faulted
        NUMERIC_FAULT: "NUMERIC_FAULT",
        ///////////////////
        // Argument Errors
        // Missing new operator to an object
        //  - name: The name of the class
        MISSING_NEW: "MISSING_NEW",
        // Invalid argument (e.g. value is incompatible with type) to a function:
        //   - argument: The argument name that was invalid
        //   - value: The value of the argument
        INVALID_ARGUMENT: "INVALID_ARGUMENT",
        // Missing argument to a function:
        //   - count: The number of arguments received
        //   - expectedCount: The number of arguments expected
        MISSING_ARGUMENT: "MISSING_ARGUMENT",
        // Too many arguments
        //   - count: The number of arguments received
        //   - expectedCount: The number of arguments expected
        UNEXPECTED_ARGUMENT: "UNEXPECTED_ARGUMENT",
        ///////////////////
        // Blockchain Errors
        // Call exception
        //  - transaction: the transaction
        //  - address?: the contract address
        //  - args?: The arguments passed into the function
        //  - method?: The Solidity method signature
        //  - errorSignature?: The EIP848 error signature
        //  - errorArgs?: The EIP848 error parameters
        //  - reason: The reason (only for EIP848 "Error(string)")
        CALL_EXCEPTION: "CALL_EXCEPTION",
        // Insufficien funds (< value + gasLimit * gasPrice)
        //   - transaction: the transaction attempted
        INSUFFICIENT_FUNDS: "INSUFFICIENT_FUNDS",
        // Nonce has already been used
        //   - transaction: the transaction attempted
        NONCE_EXPIRED: "NONCE_EXPIRED",
        // The replacement fee for the transaction is too low
        //   - transaction: the transaction attempted
        REPLACEMENT_UNDERPRICED: "REPLACEMENT_UNDERPRICED",
        // The gas limit could not be estimated
        //   - transaction: the transaction passed to estimateGas
        UNPREDICTABLE_GAS_LIMIT: "UNPREDICTABLE_GAS_LIMIT",
    };
    Logger.levels = {
        DEBUG: "DEBUG",
        INFO: "INFO",
        WARNING: "WARNING",
        ERROR: "ERROR",
        OFF: "OFF"
    };
    return Logger;
}());
exports.Logger = Logger;
