var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Signature_props;
import { getStore, setStore } from "@ethersproject/properties";
import { arrayify, concat, dataLength, hexlify, isHexString } from "@ethersproject/bytes";
import { logger } from "./logger.js";
// Constants
const BN_0 = BigInt(0);
const BN_1 = BigInt(1);
const BN_2 = BigInt(2);
const BN_27 = BigInt(27);
const BN_28 = BigInt(28);
const BN_35 = BigInt(35);
const _guard = {};
const Zero = "0x0000000000000000000000000000000000000000000000000000000000000000";
export class Signature {
    constructor(guard, r, s, v) {
        _Signature_props.set(this, void 0);
        logger.assertPrivate(guard, _guard, "Signature");
        __classPrivateFieldSet(this, _Signature_props, { r, s, v, networkV: null }, "f");
    }
    get r() { return getStore(__classPrivateFieldGet(this, _Signature_props, "f"), "r"); }
    set r(value) {
        if (dataLength(value) !== 32) {
            logger.throwArgumentError("invalid r", "value", value);
        }
        setStore(__classPrivateFieldGet(this, _Signature_props, "f"), "r", hexlify(value));
    }
    get s() { return getStore(__classPrivateFieldGet(this, _Signature_props, "f"), "s"); }
    set s(value) {
        if (dataLength(value) !== 32) {
            logger.throwArgumentError("invalid r", "value", value);
        }
        else if (arrayify(value)[0] & 0x80) {
            logger.throwArgumentError("non-canonical s", "value", value);
        }
        setStore(__classPrivateFieldGet(this, _Signature_props, "f"), "s", hexlify(value));
    }
    get v() { return getStore(__classPrivateFieldGet(this, _Signature_props, "f"), "v"); }
    set v(value) {
        const v = logger.getNumber(value, "value");
        if (v !== 27 && v !== 28) {
            throw new Error("@TODO");
        }
        setStore(__classPrivateFieldGet(this, _Signature_props, "f"), "v", v);
    }
    get networkV() { return getStore(__classPrivateFieldGet(this, _Signature_props, "f"), "networkV"); }
    get legacyChainId() {
        const v = this.networkV;
        if (v == null) {
            return null;
        }
        return Signature.getChainId(v);
    }
    get yParity() {
        if (this.v === 27) {
            return 0;
        }
        return 1;
        /*
        // When v is 0 or 1 it is the recid directly
        if (this.v.isZero()) { return 0; }
        if (this.v.eq(1)) { return 1; }

        // Otherwise, odd (e.g. 27) is 0 and even (e.g. 28) is 1
        return this.v.and(1).isZero() ? 1: 0;
        */
    }
    get yParityAndS() {
        // The EIP-2098 compact representation
        const yParityAndS = arrayify(this.s);
        if (this.yParity) {
            yParityAndS[0] |= 0x80;
        }
        return hexlify(yParityAndS);
    }
    get compactSerialized() {
        return concat([this.r, this.yParityAndS]);
    }
    get serialized() {
        return concat([this.r, this.s, (this.yParity ? "0x1c" : "0x1b")]);
    }
    [(_Signature_props = new WeakMap(), Symbol.for('nodejs.util.inspect.custom'))]() {
        return `Signature { r: "${this.r}", s: "${this.s}", yParity: ${this.yParity}, networkV: ${this.networkV} }`;
    }
    clone() {
        if (getStore(__classPrivateFieldGet(this, _Signature_props, "f"), "networkV")) {
            logger.throwError("cannot clone EIP-155 signatures", "UNSUPPORTED_OPERATION", {
                operation: "clone"
            });
        }
        const { r, s, v } = __classPrivateFieldGet(this, _Signature_props, "f");
        return new Signature(_guard, r, s, v);
    }
    freeze() {
        Object.freeze(__classPrivateFieldGet(this, _Signature_props, "f"));
        return this;
    }
    isFrozen() {
        return Object.isFrozen(__classPrivateFieldGet(this, _Signature_props, "f"));
    }
    toJSON() {
        const { r, s, v, networkV } = this;
        return {
            _type: "signature",
            networkV: ((networkV != null) ? networkV.toString() : null),
            r, s, v,
        };
    }
    static create() {
        return new Signature(_guard, Zero, Zero, 27);
    }
    // Get the chain ID from an EIP-155 v
    static getChainId(v) {
        const bv = logger.getBigInt(v, "v");
        // The v is not an EIP-155 v, so it is the unspecified chain ID
        if ((bv == BN_27) || (bv == BN_28)) {
            return BN_0;
        }
        // Bad value for an EIP-155 v
        if (bv < BN_35) {
            logger.throwArgumentError("invalid EIP-155 v", "v", v);
        }
        return (bv - BN_35) / BN_2;
    }
    // Get the EIP-155 v transformed for a given chainId
    static getChainIdV(chainId, v) {
        return (logger.getBigInt(chainId) * BN_2) + BigInt(35 + v - 27);
    }
    // Convert an EIP-155 v into a normalized v
    static getNormalizedV(v) {
        const bv = logger.getBigInt(v);
        if (bv == BN_0) {
            return 27;
        }
        if (bv == BN_1) {
            return 28;
        }
        // Otherwise, EIP-155 v means odd is 27 and even is 28
        return (bv & BN_1) ? 27 : 28;
    }
    static fromTransaction(r, s, _v) {
        const v = logger.getBigInt(_v, "v");
        const sig = Signature.from({ r, s, v });
        setStore(__classPrivateFieldGet(sig, _Signature_props, "f"), "networkV", v);
        return sig.freeze();
    }
    static from(sig) {
        const throwError = (message) => {
            return logger.throwArgumentError(message, "signature", sig);
        };
        if (typeof (sig) === "string") {
            const bytes = logger.getBytes(sig, "signature");
            if (bytes.length === 64) {
                const r = hexlify(bytes.slice(0, 32));
                const s = bytes.slice(32, 64);
                const v = (s[0] & 0x80) ? 28 : 27;
                s[0] &= 0x7f;
                return new Signature(_guard, r, hexlify(s), v);
            }
            if (dataLength(sig) !== 65) {
                const r = hexlify(sig.slice(0, 32));
                const s = bytes.slice(32, 64);
                if (s[0] & 0x80) {
                    throwError("non-canonical s");
                }
                const v = Signature.getNormalizedV(bytes[64]);
                return new Signature(_guard, r, hexlify(s), v);
            }
            return throwError("invlaid raw signature length");
        }
        if (sig instanceof Signature) {
            return sig.clone();
        }
        // Get r
        const r = sig.r;
        if (r == null) {
            throwError("missing r");
        }
        if (!isHexString(r, 32)) {
            throwError("invalid r");
        }
        // Get s; by any means necessary (we check consistency below)
        const s = (function (s, yParityAndS) {
            if (s) {
                if (!isHexString(s, 32)) {
                    throwError("invalid s");
                }
                return s;
            }
            if (yParityAndS) {
                if (!isHexString(yParityAndS, 32)) {
                    throwError("invalid yParityAndS");
                }
                const bytes = arrayify(yParityAndS);
                bytes[0] &= 0x7f;
                return hexlify(bytes);
            }
            return throwError("missing s");
        })(sig.s, sig.yParityAndS);
        if (arrayify(s)[0] & 0x80) {
            throwError("non-canonical s");
        }
        // Get v; by any means necessary (we check consistency below)
        const v = (function (v, yParityAndS, yParity) {
            if (v) {
                return Signature.getNormalizedV(v);
            }
            if (yParityAndS) {
                if (!isHexString(yParityAndS, 32)) {
                    throwError("invalid yParityAndS");
                }
                return ((arrayify(yParityAndS)[0] & 0x80) ? 28 : 27);
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
        }
        else if ("yParityAndS" in sig && sig.yParityAndS !== result.yParityAndS) {
            throwError("yParityAndS mismatch");
        }
        //if (sig.chainId && sig.chainId !== result.chainId) {
        //}
        return result;
    }
}
//# sourceMappingURL=signature.js.map