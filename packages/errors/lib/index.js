"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
//import { version } from "./_version";
var version = "@TODO";
///////////////////
// Generic Errors
// Unknown Error
exports.UNKNOWN_ERROR = "UNKNOWN_ERROR";
// Not Implemented
exports.NOT_IMPLEMENTED = "NOT_IMPLEMENTED";
// Unsupported Operation
//   - operation
exports.UNSUPPORTED_OPERATION = "UNSUPPORTED_OPERATION";
// Network Error (i.e. Ethereum Network, such as an invalid chain ID)
exports.NETWORK_ERROR = "NETWORK_ERROR";
// Some sort of bad response from the server
exports.SERVER_ERROR = "SERVER_ERROR";
// Timeout
exports.TIMEOUT = "TIMEOUT";
///////////////////
// Operational  Errors
// Buffer Overrun
exports.BUFFER_OVERRUN = "BUFFER_OVERRUN";
// Numeric Fault
//   - operation: the operation being executed
//   - fault: the reason this faulted
exports.NUMERIC_FAULT = "NUMERIC_FAULT";
///////////////////
// Argument Errors
// Missing new operator to an object
//  - name: The name of the class
exports.MISSING_NEW = "MISSING_NEW";
// Invalid argument (e.g. value is incompatible with type) to a function:
//   - argument: The argument name that was invalid
//   - value: The value of the argument
exports.INVALID_ARGUMENT = "INVALID_ARGUMENT";
// Missing argument to a function:
//   - count: The number of arguments received
//   - expectedCount: The number of arguments expected
exports.MISSING_ARGUMENT = "MISSING_ARGUMENT";
// Too many arguments
//   - count: The number of arguments received
//   - expectedCount: The number of arguments expected
exports.UNEXPECTED_ARGUMENT = "UNEXPECTED_ARGUMENT";
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
exports.CALL_EXCEPTION = "CALL_EXCEPTION";
// Insufficien funds (< value + gasLimit * gasPrice)
//   - transaction: the transaction attempted
exports.INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS";
// Nonce has already been used
//   - transaction: the transaction attempted
exports.NONCE_EXPIRED = "NONCE_EXPIRED";
// The replacement fee for the transaction is too low
//   - transaction: the transaction attempted
exports.REPLACEMENT_UNDERPRICED = "REPLACEMENT_UNDERPRICED";
// The gas limit could not be estimated
//   - transaction: the transaction passed to estimateGas
exports.UNPREDICTABLE_GAS_LIMIT = "UNPREDICTABLE_GAS_LIMIT";
//export const errors: { [ code: string ]: string } = {
//};
///////////////////
// Censorship
var _permanentCensorErrors = false;
var _censorErrors = false;
function setCensorship(censorship, permanent) {
    if (_permanentCensorErrors) {
        throwError("error censorship permanent", exports.UNSUPPORTED_OPERATION, { operation: "setCensorship" });
    }
    _censorErrors = !!censorship;
    _permanentCensorErrors = !!permanent;
}
exports.setCensorship = setCensorship;
///////////////////
// Errors
function makeError(message, code, params) {
    if (_censorErrors) {
        return new Error("unknown error");
    }
    if (!code) {
        code = exports.UNKNOWN_ERROR;
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
    messageDetails.push("version=" + version);
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
}
exports.makeError = makeError;
// @TODO: Enum
function throwError(message, code, params) {
    throw makeError(message, code, params);
}
exports.throwError = throwError;
function throwArgumentError(message, name, value) {
    return throwError(message, exports.INVALID_ARGUMENT, {
        argument: name,
        value: value
    });
}
exports.throwArgumentError = throwArgumentError;
///////////////////
// Checking
function checkArgumentCount(count, expectedCount, suffix) {
    if (suffix) {
        suffix = " " + suffix;
    }
    else {
        suffix = "";
    }
    if (count < expectedCount) {
        throwError("missing argument" + suffix, exports.MISSING_ARGUMENT, { count: count, expectedCount: expectedCount });
    }
    if (count > expectedCount) {
        throwError("too many arguments" + suffix, exports.UNEXPECTED_ARGUMENT, { count: count, expectedCount: expectedCount });
    }
}
exports.checkArgumentCount = checkArgumentCount;
function checkNew(target, kind) {
    if (target === Object || target == null) {
        throwError("missing new", exports.MISSING_NEW, { name: kind.name });
    }
}
exports.checkNew = checkNew;
/*
export function check(target: any: void {
    if (target === Object || target == null) {
        throwError("missing new", MISSING_NEW, { name: kind.name });
    }
}
*/
function checkAbstract(target, kind) {
    if (target === kind) {
        throwError("cannot instantiate abstract class " + JSON.stringify(kind.name) + " directly; use a sub-class", exports.UNSUPPORTED_OPERATION, { name: target.name, operation: "new" });
    }
    else if (target === Object || target == null) {
        throwError("missing new", exports.MISSING_NEW, { name: kind.name });
    }
}
exports.checkAbstract = checkAbstract;
/*
export function checkTarget(target: any, kind: any): void {
    if (target == null) {
        throwError("missing new", MISSING_NEW, { name: kind.name });
    }
}
*/
function _checkNormalize() {
    try {
        var missing_1 = [];
        // Make sure all forms of normalization are supported
        ["NFD", "NFC", "NFKD", "NFKC"].forEach(function (form) {
            try {
                "test".normalize(form);
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
function checkNormalize() {
    if (_normalizeError) {
        throwError("platform missing String.prototype.normalize", exports.UNSUPPORTED_OPERATION, {
            operation: "String.prototype.normalize", form: _normalizeError
        });
    }
}
exports.checkNormalize = checkNormalize;
function checkSafeUint53(value, message) {
    if (typeof (value) !== "number") {
        return;
    }
    if (message == null) {
        message = "value not safe";
    }
    if (value < 0 || value >= 0x1fffffffffffff) {
        throwError(message, exports.NUMERIC_FAULT, {
            operation: "checkSafeInteger",
            fault: "out-of-safe-range",
            value: value
        });
    }
    if (value % 1) {
        throwError(message, exports.NUMERIC_FAULT, {
            operation: "checkSafeInteger",
            fault: "non-integer",
            value: value
        });
    }
}
exports.checkSafeUint53 = checkSafeUint53;
///////////////////
// Logging
var LogLevels = { debug: 1, "default": 2, info: 2, warn: 3, error: 4, off: 5 };
var LogLevel = LogLevels["default"];
function setLogLevel(logLevel) {
    var level = LogLevels[logLevel];
    if (level == null) {
        warn("invalid log level - " + logLevel);
        return;
    }
    LogLevel = level;
}
exports.setLogLevel = setLogLevel;
function log(logLevel, args) {
    if (LogLevel > LogLevels[logLevel]) {
        return;
    }
    console.log.apply(console, args);
}
function warn() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    log("warn", args);
}
exports.warn = warn;
function info() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    log("info", args);
}
exports.info = info;
