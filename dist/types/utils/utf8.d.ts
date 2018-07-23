import { Arrayish } from './types';
export declare enum UnicodeNormalizationForm {
    current = "",
    NFC = "NFC",
    NFD = "NFD",
    NFKC = "NFKC",
    NFKD = "NFKD"
}
export declare function toUtf8Bytes(str: string, form?: UnicodeNormalizationForm): Uint8Array;
export declare function toUtf8String(bytes: Arrayish): string;
//# sourceMappingURL=utf8.d.ts.map