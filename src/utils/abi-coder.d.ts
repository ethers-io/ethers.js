import { Arrayish } from './convert';
export declare type CoerceFunc = (type: string, value: any) => any;
export declare type ParamType = {
    name?: string;
    type: string;
    indexed?: boolean;
    components?: Array<any>;
};
export declare function defaultCoerceFunc(type: string, value: any): any;
export declare function parseSignature(fragment: string): any;
export declare class AbiCoder {
    readonly coerceFunc: CoerceFunc;
    constructor(coerceFunc?: CoerceFunc);
    encode(types: Array<string | ParamType>, values: Array<any>): string;
    decode(types: Array<string | ParamType>, data: Arrayish): any;
}
export declare const defaultAbiCoder: AbiCoder;
