import { Arrayish } from './bytes';
export declare enum UnicodeNormalizationForm {
    current = "",
    NFC = "NFC",
    NFD = "NFD",
    NFKC = "NFKC",
    NFKD = "NFKD"
}
export declare function toUtf8Bytes(str: string, form?: UnicodeNormalizationForm): Uint8Array;
export declare function toUtf8String(bytes: Arrayish, ignoreErrors?: boolean): string;
export declare function formatBytes32String(text: string): string;
export declare function parseBytes32String(bytes: Arrayish): string;
