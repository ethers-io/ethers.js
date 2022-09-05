import { FetchRequest } from "../utils/fetch.js";
import { AbstractProvider } from "./abstract-provider.js";
import { AbstractSigner } from "./abstract-signer.js";
import { Network } from "./network.js";
import type { TypedDataDomain, TypedDataField } from "../hash/index.js";
import type { TransactionLike } from "../transaction/index.js";
import type { PerformActionRequest, Subscriber, Subscription } from "./abstract-provider.js";
import type { Networkish } from "./network.js";
import type { Provider, TransactionRequest, TransactionResponse } from "./provider.js";
import type { Signer } from "./signer.js";
export declare type JsonRpcPayload = {
    id: number;
    method: string;
    params: Array<any> | Record<string, any>;
    jsonrpc: "2.0";
};
export declare type JsonRpcResult = {
    id: number;
    result: any;
};
export declare type JsonRpcError = {
    id: number;
    error: {
        code: number;
        message?: string;
        data?: any;
    };
};
export declare type JsonRpcOptions = {
    polling?: boolean;
    staticNetwork?: null | Network;
    batchStallTime?: number;
    batchMaxSize?: number;
    batchMaxCount?: number;
};
export interface JsonRpcTransactionRequest {
    from?: string;
    to?: string;
    data?: string;
    chainId?: string;
    type?: string;
    gas?: string;
    gasPrice?: string;
    maxFeePerGas?: string;
    maxPriorityFeePerGas?: string;
    nonce?: string;
    value?: string;
    accessList?: Array<{
        address: string;
        storageKeys: Array<string>;
    }>;
}
export declare class JsonRpcSigner extends AbstractSigner<JsonRpcApiProvider> {
    address: string;
    constructor(provider: JsonRpcApiProvider, address: string);
    connect(provider: null | Provider): Signer;
    getAddress(): Promise<string>;
    populateTransaction(tx: TransactionRequest): Promise<TransactionLike<string>>;
    sendUncheckedTransaction(_tx: TransactionRequest): Promise<string>;
    sendTransaction(tx: TransactionRequest): Promise<TransactionResponse>;
    signTransaction(_tx: TransactionRequest): Promise<string>;
    signMessage(_message: string | Uint8Array): Promise<string>;
    signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, _value: Record<string, any>): Promise<string>;
    unlock(password: string): Promise<boolean>;
    _legacySignMessage(_message: string | Uint8Array): Promise<string>;
}
export declare class JsonRpcApiProvider extends AbstractProvider {
    #private;
    constructor(network?: Networkish, options?: JsonRpcOptions);
    _getOption<K extends keyof JsonRpcOptions>(key: K): JsonRpcOptions[K];
    send(method: string, params: Array<any> | Record<string, any>): Promise<any>;
    _send(payload: JsonRpcPayload | Array<JsonRpcPayload>): Promise<Array<JsonRpcResult | JsonRpcError>>;
    getSigner(address?: number | string): Promise<JsonRpcSigner>;
    _detectNetwork(): Promise<Network>;
    _getSubscriber(sub: Subscription): Subscriber;
    getRpcTransaction(tx: TransactionRequest): JsonRpcTransactionRequest;
    getRpcRequest(req: PerformActionRequest): null | {
        method: string;
        args: Array<any>;
    };
    getRpcError(payload: JsonRpcPayload, error: JsonRpcError): Error;
    _perform(req: PerformActionRequest): Promise<any>;
}
export declare class JsonRpcProvider extends JsonRpcApiProvider {
    #private;
    constructor(url?: string | FetchRequest, network?: Networkish, options?: JsonRpcOptions);
    _send(payload: JsonRpcPayload | Array<JsonRpcPayload>): Promise<Array<JsonRpcResult>>;
    get pollingInterval(): number;
    set pollingInterval(value: number);
}
//# sourceMappingURL=provider-jsonrpc.d.ts.map