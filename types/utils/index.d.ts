export interface Freezable<T> {
    clone(): T;
    freeze(): Frozen<T>;
    isFrozen(): boolean;
}
export declare type Frozen<T> = Readonly<{
    [P in keyof T]: T[P] extends (...args: Array<any>) => any ? T[P] : T[P] extends Freezable<any> ? Frozen<T[P]> : Readonly<T[P]>;
}>;
export { decodeBase58, encodeBase58 } from "./base58.js";
export { decodeBase64, encodeBase64 } from "./base64.js";
export { isHexString, isBytesLike, hexlify, concat, dataLength, dataSlice, stripZerosLeft, zeroPadValue, zeroPadBytes } from "./data.js";
export { isCallException, isError } from "./errors.js";
export { EventPayload } from "./events.js";
export { FetchRequest, FetchResponse } from "./fetch.js";
export { FixedFormat, FixedNumber, formatFixed, parseFixed } from "./fixednumber.js";
export { assertArgument, Logger, logger } from "./logger.js";
export { fromTwos, toTwos, mask, toBigInt, toNumber, toHex, toArray, toQuantity } from "./maths.js";
export { resolveProperties, defineReadOnly, defineProperties } from "./properties.js";
export { decodeRlp } from "./rlp-decode.js";
export { encodeRlp } from "./rlp-encode.js";
export { getStore, setStore } from "./storage.js";
export { formatEther, parseEther, formatUnits, parseUnits } from "./units.js";
export { _toEscapedUtf8String, toUtf8Bytes, toUtf8CodePoints, toUtf8String, Utf8ErrorFuncs, } from "./utf8.js";
export type { BytesLike } from "./data.js";
export type { ErrorSignature, ErrorFetchRequestWithBody, ErrorFetchRequest, ErrorFetchResponseWithBody, ErrorFetchResponse, ErrorCode, EthersError, UnknownError, NotImplementedError, UnsupportedOperationError, NetworkError, ServerError, TimeoutError, BadDataError, CancelledError, BufferOverrunError, NumericFaultError, InvalidArgumentError, MissingArgumentError, UnexpectedArgumentError, CallExceptionError, InsufficientFundsError, NonceExpiredError, OffchainFaultError, ReplacementUnderpricedError, TransactionReplacedError, UnconfiguredNameError, UnpredictableGasLimitError, ActionRejectedError, CodedEthersError } from "./errors.js";
export type { EventEmitterable, Listener } from "./events.js";
export type { GetUrlResponse, FetchRequestWithBody, FetchResponseWithBody, FetchPreflightFunc, FetchProcessFunc, FetchRetryFunc, FetchGatewayFunc, FetchGetUrlFunc } from "./fetch.js";
export { BigNumberish, Numeric } from "./maths.js";
export type { RlpStructuredData } from "./rlp.js";
export type { Utf8ErrorFunc, UnicodeNormalizationForm, Utf8ErrorReason } from "./utf8.js";
//# sourceMappingURL=index.d.ts.map