import { AbiCoder } from "./abi-coder.js";
import { checkResultErrors, Result } from "./coders/abstract-coder.js";
import { ConstructorFragment, ErrorFragment, EventFragment, FormatType, Fragment, FunctionFragment, ParamType } from "./fragments.js";
import { Typed } from "./typed.js";
import type { BigNumberish, BytesLike } from "../utils/index.js";
import type { JsonFragment } from "./fragments.js";
export { checkResultErrors, Result };
export declare class LogDescription {
    readonly fragment: EventFragment;
    readonly name: string;
    readonly signature: string;
    readonly topic: string;
    readonly args: Result;
    constructor(fragment: EventFragment, topic: string, args: Result);
}
export declare class TransactionDescription {
    readonly fragment: FunctionFragment;
    readonly name: string;
    readonly args: Result;
    readonly signature: string;
    readonly selector: string;
    readonly value: bigint;
    constructor(fragment: FunctionFragment, selector: string, args: Result, value: bigint);
}
export declare class ErrorDescription {
    readonly fragment: ErrorFragment;
    readonly name: string;
    readonly args: Result;
    readonly signature: string;
    readonly selector: string;
    constructor(fragment: ErrorFragment, selector: string, args: Result);
}
export declare class Indexed {
    readonly hash: null | string;
    readonly _isIndexed: boolean;
    static isIndexed(value: any): value is Indexed;
    constructor(hash: null | string);
}
export declare type InterfaceAbi = string | ReadonlyArray<Fragment | JsonFragment | string>;
export declare class Interface {
    #private;
    readonly fragments: ReadonlyArray<Fragment>;
    readonly deploy: ConstructorFragment;
    constructor(fragments: InterfaceAbi);
    format(format?: FormatType): string | Array<string>;
    getAbiCoder(): AbiCoder;
    getFunctionName(key: string): string;
    getFunction(key: string, values?: Array<any | Typed>): FunctionFragment;
    getEventName(key: string): string;
    getEvent(key: string, values?: Array<any | Typed>): EventFragment;
    getError(key: string, values?: Array<any | Typed>): ErrorFragment;
    getSelector(fragment: ErrorFragment | FunctionFragment): string;
    getEventTopic(fragment: EventFragment): string;
    _decodeParams(params: ReadonlyArray<ParamType>, data: BytesLike): Result;
    _encodeParams(params: ReadonlyArray<ParamType>, values: ReadonlyArray<any>): string;
    encodeDeploy(values?: ReadonlyArray<any>): string;
    decodeErrorResult(fragment: ErrorFragment | string, data: BytesLike): Result;
    encodeErrorResult(fragment: ErrorFragment | string, values?: ReadonlyArray<any>): string;
    decodeFunctionData(fragment: FunctionFragment | string, data: BytesLike): Result;
    encodeFunctionData(fragment: FunctionFragment | string, values?: ReadonlyArray<any>): string;
    decodeFunctionResult(fragment: FunctionFragment | string, data: BytesLike): Result;
    makeError(fragment: FunctionFragment | string, _data: BytesLike, tx?: {
        data: string;
    }): Error;
    encodeFunctionResult(functionFragment: FunctionFragment | string, values?: ReadonlyArray<any>): string;
    encodeFilterTopics(eventFragment: EventFragment, values: ReadonlyArray<any>): Array<null | string | Array<string>>;
    encodeEventLog(eventFragment: EventFragment, values: ReadonlyArray<any>): {
        data: string;
        topics: Array<string>;
    };
    decodeEventLog(eventFragment: EventFragment | string, data: BytesLike, topics?: ReadonlyArray<string>): Result;
    parseTransaction(tx: {
        data: string;
        value?: BigNumberish;
    }): null | TransactionDescription;
    parseLog(log: {
        topics: Array<string>;
        data: string;
    }): null | LogDescription;
    parseError(data: BytesLike): null | ErrorDescription;
    static from(value: ReadonlyArray<Fragment | string | JsonFragment> | string | Interface): Interface;
}
//# sourceMappingURL=interface.d.ts.map