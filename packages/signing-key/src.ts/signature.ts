import { getStore, setStore } from "@ethersproject/properties";

//import type { BigNumberish } from "@ethersproject/bignumber";
import type { Freezable, Frozen } from "@ethersproject/properties";

import { arrayify, concat, dataLength, hexlify, isHexString } from "@ethersproject/bytes";

import type { BytesLike } from "@ethersproject/bytes";

import type { BigNumberish } from "@ethersproject/logger";

import { logger } from "./logger.js";


// Constants
const BN_0 = BigInt(0);
const BN_1 = BigInt(1);
const BN_2 = BigInt(2);
const BN_27 = BigInt(27);
const BN_28 = BigInt(28);
const BN_35 = BigInt(35);


export type SignatureLike = Signature | string | {
    r: string;
    s: string;
    v: BigNumberish;
    //chainId?: BigNumberish;
    yParity?: 0 | 1;
    yParityAndS?: string;
//} | {
//    r: string;
//    s: string;
//    //chainId: BigNumberish;
//    v?: BigNumberish;
//    yParity?: 0 | 1
//    yParityAndS?: string;
} | {
    r: string;
    yParityAndS: string;
    //chainId?: BigNumberish;
    yParity?: 0 | 1;
    s?: string;
    v?: number;
} | {
    r: string;
    s: string;
    yParity: 0 | 1;
    //chainId?: BigNumberish;
    v?: BigNumberish;
    yParityAndS?: string;
};


const _guard = { };

const Zero = "0x0000000000000000000000000000000000000000000000000000000000000000";

export class Signature implements Freezable<Signature> {
    #props: { r: string, s: string, v: 27 | 28, networkV: null | bigint };

