import { Result } from "./coders/abstract-coder.js";
import { ParamType } from "./fragments.js";
import type { BytesLike } from "@ethersproject/bytes";
export declare class AbiCoder {
    #private;
    getDefaultValue(types: ReadonlyArray<string | ParamType>): Result;
    encode(types: ReadonlyArray<string | ParamType>, values: ReadonlyArray<any>): string;
    decode(types: ReadonlyArray<string | ParamType>, data: BytesLike, loose?: boolean): Result;
}
export declare const defaultAbiCoder: AbiCoder;
//# sourceMappingURL=abi-coder.d.ts.map