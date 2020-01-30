import { BigNumber } from './utils/bignumber';
import { Indexed, Interface } from './utils/interface';
import { UnsignedTransaction } from './utils/transaction';
import { BlockTag, Provider } from './providers/abstract-provider';
import { Signer } from './abstract-signer';
import { Arrayish } from './utils/bytes';
import { EventFragment, FunctionFragment, ParamType } from './utils/abi-coder';
import { Block, Listener, Log, TransactionReceipt, TransactionRequest, TransactionResponse } from './providers/abstract-provider';
export declare type ContractFunction = (...params: Array<any>) => Promise<any>;
export declare type EventFilter = {
    address?: string;
    topics?: Array<string>;
};
export interface Event extends Log {
    args?: Array<any>;
    decode?: (data: string, topics?: Array<string>) => any;
    event?: string;
    eventSignature?: string;
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
export declare class VoidSigner extends Signer {
    readonly address: string;
    constructor(address: string, provider: Provider);
    getAddress(): Promise<string>;
    _fail(message: string, operation: string): Promise<any>;
    signMessage(message: Arrayish | string): Promise<string>;
    sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
    connect(provider: Provider): VoidSigner;
}
interface Bucket<T> {
    [name: string]: T;
}
export declare class Contract {
    readonly address: string;
    readonly interface: Interface;
    readonly signer: Signer;
    readonly provider: Provider;
    readonly estimate: Bucket<(...params: Array<any>) => Promise<BigNumber>>;
    readonly functions: Bucket<ContractFunction>;
    readonly filters: Bucket<(...params: Array<any>) => EventFilter>;
    readonly [name: string]: ContractFunction | any;
    readonly addressPromise: Promise<string>;
    readonly deployTransaction: TransactionResponse;
    private _deployedPromise;
    constructor(addressOrName: string, contractInterface: Array<string | FunctionFragment | EventFragment | ParamType> | string | Interface, signerOrProvider: Signer | Provider);
    deployed(): Promise<Contract>;
    _deployed(blockTag?: BlockTag): Promise<Contract>;
    fallback(overrides?: TransactionRequest): Promise<TransactionResponse>;
    connect(signerOrProvider: Signer | Provider | string): Contract;
    attach(addressOrName: string): Contract;
    static isIndexed(value: any): value is Indexed;
    private _events;
    private _getEventFilter;
    private _addEventListener;
    on(event: EventFilter | string, listener: Listener): Contract;
    once(event: EventFilter | string, listener: Listener): Contract;
    addListener(eventName: EventFilter | string, listener: Listener): Contract;
    emit(eventName: EventFilter | string, ...args: Array<any>): boolean;
    listenerCount(eventName?: EventFilter | string): number;
    listeners(eventName: EventFilter | string): Array<Listener>;
    removeAllListeners(eventName: EventFilter | string): Contract;
    removeListener(eventName: any, listener: Listener): Contract;
}
export declare class ContractFactory {
    readonly interface: Interface;
    readonly bytecode: string;
    readonly signer: Signer;
    constructor(contractInterface: Array<string | FunctionFragment | EventFragment | ParamType> | string | Interface, bytecode: Arrayish | string | {
        object: string;
    }, signer?: Signer);
    getDeployTransaction(...args: Array<any>): UnsignedTransaction;
    deploy(...args: Array<any>): Promise<Contract>;
    attach(address: string): Contract;
    connect(signer: Signer): ContractFactory;
    static fromSolidity(compilerOutput: any, signer?: Signer): ContractFactory;
}
export {};
