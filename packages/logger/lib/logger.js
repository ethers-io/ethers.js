var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Logger_instances, _Logger_getBytes, _Logger_log;
import { version } from "./_version.js";
export var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "DEBUG";
    LogLevel["INFO"] = "INFO";
    LogLevel["WARNING"] = "WARNING";
    LogLevel["ERROR"] = "ERROR";
    LogLevel["OFF"] = "OFF";
})(LogLevel || (LogLevel = {}));
;
const LogLevels = { debug: 1, "default": 2, info: 2, warning: 3, error: 4, off: 5 };
let _logLevel = LogLevels["default"];
let _globalLogger = null;
const _normalizeForms = ["NFD", "NFC", "NFKD", "NFKC"].reduce((accum, form) => {
    try {
        // General test for normalize
        /* c8 ignore start */
        if ("test".normalize(form) !== "test") {
            throw new Error("bad");
        }
        ;
        /* c8 ignore stop */
        if (form === "NFD") {
            const check = String.fromCharCode(0xe9).normalize("NFD");
            const expected = String.fromCharCode(0x65, 0x0301);
            /* c8 ignore start */
            if (check !== expected) {
                throw new Error("broken");
            }
            /* c8 ignore stop */
        }
        accum.push(form);
    }
    catch (error) { }
    return accum;
}, []);
function defineReadOnly(object, name, value) {
    Object.defineProperty(object, name, {
        enumerable: true, writable: false, value,
    });
}
// IEEE 754 support 53-bits of mantissa
const maxValue = 0x1fffffffffffff;
// The type of error to use for various error codes
const ErrorConstructors = {};
ErrorConstructors.INVALID_ARGUMENT = TypeError;
ErrorConstructors.NUMERIC_FAULT = RangeError;
ErrorConstructors.BUFFER_OVERRUN = RangeError;
export class Logger {
    constructor(version) {
        _Logger_instances.add(this);
        defineReadOnly(this, "version", version || "_");
    }
    makeError(message, code, info) {
        {
            const details = [];
            if (info) {
                for (const key in info) {
                    const value = (info[key]);
                    try {
                        details.push(key + "=" + JSON.stringify(value));
                    }
                    catch (error) {
                        details.push(key + "=[could not serialize object]");
                    }
                }
            }
            details.push(`code=${code}`);
            details.push(`version=${this.version}`);
            if (details.length) {
                message += " (" + details.join(", ") + ")";
            }
        }
        const create = ErrorConstructors[code] || Error;
        const error = (new create(message));
        defineReadOnly(error, "code", code);
        if (info) {
            for (const key in info) {
                defineReadOnly(error, key, (info[key]));
            }
        }
        return error;
    }
    throwError(message, code, info) {
        throw this.makeError(message, code, info);
    }
    throwArgumentError(message, name, value) {
        return this.throwError(message, "INVALID_ARGUMENT", {
            argument: name,
            value: value
        });
    }
    assert(condition, message, code, info) {
        if (!!condition) {
            return;
        }
        this.throwError(message, code || "UNKNOWN_ERROR", info);
    }
    assertArgument(condition, message, name, value) {
        return this.assert(condition, message, "INVALID_ARGUMENT", {
            argument: name,
            value
        });
    }
    assertIntegerArgument(name, value, lower, upper) {
        let message = null;
        if (typeof (value) !== "number") {
            message = "expected a number";
        }
        else if (!Number.isInteger(value)) {
            message = "invalid integer";
        }
        else if ((lower != null && value < lower) || (upper != null && value > upper)) {
            message = "value is out of range";
        }
        if (message) {
            this.throwArgumentError(message, name, value);
        }
    }
    assertSafeUint53(value, message) {
        this.assertArgument((typeof (value) === "number"), "invalid number", "value", value);
        if (message == null) {
            message = "value not safe";
        }
        const operation = "assertSafeInteger";
        this.assert((value >= 0 && value < 0x1fffffffffffff), message, "NUMERIC_FAULT", {
            operation, fault: "out-of-safe-range", value
        });
        this.assert((value % 1) === 0, message, "NUMERIC_FAULT", {
            operation, fault: "non-integer", value
        });
    }
    assertNormalize(form) {
        if (_normalizeForms.indexOf(form) === -1) {
            this.throwError("platform missing String.prototype.normalize", "UNSUPPORTED_OPERATION", {
                operation: "String.prototype.normalize", info: { form }
            });
        }
    }
    assertPrivate(givenGuard, guard, className = "") {
        if (givenGuard !== guard) {
            let method = className, operation = "new";
            if (className) {
                method += ".";
                operation += " " + className;
            }
            this.throwError(`private constructor; use ${method}from* methods`, "UNSUPPORTED_OPERATION", {
                operation
            });
        }
    }
    assertArgumentCount(count, expectedCount, message = "") {
        if (message) {
            message = ": " + message;
        }
        this.assert((count >= expectedCount), "missing arguemnt" + message, "MISSING_ARGUMENT", {
            count: count,
            expectedCount: expectedCount
        });
        this.assert((count >= expectedCount), "too many arguemnts" + message, "UNEXPECTED_ARGUMENT", {
            count: count,
            expectedCount: expectedCount
        });
    }
    getBytes(value, name) {
        return __classPrivateFieldGet(this, _Logger_instances, "m", _Logger_getBytes).call(this, value, name, false);
    }
    getBytesCopy(value, name) {
        return __classPrivateFieldGet(this, _Logger_instances, "m", _Logger_getBytes).call(this, value, name, true);
    }
    getNumber(value, name) {
        switch (typeof (value)) {
            case "bigint":
                if (value < -maxValue || value > maxValue) {
                    this.throwArgumentError("overflow", name || "value", value);
                }
                return Number(value);
            case "number":
                if (!Number.isInteger(value)) {
                    this.throwArgumentError("underflow", name || "value", value);
                }
                else if (value < -maxValue || value > maxValue) {
                    this.throwArgumentError("overflow", name || "value", value);
                }
                return value;
            case "string":
                try {
                    return this.getNumber(BigInt(value), name);
                }
                catch (e) {
                    this.throwArgumentError(`invalid numeric string: ${e.message}`, name || "value", value);
                }
        }
        return this.throwArgumentError("invalid numeric value", name || "value", value);
    }
    getBigInt(value, name) {
        switch (typeof (value)) {
            case "bigint": return value;
            case "number":
                if (!Number.isInteger(value)) {
                    this.throwArgumentError("underflow", name || "value", value);
                }
                else if (value < -maxValue || value > maxValue) {
                    this.throwArgumentError("overflow", name || "value", value);
                }
                return BigInt(value);
            case "string":
                try {
                    return BigInt(value);
                }
                catch (e) {
                    this.throwArgumentError(`invalid BigNumberish string: ${e.message}`, name || "value", value);
                }
        }
        return this.throwArgumentError("invalid BigNumberish value", name || "value", value);
    }
    debug(...args) {
        __classPrivateFieldGet(this, _Logger_instances, "m", _Logger_log).call(this, LogLevel.DEBUG, args);
    }
    info(...args) {
        __classPrivateFieldGet(this, _Logger_instances, "m", _Logger_log).call(this, LogLevel.INFO, args);
    }
    warn(...args) {
        __classPrivateFieldGet(this, _Logger_instances, "m", _Logger_log).call(this, LogLevel.WARNING, args);
    }
    static globalLogger() {
        if (!_globalLogger) {
            _globalLogger = new Logger(version);
        }
        return _globalLogger;
    }
    static setLogLevel(logLevel) {
        const level = LogLevels[logLevel.toLowerCase()];
        if (level == null) {
            Logger.globalLogger().warn("invalid log level - " + logLevel);
            return;
        }
        _logLevel = level;
    }
}
_Logger_instances = new WeakSet(), _Logger_getBytes = function _Logger_getBytes(value, name, copy) {
    if (value instanceof Uint8Array) {
        if (copy) {
            return new Uint8Array(value);
        }
        return value;
    }
    if (typeof (value) === "string" && value.match(/^0x([0-9a-f][0-9a-f])*$/i)) {
        const result = new Uint8Array((value.length - 2) / 2);
        let offset = 2;
        for (let i = 0; i < result.length; i++) {
            result[i] = parseInt(value.substring(offset, offset + 2), 16);
            offset += 2;
        }
        return result;
    }
    return this.throwArgumentError("invalid BytesLike value", name || "value", value);
}, _Logger_log = function _Logger_log(logLevel, args) {
    const level = logLevel.toLowerCase();
    if (LogLevels[level] == null) {
        this.throwArgumentError("invalid log level name", "logLevel", logLevel);
    }
    if (_logLevel > LogLevels[level]) {
        return;
    }
    console.log.apply(console, args);
};
Logger.LogLevels = LogLevel;
//# sourceMappingURL=logger.js.map