// @TODO:
// - Add the batching API

// https://playground.open-rpc.org/?schemaUrl=https://raw.githubusercontent.com/ethereum/eth1.0-apis/assembled-spec/openrpc.json&uiSchema%5BappBar%5D%5Bui:splitView%5D=true&uiSchema%5BappBar%5D%5Bui:input%5D=false&uiSchema%5BappBar%5D%5Bui:examplesDropdown%5D=false

import { resolveAddress } from "../address/index.js";
import { TypedDataEncoder } from "../hash/index.js";
import { accessListify } from "../transaction/index.js";
import {
    defineProperties, getBigInt, hexlify, isHexString, toQuantity, toUtf8Bytes,
    makeError, throwArgumentError, throwError,
    FetchRequest
} from "../utils/index.js";

import { AbstractProvider, UnmanagedSubscriber } from "./abstract-provider.js";
import { AbstractSigner } from "./abstract-signer.js";
import { Network } from "./network.js";
import { FilterIdEventSubscriber, FilterIdPendingSubscriber } from "./subscriber-filterid.js";

import type { TypedDataDomain, TypedDataField } from "../hash/index.js";
import type { TransactionLike } from "../transaction/index.js";

import type { PerformActionRequest, Subscriber, Subscription } from "./abstract-provider.js";
import type { Networkish } from "./network.js";
import type { Provider, TransactionRequest, TransactionResponse } from "./provider.js";
import type { Signer } from "./signer.js";


const Primitive = "bigint,boolean,function,number,string,symbol".split(/,/g);
//const Methods = "getAddress,then".split(/,/g);
function deepCopy<T = any>(value: T): T {
    if (value == null || Primitive.indexOf(typeof(value)) >= 0) {
        return value;
    }

    // Keep any Addressable
    if (typeof((<any>value).getAddress) === "function") {
        return value;
    }

    if (Array.isArray(value)) { return <any>(value.map(deepCopy)); }

    if (typeof(value) === "object") {
        return Object.keys(value).reduce((accum, key) => {
            accum[key] = (<any>value)[key];
            return accum;
        }, <any>{ });
    }

    throw new Error(`should not happen: ${ value } (${ typeof(value) })`);
}

function getLowerCase(value: string): string {
    if (value) { return value.toLowerCase(); }
    return value;
}

interface Pollable {
    pollingInterval: number;
}

function isPollable(value: any): value is Pollable {
    return (value && typeof(value.pollingInterval) === "number");
}

/**
 *  A JSON-RPC payload, which are sent to a JSON-RPC server.
 */
export type JsonRpcPayload = {
    id: number;
    method: string;
    params: Array<any> | Record<string, any>;
    jsonrpc: "2.0";
};

/**
 *  A JSON-RPC result, which are returned on success from a JSON-RPC server.
 */
export type JsonRpcResult = {
    id: number;
    result: any;
};

/**
 *  A JSON-RPC error, which are returned on failure from a JSON-RPC server.
 */
export type JsonRpcError = {
    id: number;
    error: {
        code: number;
        message?: string;
        data?: any;
    }
};

export type DebugEventJsonRpcApiProvider = {
    action: "sendRpcPayload",
    payload: JsonRpcPayload | Array<JsonRpcPayload>
} | {
    action: "receiveRpcResult",
    result: Array<JsonRpcResult | JsonRpcError>
} | {
    action: "receiveRpcError",
    error: Error
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
export type JsonRpcApiProviderOptions = {
    polling?: boolean;
    staticNetwork?: null | Network;
    batchStallTime?: number;
    batchMaxSize?: number;
    batchMaxCount?: number;
};

const defaultOptions = {
    polling: false,
    staticNetwork: null,

    batchStallTime: 10,      // 10ms
    batchMaxSize: (1 << 20), // 1Mb
    batchMaxCount: 100       // 100 requests
}

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

     accessList?: Array<{ address: string, storageKeys: Array<string> }>;
}

// @TODO: Unchecked Signers

export class JsonRpcSigner extends AbstractSigner<JsonRpcApiProvider> {
    address!: string;

    constructor(provider: JsonRpcApiProvider, address: string) {
        super(provider);
        defineProperties<JsonRpcSigner>(this, { address });
    }

