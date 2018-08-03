/**
 *  Conversion Utilities
 *
 */
import { Arrayish } from './bytes';
export declare type Arrayish = string | ArrayLike<number>;
export interface Hexable {
    toHexString(): string;
}
export interface Signature {
    r: string;
    s: string;
    recoveryParam?: number;
    v?: number;
}
export declare function isHexable(value: any): value is Hexable;
export declare function isArrayish(value: any): value is Arrayish;
export declare function arrayify(value: Arrayish | Hexable): Uint8Array;
export declare function concat(objects: Array<Arrayish>): Uint8Array;
export declare function stripZeros(value: Arrayish): Uint8Array;
export declare function padZeros(value: Arrayish, length: number): Uint8Array;
export declare function isHexString(value: any, length?: number): boolean;
export declare function hexlify(value: Arrayish | Hexable | number): string;
export declare function hexDataLength(data: string): number;
export declare function hexDataSlice(data: string, offset: number, length?: number): string;
export declare function hexStripZeros(value: string): string;
export declare function hexZeroPad(value: string, length: number): string;
export declare function splitSignature(signature: Arrayish | Signature): Signature;
export declare function joinSignature(signature: Signature): string;
