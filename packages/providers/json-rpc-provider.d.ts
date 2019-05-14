import { Provider, TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";
import { Bytes } from "@ethersproject/bytes";
import { Networkish } from "@ethersproject/networks";
import { ConnectionInfo } from "@ethersproject/web";
import { BaseProvider } from "./base-provider";
export declare class JsonRpcSigner extends Signer {
    readonly provider: JsonRpcProvider;
    _index: number;
    _address: string;
    constructor(constructorGuard: any, provider: JsonRpcProvider, addressOrIndex?: string | number);
    connect(provider: Provider): JsonRpcSigner;
    connectUnchecked(): JsonRpcSigner;
    getAddress(): Promise<string>;
    sendUncheckedTransaction(transaction: TransactionRequest): Promise<string>;
    signTransaction(transaction: TransactionRequest): Promise<string>;
    sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
    signMessage(message: Bytes | string): Promise<string>;
    unlock(password: string): Promise<boolean>;
}
declare class UncheckedJsonRpcSigner extends JsonRpcSigner {
    sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse>;
}
export declare class JsonRpcProvider extends BaseProvider {
    readonly connection: ConnectionInfo;
    _pendingFilter: Promise<number>;
    constructor(url?: ConnectionInfo | string, network?: Networkish);
    getSigner(addressOrIndex?: string | number): JsonRpcSigner;
    getUncheckedSigner(addressOrIndex?: string | number): UncheckedJsonRpcSigner;
    listAccounts(): Promise<Array<string>>;
    send(method: string, params: any): Promise<any>;
    perform(method: string, params: any): Promise<any>;
    _startPending(): void;
    _stopPending(): void;
    static hexlifyTransaction(transaction: TransactionRequest, allowExtra?: {
        [key: string]: boolean;
    }): {
        [key: string]: string;
    };
}
export {};