    connect(provider: null | Provider): Signer {
        return throwError("cannot reconnect JsonRpcSigner", "UNSUPPORTED_OPERATION", {
            operation: "signer.connect"
        });
    }

    async getAddress(): Promise<string> {
        return this.address;
    }

    // JSON-RPC will automatially fill in nonce, etc. so we just check from
    async populateTransaction(tx: TransactionRequest): Promise<TransactionLike<string>> {
        return await this.populateCall(tx);
    }

    // Returns just the hash of the transaction after sent, which is what
    // the bare JSON-RPC API does;
    async sendUncheckedTransaction(_tx: TransactionRequest): Promise<string> {
        const tx = deepCopy(_tx);

        const promises: Array<Promise<void>> = [];

        // Make sure the from matches the sender
        if (tx.from) {
            const _from = tx.from;
            promises.push((async () => {
                const from = await resolveAddress(_from, this.provider);
                if (from == null || from.toLowerCase() !== this.address.toLowerCase()) {
                    throwArgumentError("from address mismatch", "transaction", _tx);
                }
                tx.from = from;
            })());
        } else {
            tx.from = this.address;
        }

        // The JSON-RPC for eth_sendTransaction uses 90000 gas; if the user
        // wishes to use this, it is easy to specify explicitly, otherwise
        // we look it up for them.
        if (tx.gasLimit == null) {
            promises.push((async () => {
                tx.gasLimit = await this.provider.estimateGas({ ...tx, from: this.address});
            })());
        }

        // The address may be an ENS name or Addressable
        if (tx.to != null) {
            const _to = tx.to;
            promises.push((async () => {
                tx.to = await resolveAddress(_to, this.provider);
            })());
        }

        // Wait until all of our properties are filled in
        if (promises.length) { await Promise.all(promises); }

        const hexTx = this.provider.getRpcTransaction(tx);

        return this.provider.send("eth_sendTransaction", [ hexTx ]);
    }

    async sendTransaction(tx: TransactionRequest): Promise<TransactionResponse> {
        // This cannot be mined any earlier than any recent block
        const blockNumber = await this.provider.getBlockNumber();

        // Send the transaction
        const hash = await this.sendUncheckedTransaction(tx);

        // Unfortunately, JSON-RPC only provides and opaque transaction hash
        // for a response, and we need the actual transaction, so we poll
        // for it; it should show up very quickly
        return await (new Promise((resolve, reject) => {
            const timeouts = [ 1000, 100 ];
            const checkTx = async () => {
                // Try getting the transaction
                const tx = await this.provider.getTransaction(hash);
                if (tx != null) {
                    resolve(this.provider._wrapTransaction(tx, hash, blockNumber));
                    return;
                }

                // Wait another 4 seconds
                this.provider._setTimeout(() => { checkTx(); }, timeouts.pop() || 4000);
            };
            checkTx();
        }));
    }

    async signTransaction(_tx: TransactionRequest): Promise<string> {
        const tx = deepCopy(_tx);

        // Make sure the from matches the sender
        if (tx.from) {
            const from = await resolveAddress(tx.from, this.provider);
            if (from == null || from.toLowerCase() !== this.address.toLowerCase()) {
                return throwArgumentError("from address mismatch", "transaction", _tx);
            }
            tx.from = from;
        } else {
            tx.from = this.address;
        }

        const hexTx = this.provider.getRpcTransaction(tx);
        return await this.provider.send("eth_sign_Transaction", [ hexTx ]);
    }


    async signMessage(_message: string | Uint8Array): Promise<string> {
        const message = ((typeof(_message) === "string") ? toUtf8Bytes(_message): _message);
        return await this.provider.send("personal_sign", [
            hexlify(message), this.address.toLowerCase() ]);
    }

    async signTypedData(domain: TypedDataDomain, types: Record<string, Array<TypedDataField>>, _value: Record<string, any>): Promise<string> {
        const value = deepCopy(_value);

        // Populate any ENS names (in-place)
        const populated = await TypedDataEncoder.resolveNames(domain, types, value, async (value: string) => {
            const address = await resolveAddress(value);
            if (address == null) {
                return throwArgumentError("TypedData does not support null address", "value", value);
            }
            return address;
        });

        return await this.provider.send("eth_signTypedData_v4", [
            this.address.toLowerCase(),
            JSON.stringify(TypedDataEncoder.getPayload(populated.domain, types, populated.value))
        ]);
    }

