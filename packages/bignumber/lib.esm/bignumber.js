"use strict";
/**
 *  BigNumber
 *
 *  A wrapper around the BN.js object. We use the BN.js library
 *  because it is used by elliptic, so it is required regardles.
 *
 */
import { BN } from "bn.js";
import { hexlify, isBytes, isHexString } from "@ethersproject/bytes";
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);
const _constructorGuard = {};
const MAX_SAFE = 0x1fffffffffffff;
export function isBigNumberish(value) {
    return (value != null) && (BigNumber.isBigNumber(value) ||
        (typeof (value) === "number" && (value % 1) === 0) ||
        (typeof (value) === "string" && !!value.match(/^-?[0-9]+$/)) ||
        isHexString(value) ||
        (typeof (value) === "bigint") ||
        isBytes(value));
}
export class BigNumber {
    constructor(constructorGuard, hex) {
        logger.checkNew(new.target, BigNumber);
        if (constructorGuard !== _constructorGuard) {
            logger.throwError("cannot call constructor directly; use BigNumber.from", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "new (BigNumber)"
            });
        }
        this._hex = hex;
        this._isBigNumber = true;
        Object.freeze(this);
    }
    fromTwos(value) {
        return toBigNumber(toBN(this).fromTwos(value));
    }
    toTwos(value) {
        return toBigNumber(toBN(this).toTwos(value));
    }
    abs() {
        if (this._hex[0] === "-") {
            return BigNumber.from(this._hex.substring(1));
        }
        return this;
    }
    add(other) {
        return toBigNumber(toBN(this).add(toBN(other)));
    }
    sub(other) {
        return toBigNumber(toBN(this).sub(toBN(other)));
    }
    div(other) {
        const o = BigNumber.from(other);
        if (o.isZero()) {
            throwFault("division by zero", "div");
        }
        return toBigNumber(toBN(this).div(toBN(other)));
    }
    mul(other) {
        return toBigNumber(toBN(this).mul(toBN(other)));
    }
    mod(other) {
        const value = toBN(other);
        if (value.isNeg()) {
            throwFault("cannot modulo negative values", "mod");
        }
        return toBigNumber(toBN(this).umod(value));
    }
    pow(other) {
        const value = toBN(other);
        if (value.isNeg()) {
            throwFault("cannot raise to negative values", "pow");
        }
        return toBigNumber(toBN(this).pow(value));
    }
    and(other) {
        const value = toBN(other);
        if (this.isNegative() || value.isNeg()) {
            throwFault("cannot 'and' negative values", "and");
        }
        return toBigNumber(toBN(this).and(value));
    }
    or(other) {
        const value = toBN(other);
        if (this.isNegative() || value.isNeg()) {
            throwFault("cannot 'or' negative values", "or");
        }
        return toBigNumber(toBN(this).or(value));
    }
    xor(other) {
        const value = toBN(other);
        if (this.isNegative() || value.isNeg()) {
            throwFault("cannot 'xor' negative values", "xor");
        }
        return toBigNumber(toBN(this).xor(value));
    }
    mask(value) {
        if (this.isNegative() || value < 0) {
            throwFault("cannot mask negative values", "mask");
        }
        return toBigNumber(toBN(this).maskn(value));
    }
    shl(value) {
        if (this.isNegative() || value < 0) {
            throwFault("cannot shift negative values", "shl");
        }
        return toBigNumber(toBN(this).shln(value));
    }
    shr(value) {
        if (this.isNegative() || value < 0) {
            throwFault("cannot shift negative values", "shr");
        }
        return toBigNumber(toBN(this).shrn(value));
    }
    eq(other) {
        return toBN(this).eq(toBN(other));
    }
    lt(other) {
        return toBN(this).lt(toBN(other));
    }
    lte(other) {
        return toBN(this).lte(toBN(other));
    }
    gt(other) {
        return toBN(this).gt(toBN(other));
    }
    gte(other) {
        return toBN(this).gte(toBN(other));
    }
    isNegative() {
        return (this._hex[0] === "-");
    }
    isZero() {
        return toBN(this).isZero();
    }
    toNumber() {
        try {
            return toBN(this).toNumber();
        }
        catch (error) {
            throwFault("overflow", "toNumber", this.toString());
        }
        return null;
    }
    toString() {
        // Lots of people expect this, which we do not support, so check
        if (arguments.length !== 0) {
            logger.throwError("bigNumber.toString does not accept parameters", Logger.errors.UNEXPECTED_ARGUMENT, {});
        }
        return toBN(this).toString(10);
    }
    toHexString() {
        return this._hex;
    }
    static from(value) {
        if (value instanceof BigNumber) {
            return value;
        }
        if (typeof (value) === "string") {
            if (value.match(/^-?0x[0-9a-f]+$/i)) {
                return new BigNumber(_constructorGuard, toHex(value));
            }
            if (value.match(/^-?[0-9]+$/)) {
                return new BigNumber(_constructorGuard, toHex(new BN(value)));
            }
            return logger.throwArgumentError("invalid BigNumber string", "value", value);
        }
        if (typeof (value) === "number") {
            if (value % 1) {
                throwFault("underflow", "BigNumber.from", value);
            }
            if (value >= MAX_SAFE || value <= -MAX_SAFE) {
                throwFault("overflow", "BigNumber.from", value);
            }
            return BigNumber.from(String(value));
        }
        if (typeof (value) === "bigint") {
            return BigNumber.from(value.toString());
        }
        if (isBytes(value)) {
            return BigNumber.from(hexlify(value));
        }
        if (value._hex && isHexString(value._hex)) {
            return BigNumber.from(value._hex);
        }
        if (value.toHexString) {
            value = value.toHexString();
            if (typeof (value) === "string") {
                return BigNumber.from(value);
            }
        }
        return logger.throwArgumentError("invalid BigNumber value", "value", value);
    }
    static isBigNumber(value) {
        return !!(value && value._isBigNumber);
    }
}
// Normalize the hex string
function toHex(value) {
    // For BN, call on the hex string
    if (typeof (value) !== "string") {
        return toHex(value.toString(16));
    }
    // If negative, prepend the negative sign to the normalized positive value
    if (value[0] === "-") {
        // Strip off the negative sign
        value = value.substring(1);
        // Cannot have mulitple negative signs (e.g. "--0x04")
        if (value[0] === "-") {
            logger.throwArgumentError("invalid hex", "value", value);
        }
        // Call toHex on the positive component
        value = toHex(value);
        // Do not allow "-0x00"
        if (value === "0x00") {
            return value;
        }
        // Negate the value
        return "-" + value;
    }
    // Add a "0x" prefix if missing
    if (value.substring(0, 2) !== "0x") {
        value = "0x" + value;
    }
    // Normalize zero
    if (value === "0x") {
        return "0x00";
    }
    // Make the string even length
    if (value.length % 2) {
        value = "0x0" + value.substring(2);
    }
    // Trim to smallest even-length string
    while (value.length > 4 && value.substring(0, 4) === "0x00") {
        value = "0x" + value.substring(4);
    }
    return value;
}
function toBigNumber(value) {
    return BigNumber.from(toHex(value));
}
function toBN(value) {
    const hex = BigNumber.from(value).toHexString();
    if (hex[0] === "-") {
        return (new BN("-" + hex.substring(3), 16));
    }
    return new BN(hex.substring(2), 16);
}
function throwFault(fault, operation, value) {
    const params = { fault: fault, operation: operation };
    if (value != null) {
        params.value = value;
    }
    return logger.throwError(fault, Logger.errors.NUMERIC_FAULT, params);
}
//# sourceMappingURL=bignumber.js.map