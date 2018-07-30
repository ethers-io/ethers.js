import { Arrayish } from './bytes';
export declare type SupportedAlgorithms = 'sha256' | 'sha512';
export declare function computeHmac(algorithm: SupportedAlgorithms, key: Arrayish, data: Arrayish): Uint8Array;
