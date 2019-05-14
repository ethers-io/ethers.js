import { EventFragment, Fragment, Indexed, Interface, JsonFragment } from "@ethersproject/abi";
import { Block, BlockTag, Listener, Log, Provider, TransactionReceipt, TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber, BigNumberish } from "@ethersproject/bignumber";
import { BytesLike } from "@ethersproject/bytes";
import { UnsignedTransaction } from "@ethersproject/transactions";
export interface Overrides {
    gasLimit?: BigNumberish | Promise<BigNumberish>;
    gasPrice?: BigNumberish | Promise<BigNumberish>;
    nonce?: BigNumberish | Promise<BigNumberish>;
}
export interface PayableOverrides extends Overrides {
    value?: BigNumberish | Promise<BigNumberish>;
}
export interface CallOverrides extends PayableOverrides {
    blockTag?: BlockTag | Promise<BlockTag>;
    from?: string | Promise<string>;
}
export declare type ContractFunction = (...params: Array<any>) => Promise<any>;
export declare type EventFilter = {
    address?: string;
    topics?: Array<string>;
};
export interface Event extends Log {
    event?: string;
    eventSignature?: string;
    values?: Array<any>;
    decode?: (data: string, topics?: Array<string>) => any;
    removeListener: () => void;
    getBlock: () => Promise<Block>;
    getTransaction: () => Promise<TransactionResponse>;
    getTransactionReceipt: () => Promise<TransactionReceipt>;
}
export interface ContractReceipt extends TransactionReceipt {
    events?: Array<Event>;
}
export interface ContractTransaction extends TransactionResponse {
    wait(confirmations?: number): Promise<ContractReceipt>;
}
interface Bucket<T> {
    [name: string]: T;
}
declare type _EventFilter = {
    prepareEvent: (event: Event) => void;
    fragment?: EventFragment;
    eventTag: string;
    filter: EventFilter;
};
export declare type ContractInterface = string | Array<Fragment | JsonFragment | string> | Interface;
export declare class Contract {
    readonly address: string;
    readonly interface: Interface;
    readonly signer: Signer;
    readonly provider: Provider;
    readonly functions: Bucket<ContractFunction>;
    readonly callStatic: Bucket<ContractFunction>;
    readonly estimate: Bucket<(...params: Array<any>) => Promise<BigNumber>>;
    readonly populateTransaction: Bucket<(...params: Array<any>) => Promise<UnsignedTransaction>>;
    readonly filters: Bucket<(...params: Array<any>) => EventFilter>;
    readonly [name: string]: ContractFunction | any;
    readonly addressPromise: Promise<string>;
    readonly deployTransaction: TransactionResponse;
    _deployedPromise: Promise<Contract>;
    constructor(addressOrName: string, contractInterface: ContractInterface, signerOrProvider: Signer | Provider);
    static getContractAddress(transaction: {
        from: string;
        nonce: BigNumberish;
    }): string;
    static getInterface(contractInterface: ContractInterface): Interface;
    deployed(): Promise<Contract>;
    _deployed(blockTag?: BlockTag): Promise<Contract>;
    fallback(overrides?: TransactionRequest): Promise<TransactionResponse>;
    connect(signerOrProvider: Signer | Provider | string): Contract;
    attach(addressOrName: string): Contract;
    static isIndexed(value: any): value is Indexed;
    private _events;
    private _getEventFilter;
    _wrapEvent(eventFilter: _EventFilter, log: Log, listener: Listener): Event;
    private _addEventListener;
    queryFilter(event: EventFilter, fromBlockOrBlockhash?: BlockTag | string, toBlock?: BlockTag): Promise<Array<Event>>;
    on(event: EventFilter | string, listener: Listener): Contract;
    once(event: EventFilter | string, listener: Listener): Contract;
    addListener(eventName: EventFilter | string, listener: Listener): Contract;
    emit(eventName: EventFilter | string, ...args: Array<any>): boolean;
    listenerCount(eventName?: EventFilter | string): number;
    listeners(eventName?: EventFilter | string): Array<Listener>;
    removeAllListeners(eventName: EventFilter | string): Contract;
    off(eventName: any, listener: Listener): Contract;
    removeListener(eventName: any, listener: Listener): Contract;
}
export declare class ContractFactory {
    readonly interface: Interface;
    readonly bytecode: string;
    readonly signer: Signer;
    constructor(contractInterface: ContractInterface, bytecode: BytesLike | {
        object: string;
    }, signer?: Signer);
    getDeployTransaction(...args: Array<any>): UnsignedTransaction;
    deploy(...args: Array<any>): Promise<Contract>;
    attach(address: string): Contract;
    connect(signer: Signer): ContractFactory;
    static fromSolidity(compilerOutput: any, signer?: Signer): ContractFactory;
    static getInterface(contractInterface: ContractInterface): Interface;
    static getContractAddress(tx: {
        from: string;
        nonce: BytesLike | BigNumber | number;
    }): string;
    static getContract(address: string, contractInterface: ContractInterface, signer?: Signer): Contract;
}
export {};
