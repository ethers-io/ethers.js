'use strict';

/**
 *  BigNumber
 *
 *  A wrapper around the BN.js object. We use the BN.js library
 *  because it is used by elliptic, so it is required regardles.
 *
 */

import _BN from 'bn.js';

import { Arrayish, hexlify, isArrayish, isHexString } from './convert';
import { defineReadOnly } from './properties';
import * as errors from '../utils/errors';

function _isBigNumber(value: any): value is BigNumber {
    return isBigNumber(value);
}

export type BigNumberish = BigNumber | string | number | Arrayish;

export class BigNumber {
    private readonly _bn: _BN.BN;
    constructor(value: BigNumberish) {
        errors.checkNew(this, BigNumber);

        if (typeof(value) === 'string') {
            if (isHexString(value)) {
                if (value == '0x') { value = '0x0'; }
                defineReadOnly(this, '_bn', new _BN.BN(value.substring(2), 16));

            } else if (value[0] === '-' && isHexString(value.substring(1))) {
                defineReadOnly(this, '_bn', (new _BN.BN(value.substring(3), 16)).mul(ConstantNegativeOne._bn));

            } else if (value.match(/^-?[0-9]*$/)) {
                if (value == '') { value = '0'; }
                defineReadOnly(this, '_bn', new _BN.BN(value));
            }

        } else if (typeof(value) === 'number') {
            if (Math.trunc(value) !== value) {
                errors.throwError('underflow', errors.NUMERIC_FAULT, { operation: 'setValue', fault: 'underflow', value: value, outputValue: Math.trunc(value) });
            }
            try {
                defineReadOnly(this, '_bn', new _BN.BN(value));
            } catch (error) {
                errors.throwError('overflow', errors.NUMERIC_FAULT, { operation: 'setValue', fault: 'overflow', details: error.message });
            }

        } else if (_BN.BN.isBN(value)) {
            defineReadOnly(this, '_bn', value);

        } else if (_isBigNumber(value)) {
            defineReadOnly(this, '_bn', value._bn);

        } else if (isArrayish(value)) {
            defineReadOnly(this, '_bn', new _BN.BN(hexlify(value).substring(2), 16));

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
