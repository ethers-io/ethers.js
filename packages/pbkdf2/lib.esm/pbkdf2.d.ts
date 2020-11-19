import { BytesLike } from "@ethersproject/bytes";
export declare function pbkdf2(password: BytesLike, salt: BytesLike, iterations: number, keylen: number, hashAlgorithm: string): string;
