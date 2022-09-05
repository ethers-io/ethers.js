import type { BytesLike } from "./index.js";
export declare type UnicodeNormalizationForm = "NFC" | "NFD" | "NFKC" | "NFKD";
export declare type Utf8ErrorReason = "UNEXPECTED_CONTINUE" | "BAD_PREFIX" | "OVERRUN" | "MISSING_CONTINUE" | "OUT_OF_RANGE" | "UTF16_SURROGATE" | "OVERLONG";
export declare type Utf8ErrorFunc = (reason: Utf8ErrorReason, offset: number, bytes: ArrayLike<number>, output: Array<number>, badCodepoint?: number) => number;
export declare const Utf8ErrorFuncs: Readonly<Record<"error" | "ignore" | "replace", Utf8ErrorFunc>>;
export declare function toUtf8Bytes(str: string, form?: UnicodeNormalizationForm): Uint8Array;
export declare function _toEscapedUtf8String(bytes: BytesLike, onError?: Utf8ErrorFunc): string;
export declare function _toUtf8String(codePoints: Array<number>): string;
export declare function toUtf8String(bytes: BytesLike, onError?: Utf8ErrorFunc): string;
export declare function toUtf8CodePoints(str: string, form?: UnicodeNormalizationForm): Array<number>;
//# sourceMappingURL=utf8.d.ts.map