    async unlock(password: string): Promise<boolean> {
        return this.provider.send("personal_unlockAccount", [
            this.address.toLowerCase(), password, null ]);
    }

    // https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_sign
    async _legacySignMessage(_message: string | Uint8Array): Promise<string> {
        const message = ((typeof(_message) === "string") ? toUtf8Bytes(_message): _message);
        return await this.provider.send("eth_sign", [
            this.address.toLowerCase(), hexlify(message) ]);
    }
}

type ResolveFunc = (result: JsonRpcResult) => void;
type RejectFunc = (error: Error) => void;

type Payload = { payload: JsonRpcPayload, resolve: ResolveFunc, reject: RejectFunc };

/**
 *  The JsonRpcApiProvider is an abstract class and **MUST** be
 *  sub-classed.
 *
 *  It provides the base for all JSON-RPC-based Provider interaction.
 */
export class JsonRpcApiProvider extends AbstractProvider {

    #options: Required<JsonRpcApiProviderOptions>;

    #nextId: number;
    #payloads: Array<Payload>;
    #drainTimer: null | NodeJS.Timer;

    constructor(network?: Networkish, options?: JsonRpcApiProviderOptions) {
        super(network);

        this.#nextId = 1;
        this.#options = Object.assign({ }, defaultOptions, options || { });

        this.#payloads = [ ];
        this.#drainTimer = null;

        // This could be relaxed in the future to just check equivalent networks
        const staticNetwork = this._getOption("staticNetwork");
        if (staticNetwork && staticNetwork !== network) {
            throwArgumentError("staticNetwork MUST match network object", "options", options);
        }
    }

    /**
     *  Returns the value associated with the option %%key%%.
     *
     *  Sub-classes can use this to inquire about configuration options.
     */
    _getOption<K extends keyof JsonRpcApiProviderOptions>(key: K): JsonRpcApiProviderOptions[K] {
        return this.#options[key];
    }

