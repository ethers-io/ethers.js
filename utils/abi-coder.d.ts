import { BigNumber } from './bignumber';
import { Arrayish } from './bytes';
export declare type CoerceFunc = (type: string, value: any) => any;
export declare type ParamType = {
    name?: string;
    type: string;
    indexed?: boolean;
    components?: Array<any>;
};
export declare type EventFragment = {
    type: string;
    name: string;
    anonymous: boolean;
    inputs: Array<ParamType>;
};
export declare type FunctionFragment = {
    type: string;
    name: string;
    constant: boolean;
    inputs: Array<ParamType>;
    outputs: Array<ParamType>;
    payable: boolean;
    stateMutability: string;
    gas?: BigNumber;
};
export declare const defaultCoerceFunc: CoerceFunc;
export declare function parseParamType(type: string): ParamType;
export declare function formatParamType(paramType: ParamType): string;
export declare function formatSignature(fragment: EventFragment | FunctionFragment): string;
export declare function parseSignature(fragment: string): EventFragment | FunctionFragment;
declare type DecodedResult = {
    consumed: number;
    value: any;
};
declare abstract class Coder {
    readonly coerceFunc: CoerceFunc;
    readonly name: string;
    readonly type: string;
    readonly localName: string;
    readonly dynamic: boolean;
    readonly size?: number;
    constructor(coerceFunc: CoerceFunc, name: string, type: string, localName: string, dynamic: boolean, size?: number);
    abstract encode(value: any, tight?: boolean): Uint8Array;
    abstract decode(data: Uint8Array, offset: number, tight?: boolean): DecodedResult;
}
export declare function pack(coders: Array<Coder>, values: Array<any>, tight?: boolean): Uint8Array;
export declare function unpack(coders: Array<Coder>, data: Uint8Array, offset: number, tight?: boolean): DecodedResult;
export declare class AbiCoder {
    readonly coerceFunc: CoerceFunc;
    constructor(coerceFunc?: CoerceFunc);
    encode(types: Array<string | ParamType>, values: Array<any>): string;
    encodePacked(types: Array<string | ParamType>, values: Array<any>): string;
    decode(types: Array<string | ParamType>, data: Arrayish): any;
    decodePacked(types: Array<string | ParamType>, data: Arrayish): any;
}
export declare const defaultAbiCoder: AbiCoder;
export {};
