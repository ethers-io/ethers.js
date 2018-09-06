import { Indexed, Interface } from './interface';
import { BigNumber } from '../utils/bignumber';
import { Provider } from '../providers/abstract-provider';
import { Signer } from '../wallet/abstract-signer';
import { Arrayish } from '../utils/bytes';
import { ParamType } from '../utils/abi-coder';
import { Block, Listener, Log, TransactionReceipt, TransactionRequest, TransactionResponse } from '../providers/abstract-provider';
export declare type ContractFunction = (...params: Array<any>) => Promise<any>;
export declare type EventFilter = {
    address?: string;
    topics?: Array<string>;
};
export interface Event extends Log {
    args: Array<any>;
    decode: (data: string, topics?: Array<string>) => any;
    event: string;
    eventSignature: string;
    removeListener: () => void;
    getBlock: () => Promise<Block>;
    getTransaction: () => Promise<TransactionResponse>;
    getTransactionReceipt: () => Promise<TransactionReceipt>;
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
    private _deployed;
    constructor(addressOrName: string, contractInterface: Array<string | ParamType> | string | Interface, signerOrProvider: Signer | Provider);
    deployed(): Promise<Contract>;
    fallback(overrides?: TransactionRequest): Promise<TransactionResponse>;
    connect(signerOrProvider: Signer | Provider | string): Contract;
    attach(addressOrName: string): Contract;
    deploy(bytecode: string, ...args: Array<any>): Promise<Contract>;
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
export {};
