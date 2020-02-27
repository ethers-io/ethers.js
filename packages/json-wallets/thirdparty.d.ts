declare module "aes-js" {
    export class Counter {
        constructor(iv: Uint8Array);
    }
    export namespace ModeOfOperation {
        class cbc{
            constructor(key: Uint8Array, iv: Uint8Array);
            decrypt(data: Uint8Array): Uint8Array;
            encrypt(data: Uint8Array): Uint8Array;
        }
        class ctr{
            constructor(key: Uint8Array, counter: Counter);
            decrypt(data: Uint8Array): Uint8Array;
            encrypt(data: Uint8Array): Uint8Array;
        }
    }
    export namespace padding {
        export namespace pkcs7 {
            export function strip(data: Uint8Array): Uint8Array;
        }
    }
}

declare module "scrypt-js" {
    export type ProgressCallback = (progress: number) => boolean | void;
    export function scrypt(password: Uint8Array, salt: Uint8Array, N: number, r: number, p: number, dkLen: number, callback?: ProgressCallback): Promise<Uint8Array>;
    export function syncScrypt(password: Uint8Array, salt: Uint8Array, N: number, r: number, p: number, dkLen: number): Uint8Array;
}

declare module "uuid" {
    export type Options = {
        random: Uint8Array;
    };
    export function v4(options?: Options): string;
}
