"use strict";

/**
 *  BigNumber
 *
 *  A wrapper around the BN.js object. We use the BN.js library
 *  because it is used by elliptic, so it is required regardles.
 *
 */

import * as BN from "bn.js";

import { Bytes, Hexable, hexlify, isBytes, isHexString } from "@ethersproject/bytes";
import { defineReadOnly, isNamedInstance } from "@ethersproject/properties";

import * as errors from "@ethersproject/errors";

const _constructorGuard = { };

const MAX_SAFE = 0x1fffffffffffff;


export type BigNumberish = BigNumber | Bytes | string | number;

/*
export function isBigNumberLike(value: any): value is BigNumberish {
    return (BigNumber.isBigNumber(value) ||
            (!!((<any>value).toHexString)) ||
            isBytes(value) ||
            value.match(/^-?([0-9]+|0x[0-9a-f]+)$/i) ||
            typeof(value) === "number");
}
*/

export class BigNumber implements Hexable {
    readonly _hex: string;

    constructor(constructorGuard: any, hex: string) {
        errors.checkNew(new.target, BigNumber);

        if (constructorGuard !== _constructorGuard) {
            errors.throwError("cannot call consturtor directly; use BigNumber.from", errors.UNSUPPORTED_OPERATION, {
                operation: "new (BigNumber)"
            });
        }

        defineReadOnly(this, "_hex", hex);
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
        let o = BigNumber.from(other);
        if (o.isZero()) {
            throwFault("division by zero", "div");
        }
        return toBigNumber(toBN(this).div(toBN(other)));
    }

    mul(other: BigNumberish): BigNumber {
        return toBigNumber(toBN(this).mul(toBN(other)));
    }

    mod(other: BigNumberish): BigNumber {
        return toBigNumber(toBN(this).mod(toBN(other)));
    }

    pow(other: BigNumberish): BigNumber {
        return toBigNumber(toBN(this).pow(toBN(other)));
    }

    maskn(value: number): BigNumber {
        return toBigNumber(toBN(this).maskn(value));
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
            errors.throwError("bigNumber.toString does not accept parameters", errors.UNEXPECTED_ARGUMENT, { });
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
                return new BigNumber(_constructorGuard, toHex(new BN.BN(value)));
            }

            return errors.throwArgumentError("invalid BigNumber string", "value", value);
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

        return errors.throwArgumentError("invalid BigNumber value", "value", value);
    }

    static isBigNumber(value: any): value is BigNumber {
        return isNamedInstance<BigNumber>(this, value);
    }
}

/*
export function bigNumberify(value: BigNumberish): BigNumber {
    if (BigNumber.isBigNumber(value)) { return value; }
    return new BigNumber(value);
}
*/

/*
function zeros(length) {
    let result = "";
    while (result.length < length) { tens += "0"; }
    return result;
}
export class FixedNumber {
    readonly value: BigNumber;
    readonly decimalPlaces: number;

    constructor(value: BigNumberish, decimalPlaces: number) {
        defineReadOnly(this, "value", bigNumberify(value));
        defineReadOnly(this, "decimalPlaces", decimalPlaces);
    }

    toString(): string {
        return formatUnits(this.value, this.decimalPlaces);
    }

    static fromString(value: string): FixedNumber {
        let comps = value.split(".");
        let decimalPlaces = 0;
        if (comps.length === 2) { decimalPlaces = comps[1].length; }
        return new FixedNumber(parseUnits(value, decimalPlaces), decimalPlaces);
    }
*/
/*
    
    readonly negative: boolean;
    readonly whole: BigNumber;
    readonly fraction: BigNumber;
    constructor(whole: BigNumberish, fraction: BigNumberish, negative?: boolean) {
        if (whole.lt(constants.Zero)) {
            errors.throwError("whole component must be positive", errors.INVALID_ARGUMENT, {
                argument: whole,
                value: whole
            });
        }
        defineReadOnly(this, "whole", bigNumberify(whole));
        defineReadOnly(this, "fraction", bigNumberify(fraction));
        defineReadOnly(this, "negative", !!boolean);
    }
*/
/*
    toHexString(bitWidth?: number, decimalPlaces?: number, signed?: boolean): string {
        if (bitWidth == null) { bitWidth = 128; }
        if (decimalPlaces == null) { decimalPlaces = 18; }
        if (signed == null) { signed = true; }
        return null;
    }
    static fromValue(value: BigNumberish, decimalPlaces: number): FixedNumber {
        let negative = false;
        if (value.lt(constants.Zero)) {
            negative = true;
            value = value.abs();
        }
        let tens = bigNumberify("1" + zeros(decimalPlaces));
        return new FixedNumber(value.divide(tens), value.mod(tens), negative);
    }
        let negative = false;
        if (value.substring(0, 1) === "-") {
            negative = true;
            value = value.substring(1);
        }

        if (value !== "." && value !== "") {
            let comps = value.split(".");
            if (comps.length === 1) {
                return new FixedNumber(comps[0], 0, negative);
            } else if (comps.length === 2) {
                if (comps[0] === "") { comps[0] = "0"; }
                if (comps[1] === "") { comps[1] = "0"; }
                return new FixedNumber(comps[0], comps[1], negative);
            }
        }

        errors.throwError("invalid fixed-point value", errors.INVALID_ARGUMENT, {
            argument: "value",
            value: value
        });

        return null;
*/

//}


// Normalize the hex string
function toHex(value: string | BN.BN): string {

    // For BN, call on the hex string
    if (typeof(value) !== "string") {
        return toHex(value.toString(16));
    }

    // If negative, prepend the negative sign to the normalized positive value
    if (value[0] === "-") {
        // Strip off the negative sign
        value = value.substring(1);

        // Cannot have mulitple negative signs (e.g. "--0x04")
        if (value[0] === "-") { errors.throwArgumentError("invalid hex", "value", value); }

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

function toBigNumber(value: BN.BN): BigNumber {
    return BigNumber.from(toHex(value));
}

function toBN(value: BigNumberish): BN.BN {
    let hex = BigNumber.from(value).toHexString();
    if (hex[0] === "-") {
        return (new BN.BN("-" + hex.substring(3), 16));
    }
    return new BN.BN(hex.substring(2), 16);
}

function throwFault(fault: string, operation: string, value?: any): never {
    let params: any = { fault: fault, operation: operation };
    if (value != null) { params.value = value; }

    return errors.throwError(fault, errors.NUMERIC_FAULT, params);
}
