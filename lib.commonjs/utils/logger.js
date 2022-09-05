"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertArgument = exports.logger = exports.Logger = void 0;
const _version_js_1 = require("../_version.js");
const LogLevels = ["debug", "info", "warning", "error", "off"];
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
class Logger {
    version;
    #logLevel;
    constructor(version) {
        defineReadOnly(this, "version", version || "_");
        this.#logLevel = 1;
    }
    get logLevel() {
        return LogLevels[this.#logLevel];
    }
    set logLevel(value) {
        const logLevel = LogLevels.indexOf(value);
        if (logLevel == null) {
            this.throwArgumentError("invalid logLevel", "logLevel", value);
        }
        this.#logLevel = logLevel;
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
        if (count < expectedCount) {
            this.throwError("missing arguemnt" + message, "MISSING_ARGUMENT", {
                count: count,
                expectedCount: expectedCount
            });
        }
        if (count > expectedCount) {
            this.throwError("too many arguemnts" + message, "UNEXPECTED_ARGUMENT", {
                count: count,
                expectedCount: expectedCount
            });
        }
    }
    #getBytes(value, name, copy) {
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
    }
    getBytes(value, name) {
        return this.#getBytes(value, name, false);
    }
    getBytesCopy(value, name) {
        return this.#getBytes(value, name, true);
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
    #log(_logLevel, args) {
        const logLevel = LogLevels.indexOf(_logLevel);
        if (logLevel === -1) {
            this.throwArgumentError("invalid log level name", "logLevel", _logLevel);
        }
        if (this.#logLevel > logLevel) {
            return;
        }
        console.log.apply(console, args);
    }
    debug(...args) {
        this.#log("debug", args);
    }
    info(...args) {
        this.#log("info", args);
    }
    warn(...args) {
        this.#log("warning", args);
    }
}
exports.Logger = Logger;
exports.logger = new Logger(_version_js_1.version);
function assertArgument(check, message, name, value) {
    if (!check) {
        exports.logger.throwArgumentError(message, name, value);
    }
}
exports.assertArgument = assertArgument;
//# sourceMappingURL=logger.js.map