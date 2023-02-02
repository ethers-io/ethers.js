import type { EventFragment, FunctionFragment, Result, Typed } from "../abi/index.js";
import type { TransactionRequest, PreparedTransactionRequest, TopicFilter } from "../providers/index.js";
import type { ContractTransactionResponse } from "./wrappers.js";
export type ContractEventName = string | ContractEvent | TopicFilter | DeferredTopicFilter;
export interface ContractInterface {
    [name: string]: BaseContractMethod;
}
export interface DeferredTopicFilter {
    getTopicFilter(): Promise<TopicFilter>;
    fragment: EventFragment;
}
export interface ContractTransaction extends PreparedTransactionRequest {
    to: string;
    data: string;
    from?: string;
}
export interface ContractDeployTransaction extends Omit<ContractTransaction, "to"> {
}
export interface Overrides extends Omit<TransactionRequest, "to" | "data"> {
}
export type PostfixOverrides<A extends Array<any>> = A | [...A, Overrides];
export type ContractMethodArgs<A extends Array<any>> = PostfixOverrides<{
    [I in keyof A]-?: A[I] | Typed;
}>;
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
export interface ContractMethod<A extends Array<any> = Array<any>, R = any, D extends R | ContractTransactionResponse = R | ContractTransactionResponse> extends BaseContractMethod<A, R, D> {
}
export interface ConstantContractMethod<A extends Array<any>, R = any> extends ContractMethod<A, R, R> {
}
export type ContractEventArgs<A extends Array<any>> = {
    [I in keyof A]?: A[I] | Typed | null;
};
export interface ContractEvent<A extends Array<any> = Array<any>> {
    (...args: ContractEventArgs<A>): DeferredTopicFilter;
    name: string;
    fragment: EventFragment;
    getFragment(...args: ContractEventArgs<A>): EventFragment;
}
//# sourceMappingURL=types.d.ts.map