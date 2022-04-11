import type { BytesLike } from "@ethersproject/logger";
export declare type ProgressCallback = (percent: number) => void;
export declare function scrypt(_passwd: BytesLike, _salt: BytesLike, N: number, r: number, p: number, dkLen: number, progress?: ProgressCallback): Promise<string>;
export declare namespace scrypt {
    var _: (passwd: Uint8Array, salt: Uint8Array, N: number, r: number, p: number, dkLen: number, onProgress?: ProgressCallback | undefined) => Promise<Uint8Array>;
    var lock: () => void;
    var register: (func: (passwd: Uint8Array, salt: Uint8Array, N: number, r: number, p: number, dkLen: number, progress?: ProgressCallback | undefined) => Promise<BytesLike>) => void;
}
export declare function scryptSync(_passwd: BytesLike, _salt: BytesLike, N: number, r: number, p: number, dkLen: number): string;
export declare namespace scryptSync {
    var _: (passwd: Uint8Array, salt: Uint8Array, N: number, r: number, p: number, dkLen: number) => Uint8Array;
    var lock: () => void;
    var register: (func: (passwd: Uint8Array, salt: Uint8Array, N: number, r: number, p: number, dkLen: number) => BytesLike) => void;
}
//# sourceMappingURL=scrypt.d.ts.map