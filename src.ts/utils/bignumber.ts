'use strict';

/**
 *  BigNumber
 *
 *  A wrapper around the BN.js object. We use the BN.js library
 *  because it is used by elliptic, so it is required regardles.
 *
 */

import _BN from 'bn.js';
/*
declare module _BN {

class BN {
    constructor(number: string | number, base?: number);


    toString(radix?: number): string;
    toNumber(): number;

    fromTwos(value: any): BN;
    toTwos(value: any): BN;
    add(other: any): BN;
    sub(other: any): BN;
    div(other: any): BN;
    mul(other: any): BN;
    mod(modulo: any): BN;
    pow(exponent: any): BN;
    maskn(bits: number): BN;

    eq(other: BN): boolean;
    gte(other: BN): boolean;
    gt(other: BN): boolean;
    lte(other: BN): boolean;
    lt(other: BN): boolean;
    isZero(): boolean;

    static isBN(value: any): boolean;
}
}
*/



import { Arrayish, hexlify, isArrayish, isHexString } from './convert';
import * as errors from '../utils/errors';

function _isBigNumber(value: any): value is BigNumber {
    return isBigNumber(value);
}

// @TODO: is there a better way?
/*
export interface BigNumber {
    readonly _bn: BN;

    fromTwos(value: any): BigNumber;
    toTwos(value: any): BigNumber;

    add(other: any): BigNumber;
    sub(other: any): BigNumber;
    div(other: any): BigNumber;
    mul(other: any): BigNumber;
    mod(other: any): BigNumber;
    pow(other: any): BigNumber;
    maskn(value: any): BigNumber;
    eq(other: any): boolean;
    lt(other: any): boolean;
    lte(other: any): boolean;
    gt(other: any): boolean;
    gte(other: any): boolean;
    isZero(): boolean;
    toNumber(): number;
    toString(): string;
    toHexString(): string;
}
*/

export type BigNumberish = BigNumber | string | number | Arrayish;

export class BigNumber {
    readonly _bn: _BN.BN;
    constructor(value: BigNumberish) {
        if (!(this instanceof BigNumber)) { throw new Error('missing new'); }

        if (typeof(value) === 'string') {
            if (isHexString(value)) {
                if (value == '0x') { value = '0x0'; }
                this._bn = new _BN.BN(value.substring(2), 16);

            } else if (value[0] === '-' && isHexString(value.substring(1))) {
                this._bn = (new _BN.BN(value.substring(3), 16)).mul(ConstantNegativeOne._bn);

            } else if (value.match(/^-?[0-9]*$/)) {
                if (value == '') { value = '0'; }
                this._bn = new _BN.BN(value);
            }

        } else if (typeof(value) === 'number') {
            if (Math.trunc(value) !== value) {
                errors.throwError('underflow', errors.NUMERIC_FAULT, { operation: 'setValue', fault: 'underflow', value: value, outputValue: Math.trunc(value) });
            }
            try {
                this._bn = new _BN.BN(value);
            } catch (error) {
                errors.throwError('overflow', errors.NUMERIC_FAULT, { operation: 'setValue', fault: 'overflow', details: error.message });
            }

        } else if (_BN.BN.isBN(value)) {
            this._bn = value;

        } else if (_isBigNumber(value)) {
            this._bn = value._bn;

        } else if (isArrayish(value)) {
            this._bn = new _BN.BN(hexlify(value).substring(2), 16);

        } else {
            errors.throwError('invalid BigNumber value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
        }
    }

    fromTwos(value: BigNumberish): BigNumber {
        return new BigNumber(this._bn.fromTwos(value));
    }

    toTwos(value: BigNumberish): BigNumber {
        return new BigNumber(this._bn.toTwos(value));
    }

    add(other: BigNumberish): BigNumber {
        return new BigNumber(this._bn.add(bigNumberify(other)._bn));
    }

    sub(other: BigNumberish): BigNumber {
        return new BigNumber(this._bn.sub(bigNumberify(other)._bn));
    }

    div(other: BigNumberish): BigNumber {
        let o: BigNumber = bigNumberify(other)._bn;
        if (o.isZero()) {
            errors.throwError('division by zero', errors.NUMERIC_FAULT, { operation: 'divide', fault: 'division by zero' });
        }
        return new BigNumber(this._bn.div(o));
    }

    mul(other: BigNumberish): BigNumber {
        return new BigNumber(this._bn.mul(bigNumberify(other)._bn));
    }

    mod(other: BigNumberish): BigNumber {
        return new BigNumber(this._bn.mod(bigNumberify(other)._bn));
    }

    pow(other: BigNumberish): BigNumber {
        return new BigNumber(this._bn.pow(bigNumberify(other)._bn));
    }

    maskn(value: BigNumberish): BigNumber {
        return new BigNumber(this._bn.maskn(value));
    }

    eq(other: BigNumberish): boolean {
        return this._bn.eq(bigNumberify(other)._bn);
    }

    lt(other: BigNumberish): boolean {
        return this._bn.lt(bigNumberify(other)._bn);
    }

    lte(other: BigNumberish): boolean {
        return this._bn.lte(bigNumberify(other)._bn);
    }

    gt(other: BigNumberish): boolean {
        return this._bn.gt(bigNumberify(other)._bn);
   }

    gte(other: BigNumberish): boolean {
        return this._bn.gte(bigNumberify(other)._bn);
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
        var hex = this._bn.toString(16);
        if (hex.length % 2) { hex = '0' + hex; }
        return '0x' + hex;
    }
}

export function isBigNumber(value: any): boolean {
    return (value._bn && value._bn.mod);
}

export function bigNumberify(value: BigNumberish): BigNumber {
    if (_isBigNumber(value)) { return value; }
    return new BigNumber(value);
}

export const ConstantNegativeOne: BigNumber = bigNumberify(-1);
export const ConstantZero: BigNumber = bigNumberify(0);
export const ConstantOne: BigNumber = bigNumberify(1);
export const ConstantTwo: BigNumber = bigNumberify(2);
export const ConstantWeiPerEther: BigNumber = bigNumberify(new _BN.BN('1000000000000000000'));
