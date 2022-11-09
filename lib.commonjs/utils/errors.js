"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assertPrivate = exports.assertNormalize = exports.assertArgumentCount = exports.assertArgument = exports.assert = exports.makeError = exports.isCallException = exports.isError = void 0;
const _version_js_1 = require("../_version.js");
const properties_js_1 = require("./properties.js");
// The type of error to use for various error codes
const ErrorConstructors = {};
ErrorConstructors.INVALID_ARGUMENT = TypeError;
ErrorConstructors.NUMERIC_FAULT = RangeError;
ErrorConstructors.BUFFER_OVERRUN = RangeError;
/**
 *  Returns true if the %%error%% matches an error thrown by ethers
 *  that matches the error %%code%%.
 *
 *  In TypeScript envornoments, this can be used to check that %%error%%
 *  matches an EthersError type, which means the expected properties will
 *  be set.
 *
 *  @See [ErrorCodes](api:ErrorCode)
 *  @example
 *  try {
 *      // code....
 *  } catch (e) {
 *      if (isError(e, "CALL_EXCEPTION")) {
 *          console.log(e.data);
 *      }
 *  }
 */
function isError(error, code) {
    return (error && error.code === code);
}
exports.isError = isError;
/**
 *  Returns true if %%error%% is a [CALL_EXCEPTION](api:CallExceptionError).
 */
function isCallException(error) {
    return isError(error, "CALL_EXCEPTION");
}
exports.isCallException = isCallException;
/**
 *  Returns a new Error configured to the format ethers emits errors, with
 *  the %%message%%, [[api:ErrorCode]] %%code%% and additioanl properties
 *  for the corresponding EthersError.
 *
 *  Each error in ethers includes the version of ethers, a
 *  machine-readable [[ErrorCode]], and depneding on %%code%%, additional
 *  required properties. The error message will also include the %%meeage%%,
 *  ethers version, %%code%% and all aditional properties, serialized.
 */
function makeError(message, code, info) {
    {
        const details = [];
        if (info) {
            if ("message" in info || "code" in info || "name" in info) {
                throw new Error(`value will overwrite populated values: ${JSON.stringify(info)}`);
            }
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
        details.push(`version=${_version_js_1.version}`);
        if (details.length) {
            message += " (" + details.join(", ") + ")";
        }
    }
    const create = ErrorConstructors[code] || Error;
    const error = (new create(message));
    (0, properties_js_1.defineReadOnly)(error, "code", code);
    if (info) {
        for (const key in info) {
            (0, properties_js_1.defineReadOnly)(error, key, (info[key]));
        }
    }
    return error;
}
exports.makeError = makeError;
/**
 *  Throws an EthersError with %%message%%, %%code%% and additional error
 *  %%info%% when %%check%% is falsish..
 *
 *  @see [[api:makeError]]
 */
function assert(check, message, code, info) {
    if (!check) {
        throw makeError(message, code, info);
    }
}
exports.assert = assert;
/**
 *  A simple helper to simply ensuring provided arguments match expected
 *  constraints, throwing if not.
 *
 *  In TypeScript environments, the %%check%% has been asserted true, so
 *  any further code does not need additional compile-time checks.
 */
function assertArgument(check, message, name, value) {
    assert(check, message, "INVALID_ARGUMENT", { argument: name, value: value });
}
exports.assertArgument = assertArgument;
function assertArgumentCount(count, expectedCount, message = "") {
    if (message) {
        message = ": " + message;
    }
    assert(count >= expectedCount, "missing arguemnt" + message, "MISSING_ARGUMENT", {
        count: count,
        expectedCount: expectedCount
    });
    assert(count <= expectedCount, "too many arguemnts" + message, "UNEXPECTED_ARGUMENT", {
        count: count,
        expectedCount: expectedCount
    });
}
exports.assertArgumentCount = assertArgumentCount;
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
/**
 *  Throws if the normalization %%form%% is not supported.
 */
function assertNormalize(form) {
    assert(_normalizeForms.indexOf(form) >= 0, "platform missing String.prototype.normalize", "UNSUPPORTED_OPERATION", {
        operation: "String.prototype.normalize", info: { form }
    });
}
exports.assertNormalize = assertNormalize;
/**
 *  Many classes use file-scoped values to guard the constructor,
 *  making it effectively private. This facilitates that pattern
 *  by ensuring the %%givenGaurd%% matches the file-scoped %%guard%%,
 *  throwing if not, indicating the %%className%% if provided.
 */
function assertPrivate(givenGuard, guard, className = "") {
    if (givenGuard !== guard) {
        let method = className, operation = "new";
        if (className) {
            method += ".";
            operation += " " + className;
        }
        assert(false, `private constructor; use ${method}from* methods`, "UNSUPPORTED_OPERATION", {
            operation
        });
    }
}
exports.assertPrivate = assertPrivate;
//# sourceMappingURL=errors.js.map