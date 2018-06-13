import { Arrayish } from './convert';
import { HmacFunc } from './hmac';
export interface CreateHmacFunc {
    (key: Arrayish): HmacFunc;
}
export declare function pbkdf2(password: Arrayish, salt: Arrayish, iterations: number, keylen: number, createHmac: CreateHmacFunc): Uint8Array;
