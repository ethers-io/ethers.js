import type {
    EventFragment, FunctionFragment, Result, Typed
} from "@ethersproject/abi";
import type { Addressable } from "@ethersproject/address";
import type {
    CallRequest, EventFilter, Filter, Log, PreparedRequest, Provider,
    TopicFilter, TransactionRequest, TransactionResponse
} from "@ethersproject/providers";
import type { Listener } from "@ethersproject/properties";

import type { ContractTransactionResponse } from "./wrappers.js";


// The types of events a Contract can listen for
export type ContractEventName = string | ContractEvent | TopicFilter;

// The object that will be used to run Contracts. The Signer and Provider
// both adhere to this, but other types of objects may wish to as well.
export interface ContractRunner {
    provider?: Provider;

    // Required to estimate gas
    estimateGas?: (tx: TransactionRequest) => Promise<bigint>;

    // Required for pure, view or static calls to contracts
    call?: (tx: TransactionRequest) => Promise<string>;

    // Required to support ENS names
    resolveName?: (name: string | Addressable) => Promise<null | string>;

    // Required for mutating calls
    sendTransaction?: (tx: TransactionRequest) => Promise<TransactionResponse>;

    // Required for queryFilter
    getLogs?: (filter: Filter) => Promise<Array<Log>>;

    // Both are required for a contract to support events
    on?: (event: EventFilter, listener: Listener) => Promise<this>;
    off?: (event: EventFilter, listener: Listener) => Promise<this>;
}

export interface ContractInterface {
    [ name: string ]: BaseContractMethod;
};

export interface DeferredTopicFilter {
    getTopicFilter(): Promise<TopicFilter>;
    fragment: EventFragment;
}

export interface ContractTransaction extends PreparedRequest {
    // These are populated by contract methods and cannot bu null
    to: string;
    data: string;
}

// Deployment Transactions have no `to`
export interface ContractDeployTransaction extends Omit<ContractTransaction, "to"> { }

// Overrides; cannot override `to` or `data` as Contract populates these
export interface Overrides extends Omit<CallRequest, "to" | "data"> { };


// Arguments for methods; with an optional (n+1)th Override
export type PostfixOverrides<A extends Array<any>> = A | [ ...A, Overrides ];
export type ContractMethodArgs<A extends Array<any>> = PostfixOverrides<{ [ I in keyof A ]-?: A[I] | Typed }>;

// A = Arguments passed in as a tuple
// R = The result type of the call (i.e. if only one return type,
//     the qualified type, otherwise Result)
// D = The type the default call will return (i.e. R for view/pure,
//     TransactionResponse otherwise)
export interface BaseContractMethod<A extends Array<any> = Array<any>, R = any, D extends R | ContractTransactionResponse = R | ContractTransactionResponse> {
    (...args: ContractMethodArgs<A>): Promise<D>;

    name: string;

    fragment: FunctionFragment;

    getFragment(...args: ContractMethodArgs<A>): FunctionFragment;

    populateTransaction(...args: ContractMethodArgs<A>): Promise<ContractTransaction>;
    staticCall(...args: ContractMethodArgs<A>): Promise<R>;
    send(...args: ContractMethodArgs<A>): Promise<ContractTransactionResponse>;
    estimateGas(...args: ContractMethodArgs<A>): Promise<bigint>;
    staticCallResult(...args: ContractMethodArgs<A>): Promise<Result>;
}

export interface ContractMethod<
    A extends Array<any> = Array<any>,
    R = any,
    D extends R | ContractTransactionResponse = R | ContractTransactionResponse
> extends BaseContractMethod<A, R, D> { }

export interface ConstantContractMethod<
    A extends Array<any>,
    R = any
> extends ContractMethod<A, R, R> { }


// Arguments for events; with each element optional and/or nullable
export type ContractEventArgs<A extends Array<any>> = { [ I in keyof A ]?: A[I] | Typed | null };

export interface ContractEvent<A extends Array<any> = Array<any>> {
    (...args: ContractEventArgs<A>): DeferredTopicFilter;

    name: string;

    fragment: EventFragment;
    getFragment(...args: ContractEventArgs<A>): EventFragment;
};
