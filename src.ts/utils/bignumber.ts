'use strict';

/**
 *  BigNumber
 *
 *  A wrapper around the BN.js object. We use the BN.js library
 *  because it is used by elliptic, so it is required regardles.
 *
 */

import BN from 'bn.js';

import { Hexable, hexlify, isArrayish, isHexString } from './bytes';
import { defineReadOnly, isType, setType } from './properties';

import { Arrayish } from './bytes';

import * as errors from '../errors';

const BN_1 = new BN.BN(-1);

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
    return _bnify(bigNumberify(value));
}

function toBigNumber(bn: BN.BN): BigNumber {
    return new BigNumber(toHex(bn));
}

function _bnify(value: BigNumber): BN.BN {
    let hex: string = (<any>value)._hex;
    if (hex[0] === '-') {
        return (new BN.BN(hex.substring(3), 16)).mul(BN_1);
    }
    return new BN.BN(hex.substring(2), 16);
}

export type BigNumberish = BigNumber | string | number | Arrayish;

export class BigNumber implements Hexable {
    private readonly _hex: string;

    constructor(value: BigNumberish) {
        errors.checkNew(this, BigNumber);
        setType(this, 'BigNumber');

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

        } else if (value instanceof BigNumber) {
            defineReadOnly(this, '_hex', value._hex);

        } else if ((<any>value).toHexString) {
            defineReadOnly(this, '_hex', toHex(toBN((<any>value).toHexString())));

        } else if ((<any>value)._hex && isHexString((<any>value)._hex)) {
            defineReadOnly(this, '_hex', (<any>value)._hex);

        } else if (isArrayish(value)) {
            defineReadOnly(this, '_hex', toHex(new BN.BN(hexlify(value).substring(2), 16)));

        } else {
            errors.throwError('invalid BigNumber value', errors.INVALID_ARGUMENT, { arg: 'value', value: value });
        }
    }

    fromTwos(value: number): BigNumber {
        return toBigNumber(_bnify(this).fromTwos(value));
    }

    toTwos(value: number): BigNumber {
        return toBigNumber(_bnify(this).toTwos(value));
    }

    abs(): BigNumber {
        if (this._hex[0] === '-') {
            return toBigNumber(_bnify(this).mul(BN_1));
        }
        return this;
    }

    add(other: BigNumberish): BigNumber {
        return toBigNumber(_bnify(this).add(toBN(other)));
    }

    sub(other: BigNumberish): BigNumber {
        return toBigNumber(_bnify(this).sub(toBN(other)));
    }

    div(other: BigNumberish): BigNumber {
        let o: BigNumber = bigNumberify(other);
        if (o.isZero()) {
            errors.throwError('division by zero', errors.NUMERIC_FAULT, { operation: 'divide', fault: 'division by zero' });
        }
        return toBigNumber(_bnify(this).div(toBN(other)));
    }

    mul(other: BigNumberish): BigNumber {
        return toBigNumber(_bnify(this).mul(toBN(other)));
    }

    mod(other: BigNumberish): BigNumber {
        return toBigNumber(_bnify(this).mod(toBN(other)));
    }

    pow(other: BigNumberish): BigNumber {
        return toBigNumber(_bnify(this).pow(toBN(other)));
    }

    maskn(value: number): BigNumber {
        return toBigNumber(_bnify(this).maskn(value));
    }

    eq(other: BigNumberish): boolean {
        return _bnify(this).eq(toBN(other));
    }

    lt(other: BigNumberish): boolean {
        return _bnify(this).lt(toBN(other));
    }

    lte(other: BigNumberish): boolean {
        return _bnify(this).lte(toBN(other));
    }

    gt(other: BigNumberish): boolean {
        return _bnify(this).gt(toBN(other));
   }

    gte(other: BigNumberish): boolean {
        return _bnify(this).gte(toBN(other));
    }

    isZero(): boolean {
        return _bnify(this).isZero();
    }

    toNumber(): number {
        try {
            return _bnify(this).toNumber();
        } catch (error) {
            errors.throwError('overflow', errors.NUMERIC_FAULT, { operation: 'setValue', fault: 'overflow', details: error.message });
        }
        return null;
    }

    toString(): string {
        return _bnify(this).toString(10);
    }

    toHexString(): string {
        return this._hex;
    }

    static isBigNumber(value: any): value is BigNumber {
        return isType(value, 'BigNumber');
    }
}

export function bigNumberify(value: BigNumberish): BigNumber {
    if (BigNumber.isBigNumber(value)) { return value; }
    return new BigNumber(value);
}

