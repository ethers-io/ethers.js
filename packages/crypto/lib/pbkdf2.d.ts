import type { BytesLike } from "@ethersproject/logger";
export declare function pbkdf2(_password: BytesLike, _salt: BytesLike, iterations: number, keylen: number, algo: "sha256" | "sha512"): string;
export declare namespace pbkdf2 {
    var _: (password: Uint8Array, salt: Uint8Array, iterations: number, keylen: number, algo: "sha256" | "sha512") => BytesLike;
    var lock: () => void;
    var register: (func: (password: Uint8Array, salt: Uint8Array, iterations: number, keylen: number, algo: "sha256" | "sha512") => BytesLike) => void;
}
//# sourceMappingURL=pbkdf2.d.ts.map