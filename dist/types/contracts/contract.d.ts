import { Interface } from './interface';
import { Signer, MinimalProvider, BigNumber, ContractFunction, EventFilter, ParamType, Listener, TransactionRequest, TransactionResponse } from '../utils/types';
interface Bucket<T> {
    [name: string]: T;
}
export declare class Contract {
    readonly address: string;
    readonly interface: Interface;
    readonly signer: Signer;
    readonly provider: MinimalProvider;
    readonly estimate: Bucket<(...params: Array<any>) => Promise<BigNumber>>;
    readonly functions: Bucket<ContractFunction>;
    readonly filters: Bucket<(...params: Array<any>) => EventFilter>;
    readonly [name: string]: ContractFunction | any;
    readonly addressPromise: Promise<string>;
    readonly deployTransaction: TransactionResponse;
    constructor(addressOrName: string, contractInterface: Array<string | ParamType> | string | Interface, signerOrProvider: Signer | MinimalProvider);
    deployed(): Promise<Contract>;
    fallback(overrides?: TransactionRequest): Promise<TransactionResponse>;
    connect(signerOrProvider: Signer | MinimalProvider): Contract;
    attach(addressOrName: string): Contract;
    deploy(bytecode: string, ...args: Array<any>): Promise<Contract>;
    private _events;
    private _getEventFilter;
    private _addEventListener;
    on(event: EventFilter | string, listener: Listener): Contract;
    once(event: EventFilter | string, listener: Listener): Contract;
    addEventLisener(eventName: EventFilter | string, listener: Listener): Contract;
    emit(eventName: EventFilter | string, ...args: Array<any>): boolean;
    listenerCount(eventName?: EventFilter | string): number;
    listeners(eventName: EventFilter | string): Array<Listener>;
    removeAllListeners(eventName: EventFilter | string): Contract;
    removeListener(eventName: any, listener: Listener): Contract;
}
export {};
//# sourceMappingURL=contract.d.ts.map