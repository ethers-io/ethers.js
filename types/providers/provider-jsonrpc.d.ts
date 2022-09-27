import { FetchRequest } from "../utils/index.js";
import { AbstractProvider } from "./abstract-provider.js";
import { AbstractSigner } from "./abstract-signer.js";
import { Network } from "./network.js";
import type { TypedDataDomain, TypedDataField } from "../hash/index.js";
import type { TransactionLike } from "../transaction/index.js";
import type { PerformActionRequest, Subscriber, Subscription } from "./abstract-provider.js";
import type { Networkish } from "./network.js";
import type { Provider, TransactionRequest, TransactionResponse } from "./provider.js";
import type { Signer } from "./signer.js";
/**
 *  A JSON-RPC payload, which are sent to a JSON-RPC server.
 */
export declare type JsonRpcPayload = {
    id: number;
    method: string;
    params: Array<any> | Record<string, any>;
    jsonrpc: "2.0";
};
/**
 *  A JSON-RPC result, which are returned on success from a JSON-RPC server.
 */
export declare type JsonRpcResult = {
    id: number;
    result: any;
};
/**
 *  A JSON-RPC error, which are returned on failure from a JSON-RPC server.
 */
export declare type JsonRpcError = {
    id: number;
    error: {
        code: number;
        message?: string;
        data?: any;
    };
};
export declare type DebugEventJsonRpcApiProvider = {
    action: "sendRpcPayload";
    payload: JsonRpcPayload | Array<JsonRpcPayload>;
} | {
    action: "receiveRpcResult";
    result: Array<JsonRpcResult | JsonRpcError>;
} | {
    action: "receiveRpcError";
    error: Error;
};
/**
 *  Options for configuring a [[JsonRpcApiProvider]]. Much of this
 *  is targetted towards sub-classes, which often will not expose
 *  any of these options to their consumers.
 *
 *  _property: options.polling? => boolean
 *  If true, the polling strategy is used immediately for events.
 *  Otherwise, an attempt to use filters is made and on failure
 *  polling is used for that and all future events. (default: ``false``)
 *
 *  _property: options.staticNetwork => [[Network]]
 *  If this is set, then there are no requests made for the chainId.
 *  (default: ``null``)
 *
 *  _warning:
 *  This should **ONLY** be used if it is **certain** that the network
 *  cannot change, such as when using INFURA (since the URL dictates the
 *  network). If the network is assumed static and it does change, this
 *  can have tragic consequences. For example, this **CANNOT** be used
 *  with MetaMask, since the used can select a new network from the
 *  drop-down at any time.
 *
 *  _property: option.batchStallTime? => number
 *  The amount of time (in ms) to wait, allowing requests to be batched,
 *  before making the request. If ``0``, then batching will only occur
 *  within the same event loop. If the batchSize is ``1``, then this is
 *  ignored. (default: ``10``)
 *
 *  _property: options.batchMaxSize? => number
 *  The target maximum size (in bytes) to allow a payload within a single
 *  batch. At least one request will be made per request, which may
 *  violate this constraint if it is set too small or a large request is
 *  present. (default: 1Mb)
 *
 *  _property: options.bstchMaxCount? => number
 *  The maximum number of payloads to allow in a single batch. Set this to
 *  ``1`` to disable batching entirely. (default: ``100``)
 */