    #scheduleDrain(): void {
        if (this.#drainTimer) { return; }

        // If we aren't using batching, no hard in sending it immeidately
        const stallTime = (this._getOption("batchMaxCount") === 1) ? 0: this._getOption("batchStallTime");

        this.#drainTimer = setTimeout(() => {
            this.#drainTimer = null;

            const payloads = this.#payloads;
            this.#payloads = [ ];

            while (payloads.length) {

                // Create payload batches that satisfy our batch constraints
                const batch = [ <Payload>(payloads.shift()) ];
                while (payloads.length) {
                    if (batch.length === this.#options.batchMaxCount) { break; }
                    batch.push(<Payload>(payloads.shift()));
                    const bytes = JSON.stringify(batch.map((p) => p.payload));
                    if (bytes.length > this.#options.batchMaxSize) {
                        payloads.unshift(<Payload>(batch.pop()));
                        break;
                    }
                }

                // Process the result to each payload
                (async () => {
                    const payload = ((batch.length === 1) ? batch[0].payload: batch.map((p) => p.payload));

                    this.emit("debug", { action: "sendRpcPayload", payload });

                    try {
                        const result = await this._send(payload);
                        this.emit("debug", { action: "receiveRpcResult", result });

                        // Process results in batch order
                        for (const { resolve, reject, payload } of batch) {

                            // Find the matching result
                            const resp = result.filter((r) => (r.id === payload.id))[0];

                            // No result; the node failed us in unexpected ways
                            if (resp == null) {
                                return reject(new Error("@TODO: no result"));
                            }

                            // The response is an error
                            if ("error" in resp) {
                                return reject(this.getRpcError(payload, resp));

                            }

                            // All good; send the result
                            resolve(resp.result);
                        }

                    } catch (error: any) {
                        this.emit("debug", { action: "receiveRpcError", error });

                        for (const { reject } of batch) {
                            // @TODO: augment the error with the payload
                            reject(error);
                        }
                    }
                })();
            }
        }, stallTime);
    }

    // Sub-classes should **NOT** override this
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
    send(method: string, params: Array<any> | Record<string, any>): Promise<any> {
        // @TODO: cache chainId?? purge on switch_networks

        const id = this.#nextId++;
        const promise = new Promise((resolve, reject) => {
            this.#payloads.push({
                resolve, reject,
                payload: { method, params, id, jsonrpc: "2.0" }
            });
        });

        // If there is not a pending drainTimer, set one
        this.#scheduleDrain();

        return <Promise<JsonRpcResult>>promise;
    }

    /**
     *  Sends a JSON-RPC %%payload%% (or a batch) to the underlying channel.
     *
     *  Sub-classes **MUST** override this.
     */
    _send(payload: JsonRpcPayload | Array<JsonRpcPayload>): Promise<Array<JsonRpcResult | JsonRpcError>> {
        return throwError("sub-classes must override _send", "UNSUPPORTED_OPERATION", {
            operation: "jsonRpcApiProvider._send"
        });
    }

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
    async getSigner(address: number | string = 0): Promise<JsonRpcSigner> {

        const accountsPromise = this.send("eth_accounts", [ ]);

        // Account index
        if (typeof(address) === "number") {
            const accounts = <Array<string>>(await accountsPromise);
            if (address > accounts.length) { throw new Error("no such account"); }
            return new JsonRpcSigner(this, accounts[address]);
        }

        const [ network, accounts ] = await Promise.all([ this.getNetwork(), accountsPromise ]);

        // Account address
        address = network.formatter.address(address);
        for (const account of accounts) {
            if (network.formatter.address(account) === account) {
                return new JsonRpcSigner(this, account);
            }
        }

        throw new Error("invalid account");
    }

    // Sub-classes can override this; it detects the *actual* network we
    // are connected to
    async _detectNetwork(): Promise<Network> {
        // We have a static network (like INFURA)
        const network = this._getOption("staticNetwork");
        if (network) { return network; }

        return Network.from(getBigInt(await this._perform({ method: "chainId" })));
    }

    /**
     *  Return a Subscriber that will manage the %%sub%%.
     *
     *  Sub-classes can override this to modify the behavior of
     *  subscription management.
     */
    _getSubscriber(sub: Subscription): Subscriber {
        // Pending Filters aren't availble via polling
        if (sub.type === "pending") { return new FilterIdPendingSubscriber(this); }

        if (sub.type === "event") {
            return new FilterIdEventSubscriber(this, sub.filter);
        }

        // Orphaned Logs are handled automatically, by the filter, since
        // logs with removed are emitted by it
        if (sub.type === "orphan" && sub.filter.orphan === "drop-log") {
            return new UnmanagedSubscriber("orphan");
        }

        return super._getSubscriber(sub);
    }

    /**
     *  Returns %%tx%% as a normalized JSON-RPC transaction request,
     *  which has all values hexlified and any numeric values converted
     *  to Quantity values.
     */
    getRpcTransaction(tx: TransactionRequest): JsonRpcTransactionRequest {
        const result: JsonRpcTransactionRequest = {};

        // JSON-RPC now requires numeric values to be "quantity" values
        ["chainId", "gasLimit", "gasPrice", "type", "maxFeePerGas", "maxPriorityFeePerGas", "nonce", "value"].forEach((key) => {
            if ((<any>tx)[key] == null) { return; }
            let dstKey = key;
            if (key === "gasLimit") { dstKey = "gas"; }
            (<any>result)[dstKey] = toQuantity(getBigInt((<any>tx)[key], `tx.${ key }`));
        });

        // Make sure addresses and data are lowercase
        ["from", "to", "data"].forEach((key) => {
            if ((<any>tx)[key] == null) { return; }
            (<any>result)[key] = hexlify((<any>tx)[key]);
        });

        // Normalize the access list object
        if (tx.accessList) {
            result["accessList"] = accessListify(tx.accessList);
        }

        return result;
    }

    /**
     *  Returns the request method and arguments required to perform
     *  %%req%%.
     */
    getRpcRequest(req: PerformActionRequest): null | { method: string, args: Array<any> } {
        switch (req.method) {
            case "chainId":
                return { method: "eth_chainId", args: [ ] };

            case "getBlockNumber":
                return { method: "eth_blockNumber", args: [ ] };

            case "getGasPrice":
                return { method: "eth_gasPrice", args: [] };

            case "getBalance":
                return {
                    method: "eth_getBalance",
                    args: [ getLowerCase(req.address), req.blockTag ]
                };

            case "getTransactionCount":
                return {
                    method: "eth_getTransactionCount",
                    args: [ getLowerCase(req.address), req.blockTag ]
                };

            case "getCode":
                return {
                    method: "eth_getCode",
                    args: [ getLowerCase(req.address), req.blockTag ]
                };

            case "getStorageAt":
                return {
                    method: "eth_getStorageAt",
                    args: [
                        getLowerCase(req.address),
                        ("0x" + req.position.toString(16)),
                        req.blockTag
                    ]
                };

            case "broadcastTransaction":
                return {
                    method: "eth_sendRawTransaction",
                    args: [ req.signedTransaction ]
                };

            case "getBlock":
                if ("blockTag" in req) {
                    return {
                        method: "eth_getBlockByNumber",
                        args: [ req.blockTag, !!req.includeTransactions ]
                    };
                } else if ("blockHash" in req) {
                    return {
                        method: "eth_getBlockByHash",
                        args: [ req.blockHash, !!req.includeTransactions ]
                    };
                }
                break;

            case "getTransaction":
                return {
                    method: "eth_getTransactionByHash",
                    args: [ req.hash ]
                };

            case "getTransactionReceipt":
                return {
                    method: "eth_getTransactionReceipt",
                    args: [ req.hash ]
                };

            case "call":
                return {
                    method: "eth_call",
                    args: [ this.getRpcTransaction(req.transaction), req.blockTag ]
                };

            case "estimateGas": {
                return {
                    method: "eth_estimateGas",
                    args: [ this.getRpcTransaction(req.transaction) ]
                };
            }

            case "getLogs":
                if (req.filter && req.filter.address != null) {
                    if (Array.isArray(req.filter.address)) {
                        req.filter.address = req.filter.address.map(getLowerCase);
                    } else {
                        req.filter.address = getLowerCase(req.filter.address);
                    }
                }
                return { method: "eth_getLogs", args: [ req.filter ] };
        }

        return null;
    }

    /**
     *  Returns an ethers-style Error for the given JSON-RPC error
     *  %%payload%%, coalescing the various strings and error shapes
     *  that different nodes return, coercing them into a machine-readable
     *  standardized error.
     */
    getRpcError(payload: JsonRpcPayload, error: JsonRpcError): Error {
        const { method } = payload;

        if (method === "eth_call") {
            const transaction = <TransactionLike<string>>((<any>payload).params[0]);

            const result = spelunkData(error);
            if (result) {
                // @TODO: Extract errorSignature, errorName, errorArgs, reason if
                //        it is Error(string) or Panic(uint25)
                return makeError("execution reverted during JSON-RPC call", "CALL_EXCEPTION", {
                    data: result.data,
                    transaction
                });
            }

            return makeError("missing revert data during JSON-RPC call", "CALL_EXCEPTION", {
                data: "0x", transaction, info: { error }
            });
        }

        const message = JSON.stringify(spelunkMessage(error));

        if (method === "eth_estimateGas") {
            const transaction = <TransactionLike<string>>((<any>payload).params[0]);

            if (message.match(/gas required exceeds allowance|always failing transaction|execution reverted/)) {
                return makeError("cannot estimate gas; transaction may fail or may require manual gas limit", "UNPREDICTABLE_GAS_LIMIT", {
                    transaction
                });
            }
        }

        if (method === "eth_sendRawTransaction" || method === "eth_sendTransaction") {
            const transaction = <TransactionLike<string>>((<any>payload).params[0]);

            if (message.match(/insufficient funds|base fee exceeds gas limit/)) {
                return makeError("insufficient funds for intrinsic transaction cost", "INSUFFICIENT_FUNDS", {
                    transaction
                });
            }

            if (message.match(/nonce/) && message.match(/too low/)) {
                return makeError("nonce has already been used", "NONCE_EXPIRED", { transaction });
            }

            // "replacement transaction underpriced"
            if (message.match(/replacement transaction/) && message.match(/underpriced/)) {
                return makeError("replacement fee too low", "REPLACEMENT_UNDERPRICED", { transaction });
            }

            if (message.match(/only replay-protected/)) {
                return makeError("legacy pre-eip-155 transactions not supported", "UNSUPPORTED_OPERATION", {
                    operation: method, info: { transaction }
                });
            }
        }

        return makeError("could not coalesce error", "UNKNOWN_ERROR", { error });
    }

    /**
     *  Resolves to the non-normalized value by performing %%req%%.
     *
     *  Sub-classes may override this to modify behavior of actions,
     *  and should generally call ``super._perform`` as a fallback.
     */
    async _perform(req: PerformActionRequest): Promise<any> {
        // Legacy networks do not like the type field being passed along (which
        // is fair), so we delete type if it is 0 and a non-EIP-1559 network
        if (req.method === "call" || req.method === "estimateGas") {
            let tx = req.transaction;
            if (tx && tx.type != null && getBigInt(tx.type)) {
                // If there are no EIP-1559 properties, it might be non-EIP-a559
                if (tx.maxFeePerGas == null && tx.maxPriorityFeePerGas == null) {
                    const feeData = await this.getFeeData();
                    if (feeData.maxFeePerGas == null && feeData.maxPriorityFeePerGas == null) {
                        // Network doesn't know about EIP-1559 (and hence type)
                        req = Object.assign({ }, req, {
                            transaction: Object.assign({ }, tx, { type: undefined })
                        });
                    }
                }
            }
        }

        const request = this.getRpcRequest(req);

        if (request != null) {
            return await this.send(request.method, request.args);
        }

        return super._perform(req);
    }
}

