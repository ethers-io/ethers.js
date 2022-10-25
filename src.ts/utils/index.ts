
////

export interface Freezable<T> {
    clone(): T;
    freeze(): Frozen<T>;
    isFrozen(): boolean;
}

export type Frozen<T> = Readonly<{
    [ P in keyof T ]: T[P] extends (...args: Array<any>) => any ? T[P]:
                      T[P] extends Freezable<any> ? Frozen<T[P]>:
                      Readonly<T[P]>;
}>;


export { decodeBase58, encodeBase58 } from "./base58.js";

export { decodeBase64, encodeBase64 } from "./base64.js";

export {
    getBytes, getBytesCopy, isHexString, isBytesLike, hexlify, concat, dataLength, dataSlice,
    stripZerosLeft, zeroPadValue, zeroPadBytes
} from "./data.js";

export {
    isCallException, isError,
    makeError, throwError,
    assertArgument, assertArgumentCount, assertPrivate, assertNormalize
} from "./errors.js"

export { EventPayload } from "./events.js";

export {
    getIpfsGatewayFunc,
    FetchRequest, FetchResponse, FetchCancelSignal,
} from "./fetch.js";

export { FixedFormat, FixedNumber, formatFixed, parseFixed } from "./fixednumber.js"

export {
    fromTwos, toTwos, mask,
    getBigInt, getNumber, toBigInt, toNumber, toHex, toArray, toQuantity
} from "./maths.js";

export { resolveProperties, defineReadOnly, defineProperties} from "./properties.js";

export { decodeRlp } from "./rlp-decode.js";
export { encodeRlp } from "./rlp-encode.js";

export { getStore, setStore} from "./storage.js";

export { formatEther, parseEther, formatUnits, parseUnits } from "./units.js";

export {
    toUtf8Bytes,
    toUtf8CodePoints,
    toUtf8String,

    Utf8ErrorFuncs,
} from "./utf8.js";


/////////////////////////////
// Types

export type { BytesLike } from "./data.js";

export type {

    //ErrorFetchRequestWithBody, ErrorFetchRequest,
    //ErrorFetchResponseWithBody, ErrorFetchResponse,

    ErrorCode,

    EthersError, UnknownError, NotImplementedError, UnsupportedOperationError, NetworkError,
    ServerError, TimeoutError, BadDataError, CancelledError, BufferOverrunError,
    NumericFaultError, InvalidArgumentError, MissingArgumentError, UnexpectedArgumentError,
    CallExceptionError, InsufficientFundsError, NonceExpiredError, OffchainFaultError,
    ReplacementUnderpricedError, TransactionReplacedError, UnconfiguredNameError,
    ActionRejectedError,

    CallExceptionAction, CallExceptionTransaction,

    CodedEthersError
} from "./errors.js"

export type { EventEmitterable, Listener } from "./events.js";

export type {
    GetUrlResponse,
    FetchPreflightFunc, FetchProcessFunc, FetchRetryFunc,
    FetchGatewayFunc, FetchGetUrlFunc
} from "./fetch.js";

export { BigNumberish, Numeric } from "./maths.js";

export type { RlpStructuredData } from "./rlp.js";

export type {
    Utf8ErrorFunc,
    UnicodeNormalizationForm,
    Utf8ErrorReason
} from "./utf8.js";