export declare type JsonRpcApiProviderOptions = {
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
/**
 *  The JsonRpcApiProvider is an abstract class and **MUST** be
 *  sub-classed.
 *
 *  It provides the base for all JSON-RPC-based Provider interaction.
 *
 *  Sub-classing Notes:
 *  - a sub-class MUST override _send
 *  - a sub-class MUST call the `_start()` method once connected
 */
export declare class JsonRpcApiProvider extends AbstractProvider {
    #private;
    constructor(network?: Networkish, options?: JsonRpcApiProviderOptions);
    /**
     *  Returns the value associated with the option %%key%%.
     *
     *  Sub-classes can use this to inquire about configuration options.
     */
    _getOption<K extends keyof JsonRpcApiProviderOptions>(key: K): JsonRpcApiProviderOptions[K];
    get _network(): Network;
    get ready(): boolean;
    _start(): Promise<void>;
    /**
     *  Requests the %%method%% with %%params%% via the JSON-RPC protocol
     *  over the underlying channel. This can be used to call methods
     *  on the backend that do not have a high-level API within the Provider
     *  API.
     *
     *  This method queues requests according to the batch constraints
     *  in the options, assigns the request a unique ID.
     *
     *  **Do NOT override** this method in sub-classes; instead
     *  override [[_send]] or force the options values in the
     *  call to the constructor to modify this method's behavior.
     */
    send(method: string, params: Array<any> | Record<string, any>): Promise<any>;
    /**
     *  Sends a JSON-RPC %%payload%% (or a batch) to the underlying channel.
     *
     *  Sub-classes **MUST** override this.
     */
    _send(payload: JsonRpcPayload | Array<JsonRpcPayload>): Promise<Array<JsonRpcResult | JsonRpcError>>;
    /**
     *  Resolves to the [[Signer]] account for  %%address%% managed by
     *  the client.
     *
     *  If the %%address%% is a number, it is used as an index in the
     *  the accounts from [[listAccounts]].
     *
     *  This can only be used on clients which manage accounts (such as
     *  Geth with imported account or MetaMask).
     *
     *  Throws if the account doesn't exist.
     */
    getSigner(address?: number | string): Promise<JsonRpcSigner>;
    /** Sub-classes can override this; it detects the *actual* network that
     *  we are **currently** connected to.
     *
     *  Keep in mind that [[send]] may only be used once [[ready]].
     */
    _detectNetwork(): Promise<Network>;
    /**
     *  Return a Subscriber that will manage the %%sub%%.
     *
     *  Sub-classes can override this to modify the behavior of
     *  subscription management.
     */
    _getSubscriber(sub: Subscription): Subscriber;
    /**
     *  Returns %%tx%% as a normalized JSON-RPC transaction request,
     *  which has all values hexlified and any numeric values converted
     *  to Quantity values.
     */
    getRpcTransaction(tx: TransactionRequest): JsonRpcTransactionRequest;
    /**
     *  Returns the request method and arguments required to perform
     *  %%req%%.
     */
    getRpcRequest(req: PerformActionRequest): null | {
        method: string;
        args: Array<any>;
    };
    /**
     *  Returns an ethers-style Error for the given JSON-RPC error
     *  %%payload%%, coalescing the various strings and error shapes
     *  that different nodes return, coercing them into a machine-readable
     *  standardized error.
     */
    getRpcError(payload: JsonRpcPayload, error: JsonRpcError): Error;
    /**
     *  Resolves to the non-normalized value by performing %%req%%.
     *
     *  Sub-classes may override this to modify behavior of actions,
     *  and should generally call ``super._perform`` as a fallback.
     */
    _perform(req: PerformActionRequest): Promise<any>;
}
/**
 *  The JsonRpcProvider is one of the most common Providers,
 *  which performs all operations over HTTP (or HTTPS) requests.
 *
 *  Events are processed by polling the backend for the current block
 *  number; when it advances, all block-base events are then checked
 *  for updates.
 */
export declare class JsonRpcProvider extends JsonRpcApiProvider {
    #private;
    constructor(url?: string | FetchRequest, network?: Networkish, options?: JsonRpcApiProviderOptions);
    send(method: string, params: Array<any> | Record<string, any>): Promise<any>;
    _send(payload: JsonRpcPayload | Array<JsonRpcPayload>): Promise<Array<JsonRpcResult>>;
    /**
     *  The polling interval (default: 4000 ms)
     */
    get pollingInterval(): number;
    set pollingInterval(value: number);
}
//# sourceMappingURL=provider-jsonrpc.d.ts.map