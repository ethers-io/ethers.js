import { Interface } from './interface';
import { Provider, TransactionResponse } from '../providers/provider';
import { ParamType } from '../utils/abi-coder';
import { BigNumber } from '../utils/bignumber';
interface Signer {
    defaultGasLimit?: BigNumber;
    defaultGasPrice?: BigNumber;
    address?: string;
    provider?: Provider;
    getAddress(): Promise<string>;
    getTransactionCount(): Promise<number>;
    estimateGas(tx: any): Promise<BigNumber>;
    sendTransaction(tx: any): Promise<any>;
    sign(tx: any): string | Promise<string>;
}
export declare type ContractEstimate = (...params: Array<any>) => Promise<BigNumber>;
export declare type ContractFunction = (...params: Array<any>) => Promise<any>;
export declare type ContractEvent = (...params: Array<any>) => void;
interface Bucket<T> {
    [name: string]: T;
}
export declare type Contractish = Array<string | ParamType> | Interface | string;
export declare class Contract {
    readonly address: string;
    readonly interface: Interface;
    readonly signer: Signer;
    readonly provider: Provider;
    readonly estimate: Bucket<ContractEstimate>;
    readonly functions: Bucket<ContractFunction>;
    readonly events: Bucket<ContractEvent>;
    readonly addressPromise: Promise<string>;
    readonly deployTransaction: TransactionResponse;
    constructor(addressOrName: string, contractInterface: Contractish, signerOrProvider: Signer | Provider);
    connect(signerOrProvider: Signer | Provider): Contract;
    deploy(bytecode: string, ...args: Array<any>): Promise<Contract>;
}
export {};
