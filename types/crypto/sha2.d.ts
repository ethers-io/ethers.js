import type { BytesLike } from "../utils/index.js";
export declare function sha256(_data: BytesLike): string;
export declare namespace sha256 {
    var _: (data: Uint8Array) => Uint8Array;
    var lock: () => void;
    var register: (func: (data: Uint8Array) => BytesLike) => void;
}
export declare function sha512(_data: BytesLike): string;
export declare namespace sha512 {
    var _: (data: Uint8Array) => Uint8Array;
    var lock: () => void;
    var register: (func: (data: Uint8Array) => BytesLike) => void;
}
//# sourceMappingURL=sha2.d.ts.map