import { AbstractProvider } from "./abstract-provider.js";
import { Network } from "./network.js";
import { FeeData } from "./provider.js";
import type { Addressable } from "@ethersproject/address";
import type { TypedDataDomain, TypedDataField } from "@ethersproject/hash";
import type { Frozen } from "@ethersproject/properties";
import type { ConnectionInfo } from "@ethersproject/web";
import type { PerformActionRequest, Subscriber, Subscription } from "./abstract-provider.js";
import type { Networkish } from "./network.js";
import type { BlockTag, Provider, TransactionRequest, TransactionResponse } from "./provider.js";
import type { Signer } from "./signer.js";
export declare type JsonRpcPayload = {
    id: number;
    method: string;
    params: any;
    jsonrpc: "2.0";
};
export declare type JsonRpcResult = {
    id: number;
    result: any;
} | {
    id: number;
    error: {
        code: number;
        message?: string;
        data?: any;
    };
};
export declare type JsonRpcIncomingMessage = JsonRpcResult | {
    method: string;
    params: any;
};
export declare type JsonRpcOptions = {
    polling?: boolean;
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
export declare class JsonRpcSigner implements Signer {
    provider: JsonRpcApiProvider;
    address: string;
    constructor(provider: JsonRpcApiProvider, address: string);
    connect(provider: null | Provider): Signer;
    getAddress(): Promise<string>;
    getNetwork(): Promise<Frozen<Network>>;
    getFeeData(): Promise<FeeData>;
    estimateGas(tx: TransactionRequest): Promise<bigint>;
    call(tx: TransactionRequest): Promise<string>;
    resolveName(name: string | Addressable): Promise<null | string>;
    getBalance(blockTag?: BlockTag): Promise<bigint>;
    getTransactionCount(blockTag?: BlockTag): Promise<number>;
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
    constructor(network?: Networkish);
    _getOptions<K extends keyof JsonRpcOptions>(key: K): JsonRpcOptions[K];
    _setOptions(options: JsonRpcOptions): void;
    prepareRequest(method: string, params: Array<any>): JsonRpcPayload;
    send<T = any>(method: string, params: Array<any>): Promise<T>;
    getSigner(address?: number | string): Promise<JsonRpcSigner>;
    _detectNetwork(): Promise<Network>;
    _getSubscriber(sub: Subscription): Subscriber;
    getRpcTransaction(tx: TransactionRequest): JsonRpcTransactionRequest;
    getRpcRequest(req: PerformActionRequest): null | {
        method: string;
        args: Array<any>;
    };
    getRpcError(method: string, args: Array<any>, error: Error): Error;
    _perform(req: PerformActionRequest): Promise<any>;
}
export declare class JsonRpcProvider extends JsonRpcApiProvider {
    #private;
    constructor(url?: string | ConnectionInfo, network?: Networkish);
    send<T = any>(method: string, params: Array<any>): Promise<T>;
    get pollingInterval(): number;
    set pollingInterval(value: number);
}
export declare class StaticJsonRpcProvider extends JsonRpcProvider {
    readonly network: Network;
    constructor(url: string | ConnectionInfo, network?: Network);
    _detectNetwork(): Promise<Network>;
}
//# sourceMappingURL=provider-jsonrpc.d.ts.map