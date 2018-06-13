import { Network } from './networks';
import { BlockTag, Provider, TransactionRequest } from './provider.js';
import { BigNumber } from '../utils/bignumber';
import { Arrayish } from '../utils/convert';
import { ConnectionInfo } from '../utils/web';
export declare function hexlifyTransaction(transaction: TransactionRequest): any;
export declare class JsonRpcSigner {
    readonly provider: JsonRpcProvider;
    readonly _address: string;
    constructor(provider: JsonRpcProvider, address?: string);
    readonly address: string;
    getAddress(): Promise<string>;
    getBalance(blockTag?: BlockTag): Promise<BigNumber>;
    getTransactionCount(blockTag: any): Promise<number>;
    sendTransaction(transaction: TransactionRequest): Promise<any>;
    signMessage(message: Arrayish | string): Promise<string>;
    unlock(password: any): Promise<boolean>;
}
export declare class JsonRpcProvider extends Provider {
    readonly connection: ConnectionInfo;
    private _pendingFilter;
    constructor(url?: ConnectionInfo | string, network?: Network | string);
    getSigner(address: any): JsonRpcSigner;
    listAccounts(): Promise<any>;
    send(method: any, params: any): Promise<any>;
    perform(method: any, params: any): Promise<any>;
    _startPending(): void;
    _stopPending(): void;
}
