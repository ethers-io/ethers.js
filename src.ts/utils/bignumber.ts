'use strict';

/**
 *  BigNumber
 *
 *  A wrapper around the BN.js object. We use the BN.js library
 *  because it is used by elliptic, so it is required regardles.
 *
 */

import BN from 'bn.js';

import { Arrayish, hexlify, isArrayish, isHexString } from './bytes';
import { defineReadOnly } from './properties';
import * as errors from './errors';

const BN_1 = new BN.BN(-1);

export type BigNumberish = BigNumber | string | number | Arrayish;

function toHex(bn: BN.BN): string {
    let value = bn.toString(16);
    if (value[0] === '-') {
        if ((value.length % 2) === 0) {
            return '-0x0' + value.substring(1);
        }
        return "-0x" + value.substring(1);
    }
    if ((value.length % 2) === 1) { return '0x0' + value; }
    return '0x' + value;
}

function toBN(value: BigNumberish): BN.BN {
    return (<_BigNumber>bigNumberify(value))._bn;
}

function toBigNumber(bn: BN.BN): _BigNumber {
    return new _BigNumber(toHex(bn));
}



export interface BigNumber {
    fromTwos(value: number): BigNumber;
    toTwos(value: number): BigNumber;
    add(other: BigNumberish): BigNumber;
    sub(other: BigNumberish): BigNumber;
    div(other: BigNumberish): BigNumber;
    mul(other: BigNumberish): BigNumber;
    mod(other: BigNumberish): BigNumber;
    pow(other: BigNumberish): BigNumber;
    maskn(value: number): BigNumber;
    eq(other: BigNumberish): boolean;
    lt(other: BigNumberish): boolean;
    lte(other: BigNumberish): boolean;
    gt(other: BigNumberish): boolean;
    gte(other: BigNumberish): boolean;
    isZero(): boolean;
    toNumber(): number;
    toString(): string;
    toHexString(): string;
};

class _BigNumber implements BigNumber {
    private readonly _hex: string;

    constructor(value: BigNumberish) {
        errors.checkNew(this, _BigNumber);

        if (typeof(value) === 'string') {
            if (isHexString(value)) {
                if (value == '0x') { value = '0x0'; }
                defineReadOnly(this, '_hex', value);

            } else if (value[0] === '-' && isHexString(value.substring(1))) {
                defineReadOnly(this, '_hex', value);

            } else if (value.match(/^-?[0-9]*$/)) {
                if (value == '') { value = '0'; }
                defineReadOnly(this, '_hex', toHex(new BN.BN(value)));

            } else {
                errors.throwError('invalid BigNumber string value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
            }

        } else if (typeof(value) === 'number') {
            if (parseInt(String(value)) !== value) {
                errors.throwError('underflow', errors.NUMERIC_FAULT, { operation: 'setValue', fault: 'underflow', value: value, outputValue: parseInt(String(value)) });
            }
            try {
                defineReadOnly(this, '_hex', toHex(new BN.BN(value)));
            } catch (error) {
                errors.throwError('overflow', errors.NUMERIC_FAULT, { operation: 'setValue', fault: 'overflow', details: error.message });
            }

        } else if (value instanceof _BigNumber) {
            defineReadOnly(this, '_hex', value.toHexString());

        } else if ((<any>value).toHexString) {
            defineReadOnly(this, '_hex', toHex(toBN((<any>value).toHexString())));

        } else if (isArrayish(value)) {
            defineReadOnly(this, '_hex', toHex(new BN.BN(hexlify(value).substring(2), 16)));

        } else {
            errors.throwError('invalid BigNumber value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
        }
    }

    get _bn(): BN.BN {
        if (this._hex[0] === '-') {
            return (new BN.BN(this._hex.substring(3), 16)).mul(BN_1);
        }
        return new BN.BN(this._hex.substring(2), 16);
    }

    fromTwos(value: number): BigNumber {
        return toBigNumber(this._bn.fromTwos(value));
    }

    toTwos(value: number): BigNumber {
        return toBigNumber(this._bn.toTwos(value));
    }

    add(other: BigNumberish): BigNumber {
        return toBigNumber(this._bn.add(toBN(other)));
    }

    sub(other: BigNumberish): BigNumber {
        return toBigNumber(this._bn.sub(toBN(other)));
    }

    div(other: BigNumberish): BigNumber {
        let o: BigNumber = bigNumberify(other);
        if (o.isZero()) {
            errors.throwError('division by zero', errors.NUMERIC_FAULT, { operation: 'divide', fault: 'division by zero' });
        }
        return toBigNumber(this._bn.div(toBN(other)));
    }

    mul(other: BigNumberish): BigNumber {
        return toBigNumber(this._bn.mul(toBN(other)));
    }

    mod(other: BigNumberish): BigNumber {
        return toBigNumber(this._bn.mod(toBN(other)));
    }

    pow(other: BigNumberish): BigNumber {
        return toBigNumber(this._bn.pow(toBN(other)));
    }

    maskn(value: number): BigNumber {
        return toBigNumber(this._bn.maskn(value));
    }

    eq(other: BigNumberish): boolean {
        return this._bn.eq(toBN(other));
    }

    lt(other: BigNumberish): boolean {
        return this._bn.lt(toBN(other));
    }

    lte(other: BigNumberish): boolean {
        return this._bn.lte(toBN(other));
    }

    gt(other: BigNumberish): boolean {
        return this._bn.gt(toBN(other));
   }

    gte(other: BigNumberish): boolean {
        return this._bn.gte(toBN(other));
    }

    isZero(): boolean {
        return this._bn.isZero();
    }

    toNumber(): number {
        try {
            return this._bn.toNumber();
        } catch (error) {
            errors.throwError('overflow', errors.NUMERIC_FAULT, { operation: 'setValue', fault: 'overflow', details: error.message });
        }
        return null;
    }

    toString(): string {
        return this._bn.toString(10);
    }

    toHexString(): string {
        return this._hex;
    }
}

export function isBigNumber(value: any): boolean {
    return (value instanceof _BigNumber);
}

export function bigNumberify(value: BigNumberish): BigNumber {
    if (value instanceof _BigNumber) { return value; }
    return new _BigNumber(value);
}

export const ConstantNegativeOne: BigNumber = bigNumberify(-1);
export const ConstantZero: BigNumber = bigNumberify(0);
export const ConstantOne: BigNumber = bigNumberify(1);
export const ConstantTwo: BigNumber = bigNumberify(2);
export const ConstantWeiPerEther: BigNumber = bigNumberify('1000000000000000000');
