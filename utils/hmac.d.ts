import { Arrayish } from './bytes';
export declare enum SupportedAlgorithms {
    sha256 = "sha256",
    sha512 = "sha512"
}
export declare function computeHmac(algorithm: SupportedAlgorithms, key: Arrayish, data: Arrayish): Uint8Array;
