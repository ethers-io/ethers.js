import { Interface } from './interface.js';
import { ParamType } from '../utils/abi-coder';
import { BigNumber } from '../utils/bignumber.js';
interface Provider {
}
interface Signer {
    call(data: string): any;
    sendTransaction(tx: any): Promise<any>;
}
export declare type ContractEstimate = (...params: Array<any>) => Promise<BigNumber>;
export declare type ContractFunction = (...params: Array<any>) => Promise<any>;
export declare type ContractEvent = (...params: Array<any>) => void;
interface Bucket<T> {
    [name: string]: T;
}
export declare class Contract {
    readonly address: string;
    readonly interface: Interface;
    readonly signer: Signer;
    readonly provider: Provider;
    readonly estimate: Bucket<ContractEstimate>;
    readonly functions: Bucket<ContractFunction>;
    readonly events: Bucket<ContractEvent>;
    readonly addressPromise: Promise<string>;
    constructor(addressOrName: string, contractInterface: Array<string | ParamType> | Interface | string, signerOrProvider: any);
    connect(signerOrProvider: any): Contract;
    deploy(bytecode: any, ...args: any[]): Promise<any>;
}
export {};
