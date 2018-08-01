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
    gas: BigNumber;
};
export declare const defaultCoerceFunc: CoerceFunc;
export declare function parseParamType(type: string): ParamType;
export declare function formatParamType(paramType: ParamType): string;
export declare function formatSignature(fragment: EventFragment | FunctionFragment): string;
export declare function parseSignature(fragment: string): EventFragment | FunctionFragment;
export declare class AbiCoder {
    readonly coerceFunc: CoerceFunc;
    constructor(coerceFunc?: CoerceFunc);
    encode(types: Array<string | ParamType>, values: Array<any>): string;
    decode(types: Array<string | ParamType>, data: Arrayish): any;
}
export declare const defaultAbiCoder: AbiCoder;
