import type { BytesLike } from "../utils/index.js";
/**
 *  Compute the cryptographic RIPEMD-160 hash of %%data%%.
 *
 *  @returns DataHexstring
 */
export declare function ripemd160(_data: BytesLike): string;
export declare namespace ripemd160 {
    var _: (data: Uint8Array) => Uint8Array;
    var lock: () => void;
    var register: (func: (data: Uint8Array) => BytesLike) => void;
}
//# sourceMappingURL=ripemd160.d.ts.map