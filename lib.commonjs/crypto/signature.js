"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Signature = void 0;
const index_js_1 = require("../constants/index.js");
const index_js_2 = require("../utils/index.js");
// Constants
const BN_0 = BigInt(0);
const BN_1 = BigInt(1);
const BN_2 = BigInt(2);
const BN_27 = BigInt(27);
const BN_28 = BigInt(28);
const BN_35 = BigInt(35);
const _guard = {};
class Signature {
    #props;
    get r() { return (0, index_js_2.getStore)(this.#props, "r"); }
    set r(value) {
        if ((0, index_js_2.dataLength)(value) !== 32) {
            index_js_2.logger.throwArgumentError("invalid r", "value", value);
        }
        (0, index_js_2.setStore)(this.#props, "r", (0, index_js_2.hexlify)(value));
    }
    get s() { return (0, index_js_2.getStore)(this.#props, "s"); }
    set s(value) {
        if ((0, index_js_2.dataLength)(value) !== 32) {
            index_js_2.logger.throwArgumentError("invalid r", "value", value);
        }
        else if (index_js_2.logger.getBytes(value)[0] & 0x80) {
            index_js_2.logger.throwArgumentError("non-canonical s", "value", value);
        }
        (0, index_js_2.setStore)(this.#props, "s", (0, index_js_2.hexlify)(value));
    }
    get v() { return (0, index_js_2.getStore)(this.#props, "v"); }
    set v(value) {
        const v = index_js_2.logger.getNumber(value, "value");
        if (v !== 27 && v !== 28) {
            throw new Error("@TODO");
        }
        (0, index_js_2.setStore)(this.#props, "v", v);
    }
    get networkV() { return (0, index_js_2.getStore)(this.#props, "networkV"); }
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
        const yParityAndS = index_js_2.logger.getBytes(this.s);
        if (this.yParity) {
            yParityAndS[0] |= 0x80;
        }
        return (0, index_js_2.hexlify)(yParityAndS);
    }
    get compactSerialized() {
        return (0, index_js_2.concat)([this.r, this.yParityAndS]);
    }
    get serialized() {
        return (0, index_js_2.concat)([this.r, this.s, (this.yParity ? "0x1c" : "0x1b")]);
    }
    constructor(guard, r, s, v) {
        index_js_2.logger.assertPrivate(guard, _guard, "Signature");
        this.#props = { r, s, v, networkV: null };
    }
    [Symbol.for('nodejs.util.inspect.custom')]() {
        return `Signature { r: "${this.r}", s: "${this.s}", yParity: ${this.yParity}, networkV: ${this.networkV} }`;
    }
    clone() {
        const clone = new Signature(_guard, this.r, this.s, this.v);
        if (this.networkV) {
            (0, index_js_2.setStore)(clone.#props, "networkV", this.networkV);
        }
        return clone;
    }
    freeze() {
        Object.freeze(this.#props);
        return this;
    }
    isFrozen() {
        return Object.isFrozen(this.#props);
    }
    toJSON() {
        const networkV = this.networkV;
        return {
            _type: "signature",
            networkV: ((networkV != null) ? networkV.toString() : null),
            r: this.r, s: this.s, v: this.v,
        };
    }
    static create() {
        return new Signature(_guard, index_js_1.ZeroHash, index_js_1.ZeroHash, 27);
    }
    // Get the chain ID from an EIP-155 v
    static getChainId(v) {
        const bv = index_js_2.logger.getBigInt(v, "v");
        // The v is not an EIP-155 v, so it is the unspecified chain ID
        if ((bv == BN_27) || (bv == BN_28)) {
            return BN_0;
        }
        // Bad value for an EIP-155 v
        if (bv < BN_35) {
            index_js_2.logger.throwArgumentError("invalid EIP-155 v", "v", v);
        }
        return (bv - BN_35) / BN_2;
    }
    // Get the EIP-155 v transformed for a given chainId
    static getChainIdV(chainId, v) {
        return (index_js_2.logger.getBigInt(chainId) * BN_2) + BigInt(35 + v - 27);
    }
    // Convert an EIP-155 v into a normalized v
    static getNormalizedV(v) {
        const bv = index_js_2.logger.getBigInt(v);
        if (bv == BN_0) {
            return 27;
        }
        if (bv == BN_1) {
            return 28;
        }
        // Otherwise, EIP-155 v means odd is 27 and even is 28
        return (bv & BN_1) ? 27 : 28;
    }
    static from(sig) {
        const throwError = (message) => {
            return index_js_2.logger.throwArgumentError(message, "signature", sig);
        };
        if (typeof (sig) === "string") {
            const bytes = index_js_2.logger.getBytes(sig, "signature");
            if (bytes.length === 64) {
                const r = (0, index_js_2.hexlify)(bytes.slice(0, 32));
                const s = bytes.slice(32, 64);
                const v = (s[0] & 0x80) ? 28 : 27;
                s[0] &= 0x7f;
                return new Signature(_guard, r, (0, index_js_2.hexlify)(s), v);
            }
            if ((0, index_js_2.dataLength)(sig) !== 65) {
                const r = (0, index_js_2.hexlify)(sig.slice(0, 32));
                const s = bytes.slice(32, 64);
                if (s[0] & 0x80) {
                    throwError("non-canonical s");
                }
                const v = Signature.getNormalizedV(bytes[64]);
                return new Signature(_guard, r, (0, index_js_2.hexlify)(s), v);
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
        if (!(0, index_js_2.isHexString)(r, 32)) {
            throwError("invalid r");
        }
        // Get s; by any means necessary (we check consistency below)
        const s = (function (s, yParityAndS) {
            if (s != null) {
                if (!(0, index_js_2.isHexString)(s, 32)) {
                    throwError("invalid s");
                }
                return s;
            }
            if (yParityAndS != null) {
                if (!(0, index_js_2.isHexString)(yParityAndS, 32)) {
                    throwError("invalid yParityAndS");
                }
                const bytes = index_js_2.logger.getBytes(yParityAndS);
                bytes[0] &= 0x7f;
                return (0, index_js_2.hexlify)(bytes);
            }
            return throwError("missing s");
        })(sig.s, sig.yParityAndS);
        if (index_js_2.logger.getBytes(s)[0] & 0x80) {
            throwError("non-canonical s");
        }
        // Get v; by any means necessary (we check consistency below)
        const { networkV, v } = (function (_v, yParityAndS, yParity) {
            if (_v != null) {
                const v = index_js_2.logger.getBigInt(_v);
                return {
                    networkV: ((v >= BN_35) ? v : undefined),
                    v: Signature.getNormalizedV(v)
                };
            }
            if (yParityAndS != null) {
                if (!(0, index_js_2.isHexString)(yParityAndS, 32)) {
                    throwError("invalid yParityAndS");
                }
                return { v: ((index_js_2.logger.getBytes(yParityAndS)[0] & 0x80) ? 28 : 27) };
            }
            if (yParity != null) {
                switch (yParity) {
                    case 0: return { v: 27 };
                    case 1: return { v: 28 };
                }
                return throwError("invalid yParity");
            }
            return throwError("missing v");
        })(sig.v, sig.yParityAndS, sig.yParity);
        const result = new Signature(_guard, r, s, v);
        if (networkV) {
            (0, index_js_2.setStore)(result.#props, "networkV", networkV);
        }
        // If multiple of v, yParity, yParityAndS we given, check they match
        if ("yParity" in sig && sig.yParity !== result.yParity) {
            throwError("yParity mismatch");
        }
        else if ("yParityAndS" in sig && sig.yParityAndS !== result.yParityAndS) {
            throwError("yParityAndS mismatch");
        }
        return result;
    }
}
exports.Signature = Signature;
//# sourceMappingURL=signature.js.map