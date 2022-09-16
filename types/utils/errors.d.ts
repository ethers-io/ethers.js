import type { TransactionRequest, TransactionReceipt, TransactionResponse } from "../providers/index.js";
import type { FetchRequest, FetchResponse } from "./fetch.js";
export declare type ErrorInfo<T> = Omit<T, "code" | "name" | "message">;
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
export declare type ErrorCode = "UNKNOWN_ERROR" | "NOT_IMPLEMENTED" | "UNSUPPORTED_OPERATION" | "NETWORK_ERROR" | "SERVER_ERROR" | "TIMEOUT" | "BAD_DATA" | "CANCELLED" | "BUFFER_OVERRUN" | "NUMERIC_FAULT" | "INVALID_ARGUMENT" | "MISSING_ARGUMENT" | "UNEXPECTED_ARGUMENT" | "VALUE_MISMATCH" | "CALL_EXCEPTION" | "INSUFFICIENT_FUNDS" | "NONCE_EXPIRED" | "REPLACEMENT_UNDERPRICED" | "TRANSACTION_REPLACED" | "UNPREDICTABLE_GAS_LIMIT" | "UNCONFIGURED_NAME" | "OFFCHAIN_FAULT" | "ACTION_REJECTED";
export interface EthersError<T extends ErrorCode = ErrorCode> extends Error {
    code: ErrorCode;
    info?: Record<string, any>;
    error?: Error;
}
export interface UnknownError extends EthersError<"UNKNOWN_ERROR"> {
    [key: string]: any;
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
export interface InvalidArgumentError extends EthersError<"INVALID_ARGUMENT"> {
    argument: string;
    value: any;
    info?: Record<string, any>;
}
export interface MissingArgumentError extends EthersError<"MISSING_ARGUMENT"> {
    count: number;
    expectedCount: number;
}
export interface UnexpectedArgumentError extends EthersError<"UNEXPECTED_ARGUMENT"> {
    count: number;
    expectedCount: number;
}
export interface CallExceptionError extends EthersError<"CALL_EXCEPTION"> {
    data: string;
    transaction?: any;
    method?: string;
    signature?: string;
    args?: ReadonlyArray<any>;
    errorSignature?: string;
    errorName?: string;
    errorArgs?: ReadonlyArray<any>;
    reason?: string;
}
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
    action: string;
}
/**
 *  A conditional type that transforms the [[ErrorCode]] T into
 *  its EthersError type.
 *
 *  @flatworm-skip-docs
 */
export declare type CodedEthersError<T> = T extends "UNKNOWN_ERROR" ? UnknownError : T extends "NOT_IMPLEMENTED" ? NotImplementedError : T extends "UNSUPPORTED_OPERATION" ? UnsupportedOperationError : T extends "NETWORK_ERROR" ? NetworkError : T extends "SERVER_ERROR" ? ServerError : T extends "TIMEOUT" ? TimeoutError : T extends "BAD_DATA" ? BadDataError : T extends "CANCELLED" ? CancelledError : T extends "BUFFER_OVERRUN" ? BufferOverrunError : T extends "NUMERIC_FAULT" ? NumericFaultError : T extends "INVALID_ARGUMENT" ? InvalidArgumentError : T extends "MISSING_ARGUMENT" ? MissingArgumentError : T extends "UNEXPECTED_ARGUMENT" ? UnexpectedArgumentError : T extends "CALL_EXCEPTION" ? CallExceptionError : T extends "INSUFFICIENT_FUNDS" ? InsufficientFundsError : T extends "NONCE_EXPIRED" ? NonceExpiredError : T extends "OFFCHAIN_FAULT" ? OffchainFaultError : T extends "REPLACEMENT_UNDERPRICED" ? ReplacementUnderpricedError : T extends "TRANSACTION_REPLACED" ? TransactionReplacedError : T extends "UNCONFIGURED_NAME" ? UnconfiguredNameError : T extends "UNPREDICTABLE_GAS_LIMIT" ? UnpredictableGasLimitError : T extends "ACTION_REJECTED" ? ActionRejectedError : never;
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
export declare function isError<K extends ErrorCode, T extends CodedEthersError<K>>(error: any, code: K): error is T;
/**
 *  Returns true if %%error%% is a [CALL_EXCEPTION](api:CallExceptionError).
 */
export declare function isCallException(error: any): error is CallExceptionError;
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
export declare function makeError<K extends ErrorCode, T extends CodedEthersError<K>>(message: string, code: K, info?: ErrorInfo<T>): T;
/**
 *  Throws an EthersError with %%message%%, %%code%% and additional error
 *  info.
 *
 *  @see [[api:makeError]]
 */
export declare function throwError<K extends ErrorCode, T extends CodedEthersError<K>>(message: string, code: K, info?: ErrorInfo<T>): never;
/**
 *  Throws an [[api:ArgumentError]] with %%message%% for the parameter with
 *  %%name%% and the %%value%%.
 */
export declare function throwArgumentError(message: string, name: string, value: any): never;
/**
 *  A simple helper to simply ensuring provided arguments match expected
 *  constraints, throwing if not.
 *
 *  In TypeScript environments, the %%check%% has been asserted true, so
 *  any further code does not need additional compile-time checks.
 */
export declare function assertArgument(check: unknown, message: string, name: string, value: unknown): asserts check;
export declare function assertArgumentCount(count: number, expectedCount: number, message?: string): void;
/**
 *  Throws if the normalization %%form%% is not supported.
 */
export declare function assertNormalize(form: string): void;
/**
 *  Many classes use file-scoped values to guard the constructor,
 *  making it effectively private. This facilitates that pattern
 *  by ensuring the %%givenGaurd%% matches the file-scoped %%guard%%,
 *  throwing if not, indicating the %%className%% if provided.
 */
export declare function assertPrivate(givenGuard: any, guard: any, className?: string): void;
//# sourceMappingURL=errors.d.ts.map