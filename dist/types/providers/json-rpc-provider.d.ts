import { Provider } from './provider';
import { Arrayish, BigNumber, BlockTag, ConnectionInfo, Networkish, Signer, TransactionRequest, TransactionResponse } from '../utils/types';
export declare class JsonRpcSigner extends Signer {
    readonly provider: JsonRpcProvider;
    private _address;
    constructor(provider: JsonRpcProvider, address?: string);
    readonly address: string;
    getAddress(): Promise<string>;
    getBalance(blockTag?: BlockTag): Promise<BigNumber>;
    getTransactionCount(blockTag?: BlockTag): Promise<number>;
    sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
    signMessage(message: Arrayish | string): Promise<string>;
    unlock(password: string): Promise<boolean>;
}
export declare class JsonRpcProvider extends Provider {
    readonly connection: ConnectionInfo;
    private _pendingFilter;
    constructor(url?: ConnectionInfo | string, network?: Networkish);
    getSigner(address?: string): JsonRpcSigner;
    listAccounts(): Promise<Array<string>>;
    send(method: string, params: any): Promise<any>;
    perform(method: string, params: any): Promise<any>;
    protected _startPending(): void;
    protected _stopPending(): void;
    static hexlifyTransaction(transaction: TransactionRequest): any;
}
//# sourceMappingURL=json-rpc-provider.d.ts.map