/**
 *  The JsonRpcProvider is one of the most common Providers,
 *  which performs all operations over HTTP (or HTTPS) requests.
 *
 *  Events are processed by polling the backend for the current block
 *  number; when it advances, all block-base events are then checked
 *  for updates.
 */
export class JsonRpcProvider extends JsonRpcApiProvider {
    #connect: FetchRequest;

    #pollingInterval: number;

    constructor(url?: string | FetchRequest, network?: Networkish, options?: JsonRpcApiProviderOptions) {
        if (url == null) { url = "http:/\/localhost:8545"; }
        super(network, options);

        if (typeof(url) === "string") {
            this.#connect = new FetchRequest(url);
        } else {
            this.#connect = url.clone();
        }

        this.#pollingInterval = 4000;
    }

    async _send(payload: JsonRpcPayload | Array<JsonRpcPayload>): Promise<Array<JsonRpcResult>> {
        // Configure a POST connection for the requested method
        const request = this.#connect.clone();
        request.body = JSON.stringify(payload);

        const response = await request.send();
        response.assertOk();

        let resp = response.bodyJson;
        if (!Array.isArray(resp)) { resp = [ resp ]; }

        return resp;
    }

    /**
     *  The polling interval (default: 4000 ms)
     */
    get pollingInterval(): number { return this.#pollingInterval; }
    set pollingInterval(value: number) {
        if (!Number.isInteger(value) || value < 0) { throw new Error("invalid interval"); }
        this.#pollingInterval = value;
        this._forEachSubscriber((sub) => {
            if (isPollable(sub)) {
                sub.pollingInterval = this.#pollingInterval;
            }
        });
    }
}

function spelunkData(value: any): null | { message: string, data: string } {
    if (value == null) { return null; }

    // These *are* the droids we're looking for.
    if (typeof(value.message) === "string" && value.message.match("reverted") && isHexString(value.data)) {
        return { message: value.message, data: value.data };
    }

    // Spelunk further...
    if (typeof(value) === "object") {
        for (const key in value) {
            const result = spelunkData(value[key]);
            if (result) { return result; }
        }
        return null;
    }

    // Might be a JSON string we can further descend...
    if (typeof(value) === "string") {
        try {
            return spelunkData(JSON.parse(value));
        } catch (error) { }
    }

    return null;
}

function _spelunkMessage(value: any, result: Array<string>): void {
    if (value == null) { return; }

    // These *are* the droids we're looking for.
    if (typeof(value.message) === "string") {
        result.push(value.message);
    }

    // Spelunk further...
    if (typeof(value) === "object") {
        for (const key in value) {
            _spelunkMessage(value[key], result);
        }
    }

    // Might be a JSON string we can further descend...
    if (typeof(value) === "string") {
        try {
            return _spelunkMessage(JSON.parse(value), result);
        } catch (error) { }
    }
}

function spelunkMessage(value: any): Array<string> {
    const result: Array<string> = [ ];
    _spelunkMessage(value, result);
    return result;
}
