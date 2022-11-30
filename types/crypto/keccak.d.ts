import type { BytesLike } from "../utils/index.js";
/**
 *  Compute the cryptographic KECCAK256 hash of %%data%%.
 *
 *  @returns DataHexstring
 */
export declare function keccak256(_data: BytesLike): string;
export declare namespace keccak256 {
    var _: (data: Uint8Array) => Uint8Array;
    var lock: () => void;
    var register: (func: (data: Uint8Array) => BytesLike) => void;
}
//# sourceMappingURL=keccak.d.ts.map