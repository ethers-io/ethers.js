import { Arrayish } from './bytes';
export declare function pbkdf2(password: Arrayish, salt: Arrayish, iterations: number, keylen: number, hashAlgorithm: string): Uint8Array;
