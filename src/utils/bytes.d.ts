/**
 *  Conversion Utilities
 *
 */
import { BigNumber } from './bignumber';
import { Signature } from './secp256k1';
export declare type Arrayish = string | ArrayLike<number>;
export declare function isArrayish(value: any): boolean;
export declare function arrayify(value: Arrayish | BigNumber): Uint8Array;
export declare function concat(objects: Array<Arrayish>): Uint8Array;
export declare function stripZeros(value: Arrayish): Uint8Array;
export declare function padZeros(value: Arrayish, length: number): Uint8Array;
export declare function isHexString(value: any, length?: number): boolean;
export declare function hexlify(value: Arrayish | BigNumber | number): string;
export declare function hexDataLength(data: string): number;
export declare function hexDataSlice(data: string, offset: number, length?: number): string;
export declare function hexStripZeros(value: string): string;
export declare function hexZeroPad(value: string, length: number): string;
export declare function splitSignature(signature: Arrayish): Signature;
export declare function joinSignature(signature: Signature): string;
