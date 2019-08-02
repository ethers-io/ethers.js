import { BytesLike } from "@ethersproject/bytes";
export declare enum UnicodeNormalizationForm {
    current = "",
    NFC = "NFC",
    NFD = "NFD",
    NFKC = "NFKC",
    NFKD = "NFKD"
}
export declare function toUtf8Bytes(str: string, form?: UnicodeNormalizationForm): Uint8Array;
export declare function _toEscapedUtf8String(bytes: BytesLike, ignoreErrors?: boolean): string;
export declare function _toUtf8String(codePoints: Array<number>): string;
export declare function toUtf8String(bytes: BytesLike, ignoreErrors?: boolean): string;
export declare function toUtf8CodePoints(str: string, form?: UnicodeNormalizationForm): Array<number>;
