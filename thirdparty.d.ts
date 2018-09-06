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

declare module "bn.js" {
    export class BN {
        constructor(value: string | number, radix?: number);

        add(other: BN): BN;
        sub(other: BN): BN;
        div(other: BN): BN;
        mod(other: BN): BN;
        mul(other: BN): BN;

        pow(other: BN): BN;
        maskn(other: number): BN;

        eq(other: BN): boolean;
        lt(other: BN): boolean;
        lte(other: BN): boolean;
        gt(other: BN): boolean;
        gte(other: BN): boolean;

        isZero(): boolean;

        toTwos(other: number): BN;
        fromTwos(other: number): BN;

        toString(radix: number): string;
        toNumber(): number;
        toArray(endian: string, width: number): Uint8Array;
        encode(encoding: string, compact: boolean): Uint8Array;
    }
}

declare module "elliptic" {
    import { BN } from "bn.js";
    export type BasicSignature = {
        r: Uint8Array;
        s: Uint8Array;
    };

    export type Signature = {
        r: BN,
        s: BN,
        recoveryParam: number
    }

    interface KeyPair {
        sign(message: Uint8Array, options: { canonical?: boolean }): Signature;
        getPublic(compressed: boolean, encoding?: string): string;
        getPublic(): BN;
        getPrivate(encoding?: string): string;
        encode(encoding: string, compressed: boolean): string;
        derive(publicKey: BN): BN;
        priv: BN;
    }

    export class ec {
        constructor(curveName: string);

        n: BN;

        keyFromPublic(publicKey: string | Uint8Array): KeyPair;
        keyFromPrivate(privateKey: string | Uint8Array): KeyPair;
        recoverPubKey(data: Uint8Array, signature: BasicSignature, recoveryParam: number): KeyPair;
    }
}

declare module "hash.js" {
    export interface HashFunc {
        update(chunk: Uint8Array): HashFunc;
        digest(encoding: string): string;
        digest(): Uint8Array;
    }

    export type CreateHashFunc = () => HashFunc;

    export function sha256(): HashFunc;
    export function sha512(): HashFunc;
    export function hmac(createHashFunc: CreateHashFunc, key: Uint8Array): HashFunc;
}

declare module "scrypt-js" {
    export class ScryptError extends Error {
        progress: number;
    }
    export type ScryptCallback = (error: ScryptError, progress: number, key: Uint8Array) => void;
    export default function(password: Uint8Array, salt: Uint8Array, N: number, r: number, p: number, dkLen: number, callback: ScryptCallback): void;
}

declare module "uuid" {
    export type Options = {
        random: Uint8Array;
    };
    export function v4(options?: Options): string;
}

declare module "xmlhttprequest" {
    export class XMLHttpRequest {
        readyState: number;
        status: number;
        responseText: string;

        constructor();
        open(method: string, url: string, async?: boolean): void;
        setRequestHeader(key: string, value: string): void;
        send(body?: string): void;
        abort(): void;

        onreadystatechange: () => void;
        onerror: (error: Error) => void;
    }
}

