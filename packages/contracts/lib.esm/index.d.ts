import { Fragment, Indexed, Interface, JsonFragment, Result } from "@ethersproject/abi";
import { Listener, Log, Provider, TransactionReceipt, TransactionRequest, TransactionResponse } from "@hethers/abstract-provider";
import { Signer } from "@hethers/abstract-signer";
import { AccountLike } from "@hethers/address";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { BytesLike } from "@ethersproject/bytes";
import { AccessList, AccessListish } from "@hethers/transactions";
export interface Overrides {
    gasLimit?: BigNumberish | Promise<BigNumberish>;
    maxFeePerGas?: BigNumberish | Promise<BigNumberish>;
    maxPriorityFeePerGas?: BigNumberish | Promise<BigNumberish>;
    type?: number;
    accessList?: AccessListish;
    customData?: Record<string, any>;
    nodeId?: AccountLike;
}
export interface PayableOverrides extends Overrides {
    value?: BigNumberish | Promise<BigNumberish>;
}
export interface CallOverrides extends PayableOverrides {
    from?: string | Promise<string>;
}
export interface PopulatedTransaction {
    to?: AccountLike;
    from?: AccountLike;
    gasLimit?: BigNumber;
    data?: string;
    value?: BigNumber;
    chainId?: number;
    type?: number;
    accessList?: AccessList;
    maxFeePerGas?: BigNumber;
    maxPriorityFeePerGas?: BigNumber;
    customData?: Record<string, any>;
    nodeId?: AccountLike;
}
export declare type EventFilter = {
    address?: AccountLike;
    topics?: Array<string | Array<string>>;
};
export declare type ContractFunction<T = any> = (...args: Array<any>) => Promise<T>;
export interface Event extends Log {
    event?: string;
    eventSignature?: string;
    args?: Result;
    decodeError?: Error;
    decode?: (data: string, topics?: Array<string>) => any;
    removeListener: () => void;
    getTransaction: () => Promise<TransactionResponse>;
    getTransactionReceipt: () => Promise<TransactionReceipt>;
}
export interface ContractReceipt extends TransactionReceipt {
    events?: Array<Event>;
}
export interface ContractTransaction extends TransactionResponse {
    wait(confirmations?: number): Promise<ContractReceipt>;
}
declare class RunningEvent {
    readonly tag: string;
    readonly filter: EventFilter;
    private _listeners;
    constructor(tag: string, filter: EventFilter);
    addListener(listener: Listener, once: boolean): void;
    removeListener(listener: Listener): void;
    removeAllListeners(): void;
    listeners(): Array<Listener>;
    listenerCount(): number;
    run(args: Array<any>): number;
    prepareEvent(event: Event): void;
    getEmit(event: Event): Array<any>;
}
export declare type ContractInterface = string | ReadonlyArray<Fragment | JsonFragment | string> | Interface;
export declare class BaseContract {
    private _address;
    readonly interface: Interface;
    readonly signer: Signer;
    readonly provider: Provider;
    readonly functions: {
        [name: string]: ContractFunction;
    };
    readonly callStatic: {
        [name: string]: ContractFunction;
    };
    readonly estimateGas: {
        [name: string]: ContractFunction<BigNumber>;
    };
    readonly populateTransaction: {
        [name: string]: ContractFunction<PopulatedTransaction>;
    };
    readonly filters: {
        [name: string]: (...args: Array<any>) => EventFilter;
    };
    readonly resolvedAddress: Promise<string>;
    readonly deployTransaction: TransactionResponse;
    _deployedPromise: Promise<Contract>;
    _runningEvents: {
        [eventTag: string]: RunningEvent;
    };
    _wrappedEmits: {
        [eventTag: string]: (...args: Array<any>) => void;
    };
    constructor(address: AccountLike | null, contractInterface: ContractInterface, signerOrProvider?: Signer | Provider);
    set address(val: string);
    get address(): string;
    static getInterface(contractInterface: ContractInterface): Interface;
    deployed(): Promise<Contract>;
    _deployed(): Promise<Contract>;
    fallback(overrides?: TransactionRequest): Promise<TransactionResponse>;
    connect(signerOrProvider: Signer | Provider | string): Contract;
    attach(addressOrName: string): Contract;
    static isIndexed(value: any): value is Indexed;
    private _normalizeRunningEvent;
    private _getRunningEvent;
    _requireAddressSet(): void;
    _checkRunningEvents(runningEvent: RunningEvent): void;
    _wrapEvent(runningEvent: RunningEvent, log: Log, listener: Listener): Event;
    private _addEventListener;
    queryFilter(event: EventFilter, fromTimestamp?: string | number, toTimestamp?: string | number): Promise<Array<Event>>;
    on(event: EventFilter | string, listener: Listener): this;
    once(event: EventFilter | string, listener: Listener): this;
    emit(eventName: EventFilter | string, ...args: Array<any>): boolean;
    listenerCount(eventName?: EventFilter | string): number;
    listeners(eventName?: EventFilter | string): Array<Listener>;
    removeAllListeners(eventName?: EventFilter | string): this;
    off(eventName: EventFilter | string, listener: Listener): this;
    removeListener(eventName: EventFilter | string, listener: Listener): this;
}
export declare class Contract extends BaseContract {
    readonly [key: string]: ContractFunction | any;
}
export declare class ContractFactory {
    readonly interface: Interface;
    readonly bytecode: string;
    readonly signer: Signer;
    constructor(contractInterface: ContractInterface, bytecode: BytesLike | {
        object: string;
    }, signer?: Signer);
    getDeployTransaction(...args: Array<any>): TransactionRequest;
    deploy(...args: Array<any>): Promise<Contract>;
    attach(address: string): Contract;
    connect(signer: Signer): ContractFactory;
    static fromSolidity(compilerOutput: any, signer?: Signer): ContractFactory;
    static getInterface(contractInterface: ContractInterface): Interface;
    static getContract(address: AccountLike, contractInterface: ContractInterface, signer?: Signer): Contract;
}
export {};
//# sourceMappingURL=index.d.ts.map