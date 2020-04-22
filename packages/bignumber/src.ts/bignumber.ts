"use strict";

/**
 *  BigNumber
 *
 *  A wrapper around the BN.js object. We use the BN.js library
 *  because it is used by elliptic, so it is required regardles.
 *
 */

import { BN } from "bn.js";

import { Bytes, Hexable, hexlify, isBytes, isHexString } from "@ethersproject/bytes";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

const _constructorGuard = { };

const MAX_SAFE = 0x1fffffffffffff;


export type BigNumberish = BigNumber | Bytes | string | number;

export function isBigNumberish(value: any): value is BigNumberish {
    return (value != null) && (
        BigNumber.isBigNumber(value) ||
        (typeof(value) === "number" && (value % 1) === 0) ||
        (typeof(value) === "string" && !!value.match(/^-?[0-9]+$/)) ||
        isHexString(value) ||
        (typeof(value) === "bigint") ||
        isBytes(value)
    );
}

export class BigNumber implements Hexable {
    readonly _hex: string;
    readonly _isBigNumber: boolean;

    constructor(constructorGuard: any, hex: string) {
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

    fromTwos(value: number): BigNumber {
        return toBigNumber(toBN(this).fromTwos(value));
    }

    toTwos(value: number): BigNumber {
        return toBigNumber(toBN(this).toTwos(value));
    }

    abs(): BigNumber {
        if (this._hex[0] === "-") {
            return BigNumber.from(this._hex.substring(1));
        }
        return this;
    }

    add(other: BigNumberish): BigNumber {
        return toBigNumber(toBN(this).add(toBN(other)));
    }

    sub(other: BigNumberish): BigNumber {
        return toBigNumber(toBN(this).sub(toBN(other)));
    }

    div(other: BigNumberish): BigNumber {
        const o = BigNumber.from(other);
        if (o.isZero()) {
            throwFault("division by zero", "div");
        }
        return toBigNumber(toBN(this).div(toBN(other)));
    }

    mul(other: BigNumberish): BigNumber {
        return toBigNumber(toBN(this).mul(toBN(other)));
    }

    mod(other: BigNumberish): BigNumber {
        const value = toBN(other);
        if (value.isNeg()) {
            throwFault("cannot modulo negative values", "mod");
        }
        return toBigNumber(toBN(this).umod(value));
    }

    pow(other: BigNumberish): BigNumber {
        return toBigNumber(toBN(this).pow(toBN(other)));
    }

    and(other: BigNumberish): BigNumber {
        const value = toBN(other);
        if (this.isNegative() || value.isNeg()) {
            throwFault("cannot 'and' negative values", "and");
        }
        return toBigNumber(toBN(this).and(value));
    }

    or(other: BigNumberish): BigNumber {
        const value = toBN(other);
        if (this.isNegative() || value.isNeg()) {
            throwFault("cannot 'or' negative values", "or");
        }
        return toBigNumber(toBN(this).or(value));
    }

    xor(other: BigNumberish): BigNumber {
        const value = toBN(other);
        if (this.isNegative() || value.isNeg()) {
            throwFault("cannot 'xor' negative values", "xor");
        }
        return toBigNumber(toBN(this).xor(value));
    }

    mask(value: number): BigNumber {
        if (this.isNegative() || value < 0) {
            throwFault("cannot mask negative values", "mask");
        }
        return toBigNumber(toBN(this).maskn(value));
    }

    shl(value: number): BigNumber {
        if (this.isNegative() || value < 0) {
            throwFault("cannot shift negative values", "shl");
        }
        return toBigNumber(toBN(this).shln(value));
    }

    shr(value: number): BigNumber {
        if (this.isNegative() || value < 0) {
            throwFault("cannot shift negative values", "shr");
        }
        return toBigNumber(toBN(this).shrn(value));
    }

    eq(other: BigNumberish): boolean {
        return toBN(this).eq(toBN(other));
    }

    lt(other: BigNumberish): boolean {
        return toBN(this).lt(toBN(other));
    }

    lte(other: BigNumberish): boolean {
        return toBN(this).lte(toBN(other));
    }

    gt(other: BigNumberish): boolean {
        return toBN(this).gt(toBN(other));
   }

    gte(other: BigNumberish): boolean {
        return toBN(this).gte(toBN(other));
    }

    isNegative(): boolean {
        return (this._hex[0] === "-");
    }

    isZero(): boolean {
        return toBN(this).isZero();
    }

    toNumber(): number {
        try {
            return toBN(this).toNumber();
        } catch (error) {
            throwFault("overflow", "toNumber", this.toString());
        }
        return null;
    }

    toString(): string {
        // Lots of people expect this, which we do not support, so check
        if (arguments.length !== 0) {
            logger.throwError("bigNumber.toString does not accept parameters", Logger.errors.UNEXPECTED_ARGUMENT, { });
        }
        return toBN(this).toString(10);
    }

    toHexString(): string {
        return this._hex;
    }

    static from(value: any): BigNumber {
        if (value instanceof BigNumber) { return value; }

        if (typeof(value) === "string") {
            if (value.match(/-?0x[0-9a-f]+/i)) {
                return new BigNumber(_constructorGuard, toHex(value));
            }

            if (value.match(/^-?[0-9]+$/)) {
                return new BigNumber(_constructorGuard, toHex(new BN(value)));
            }

            return logger.throwArgumentError("invalid BigNumber string", "value", value);
        }

        if (typeof(value) === "number") {
            if (value % 1) {
                throwFault("underflow", "BigNumber.from", value);
            }

            if (value >= MAX_SAFE || value <= -MAX_SAFE) {
                throwFault("overflow", "BigNumber.from", value);
            }

            return BigNumber.from(String(value));
        }

        if (typeof(value) === "bigint") {
            return BigNumber.from((<any>value).toString());
        }

        if (isBytes(value)) {
            return BigNumber.from(hexlify(value));
        }

        if ((<any>value)._hex && isHexString((<any>value)._hex)) {
            return BigNumber.from((<any>value)._hex);
        }

        if ((<any>value).toHexString) {
            value = (<any>value).toHexString();
            if (typeof(value) === "string") {
                return BigNumber.from(value);
            }
        }

        return logger.throwArgumentError("invalid BigNumber value", "value", value);
    }

    static isBigNumber(value: any): value is BigNumber {
        return !!(value && value._isBigNumber);
    }
}

// Normalize the hex string
function toHex(value: string | BN): string {

    // For BN, call on the hex string
    if (typeof(value) !== "string") {
        return toHex(value.toString(16));
    }

    // If negative, prepend the negative sign to the normalized positive value
    if (value[0] === "-") {
        // Strip off the negative sign
        value = value.substring(1);

        // Cannot have mulitple negative signs (e.g. "--0x04")
        if (value[0] === "-") { logger.throwArgumentError("invalid hex", "value", value); }

        // Call toHex on the positive component
        value = toHex(value);

        // Do not allow "-0x00"
        if (value === "0x00") { return value; }

        // Negate the value
        return "-" + value;
    }

    // Add a "0x" prefix if missing
    if (value.substring(0, 2) !== "0x") { value = "0x" + value; }

    // Normalize zero
    if (value === "0x") { return "0x00"; }

    // Make the string even length
    if (value.length % 2) { value = "0x0" + value.substring(2); }

    // Trim to smallest even-length string
    while (value.length > 4 && value.substring(0, 4) === "0x00") {
        value = "0x" + value.substring(4);
    }

    return value;
}

function toBigNumber(value: BN): BigNumber {
    return BigNumber.from(toHex(value));
}

function toBN(value: BigNumberish): BN {
    const hex = BigNumber.from(value).toHexString();
    if (hex[0] === "-") {
        return (new BN("-" + hex.substring(3), 16));
    }
    return new BN(hex.substring(2), 16);
}

function throwFault(fault: string, operation: string, value?: any): never {
    const params: any = { fault: fault, operation: operation };
    if (value != null) { params.value = value; }

    return logger.throwError(fault, Logger.errors.NUMERIC_FAULT, params);
}
