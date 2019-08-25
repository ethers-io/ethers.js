import { BytesLike } from '@ethersproject/bytes';
export declare enum SupportedAlgorithms {
    sha256 = "sha256",
    sha512 = "sha512"
}
export declare function ripemd160(data: BytesLike): string;
export declare function sha256(data: BytesLike): string;
export declare function sha512(data: BytesLike): string;
export declare function computeHmac(algorithm: SupportedAlgorithms, key: BytesLike, data: BytesLike): string;
