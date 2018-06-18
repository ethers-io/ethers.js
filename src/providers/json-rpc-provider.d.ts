import { Networkish } from './networks';
import { BlockTag, Provider, TransactionRequest, TransactionResponse } from './provider';
import { Signer } from '../wallet/wallet';
import { BigNumber } from '../utils/bignumber';
import { Arrayish } from '../utils/bytes';
import { ConnectionInfo } from '../utils/web';
export declare function hexlifyTransaction(transaction: TransactionRequest): any;
export declare class JsonRpcSigner extends Signer {
    readonly provider: JsonRpcProvider;
    readonly _address: string;
    constructor(provider: JsonRpcProvider, address?: string);
    readonly address: string;
    getAddress(): Promise<string>;
    getBalance(blockTag?: BlockTag): Promise<BigNumber>;
    getTransactionCount(blockTag: any): Promise<number>;
    sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
    signMessage(message: Arrayish | string): Promise<string>;
    unlock(password: any): Promise<boolean>;
}
export declare class JsonRpcProvider extends Provider {
    readonly connection: ConnectionInfo;
    private _pendingFilter;
    constructor(url?: ConnectionInfo | string, network?: Networkish);
    getSigner(address: string): JsonRpcSigner;
    listAccounts(): Promise<Array<string>>;
    send(method: string, params: any): Promise<any>;
    perform(method: string, params: any): Promise<any>;
    _startPending(): void;
    _stopPending(): void;
}
