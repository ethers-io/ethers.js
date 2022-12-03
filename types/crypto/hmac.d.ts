import type { BytesLike } from "../utils/index.js";
/**
 *  Return the HMAC for %%data%% using the %%key%% key with the underlying
 *  %%algo%% used for compression.
 */
export declare function computeHmac(algorithm: "sha256" | "sha512", _key: BytesLike, _data: BytesLike): string;
export declare namespace computeHmac {
    var _: (algorithm: "sha256" | "sha512", key: Uint8Array, data: Uint8Array) => BytesLike;
    var lock: () => void;
    var register: (func: (algorithm: "sha256" | "sha512", key: Uint8Array, data: Uint8Array) => BytesLike) => void;
}
//# sourceMappingURL=hmac.d.ts.map