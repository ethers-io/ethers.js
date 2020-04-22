"use strict";

//import { version } from "./_version";
const version = "@TODO";


///////////////////
// Generic Errors

// Unknown Error
export const UNKNOWN_ERROR = "UNKNOWN_ERROR";

// Not Implemented
export const NOT_IMPLEMENTED = "NOT_IMPLEMENTED";

// Unsupported Operation
//   - operation
export const UNSUPPORTED_OPERATION = "UNSUPPORTED_OPERATION";

// Network Error (i.e. Ethereum Network, such as an invalid chain ID)
export const NETWORK_ERROR = "NETWORK_ERROR";

// Some sort of bad response from the server
export const SERVER_ERROR = "SERVER_ERROR";

// Timeout
export const TIMEOUT = "TIMEOUT";

///////////////////
// Operational  Errors

// Buffer Overrun
export const BUFFER_OVERRUN = "BUFFER_OVERRUN";

// Numeric Fault
//   - operation: the operation being executed
//   - fault: the reason this faulted
export const NUMERIC_FAULT = "NUMERIC_FAULT";


///////////////////
// Argument Errors

// Missing new operator to an object
//  - name: The name of the class
export const MISSING_NEW = "MISSING_NEW";

// Invalid argument (e.g. value is incompatible with type) to a function:
//   - argument: The argument name that was invalid
//   - value: The value of the argument
export const INVALID_ARGUMENT = "INVALID_ARGUMENT";

// Missing argument to a function:
//   - count: The number of arguments received
//   - expectedCount: The number of arguments expected
export const MISSING_ARGUMENT = "MISSING_ARGUMENT";

// Too many arguments
//   - count: The number of arguments received
//   - expectedCount: The number of arguments expected
export const UNEXPECTED_ARGUMENT = "UNEXPECTED_ARGUMENT";


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
export const CALL_EXCEPTION = "CALL_EXCEPTION";

// Insufficien funds (< value + gasLimit * gasPrice)
//   - transaction: the transaction attempted
export const INSUFFICIENT_FUNDS = "INSUFFICIENT_FUNDS";

// Nonce has already been used
//   - transaction: the transaction attempted
export const NONCE_EXPIRED = "NONCE_EXPIRED";

// The replacement fee for the transaction is too low
//   - transaction: the transaction attempted
export const REPLACEMENT_UNDERPRICED = "REPLACEMENT_UNDERPRICED";

// The gas limit could not be estimated
//   - transaction: the transaction passed to estimateGas
export const UNPREDICTABLE_GAS_LIMIT = "UNPREDICTABLE_GAS_LIMIT";

//export const errors: { [ code: string ]: string } = {
//};

///////////////////
// Censorship

let _permanentCensorErrors = false;
let _censorErrors = false;

export function setCensorship(censorship: boolean, permanent?: boolean): void {
    if (_permanentCensorErrors) {
        throwError("error censorship permanent", UNSUPPORTED_OPERATION, { operation: "setCensorship" });
    }

    _censorErrors = !!censorship;
    _permanentCensorErrors = !!permanent;
}


///////////////////
// Errors

export function makeError(message: string, code: string, params: any): Error {
    if (_censorErrors) {
        return new Error("unknown error");
    }

    if (!code) { code = UNKNOWN_ERROR; }
    if (!params) { params = {}; }

    let messageDetails: Array<string> = [];
    Object.keys(params).forEach((key) => {
        try {
            messageDetails.push(key + "=" + JSON.stringify(params[key]));
        } catch (error) {
            messageDetails.push(key + "=" + JSON.stringify(params[key].toString()));
        }
    });
    messageDetails.push("version=" + version);

    let reason = message;
    if (messageDetails.length) {
        message += " (" + messageDetails.join(", ") + ")";
    }

    // @TODO: Any??
    let error: any = new Error(message);
    error.reason = reason;
    error.code = code

    Object.keys(params).forEach(function(key) {
        error[key] = params[key];
    });

    return error;
}

// @TODO: Enum
export function throwError(message: string, code: string, params: any): never {
    throw makeError(message, code, params);
}


export function throwArgumentError(message: string, name: string, value: any): never {
    return throwError(message, INVALID_ARGUMENT, {
        argument: name,
        value: value
    });
}


///////////////////
// Checking