    get r(): string { return getStore(this.#props, "r"); }
    set r(value: BytesLike) {
        if (dataLength(value) !== 32) {
            logger.throwArgumentError("invalid r", "value", value);
        }
        setStore(this.#props, "r", hexlify(value));
    }

    get s(): string { return getStore(this.#props, "s"); }
    set s(value: BytesLike) {
        if (dataLength(value) !== 32) {
            logger.throwArgumentError("invalid r", "value", value);
        } else if (arrayify(value)[0] & 0x80) {
            logger.throwArgumentError("non-canonical s", "value", value);
        }
        setStore(this.#props, "s", hexlify(value));
    }

    get v(): 27 | 28 { return getStore(this.#props, "v"); }
    set v(value: BigNumberish) {
        const v = logger.getNumber(value, "value");
        if (v !== 27 && v !== 28) { throw new Error("@TODO"); }
        setStore(this.#props, "v", v);
    }

    get networkV(): null | bigint { return getStore(this.#props, "networkV"); }
    get legacyChainId(): null | bigint {
        const v = this.networkV;
        if (v == null) { return null; }
        return Signature.getChainId(v);
    }

    get yParity(): 0 | 1 {
        if (this.v === 27) { return 0; }
        return 1;
        /*
        // When v is 0 or 1 it is the recid directly
        if (this.v.isZero()) { return 0; }
        if (this.v.eq(1)) { return 1; }

        // Otherwise, odd (e.g. 27) is 0 and even (e.g. 28) is 1
        return this.v.and(1).isZero() ? 1: 0;
        */
    }

    get yParityAndS(): string {
        // The EIP-2098 compact representation
        const yParityAndS = arrayify(this.s);
        if (this.yParity) { yParityAndS[0] |= 0x80; }
        return hexlify(yParityAndS);
    }

    get compactSerialized(): string {
        return concat([ this.r, this.yParityAndS ]);
    }

    get serialized(): string {
        return concat([ this.r, this.s, (this.yParity ? "0x1c": "0x1b") ]);
    }

    constructor(guard: any, r: string, s: string, v: 27 | 28) {
        logger.assertPrivate(guard, _guard, "Signature");
        this.#props = { r, s, v, networkV: null };
    }

    [Symbol.for('nodejs.util.inspect.custom')]() {
        return `Signature { r: "${ this.r }", s: "${ this.s }", yParity: ${ this.yParity }, networkV: ${ this.networkV } }`;
    }

    clone(): Signature {
        if (getStore(this.#props, "networkV")) {
            logger.throwError("cannot clone EIP-155 signatures", "UNSUPPORTED_OPERATION", {
                operation: "clone"
            });
        }
        const { r, s, v } = this.#props;
        return new Signature(_guard, r, s, v);
    }

    freeze(): Frozen<Signature> {
        Object.freeze(this.#props);
        return this;
    }

    isFrozen(): boolean {
        return Object.isFrozen(this.#props);
    }

    toJSON(): any {
        const { r, s, v, networkV } = this;
        return {
            _type: "signature",
            networkV: ((networkV != null) ? networkV.toString(): null),
            r, s, v,
        };
    }

    static create(): Signature {
        return new Signature(_guard, Zero, Zero, 27);
    }

    // Get the chain ID from an EIP-155 v
    static getChainId(v: BigNumberish): bigint {
        const bv = logger.getBigInt(v, "v");

        // The v is not an EIP-155 v, so it is the unspecified chain ID
        if ((bv == BN_27) || (bv == BN_28)) { return BN_0; }

        // Bad value for an EIP-155 v
        if (bv < BN_35) { logger.throwArgumentError("invalid EIP-155 v", "v", v); }

        return (bv - BN_35) / BN_2;
    }

    // Get the EIP-155 v transformed for a given chainId
    static getChainIdV(chainId: BigNumberish, v: 27 | 28): bigint {
        return (logger.getBigInt(chainId) * BN_2) + BigInt(35 + v - 27);
    }

    // Convert an EIP-155 v into a normalized v
    static getNormalizedV(v: BigNumberish): 27 | 28 {
        const bv = logger.getBigInt(v);

        if (bv == BN_0) { return 27; }
        if (bv == BN_1) { return 28; }

        // Otherwise, EIP-155 v means odd is 27 and even is 28
        return (bv & BN_1) ? 27: 28;
    }

    static fromTransaction(r: string, s: string, _v: BigNumberish): Frozen<Signature> {
        const v = logger.getBigInt(_v, "v");
        const sig = Signature.from({ r, s, v });
        setStore(sig.#props, "networkV", v);
        return sig.freeze();
    }

    static from(sig: SignatureLike): Signature {
        const throwError = (message: string) => {
            return logger.throwArgumentError(message, "signature", sig);
        };

        if (typeof(sig) === "string") {
            const bytes = logger.getBytes(sig, "signature");
            if (bytes.length === 64) {
                const r = hexlify(bytes.slice(0, 32));
                const s = bytes.slice(32, 64);
                const v = (s[0] & 0x80) ? 28: 27;
                s[0] &= 0x7f;
                return new Signature(_guard, r, hexlify(s), v);
            }

            if (dataLength(sig) !== 65) { 
                const r = hexlify(sig.slice(0, 32));
                const s = bytes.slice(32, 64);
                if (s[0] & 0x80) { throwError("non-canonical s"); }
                const v = Signature.getNormalizedV(bytes[64]);
                return new Signature(_guard, r, hexlify(s), v);
            }

            return throwError("invlaid raw signature length");
        }

        if (sig instanceof Signature) { return sig.clone(); }

        // Get r
        const r = sig.r;
        if (r == null) { throwError("missing r"); }
        if (!isHexString(r, 32)) { throwError("invalid r"); }

        // Get s; by any means necessary (we check consistency below)
        const s = (function(s?: string, yParityAndS?: string) {
            if (s) {
                if (!isHexString(s, 32)) { throwError("invalid s"); }
                return s;
            }
            if (yParityAndS) {
                if (!isHexString(yParityAndS, 32)) { throwError("invalid yParityAndS"); }
                const bytes = arrayify(yParityAndS);
                bytes[0] &= 0x7f;
                return hexlify(bytes);
            }
            return throwError("missing s");
        })(sig.s, sig.yParityAndS);
        if (arrayify(s)[0] & 0x80) { throwError("non-canonical s"); }

        // Get v; by any means necessary (we check consistency below)
        const v = (function(v?: BigNumberish, yParityAndS?: string, yParity?: number) {
            if (v) { return Signature.getNormalizedV(v); }
            if (yParityAndS) {
                if (!isHexString(yParityAndS, 32)) { throwError("invalid yParityAndS"); }
                return ((arrayify(yParityAndS)[0] & 0x80) ? 28: 27);
            }
            if (yParity) {
                switch (yParity) {
                    case 0: return 27;
                    case 1: return 28;
                }
                return throwError("invalid yParity");
            }
            //if (chainId) { return BigNumber.from(chainId).and(1).sub(27); } // @TODO: check this
            return throwError("missing v");
        })(sig.v, sig.yParityAndS, sig.yParity);

        // @TODO: add chainId support

        const result = new Signature(_guard, r, s, v);

        // If multiple of v, yParity, yParityAndS we given, check they match
        if ("yParity" in sig && sig.yParity !== result.yParity) {
            throwError("yParity mismatch");
        } else if ("yParityAndS" in sig && sig.yParityAndS !== result.yParityAndS) {
            throwError("yParityAndS mismatch");
        }

        //if (sig.chainId && sig.chainId !== result.chainId) {
        //}

        return result;
    }
}

