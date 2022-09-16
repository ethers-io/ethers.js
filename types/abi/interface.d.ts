import { AbiCoder } from "./abi-coder.js";
import { checkResultErrors, Result } from "./coders/abstract-coder.js";
import { ConstructorFragment, ErrorFragment, EventFragment, Fragment, FunctionFragment, ParamType } from "./fragments.js";
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
    /**
     *  All the Contract ABI members (i.e. methods, events, errors, etc).
     */
    readonly fragments: ReadonlyArray<Fragment>;
    /**
     *  The Contract constructor.
     */
    readonly deploy: ConstructorFragment;
    constructor(fragments: InterfaceAbi);
    /**
     *  Returns the entire Human-Readable ABI, as an array of
     *  signatures, optionally as %%minimal%% strings, which
     *  removes parameter names and unneceesary spaces.
     */
    format(minimal?: boolean): Array<string>;
    /**
     *  Return the JSON-encoded ABI. This is the format Solidiy
     *  returns.
     */
    formatJson(): string;
    /**
     *  The ABI coder that will be used to encode and decode binary
     *  data.
     */
    getAbiCoder(): AbiCoder;
    /**
     *  Get the function name for %%key%%, which may be a function selector,
     *  function name or function signature that belongs to the ABI.
     */
    getFunctionName(key: string): string;
    /**
     *  Get the [[FunctionFragment]] for %%key%%, which may be a function
     *  selector, function name or function signature that belongs to the ABI.
     *
     *  If %%values%% is provided, it will use the Typed API to handle
     *  ambiguous cases where multiple functions match by name.
     *
     *  If the %%key%% and %%values%% do not refine to a single function in
     *  the ABI, this will throw.
     */
    getFunction(key: string, values?: Array<any | Typed>): FunctionFragment;
    /**
     *  Get the event name for %%key%%, which may be a topic hash,
     *  event name or event signature that belongs to the ABI.
     */
    getEventName(key: string): string;
    /**
     *  Get the [[EventFragment]] for %%key%%, which may be a topic hash,
     *  event name or event signature that belongs to the ABI.
     *
     *  If %%values%% is provided, it will use the Typed API to handle
     *  ambiguous cases where multiple events match by name.
     *
     *  If the %%key%% and %%values%% do not refine to a single event in
     *  the ABI, this will throw.
     */
    getEvent(key: string, values?: Array<any | Typed>): EventFragment;
    /**
     *  Get the [[ErrorFragment]] for %%key%%, which may be an error
     *  selector, error name or error signature that belongs to the ABI.
     *
     *  If %%values%% is provided, it will use the Typed API to handle
     *  ambiguous cases where multiple errors match by name.
     *
     *  If the %%key%% and %%values%% do not refine to a single error in
     *  the ABI, this will throw.
     */
    getError(key: string, values?: Array<any | Typed>): ErrorFragment;
    _decodeParams(params: ReadonlyArray<ParamType>, data: BytesLike): Result;
    _encodeParams(params: ReadonlyArray<ParamType>, values: ReadonlyArray<any>): string;
    /**
     *  Encodes a ``tx.data`` object for deploying the Contract with
     *  the %%values%% as the constructor arguments.
     */
    encodeDeploy(values?: ReadonlyArray<any>): string;
    /**
     *  Decodes the result %%data%% (e.g. from an ``eth_call``) for the
     *  specified error (see [[getError]] for valid values for
     *  %%key%%).
     *
     *  Most developers should prefer the [[parseResult]] method instead,
     *  which will automatically detect a ``CALL_EXCEPTION`` and throw the
     *  corresponding error.
     */
    decodeErrorResult(fragment: ErrorFragment | string, data: BytesLike): Result;
    /**
     *  Encodes the transaction revert data for a call result that
     *  reverted from the the Contract with the sepcified %%error%%
     *  (see [[getError]] for valid values for %%key%%) with the %%values%%.
     *
     *  This is generally not used by most developers, unless trying to mock
     *  a result from a Contract.
     */
    encodeErrorResult(key: ErrorFragment | string, values?: ReadonlyArray<any>): string;
    /**
     *  Decodes the %%data%% from a transaction ``tx.data`` for
     *  the function specified (see [[getFunction]] for valid values
     *  for %%key%%).
     *
     *  Most developers should prefer the [[parseTransaction]] method
     *  instead, which will automatically detect the fragment.
     */
    decodeFunctionData(key: FunctionFragment | string, data: BytesLike): Result;
    /**
     *  Encodes the ``tx.data`` for a transaction that calls the function
     *  specified (see [[getFunction]] for valid values for %%key%%) with
     *  the %%values%%.
     */
    encodeFunctionData(key: FunctionFragment | string, values?: ReadonlyArray<any>): string;
    /**
     *  Decodes the result %%data%% (e.g. from an ``eth_call``) for the
     *  specified function (see [[getFunction]] for valid values for
     *  %%key%%).
     *
     *  Most developers should prefer the [[parseResult]] method instead,
     *  which will automatically detect a ``CALL_EXCEPTION`` and throw the
     *  corresponding error.
     */
    decodeFunctionResult(fragment: FunctionFragment | string, data: BytesLike): Result;
    makeError(fragment: FunctionFragment | string, _data: BytesLike, tx?: {
        data: string;
    }): Error;
    /**
     *  Encodes the result data (e.g. from an ``eth_call``) for the
     *  specified function (see [[getFunction]] for valid values
     *  for %%key%%) with %%values%%.
     *
     *  This is generally not used by most developers, unless trying to mock
     *  a result from a Contract.
     */
    encodeFunctionResult(key: FunctionFragment | string, values?: ReadonlyArray<any>): string;
    encodeFilterTopics(eventFragment: EventFragment, values: ReadonlyArray<any>): Array<null | string | Array<string>>;
    encodeEventLog(eventFragment: EventFragment, values: ReadonlyArray<any>): {
        data: string;
        topics: Array<string>;
    };
    decodeEventLog(eventFragment: EventFragment | string, data: BytesLike, topics?: ReadonlyArray<string>): Result;
    /**
     *  Parses a transaction, finding the matching function and extracts
     *  the parameter values along with other useful function details.
     *
     *  If the matching function cannot be found, return null.
     */
    parseTransaction(tx: {
        data: string;
        value?: BigNumberish;
    }): null | TransactionDescription;
    parseCallResult(data: BytesLike): Result;
    /**
     *  Parses a receipt log, finding the matching event and extracts
     *  the parameter values along with other useful event details.
     *
     *  If the matching event cannot be found, returns null.
     */
    parseLog(log: {
        topics: Array<string>;
        data: string;
    }): null | LogDescription;
    /**
     *  Parses a revert data, finding the matching error and extracts
     *  the parameter values along with other useful error details.
     *
     *  If the matching event cannot be found, returns null.
     */
    parseError(data: BytesLike): null | ErrorDescription;
    /**
     *  Creates a new [[Interface]] from the ABI %%value%%.
     *
     *  The %%value%% may be provided as an existing [[Interface]] object,
     *  a JSON-encoded ABI or any Human-Readable ABI format.
     */
    static from(value: ReadonlyArray<Fragment | string | JsonFragment> | string | Interface): Interface;
}
//# sourceMappingURL=interface.d.ts.map