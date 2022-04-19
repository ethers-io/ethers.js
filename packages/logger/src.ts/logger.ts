import { ErrorCode } from "./errors.js";

import type { CodedEthersError } from "./errors.js";

import { version } from "./_version.js";

export type BytesLike = string | Uint8Array;
export type BigNumberish = string | number | bigint;
export type Numeric = number | bigint;


export type ErrorInfo<T> = Omit<T, "code" | "name" | "message">;

export enum LogLevel {
    DEBUG    = "DEBUG",
    INFO     = "INFO",
    WARNING  = "WARNING",
    ERROR    = "ERROR",
    OFF      = "OFF"
};

const LogLevels: Record<string, number> = { debug: 1, "default": 2, info: 2, warning: 3, error: 4, off: 5 };

let _logLevel = LogLevels["default"];
let _globalLogger: null | Logger = null;

const _normalizeForms = ["NFD", "NFC", "NFKD", "NFKC"].reduce((accum, form) => {
    try {
        // General test for normalize
        /* c8 ignore start */
        if ("test".normalize(form) !== "test") { throw new Error("bad"); };
        /* c8 ignore stop */

        if (form === "NFD") {
            const check = String.fromCharCode(0xe9).normalize("NFD");
            const expected = String.fromCharCode(0x65, 0x0301)
            /* c8 ignore start */
            if (check !== expected) { throw new Error("broken") }
            /* c8 ignore stop */
        }

        accum.push(form);
    } catch(error) { }

    return accum;
}, <Array<string>>[]);

function defineReadOnly<T, P extends keyof T>(object: T, name: P, value: T[P]): void {
    Object.defineProperty(object, name, {
        enumerable: true, writable: false, value,
    });
}

// IEEE 754 support 53-bits of mantissa
const maxValue = 0x1fffffffffffff;

// The type of error to use for various error codes
const ErrorConstructors: Record<string, { new (...args: Array<any>): Error }> = { };
ErrorConstructors.INVALID_ARGUMENT = TypeError;
ErrorConstructors.NUMERIC_FAULT = RangeError;
ErrorConstructors.BUFFER_OVERRUN = RangeError;

export class Logger {
    readonly version!: string;

    static readonly LogLevels = LogLevel;

    constructor(version?: string) {
        defineReadOnly(this, "version", version || "_");
    }

    makeError<K extends ErrorCode, T extends CodedEthersError<K>>(message: string, code: K, info?: ErrorInfo<T>): T {
        {
            const details: Array<string> = [];
            if (info) {
                for (const key in info) {
                    const value = <any>(info[<keyof ErrorInfo<T>>key]);
                    try {
                        details.push(key + "=" + JSON.stringify(value));
                    } catch (error) {
                        details.push(key + "=[could not serialize object]");
                    }
                }
            }
            details.push(`code=${ code }`);
            details.push(`version=${ this.version }`);

            if (details.length) {
                message += " (" + details.join(", ") + ")";
            }
        }

        const create = ErrorConstructors[code] || Error;
        const error = <T>(new create(message));
        defineReadOnly(error, "code", code);
        if (info) {
            for (const key in info) {
                defineReadOnly(error, <keyof T>key, <any>(info[<keyof ErrorInfo<T>>key]));
            }
        }
        return <T>error;
    }

    throwError<K extends ErrorCode, T extends CodedEthersError<K>>(message: string, code: K, info?: ErrorInfo<T>): never {
        throw this.makeError(message, code, info);
    }

    throwArgumentError(message: string, name: string, value: any): never {
        return this.throwError(message, "INVALID_ARGUMENT", {
            argument: name,
            value: value
        });
    }

    assert<K extends ErrorCode, T extends CodedEthersError<K>>(condition: any, message: string, code: K, info?: ErrorInfo<T>): void {
        if (!!condition) { return; }
        this.throwError(message, code || "UNKNOWN_ERROR", info);
    }

    assertArgument(condition: any, message: string, name: string, value: any): void {
        return this.assert(condition, message, "INVALID_ARGUMENT", {
            argument: name,
            value
        });
    }

    assertIntegerArgument(name: string, value: any, lower?: number, upper?: number) {
        let message: null | string = null;
        if (typeof(value) !== "number") {
            message = "expected a number";
        } else if (!Number.isInteger(value)) {
            message = "invalid integer";
        } else if ((lower != null && value < lower) || (upper != null && value > upper)) {
            message = "value is out of range";
        }

        if (message) {
            this.throwArgumentError(message, name, value);
        }
    }

