declare module "hash.js" {
    export interface HashFunc {
        update(chunk: Uint8Array): HashFunc;
        digest(encoding: string): string;
        digest(): Uint8Array;
    }

    export type CreateHashFunc = () => HashFunc;

    export function sha256(): HashFunc;
    export function sha512(): HashFunc;
    export function ripemd160(): HashFunc;
    export function hmac(createHashFunc: CreateHashFunc, key: Uint8Array): HashFunc;
}
