/**
 *  BigNumber
 *
 *  A wrapper around the BN.js object. We use the BN.js library
 *  because it is used by elliptic, so it is required regardles.
 *
 */
import _BN from 'bn.js';
import { Arrayish } from './convert';
export declare type BigNumberish = BigNumber | string | number | Arrayish;
export declare class BigNumber {
    readonly _bn: _BN.BN;
    constructor(value: BigNumberish);
    fromTwos(value: BigNumberish): BigNumber;
    toTwos(value: BigNumberish): BigNumber;
    add(other: BigNumberish): BigNumber;
    sub(other: BigNumberish): BigNumber;
    div(other: BigNumberish): BigNumber;
    mul(other: BigNumberish): BigNumber;
    mod(other: BigNumberish): BigNumber;
    pow(other: BigNumberish): BigNumber;
    maskn(value: BigNumberish): BigNumber;
    eq(other: BigNumberish): boolean;
    lt(other: BigNumberish): boolean;
    lte(other: BigNumberish): boolean;
    gt(other: BigNumberish): boolean;
    gte(other: BigNumberish): boolean;
    isZero(): boolean;
    toNumber(): number;
    toString(): string;
    toHexString(): string;
}
export declare function isBigNumber(value: any): boolean;
export declare function bigNumberify(value: BigNumberish): BigNumber;
export declare const ConstantNegativeOne: BigNumber;
export declare const ConstantZero: BigNumber;
export declare const ConstantOne: BigNumber;
export declare const ConstantTwo: BigNumber;
export declare const ConstantWeiPerEther: BigNumber;
