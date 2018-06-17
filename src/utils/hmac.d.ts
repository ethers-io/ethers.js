import { Arrayish } from './bytes';
interface HashFunc {
    (): HashFunc;
    update(chunk: Uint8Array): HashFunc;
    digest(encoding: string): string;
    digest(): Uint8Array;
}
export interface HmacFunc extends HashFunc {
    (hashFunc: HashFunc, key: Arrayish): HmacFunc;
}
export declare function createSha256Hmac(key: Arrayish): HmacFunc;
export declare function createSha512Hmac(key: Arrayish): HmacFunc;
export {};