    assertSafeUint53(value: number, message?: string): void {
        this.assertArgument((typeof(value) === "number"), "invalid number", "value", value);

        if (message == null) { message = "value not safe"; }
        const operation = "assertSafeInteger";

        this.assert((value >= 0 && value < 0x1fffffffffffff), message, "NUMERIC_FAULT", {
            operation, fault: "out-of-safe-range", value
        });

        this.assert((value % 1) === 0, message, "NUMERIC_FAULT", {
            operation, fault: "non-integer", value
        });
    }

    assertNormalize(form: string): void {
        if (_normalizeForms.indexOf(form) === -1) {
            this.throwError("platform missing String.prototype.normalize", "UNSUPPORTED_OPERATION", {
                operation: "String.prototype.normalize", info: { form }
            });
        }
    }

    assertPrivate(givenGuard: any, guard: any, className = ""): void {
        if (givenGuard !== guard) {
            let method = className, operation = "new";
            if (className) {
                method += ".";
                operation += " " + className;
            }
            this.throwError(`private constructor; use ${ method }from* methods`, "UNSUPPORTED_OPERATION", {
                operation
            });
        }
    }

    assertArgumentCount(count: number, expectedCount: number, message: string = ""): void {
        if (message) { message = ": " + message; }

        this.assert((count >= expectedCount), "missing arguemnt" + message, "MISSING_ARGUMENT", {
            count: count,
            expectedCount: expectedCount
        });

        this.assert((count >= expectedCount), "too many arguemnts" + message, "UNEXPECTED_ARGUMENT", {
            count: count,
            expectedCount: expectedCount
        });
    }

    #getBytes(value: BytesLike, name?: string, copy?: boolean): Uint8Array {
        if (value instanceof Uint8Array) {
            if (copy) { return new Uint8Array(value); }
            return value;
        }

        if (typeof(value) === "string" && value.match(/^0x([0-9a-f][0-9a-f])*$/i)) {
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

    getBytes(value: BytesLike, name?: string): Uint8Array {
        return this.#getBytes(value, name, false);
    }

    getBytesCopy(value: BytesLike, name?: string): Uint8Array {
        return this.#getBytes(value, name, true);
    }

    getNumber(value: BigNumberish, name?: string): number {
        switch (typeof(value)) {
            case "bigint":
                if (value < -maxValue || value > maxValue) {
                    this.throwArgumentError("overflow", name || "value", value);
                }
                return Number(value);
            case "number":
                if (!Number.isInteger(value)) {
                    this.throwArgumentError("underflow", name || "value", value);
                } else if (value < -maxValue || value > maxValue) {
                    this.throwArgumentError("overflow", name || "value", value);
                }
                return value;
            case "string":
                try {
                    return this.getNumber(BigInt(value), name);
                } catch(e: any) {
                    this.throwArgumentError(`invalid numeric string: ${ e.message }`, name || "value", value);
                }
        }
        return this.throwArgumentError("invalid numeric value", name || "value", value);
    }

    getBigInt(value: BigNumberish, name?: string): bigint {
        switch (typeof(value)) {
            case "bigint": return value;
            case "number":
                if (!Number.isInteger(value)) {
                    this.throwArgumentError("underflow", name || "value", value);
                } else if (value < -maxValue || value > maxValue) {
                    this.throwArgumentError("overflow", name || "value", value);
                }
                return BigInt(value);
            case "string":
                try {
                    return BigInt(value);
                } catch(e: any) {
                    this.throwArgumentError(`invalid BigNumberish string: ${ e.message }`, name || "value", value);
                }
        }
        return this.throwArgumentError("invalid BigNumberish value", name || "value", value);
    }

    #log(logLevel: LogLevel, args: Array<any>): void {
        const level = logLevel.toLowerCase();
        if (LogLevels[level] == null) {
            this.throwArgumentError("invalid log level name", "logLevel", logLevel);
        }
        if (_logLevel > LogLevels[level]) { return; }
        console.log.apply(console, args);
    }

    debug(...args: Array<any>): void {
        this.#log(LogLevel.DEBUG, args);
    }

    info(...args: Array<any>): void {
        this.#log(LogLevel.INFO, args);
    }

    warn(...args: Array<any>): void {
        this.#log(LogLevel.WARNING, args);
    }

    static globalLogger(): Logger {
        if (!_globalLogger) { _globalLogger = new Logger(version); }
        return _globalLogger;
    }

    static setLogLevel(logLevel: LogLevel): void {
        const level = LogLevels[logLevel.toLowerCase()];
        if (level == null) {
            Logger.globalLogger().warn("invalid log level - " + logLevel);
            return;
        }
        _logLevel = level;
    }
}
