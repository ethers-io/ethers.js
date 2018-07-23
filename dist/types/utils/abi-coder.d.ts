import { Arrayish, CoerceFunc, EventFragment, FunctionFragment, ParamType } from './types';
export declare const defaultCoerceFunc: CoerceFunc;
export declare function parseParamType(type: string): ParamType;
export declare function formatParamType(paramType: ParamType): string;
export declare function formatSignature(fragment: EventFragment | FunctionFragment): string;
export declare function parseSignature(fragment: string): EventFragment | FunctionFragment;
export declare class AbiCoder {
    readonly coerceFunc: CoerceFunc;
    constructor(coerceFunc?: CoerceFunc);
    encode(types: Array<string | ParamType>, values: Array<any>): string;
    decode(types: Array<string | ParamType>, data: Arrayish): Array<any>;
}
export declare const defaultAbiCoder: AbiCoder;
//# sourceMappingURL=abi-coder.d.ts.map