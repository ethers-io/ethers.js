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

    interface Point {
        add(point: Point): Point;
        encodeCompressed(enc: string): string
    }

    interface KeyPair {
        sign(message: Uint8Array, options: { canonical?: boolean }): Signature;
        getPublic(compressed: boolean, encoding?: string): string;
        getPublic(): BN;
        getPrivate(encoding?: string): string;
        encode(encoding: string, compressed: boolean): string;
        derive(publicKey: BN): BN;
        pub: Point;
        priv: BN;
    }

    export class ec {
        constructor(curveName: string);

        n: BN;

        keyFromPublic(publicKey: Uint8Array): KeyPair;
        keyFromPrivate(privateKey: Uint8Array): KeyPair;
        recoverPubKey(data: Uint8Array, signature: BasicSignature, recoveryParam: number): KeyPair;
    }


    export class eddsa {
        constructor(name: "ed25519");

        sign(message: eddsa.Bytes, secret: eddsa.Bytes): eddsa.Signature;
        verify(
            message: eddsa.Bytes,
            sig: eddsa.Bytes | eddsa.Signature,
            pub: eddsa.Bytes | eddsa.Point | eddsa.KeyPair
        ): boolean;
        hashInt(): BN;
        keyFromPublic(pub: eddsa.Bytes | eddsa.KeyPair | eddsa.Point): eddsa.KeyPair;
        keyFromSecret(secret: eddsa.Bytes): eddsa.KeyPair;
        makeSignature(sig: eddsa.Signature | Buffer | string): eddsa.Signature;
        encodePoint(point: eddsa.Point): Buffer;
        decodePoint(bytes: eddsa.Bytes): eddsa.Point;
        encodeInt(num: BN): Buffer;
        decodeInt(bytes: any): BN;
        isPoint(val: any): boolean;
    }
    export namespace eddsa {
        type Point = any;
        type Bytes = string | Buffer;
    
        class Signature {
            constructor(eddsa: eddsa, sig: Signature | Bytes);
    
            toBytes(): Buffer;
            toHex(): string;
        }
    
        class KeyPair {
            constructor(eddsa: eddsa, params: KeyPairOptions);
    
            static fromPublic(eddsa: eddsa, pub: Bytes): KeyPair;
            static fromSecret(eddsa: eddsa, secret: Bytes): KeyPair;
    
            secret(): Buffer;
            sign(message: Bytes): Signature;
            verify(message: Bytes, sig: Signature | Bytes): boolean;
            getSecret(enc: "hex"): string;
            getSecret(): Buffer;
            getPublic(enc: "hex"): string;
            getPublic(): Buffer;
        }
    
        interface KeyPairOptions {
            secret: Buffer;
            pub: Buffer | Point;
        }
    }
}
