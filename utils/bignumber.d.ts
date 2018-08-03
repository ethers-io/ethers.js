import { Hexable } from './bytes';
import { Arrayish } from './bytes';
export declare type BigNumberish = BigNumber | string | number | Arrayish;
export declare class BigNumber implements Hexable {
    private readonly _hex;
    constructor(value: BigNumberish);
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
    static isBigNumber(value: any): value is BigNumber;
}
export declare function bigNumberify(value: BigNumberish): BigNumber;
