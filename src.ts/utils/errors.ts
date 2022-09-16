import { version } from "../_version.js";

import { defineReadOnly } from "./properties.js";

import type {
    TransactionRequest, TransactionReceipt, TransactionResponse
} from "../providers/index.js";

import type { FetchRequest, FetchResponse } from "./fetch.js";


export type ErrorInfo<T> = Omit<T, "code" | "name" | "message">;

// The type of error to use for various error codes
const ErrorConstructors: Record<string, { new (...args: Array<any>): Error }> = { };
ErrorConstructors.INVALID_ARGUMENT = TypeError;
ErrorConstructors.NUMERIC_FAULT = RangeError;
ErrorConstructors.BUFFER_OVERRUN = RangeError;

/**
 *  All errors emitted by ethers have an **ErrorCode** to help
 *  identify and coalesce errors to simplfy programatic analysis.
 *
 *  _property: ``"UNKNOWN_ERROR"``
 *  This is a general puspose fallback when no other error makes sense
 *  or the error wasn't expected
 *
 *  _property: ``"NOT_IMPLEMENTED"``
 */
export type ErrorCode =

    // Generic Errors
    "UNKNOWN_ERROR" | "NOT_IMPLEMENTED" | "UNSUPPORTED_OPERATION" |
    "NETWORK_ERROR" | "SERVER_ERROR" | "TIMEOUT" | "BAD_DATA" |
    "CANCELLED" |

    // Operational Errors
    "BUFFER_OVERRUN" |  "NUMERIC_FAULT" |

    // Argument Errors
    "INVALID_ARGUMENT" | "MISSING_ARGUMENT" | "UNEXPECTED_ARGUMENT" |
    "VALUE_MISMATCH" |

    // Blockchain Errors
    "CALL_EXCEPTION" | "INSUFFICIENT_FUNDS" | "NONCE_EXPIRED" |
    "REPLACEMENT_UNDERPRICED" | "TRANSACTION_REPLACED" |
    "UNPREDICTABLE_GAS_LIMIT" |
    "UNCONFIGURED_NAME" | "OFFCHAIN_FAULT" |

    // User Interaction
    "ACTION_REJECTED"
;

export interface EthersError<T extends ErrorCode = ErrorCode> extends Error {
    code: ErrorCode;
//    recover?: (...args: Array<any>) => any;
    info?: Record<string, any>;
    error?: Error;
}

// Generic Errors

export interface UnknownError extends EthersError<"UNKNOWN_ERROR"> {
    [ key: string ]: any;
}

export interface NotImplementedError extends EthersError<"NOT_IMPLEMENTED"> {
    operation: string;
}

export interface UnsupportedOperationError extends EthersError<"UNSUPPORTED_OPERATION"> {
    operation: string;
}

export interface NetworkError extends EthersError<"NETWORK_ERROR"> {
    event: string;
}

export interface ServerError extends EthersError<"SERVER_ERROR"> {
    request: FetchRequest | string;
    response?: FetchResponse;
}

export interface TimeoutError extends EthersError<"TIMEOUT"> {
    operation: string;
    reason: string;
    request?: FetchRequest;
}

export interface BadDataError extends EthersError<"BAD_DATA"> {
    value: any;
}

export interface CancelledError extends EthersError<"CANCELLED"> {
}


// Operational Errors

export interface BufferOverrunError extends EthersError<"BUFFER_OVERRUN"> {
    buffer: Uint8Array;
    length: number;
    offset: number;
}

export interface NumericFaultError extends EthersError<"NUMERIC_FAULT"> {
    operation: string;
    fault: string;
    value: any;
}


// Argument Errors

export interface InvalidArgumentError extends EthersError<"INVALID_ARGUMENT"> {
    argument: string;
    value: any;
    info?: Record<string, any>
}

export interface MissingArgumentError extends EthersError<"MISSING_ARGUMENT"> {
    count: number;
    expectedCount: number;
}

export interface UnexpectedArgumentError extends EthersError<"UNEXPECTED_ARGUMENT"> {
    count: number;
    expectedCount: number;
}


// Blockchain Errors

export interface CallExceptionError extends EthersError<"CALL_EXCEPTION"> {
    // The revert data
    data: string;

    // The transaction that triggered the exception
    transaction?: any;

    // The Contract, method and args used during invocation
    method?: string;
    signature?: string;
    args?: ReadonlyArray<any>;

    // The Solidity custom revert error
    errorSignature?: string;
    errorName?: string;
    errorArgs?: ReadonlyArray<any>;
    reason?: string;
}

//export interface ContractCallExceptionError extends CallExceptionError {
    // The transaction call
//    transaction: any;//ErrorTransaction;
//}

export interface InsufficientFundsError extends EthersError<"INSUFFICIENT_FUNDS"> {
    transaction: TransactionRequest;
}

export interface NonceExpiredError extends EthersError<"NONCE_EXPIRED"> {
    transaction: TransactionRequest;
}

export interface OffchainFaultError extends EthersError<"OFFCHAIN_FAULT"> {
    transaction?: TransactionRequest;
    reason: string;
}

export interface ReplacementUnderpricedError extends EthersError<"REPLACEMENT_UNDERPRICED"> {
    transaction: TransactionRequest;
}

export interface TransactionReplacedError extends EthersError<"TRANSACTION_REPLACED"> {
    cancelled: boolean;
    reason: "repriced" | "cancelled" | "replaced";
    hash: string;
    replacement: TransactionResponse;
    receipt: TransactionReceipt;
}