export function checkArgumentCount(count: number, expectedCount: number, suffix?: string): void {
    if (suffix) {
        suffix = " " + suffix;
    } else {
        suffix = "";
    }

    if (count < expectedCount) {
        throwError("missing argument" + suffix, MISSING_ARGUMENT, { count: count, expectedCount: expectedCount });
    }

    if (count > expectedCount) {
        throwError("too many arguments" + suffix, UNEXPECTED_ARGUMENT, { count: count, expectedCount: expectedCount });
    }
}

export function checkNew(target: any, kind: any): void {
    if (target === Object || target == null) {
        throwError("missing new", MISSING_NEW, { name: kind.name });
    }
}

/*
export function check(target: any: void {
    if (target === Object || target == null) {
        throwError("missing new", MISSING_NEW, { name: kind.name });
    }
}
*/

export function checkAbstract(target: any, kind: any): void {
    if (target === kind) {
        throwError(
            "cannot instantiate abstract class " + JSON.stringify(kind.name) + " directly; use a sub-class",
            UNSUPPORTED_OPERATION,
            { name: target.name, operation: "new" }
        );
    } else if (target === Object || target == null) {
        throwError("missing new", MISSING_NEW, { name: kind.name });
    }
}

/*
export function checkTarget(target: any, kind: any): void {
    if (target == null) {
        throwError("missing new", MISSING_NEW, { name: kind.name });
    }
}
*/
function _checkNormalize(): string {
    try {
        let missing: Array<string> = [ ];

        // Make sure all forms of normalization are supported
        ["NFD", "NFC", "NFKD", "NFKC"].forEach((form) => {
            try {
                "test".normalize(form);
            } catch(error) {
                missing.push(form);
            }
        });

        if (missing.length) {
            throw new Error("missing " + missing.join(", "));
        }

        if (String.fromCharCode(0xe9).normalize("NFD") !== String.fromCharCode(0x65, 0x0301)) {
            throw new Error("broken implementation")
        }
    } catch (error) {
        return error.message;
    }

    return null;
}

let _normalizeError = _checkNormalize();
export function checkNormalize(): void {
    if (_normalizeError) {
        throwError("platform missing String.prototype.normalize", UNSUPPORTED_OPERATION, {
            operation: "String.prototype.normalize", form: _normalizeError
        });
    }
}

export function checkSafeUint53(value: number, message?: string): void {
    if (typeof(value) !== "number") { return; }

    if (message == null) { message = "value not safe"; }

    if (value < 0 || value >= 0x1fffffffffffff) {
        throwError(message, NUMERIC_FAULT, {
            operation: "checkSafeInteger",
            fault: "out-of-safe-range",
            value: value
        });
    }

    if (value % 1) {
        throwError(message, NUMERIC_FAULT, {
            operation: "checkSafeInteger",
            fault: "non-integer",
            value: value
        });
    }
}


///////////////////
// Logging

const LogLevels: { [ name: string ]: number } = { debug: 1, "default": 2, info: 2, warn: 3, error: 4, off: 5 };
let LogLevel = LogLevels["default"];

export function setLogLevel(logLevel: string): void {
    let level = LogLevels[logLevel];
    if (level == null) {
        warn("invalid log level - " + logLevel);
        return;
    }
    LogLevel = level;
}

function log(logLevel: string, args: Array<any>): void {
    if (LogLevel > LogLevels[logLevel]) { return; }
    console.log.apply(console, args);
}

export function warn(...args: Array<any>): void {
    log("warn", args);
}

export function info(...args: Array<any>): void {
    log("info", args);
}
/*
export class Logger {
    readonly version: string;
    _logLevel: number;

    constructor(version?: string) {
        Object.defineProperty(this, "version", {
            enumerable: true,
            value: (version || "unknown"),
            writable: false
        });
        this._logLevel = LogLevels["default"];;
    }

    _log(logLevel: string, args: Array<any>): void {
        if (this._logLevel > LogLevels[logLevel]) { return; }
        console.log.apply(console, args);
    }

    get logLevel(): number {
        return this._logLevel;
    }

    set logLevel(value: string | number) {
        if (typeof(value) === "string") {
            value = LogLevels[value];
            if (logLevel == null) {
                this.warn("invliad log level - " + value);
                return;
            }
        }
        this._logLevel = value;
    }

    warn(...args: Array<any>): void {
        this._log("warn", args);
    }

    log(...args: Array<any>): void {
        this._log("info", args);
    }
}
*/
