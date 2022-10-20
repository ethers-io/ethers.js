import { Result } from "./coders/abstract-coder.js";
import { ParamType } from "./fragments.js";
import type { BytesLike, CallExceptionAction, CallExceptionError } from "../utils/index.js";
export declare class AbiCoder {
    #private;
    getDefaultValue(types: ReadonlyArray<string | ParamType>): Result;
    encode(types: ReadonlyArray<string | ParamType>, values: ReadonlyArray<any>): string;
    decode(types: ReadonlyArray<string | ParamType>, data: BytesLike, loose?: boolean): Result;
}
export declare function getBuiltinCallException(action: CallExceptionAction, tx: {
    to?: null | string;
    from?: null | string;
    data?: string;
}, data: null | BytesLike): CallExceptionError;
export declare const defaultAbiCoder: AbiCoder;
//# sourceMappingURL=abi-coder.d.ts.map