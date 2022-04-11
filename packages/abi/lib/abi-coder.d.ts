import { Result } from "./coders/abstract-coder.js";
import { ParamType } from "./fragments.js";
import type { BytesLike } from "@ethersproject/bytes";
export declare type CoerceFunc = (type: string, value: any) => any;
export declare class AbiCoder {
    #private;
    readonly coerceFunc: null | CoerceFunc;
    constructor(coerceFunc?: CoerceFunc);
    getDefaultValue(types: ReadonlyArray<string | ParamType>): Result;
    encode(types: ReadonlyArray<string | ParamType>, values: ReadonlyArray<any>): string;
    decode(types: ReadonlyArray<string | ParamType>, data: BytesLike, loose?: boolean): Result;
}
export declare const defaultAbiCoder: AbiCoder;
//# sourceMappingURL=abi-coder.d.ts.map