import { Interface } from "../abi/index.js";
import { Log, TransactionResponse } from "../providers/provider.js";
import { ContractTransactionResponse, EventLog } from "./wrappers.js";
import type { EventFragment, FunctionFragment, InterfaceAbi, ParamType } from "../abi/index.js";
import type { Addressable } from "../address/index.js";
import type { EventEmitterable, Listener } from "../utils/index.js";
import type { BlockTag, ContractRunner } from "../providers/index.js";
import type { ContractEventName, ContractInterface, ContractMethod, ContractEvent, ContractTransaction, WrappedFallback } from "./types.js";
/**
 *  @_ignore:
 */
export declare function copyOverrides<O extends string = "data" | "to">(arg: any, allowed?: Array<string>): Promise<Omit<ContractTransaction, O>>;
/**
 *  @_ignore:
 */
export declare function resolveArgs(_runner: null | ContractRunner, inputs: ReadonlyArray<ParamType>, args: Array<any>): Promise<Array<any>>;
declare const internal: unique symbol;
export declare class BaseContract implements Addressable, EventEmitterable<ContractEventName> {
    readonly target: string | Addressable;
    readonly interface: Interface;
    readonly runner: null | ContractRunner;
    readonly filters: Record<string, ContractEvent>;
    readonly [internal]: any;
    readonly fallback: null | WrappedFallback;
    constructor(target: string | Addressable, abi: Interface | InterfaceAbi, runner?: null | ContractRunner, _deployTx?: null | TransactionResponse);
    connect(runner: null | ContractRunner): BaseContract;
    getAddress(): Promise<string>;
    getDeployedCode(): Promise<null | string>;
    waitForDeployment(): Promise<this>;
    deploymentTransaction(): null | ContractTransactionResponse;
    getFunction<T extends ContractMethod = ContractMethod>(key: string | FunctionFragment): T;
    getEvent(key: string | EventFragment): ContractEvent;
    queryTransaction(hash: string): Promise<Array<EventLog>>;
    queryFilter(event: ContractEventName, fromBlock?: BlockTag, toBlock?: BlockTag): Promise<Array<EventLog | Log>>;
    on(event: ContractEventName, listener: Listener): Promise<this>;
    once(event: ContractEventName, listener: Listener): Promise<this>;
    emit(event: ContractEventName, ...args: Array<any>): Promise<boolean>;
    listenerCount(event?: ContractEventName): Promise<number>;
    listeners(event?: ContractEventName): Promise<Array<Listener>>;
    off(event: ContractEventName, listener?: Listener): Promise<this>;
    removeAllListeners(event?: ContractEventName): Promise<this>;
    addListener(event: ContractEventName, listener: Listener): Promise<this>;
    removeListener(event: ContractEventName, listener: Listener): Promise<this>;
    static buildClass<T = ContractInterface>(abi: InterfaceAbi): new (target: string, runner?: null | ContractRunner) => BaseContract & Omit<T, keyof BaseContract>;
    static from<T = ContractInterface>(target: string, abi: InterfaceAbi, runner?: null | ContractRunner): BaseContract & Omit<T, keyof BaseContract>;
}
declare const Contract_base: new (target: string, abi: InterfaceAbi, runner?: ContractRunner | null | undefined) => BaseContract & Omit<ContractInterface, keyof BaseContract>;
export declare class Contract extends Contract_base {
}
export {};
//# sourceMappingURL=contract.d.ts.map