export interface UnconfiguredNameError extends EthersError<"UNCONFIGURED_NAME"> {
    value: string;
}

export interface UnpredictableGasLimitError extends EthersError<"UNPREDICTABLE_GAS_LIMIT"> {
    transaction: TransactionRequest;
}

export interface ActionRejectedError extends EthersError<"ACTION_REJECTED"> {
    action: string
}

// Coding; converts an ErrorCode its Typed Error

/**
 *  A conditional type that transforms the [[ErrorCode]] T into
 *  its EthersError type.
 *
 *  @flatworm-skip-docs
 */
export type CodedEthersError<T> =
    T extends "UNKNOWN_ERROR" ? UnknownError:
    T extends "NOT_IMPLEMENTED" ? NotImplementedError:
    T extends "UNSUPPORTED_OPERATION" ? UnsupportedOperationError:
    T extends "NETWORK_ERROR" ? NetworkError:
    T extends "SERVER_ERROR" ? ServerError:
    T extends "TIMEOUT" ? TimeoutError:
    T extends "BAD_DATA" ? BadDataError:
    T extends "CANCELLED" ? CancelledError:

    T extends "BUFFER_OVERRUN" ? BufferOverrunError:
    T extends "NUMERIC_FAULT" ? NumericFaultError:

    T extends "INVALID_ARGUMENT" ? InvalidArgumentError:
    T extends "MISSING_ARGUMENT" ? MissingArgumentError:
    T extends "UNEXPECTED_ARGUMENT" ? UnexpectedArgumentError:

    T extends "CALL_EXCEPTION" ? CallExceptionError:
    T extends "INSUFFICIENT_FUNDS" ? InsufficientFundsError:
    T extends "NONCE_EXPIRED" ? NonceExpiredError:
    T extends "OFFCHAIN_FAULT" ? OffchainFaultError:
    T extends "REPLACEMENT_UNDERPRICED" ? ReplacementUnderpricedError:
    T extends "TRANSACTION_REPLACED" ? TransactionReplacedError:
    T extends "UNCONFIGURED_NAME" ? UnconfiguredNameError:
    T extends "UNPREDICTABLE_GAS_LIMIT" ? UnpredictableGasLimitError:

    T extends "ACTION_REJECTED" ? ActionRejectedError:

    never;



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
export function isError<K extends ErrorCode, T extends CodedEthersError<K>>(error: any, code: K): error is T {
    return (error && (<EthersError>error).code === code);
}

/**
 *  Returns true if %%error%% is a [CALL_EXCEPTION](api:CallExceptionError).
 */
export function isCallException(error: any): error is CallExceptionError {
    return isError(error, "CALL_EXCEPTION");
}

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
export function makeError<K extends ErrorCode, T extends CodedEthersError<K>>(message: string, code: K, info?: ErrorInfo<T>): T {
    {
        const details: Array<string> = [];
        if (info) {
            if ("message" in info || "code" in info || "name" in info) {
                throw new Error(`value will overwrite populated values: ${ JSON.stringify(info) }`);
            }
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
        details.push(`version=${ version }`);

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

/**
 *  Throws an EthersError with %%message%%, %%code%% and additional error
 *  info.
 *
 *  @see [[api:makeError]]
 */
export function throwError<K extends ErrorCode, T extends CodedEthersError<K>>(message: string, code: K, info?: ErrorInfo<T>): never {
    throw makeError(message, code, info);
}

/**
 *  Throws an [[api:ArgumentError]] with %%message%% for the parameter with
 *  %%name%% and the %%value%%.
 */
export function throwArgumentError(message: string, name: string, value: any): never {
    return throwError(message, "INVALID_ARGUMENT", {
        argument: name,
        value: value
    });
}

/**
 *  A simple helper to simply ensuring provided arguments match expected
 *  constraints, throwing if not.
 *
 *  In TypeScript environments, the %%check%% has been asserted true, so
 *  any further code does not need additional compile-time checks.
 */
export function assertArgument(check: unknown, message: string, name: string, value: unknown): asserts check {
    if (!check) { throwArgumentError(message, name, value); }
}

export function assertArgumentCount(count: number, expectedCount: number, message: string = ""): void {
    if (message) { message = ": " + message; }

    if (count < expectedCount) {
        throwError("missing arguemnt" + message, "MISSING_ARGUMENT", {
            count: count,
            expectedCount: expectedCount
        });
    }

    if (count > expectedCount) {
        throwError("too many arguemnts" + message, "UNEXPECTED_ARGUMENT", {
            count: count,
            expectedCount: expectedCount
        });
    }
}

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

/**
 *  Throws if the normalization %%form%% is not supported.
 */
export function assertNormalize(form: string): void {
    if (_normalizeForms.indexOf(form) === -1) {
        throwError("platform missing String.prototype.normalize", "UNSUPPORTED_OPERATION", {
            operation: "String.prototype.normalize", info: { form }
        });
    }
}

/**
 *  Many classes use file-scoped values to guard the constructor,
 *  making it effectively private. This facilitates that pattern
 *  by ensuring the %%givenGaurd%% matches the file-scoped %%guard%%,
 *  throwing if not, indicating the %%className%% if provided.
 */
export function assertPrivate(givenGuard: any, guard: any, className: string = ""): void {
    if (givenGuard !== guard) {
        let method = className, operation = "new";
        if (className) {
            method += ".";
            operation += " " + className;
        }
        throwError(`private constructor; use ${ method }from* methods`, "UNSUPPORTED_OPERATION", {
            operation
        });
    }
}
