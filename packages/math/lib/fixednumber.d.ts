import type { BigNumberish, BytesLike, Numeric } from "@ethersproject/logger";
export declare function formatFixed(_value: BigNumberish, _decimals?: Numeric): string;
export declare function parseFixed(value: string, _decimals: Numeric): bigint;
export declare class FixedFormat {
    readonly signed: boolean;
    readonly width: number;
    readonly decimals: number;
    readonly name: string;
    readonly _multiplier: bigint;
    constructor(constructorGuard: any, signed: boolean, width: number, decimals: number);
    static from(value: any): FixedFormat;
}
export declare class FixedNumber {
    #private;
    readonly format: FixedFormat;
    readonly _isFixedNumber: boolean;
    constructor(constructorGuard: any, hex: string, value: string, format?: FixedFormat);
    addUnsafe(other: FixedNumber): FixedNumber;
    subUnsafe(other: FixedNumber): FixedNumber;
    mulUnsafe(other: FixedNumber): FixedNumber;
    divUnsafe(other: FixedNumber): FixedNumber;
    floor(): FixedNumber;
    ceiling(): FixedNumber;
    round(decimals?: number): FixedNumber;
    isZero(): boolean;
    isNegative(): boolean;
    toString(): string;
    toHexString(_width: Numeric): string;
    toUnsafeFloat(): number;
    toFormat(format: FixedFormat | string): FixedNumber;
    static fromValue(value: BigNumberish, decimals?: number, format?: FixedFormat | string | number): FixedNumber;
    static fromString(value: string, format?: FixedFormat | string | number): FixedNumber;
    static fromBytes(_value: BytesLike, format?: FixedFormat | string | number): FixedNumber;
    static from(value: any, format?: FixedFormat | string | number): FixedNumber;
    static isFixedNumber(value: any): value is FixedNumber;
}
//# sourceMappingURL=fixednumber.d.ts.map