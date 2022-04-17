// @TODO
// Event coalescence
//   When we register an event with an async value (e.g. address is a Signer
//   or ENS name), we need to add it immeidately for the Event API, but also
//   need time to resolve the address. Upon resolving the address, we need to
//   migrate the listener to the static event. We also need to maintain a map
//   of Signer/ENS name to address so we can sync respond to listenerCount.

import { resolveAddress } from "@ethersproject/address";
import { concat, dataLength, dataSlice, hexlify, isHexString } from "@ethersproject/bytes";
import { isCallException } from "@ethersproject/logger";
import { toArray } from "@ethersproject/math";
import { defineProperties, EventPayload, resolveProperties } from "@ethersproject/properties";
import { toUtf8String } from "@ethersproject/strings";
import { fetchData, FetchRequest } from "@ethersproject/web";

import { EnsResolver } from "./ens-resolver.js";
import { logger } from "./logger.js";
import { Network } from "./network.js";
import { Block, FeeData, Log, TransactionReceipt, TransactionResponse } from "./provider.js";
import {
    PollingBlockSubscriber, PollingEventSubscriber, PollingOrphanSubscriber, PollingTransactionSubscriber
} from "./subscriber-polling.js";

import type { Addressable } from "@ethersproject/address";
import type { BigNumberish, BytesLike } from "@ethersproject/logger";
import type { Frozen, Listener } from "@ethersproject/properties";
import type { AccessList } from "@ethersproject/transaction";

import type { Networkish } from "./network.js";
import type { MaxPriorityFeePlugin } from "./plugins-network.js";
import type {
    BlockTag, CallRequest, EventFilter, Filter, FilterByBlockHash,
    LogParams, OrphanFilter, Provider, ProviderEvent, TransactionRequest,
} from "./provider.js";


// Constants
const BN_2 = BigInt(2);

const MAX_CCIP_REDIRECTS = 10;


function getTag(prefix: string, value: any): string {
    return prefix + ":" + JSON.stringify(value, (k, v) => {
        if (typeof(v) === "bigint") { return `bigint:${ v.toString() }`}
        if (typeof(v) === "string") { return v.toLowerCase(); }

        // Sort object keys
        if (typeof(v) === "object" && !Array.isArray(v)) {
            const keys = Object.keys(v);
            keys.sort();
            return keys.reduce((accum, key) => {
                accum[key] = v[key];
                return accum;
            }, <any>{ });
        }

        return v;
    });
}

// Only sub-classes overriding the _getSubscription method will care about this
export type Subscription = {
    type: "block" | "close" | "debug" | "network" | "pending",
    tag: string
} | {
    type: "transaction",
    tag: string,
    hash: string
} | {
    type: "event",
    tag: string,
    filter: EventFilter
} | {
    type: "orphan",
    tag: string,
    filter: OrphanFilter
};

export interface Subscriber {
    start(): void;
    stop(): void;

    pause(dropWhilePaused?: boolean): void;
    resume(): void;

    // Subscribers which use polling should implement this to allow
    // Providers the ability to update underlying polling intervals
    // If not supported, accessing this property should return undefined
    pollingInterval?: number;
}

export class UnmanagedSubscriber implements Subscriber {
    name!: string;

    constructor(name: string) { defineProperties<UnmanagedSubscriber>(this, { name }); }

    start(): void { }
    stop(): void { }

    pause(dropWhilePaused?: boolean): void { }
    resume(): void { }
}

type Sub = {
    tag: string;
    nameMap: Map<string, string>
    addressableMap: WeakMap<Addressable, string>;
    listeners: Array<{ listener: Listener, once: boolean }>;
    started: boolean;
    subscriber: Subscriber;
};

function copy<T = any>(value: T): T {
    return JSON.parse(JSON.stringify(value));
}

function concisify(items: Array<string>): Array<string> {
    items = Array.from((new Set(items)).values())
    items.sort();
    return items;
}

// Normalize a ProviderEvent into a Subscription
// @TODO: Make events sync if possible; like block
//function getSyncSubscription(_event: ProviderEvent): Subscription {
//}

async function getSubscription(_event: ProviderEvent, provider: AbstractProvider): Promise<Subscription> {
    if (_event == null) { throw new Error("invalid event"); }

    // Normalize topic array info an EventFilter
    if (Array.isArray(_event)) { _event = { topics: _event }; }

    if (typeof(_event) === "string") {
        switch (_event) {
            case "block": case "pending": case "debug": case "network": {
                return { type: _event, tag: _event };
            }
        }
    }

    if (isHexString(_event, 32)) {
        const hash = _event.toLowerCase();
        return { type: "transaction", tag: getTag("tx", { hash }), hash };
    }

    if ((<any>_event).orphan) {
        const event = <OrphanFilter>_event;
        // @TODO: Should lowercase and whatnot things here instead of copy...
        return { type: "orphan", tag: getTag("orphan", event), filter: copy(event) };
    }

    if (((<any>_event).address || (<any>_event).topics)) {
        const event = <EventFilter>_event;

        const filter: any = {
            topics: ((event.topics || []).map((t) => {
                if (t == null) { return null; }
                if (Array.isArray(t)) {
                    return concisify(t.map((t) => t.toLowerCase()));
                }
                return t.toLowerCase();
            }))
        };

        if (event.address) {
            const addresses: Array<string> = [ ];
            const promises: Array<Promise<void>> = [ ];

            const addAddress = (addr: string | Addressable) => {
                if (isHexString(addr)) {
                    addresses.push(addr);
                } else {
                    promises.push((async () => {
                        addresses.push(await resolveAddress(addr, provider));
                    })());
                }
            }


            if (Array.isArray(event.address)) {
                event.address.forEach(addAddress);
            } else {
                addAddress(event.address);
            }
            if (promises.length) { await Promise.all(promises); }
            filter.address = concisify(addresses.map((a) => a.toLowerCase()));
        }

        return { filter, tag: getTag("event", filter), type: "event" };
    }

    return logger.throwArgumentError("unknown ProviderEvent", "event", _event);
}

function getTime(): number { return (new Date()).getTime(); }

export interface ProviderPlugin {
    readonly name: string;
    validate(provider: Provider): ProviderPlugin;
}

export type PerformActionFilter = {
    address?: string | Array<string>;
    topics?: Array<null | string | Array<string>>;
    fromBlock?: BlockTag;
    toBlock?: BlockTag;
    blockHash?: string;
};

export type PerformActionTransaction = {
    type?: number;

    to?: string;
    from?: string;

    nonce?: number;

    gasLimit?: bigint;
    gasPrice?: bigint;

    maxPriorityFeePerGas?: bigint;
    maxFeePerGas?: bigint;

    data?: string;
    value?: bigint;
    chainId?: bigint;

    accessList?: AccessList;
};

export function copyRequest<T extends PerformActionTransaction>(tx: T): T {
    // @TODO: copy the copy from contracts and use it from this
    return tx;
}

export type PerformActionRequest = {
    method: "call",
    transaction: PerformActionTransaction, blockTag: BlockTag
} | {
    method: "chainId"
} | {
    method: "estimateGas",
    transaction: PerformActionTransaction
} | {
    method: "getBalance",
    address: string, blockTag: BlockTag
} | {
    method: "getBlock",
    blockTag: BlockTag, includeTransactions: boolean
} | {
    method: "getBlock",
    blockHash: string, includeTransactions: boolean
} | {
    method: "getBlockNumber"
} | {
    method: "getCode",
    address: string, blockTag: BlockTag
} | {
    method: "getGasPrice"
} | {
    method: "getLogs",
    filter: PerformActionFilter
} | {
    method: "getStorageAt",
    address: string, position: bigint, blockTag: BlockTag
} | {
    method: "getTransaction",
    hash: string
} | {
    method: "getTransactionCount",
    address: string, blockTag: BlockTag
} | {
    method: "getTransactionReceipt",
    hash: string
} | {
    method: "sendTransaction", // @TODO: rename to broadcast
    signedTransaction: string
};


type CcipArgs = {
    sender: string;
    urls: Array<string>;
    calldata: string;
    selector: string;
    extraData: string;
    errorArgs: Array<any>
};



export class AbstractProvider implements Provider {

    #subs: Map<string, Sub>;
    #plugins: Map<string, ProviderPlugin>;

    // null=unpaused, true=paused+dropWhilePaused, false=paused
    #pausedState: null | boolean;

    #networkPromise: null | Promise<Frozen<Network>>;
    readonly #anyNetwork: boolean;

    #performCache: Map<string, Promise<any>>;

    #nextTimer: number;
    #timers: Map<number, { timer: null | NodeJS.Timer, func: () => void, time: number }>;

    #disableCcipRead: boolean;

    // @TODO: This should be a () => Promise<Network> so network can be
    // done when needed; or rely entirely on _detectNetwork?
    constructor(_network?: "any" | Networkish) {
        if (_network === "any") {
            this.#anyNetwork = true;
            this.#networkPromise = null;
        } else if (_network) {
            const network = Network.from(_network);
            this.#anyNetwork = false;
            this.#networkPromise = Promise.resolve(network);
            setTimeout(() => { this.emit("network", network, null); }, 0);
        } else {
            this.#anyNetwork = false;
            this.#networkPromise = null;
        }

        //this.#approxNumber = -2;
        //this.#approxNumberT0 = 0;
        this.#performCache = new Map();

        this.#subs = new Map();
        this.#plugins = new Map();
        this.#pausedState = null;

        this.#nextTimer = 0;
        this.#timers = new Map();

        this.#disableCcipRead = false;
    }

    get plugins(): Array<ProviderPlugin> {
        return Array.from(this.#plugins.values());
    }

    attachPlugin(plugin: ProviderPlugin): this {
        if (this.#plugins.get(plugin.name)) {
            throw new Error(`cannot replace existing plugin: ${ plugin.name } `);
        }
        this.#plugins.set(plugin.name,  plugin.validate(this));
        return this;
    }

    getPlugin<T extends ProviderPlugin = ProviderPlugin>(name: string): null | T {
        return <T>(this.#plugins.get(name)) || null;
    }

    set disableCcipRead(value: boolean) { this.#disableCcipRead = !!value; }
    get disableCcipRead(): boolean { return this.#disableCcipRead; }

    // Shares multiple identical requests made during the same 250ms
    async #perform<T = any>(req: PerformActionRequest): Promise<T> {
        // Create a tag
        const tag = getTag(req.method, req);

        let perform = this.#performCache.get(tag);
        if (!perform) {
            perform = this._perform(req);
            this.#performCache.set(tag, perform);

            setTimeout(() => {
                if (this.#performCache.get(tag) === perform) {
                    this.#performCache.delete(tag);
                }
            }, 250);
        }

        return await perform;
    }

    async ccipReadFetch(tx: PerformActionTransaction, calldata: string, urls: Array<string>): Promise<null | string> {
        if (this.disableCcipRead || urls.length === 0 || tx.to == null) { return null; }

        const sender = tx.to.toLowerCase();
        const data = calldata.toLowerCase();

        const errorMessages: Array<string> = [ ];

        for (let i = 0; i < urls.length; i++) {
            const url = urls[i];

            // URL expansion
            const href = url.replace("{sender}", sender).replace("{data}", data);

            // If no {data} is present, use POST; otherwise GET
            //const json: string | null = (url.indexOf("{data}") >= 0) ? null: JSON.stringify({ data, sender });

            //const result = await fetchJson({ url: href, errorPassThrough: true }, json, (value, response) => {
            //    value.status = response.statusCode;
            //    return value;
            //});
            const request = new FetchRequest(href);
            if (url.indexOf("{data}") === -1) {
                request.body = { data, sender };
            }

            let errorMessage = "unknown error";

            const resp = await fetchData(request);
            try {
                 const result = resp.bodyJson;
                 if (result.data) { return result.data; }
                 if (result.message) { errorMessage = result.message; }
            } catch (error) { }

            // 4xx indicates the result is not present; stop
            if (resp.statusCode >= 400 && resp.statusCode < 500) {
                return logger.throwError(`response not found during CCIP fetch: ${ errorMessage }`, "OFFCHAIN_FAULT", {
                    reason: "404_MISSING_RESOURCE",
                    transaction: tx, info: { url, errorMessage }
                });
            }

            // 5xx indicates server issue; try the next url
            errorMessages.push(errorMessage);
        }

        return logger.throwError(`error encountered during CCIP fetch: ${ errorMessages.map((m) => JSON.stringify(m)).join(", ") }`, "OFFCHAIN_FAULT", {
            reason: "500_SERVER_ERROR",
            transaction: tx, info: { urls, errorMessages }
        });
    }

    _wrapTransaction(tx: TransactionResponse, hash: string, blockNumber: number): TransactionResponse {
        return tx;
    }

    _detectNetwork(): Promise<Frozen<Network>> {
        return logger.throwError("sub-classes must implement this", "UNSUPPORTED_OPERATION", {
            operation: "_detectNetwork"
        });
    }

    async _perform<T = any>(req: PerformActionRequest): Promise<T> {
        return logger.throwError(`unsupported method: ${ req.method }`, "UNSUPPORTED_OPERATION", {
            operation: req.method,
            info: req
        });
    }

    // State
    async getBlockNumber() {
        return logger.getNumber(await this.#perform({ method: "getBlockNumber" }), "%response");
    }

    async _getAddress(address: string | Addressable): Promise<string> {
        if (typeof(address) === "string") { return address; }
        return await address.getAddress();
    }

    async _getBlockTag(blockTag?: BlockTag): Promise<string> {
        const network = await this.getNetwork();

        if (typeof(blockTag) === "number" && Number.isSafeInteger(blockTag) && blockTag < 0) {
            //let blockNumber = await this._getApproxBlockNumber(500);
            let blockNumber = await this.getBlockNumber();
            blockNumber += blockTag;
            if (blockNumber < 0) { blockNumber = 0; }
            return network.formatter.blockTag(blockNumber)
        }

        return network.formatter.blockTag(blockTag);
    }

    async getNetwork(): Promise<Frozen<Network>> {

        // No explicit network was set and this is our first time
        if (this.#networkPromise == null) {

            // Detect the current network (shared with all calls)
            const detectNetwork = this._detectNetwork().then((network) => {
                this.emit("network", network, null);
                return network;
            }, (error) => {
                // Reset the networkPromise on failure, so we will try again
                if (this.#networkPromise === detectNetwork) {
                    this.#networkPromise = null;
                }
                throw error;
            });

            this.#networkPromise = detectNetwork;
            return await detectNetwork;
        }

        const networkPromise = this.#networkPromise;

        const [ expected, actual ] = await Promise.all([
            networkPromise,          // Possibly an explicit Network
            this._detectNetwork()    // The actual connected network
        ]);

        if (expected.chainId !== actual.chainId) {
            if (this.#anyNetwork) {
                // The "any" network can change, so notify listeners
                this.emit("network", actual, expected);

                // Update the network if something else hasn't already changed it
                if (this.#networkPromise === networkPromise) {
                    this.#networkPromise = Promise.resolve(actual);
                }
            } else {
                // Otherwise, we do not allow changes to the underlying network
                logger.throwError(`network changed: ${ expected.chainId } => ${ actual.chainId } `, "NETWORK_ERROR", {
                    event: "changed"
                });
            }
        }

        return expected.clone().freeze();
    }

    async getFeeData(): Promise<FeeData> {
        const { block, gasPrice } = await resolveProperties({
            block: this.getBlock("latest"),
            gasPrice: ((async () => {
                try {
                    const gasPrice = await this.#perform({ method: "getGasPrice" });
                    return logger.getBigInt(gasPrice, "%response");
                } catch (error) { }
                return null
            })())
        });

        let maxFeePerGas = null, maxPriorityFeePerGas = null;

        if (block && block.baseFeePerGas) {
            // We may want to compute this more accurately in the future,
            // using the formula "check if the base fee is correct".
            // See: https://eips.ethereum.org/EIPS/eip-1559
            maxPriorityFeePerGas = BigInt("1500000000");

            // Allow a network to override their maximum priority fee per gas
            const priorityFeePlugin = (await this.getNetwork()).getPlugin<MaxPriorityFeePlugin>("org.ethers.plugins.max-priority-fee");
            if (priorityFeePlugin) {
                maxPriorityFeePerGas = await priorityFeePlugin.getPriorityFee(this);
            }
            maxFeePerGas = (block.baseFeePerGas * BN_2) + maxPriorityFeePerGas;
        }

        return new FeeData(gasPrice, maxFeePerGas, maxPriorityFeePerGas);
    }

    async _getTransaction(_request: CallRequest): Promise<PerformActionTransaction> {
        const network = await this.getNetwork();

        // Fill in any addresses
        const request = Object.assign({}, _request, await resolveProperties({
            to: (_request.to ? resolveAddress(_request.to, this): undefined),
            from: (_request.from ? resolveAddress(_request.from, this): undefined),
        }));

        return network.formatter.transactionRequest(request);
    }

    async estimateGas(_tx: TransactionRequest) {
        const transaction = await this._getTransaction(_tx);
        return logger.getBigInt(await this.#perform({
            method: "estimateGas", transaction
        }), "%response");
    }

    async #call(tx: PerformActionTransaction, blockTag: string, attempt: number): Promise<string> {
        if (attempt >= MAX_CCIP_REDIRECTS) {
             logger.throwError("CCIP read exceeded maximum redirections", "OFFCHAIN_FAULT", {
                 reason: "TOO_MANY_REDIRECTS",
                 transaction: Object.assign({ }, tx, { blockTag, enableCcipRead: true })
             });
         }

         const transaction = copyRequest(tx);

         try {
             return hexlify(await this._perform({ method: "call", transaction, blockTag }));

         } catch (error) {
             // CCIP Read OffchainLookup
             if (!this.disableCcipRead && isCallException(error) && attempt >= 0 && blockTag === "latest" && transaction.to != null && dataSlice(error.data, 0, 4) === "0x556f1830") {
                 const data = error.data;

                 const txSender = await resolveAddress(transaction.to, this);

                 // Parse the CCIP Read Arguments
                 let ccipArgs: CcipArgs;
                 try {
                     ccipArgs = parseOffchainLookup(dataSlice(error.data, 4));
                 } catch (error: any) {
                     return logger.throwError(error.message, "OFFCHAIN_FAULT", {
                         reason: "BAD_DATA",
                         transaction, info: { data }
                     });
                 }

                 // Check the sender of the OffchainLookup matches the transaction
                 if (ccipArgs.sender.toLowerCase() !== txSender.toLowerCase()) {
                     return logger.throwError("CCIP Read sender mismatch", "CALL_EXCEPTION", {
                         data, transaction,
                         errorSignature: "OffchainLookup(address,string[],bytes,bytes4,bytes)",
                         errorName: "OffchainLookup",
                         errorArgs: ccipArgs.errorArgs
                     });
                 }

                 const ccipResult = await this.ccipReadFetch(transaction, ccipArgs.calldata, ccipArgs.urls);
                 if (ccipResult == null) {
                     return logger.throwError("CCIP Read failed to fetch data", "OFFCHAIN_FAULT", {
                         reason: "FETCH_FAILED",
                         transaction, info: { data: error.data, errorArgs: ccipArgs.errorArgs }
                     });
                 }

                 return this.#call({
                     to: txSender,
                     data: concat([
                         ccipArgs.selector, encodeBytes([ ccipResult, ccipArgs.extraData ])
                     ]),
                 }, blockTag, attempt + 1);
             }

             throw error;
         }
    }

    async call(_tx: CallRequest) {
        const { tx, blockTag } = await resolveProperties({
            tx: this._getTransaction(_tx),
            blockTag: this._getBlockTag(_tx.blockTag)
        });
        return this.#call(tx, blockTag, _tx.enableCcipRead ? 0: -1);
    }

    // Account
    async getBalanceOf(_address: string | Addressable, _blockTag?: BlockTag) {
        const { address, blockTag} = await resolveProperties({
            address: resolveAddress(_address),
            blockTag: this._getBlockTag(_blockTag)
        });

        return logger.getBigInt(await this.#perform({
            method: "getBalance", address, blockTag
        }), "%response");
    }

    async getTransactionCountOf(_address: string | Addressable, _blockTag?: BlockTag) {
        const { address, blockTag} = await resolveProperties({
            address: resolveAddress(_address),
            blockTag: this._getBlockTag(_blockTag)
        });

        return logger.getNumber(await this.#perform({
            method: "getTransactionCount", address, blockTag
        }), "%response");
    }

    async getCode(_address: string | Addressable, _blockTag?: BlockTag) {
        const { address, blockTag} = await resolveProperties({
            address: resolveAddress(_address),
            blockTag: this._getBlockTag(_blockTag)
        });

        return hexlify(await this.#perform({
            method: "getCode", address, blockTag
        }));
    }

    async getStorageAt(_address: string | Addressable, _position: BigNumberish, _blockTag?: BlockTag) {
        const position = logger.getBigInt(_position);
        const { address, blockTag} = await resolveProperties({
            address: resolveAddress(_address),
            blockTag: this._getBlockTag(_blockTag)
        });
        return hexlify(await this.#perform({
            method: "getStorageAt", address, position, blockTag
        }));
    }

    // Write
    async broadcastTransaction(signedTx: string) {
        throw new Error();
        return <TransactionResponse><unknown>{ };
    }

    async #getBlock(block: BlockTag | string, includeTransactions: boolean): Promise<any> {
        const format = (await this.getNetwork()).formatter;

        if (isHexString(block, 32)) {
            return await this.#perform({
                method: "getBlock", blockHash: block, includeTransactions
            });
        }

        return await this.#perform({
            method: "getBlock", blockTag: format.blockTag(block), includeTransactions
        });
    }

    // Queries
    async getBlock(block: BlockTag | string): Promise<null | Block<string>> {
        const format = (await this.getNetwork()).formatter;

        const params = await this.#getBlock(block, false);
        if (params == null) { return null; }

        return format.block(params, this);
    }

    async getBlockWithTransactions(block: BlockTag | string): Promise<null | Block<TransactionResponse>> {
        const format = (await this.getNetwork()).formatter;

        const params = this.#getBlock(block, true);
        if (params == null) { return null; }

        return format.blockWithTransactions(params, this);
    }

    async getTransaction(hash: string): Promise<null | TransactionResponse> {
        const format = (await this.getNetwork()).formatter;
        const params = await this.#perform({ method: "getTransaction", hash });
        return format.transactionResponse(params, this);
    }

    async getTransactionReceipt(hash: string): Promise<null | TransactionReceipt> {
        const format = (await this.getNetwork()).formatter;

        const receipt = await this.#perform({ method: "getTransactionReceipt", hash });
        if (receipt == null) { return null; }

        // Some backends did not backfill the effectiveGasPrice into old transactions
        // in the receipt, so we look it up manually and inject it.
        if (receipt.gasPrice == null && receipt.effectiveGasPrice == null) {
            const tx = await this.#perform({ method: "getTransaction", hash });
            receipt.effectiveGasPrice = tx.gasPrice;
        }

        return format.receipt(receipt, this);
    }

    async _getFilter(filter: Filter | FilterByBlockHash): Promise<PerformActionFilter> {
        // Create a canonical representation of the topics
        const topics = (filter.topics || [ ]).map((t) => {
            if (t == null) { return null; }
            if (Array.isArray(t)) {
                return concisify(t.map((t) => t.toLowerCase()));
            }
            return t.toLowerCase();
        });

        const blockHash = ("blockHash" in filter) ? filter.blockHash: undefined;

        const lookup: { [K in keyof PerformActionFilter]: Promise<PerformActionFilter[K]> } = { };

        // Addresses could be async (ENS names or Addressables)
        if (filter.address) {
            if (Array.isArray(filter.address)) {
                lookup.address = <any>Promise.all(filter.address.map((a) => resolveAddress(a, this)));
            } else {
                lookup.address = <any>resolveAddress(filter.address, this);
            }
        }

        // Block Tags could be async (i.e. relative)
        const addBlockTag = (key: "fromBlock" | "toBlock") => {
            if ((<Filter>filter)[key] == null) { return; }
            lookup[key] = this._getBlockTag((<Filter>filter)[key]);
        }
        addBlockTag("fromBlock");
        addBlockTag("toBlock");

        // Wait for all properties to resolve
        const result = await resolveProperties(lookup);

        // Make sure things are canonical
        if (Array.isArray(result.address)) { result.address.sort(); }

        result.topics = topics;

        if (blockHash) {
            if ((<Filter>filter).fromBlock || (<Filter>filter).toBlock) {
                throw new Error("invalid filter");
            }
            result.blockHash = blockHash;
        }

        return result;
    }

    // Bloom-filter Queries
    async getLogs(_filter: Filter | FilterByBlockHash): Promise<Array<Log>> {
        const { network, filter } = await resolveProperties({
            network: this.getNetwork(),
            filter: this._getFilter(_filter)
        });

        return (await this.#perform<Array<LogParams>>({ method: "getLogs", filter })).map((l) => {
            return network.formatter.log(l, this);
        });
    }

    // ENS
    _getProvider(chainId: number): AbstractProvider {
        return logger.throwError("provider cannot connect to target network", "UNSUPPORTED_OPERATION", {
            operation: "_getProvider()"
        });
    }

    async getResolver(name: string): Promise<null | EnsResolver> {
        return await EnsResolver.fromName(this, name);
    }

    async getAvatar(name: string): Promise<null | string> {
        const resolver = await this.getResolver(name);
        if (resolver) { return await resolver.getAvatar(); }
        return null;
    }

    async resolveName(name: string | Addressable): Promise<null | string>{
        if (typeof(name) === "string") {
            const resolver = await this.getResolver(name);
            if (resolver) { return await resolver.getAddress(); }
        } else {
            const address = await name.getAddress();
            if (address == null) {
                return logger.throwArgumentError("Addressable returned no address", "name", name);
            }
            return address;
        }
        return null;
    }

    async lookupAddress(address: string): Promise<null | string> {
        throw new Error();
        //return "TODO";
    }

    async waitForTransaction(hash: string, confirms: number = 1, timeout?: number): Promise<null | TransactionReceipt> {
        if (confirms === 0) { return this.getTransactionReceipt(hash); }

        return new Promise(async (resolve, reject) => {
            let timer: null | NodeJS.Timer = null;

            const listener = (async (blockNumber: number) => {
                try {
                    const receipt = await this.getTransactionReceipt(hash);
                    if (receipt != null) {
                        if (blockNumber - receipt.blockNumber + 1 >= confirms) {
                            resolve(receipt);
                            this.off("block", listener);
                            if (timer) {
                                clearTimeout(timer);
                                timer = null;
                            }
                            return;
                        }
                    }
                } catch (error) {
                    console.log("EEE", error);
                }
                this.once("block", listener);
            });

            if (timeout != null) {
                timer = setTimeout(() => {
                    if (timer == null) { return; }
                    timer = null;
                    this.off("block", listener);
                    reject(logger.makeError("timeout", "TIMEOUT", { }));
                }, timeout);
            }

            listener(await this.getBlockNumber());
        });
    }

    async waitForBlock(blockTag?: BlockTag): Promise<Block<string>> {
        throw new Error();
        //return new Block(<any><unknown>{ }, this);
    }

    _clearTimeout(timerId: number): void {
        const timer = this.#timers.get(timerId);
        if (!timer) { return; }
        if (timer.timer) { clearTimeout(timer.timer); }
        this.#timers.delete(timerId);
    }

    _setTimeout(_func: () => void, timeout: number = 0): number {
        const timerId = this.#nextTimer++;
        const func = () => {
            this.#timers.delete(timerId);
            _func();
        };

        if (this.paused) {
            this.#timers.set(timerId, { timer: null, func, time: timeout });
        } else {
            const timer = setTimeout(func, timeout);
            this.#timers.set(timerId, { timer, func, time: getTime() });
        }

        return timerId;
    }

    _forEachSubscriber(func: (s: Subscriber) => void): void {
        for (const sub of this.#subs.values()) {
            func(sub.subscriber);
        }
    }

    // Event API; sub-classes should override this; any supported
    // event filter will have been munged into an EventFilter
    _getSubscriber(sub: Subscription): Subscriber {
        switch (sub.type) {
            case "debug":
            case "network":
                return new UnmanagedSubscriber(sub.type);
            case "block":
                return new PollingBlockSubscriber(this);
            case "event":
                return new PollingEventSubscriber(this, sub.filter);
            case "transaction":
                return new PollingTransactionSubscriber(this, sub.hash);
            case "orphan":
                return new PollingOrphanSubscriber(this, sub.filter);
        }

        throw new Error(`unsupported event: ${ sub.type }`);
    }

    _recoverSubscriber(oldSub: Subscriber, newSub: Subscriber): void {
        for (const sub of this.#subs.values()) {
            if (sub.subscriber === oldSub) {
                if (sub.started) { sub.subscriber.stop(); }
                sub.subscriber = newSub;
                if (sub.started) { newSub.start(); }
                if (this.#pausedState != null) { newSub.pause(this.#pausedState); }
                break;
            }
        }
    }

    async #hasSub(event: ProviderEvent, emitArgs?: Array<any>): Promise<null | Sub> {
        let sub = await getSubscription(event, this);
        // This is a log that is removing an existing log; we actually want
        // to emit an orphan event for the removed log
        if (sub.type === "event" && emitArgs && emitArgs.length > 0 && emitArgs[0].removed === true) {
            sub = await getSubscription({ orphan: "drop-log", log: emitArgs[0] }, this);
        }
        return this.#subs.get(sub.tag) || null;
    }

    async #getSub(event: ProviderEvent): Promise<Sub> {
        const subscription = await getSubscription(event, this);

        // Prevent tampering with our tag in any subclass' _getSubscriber
        const tag = subscription.tag;

        let sub = this.#subs.get(tag);
        if (!sub) {
            const subscriber = this._getSubscriber(subscription);
            const addressableMap = new WeakMap();
            const nameMap = new Map();
            sub = { subscriber, tag, addressableMap, nameMap, started: false, listeners: [ ] };
            this.#subs.set(tag, sub);
        }
        return sub;
    }

    async on(event: ProviderEvent, listener: Listener): Promise<this> {
        const sub = await this.#getSub(event);
        sub.listeners.push({ listener, once: false });
        if (!sub.started) {
            sub.subscriber.start();
            sub.started = true;
            if (this.#pausedState != null) { sub.subscriber.pause(this.#pausedState); }
        }
        return this;
    }

    async once(event: ProviderEvent, listener: Listener): Promise<this> {
        const sub = await this.#getSub(event);
        sub.listeners.push({ listener, once: true });
        if (!sub.started) {
            sub.subscriber.start();
            sub.started = true;
            if (this.#pausedState != null) { sub.subscriber.pause(this.#pausedState); }
        }
        return this;
    }

    async emit(event: ProviderEvent, ...args: Array<any>): Promise<boolean> {
        const sub = await this.#hasSub(event, args);
        if (!sub) { return false; };

        const count = sub.listeners.length;
        sub.listeners = sub.listeners.filter(({ listener, once }) => {
            const payload = new EventPayload(this, (once ? null: listener), event);
            try {
                listener.call(this, ...args, payload);
            } catch(error) { }
            return !once;
        });

        return (count > 0);
    }

    async listenerCount(event?: ProviderEvent): Promise<number> {
        if (event) {
            const sub = await this.#hasSub(event);
            if (!sub) { return 0; }
            return sub.listeners.length;
        }

        let total = 0;
        for (const { listeners } of this.#subs.values()) {
            total += listeners.length;
        }
        return total;
    }

    async listeners(event?: ProviderEvent): Promise<Array<Listener>> {
        if (event) {
            const sub = await this.#hasSub(event);
            if (!sub) { return  [ ]; }
            return sub.listeners.map(({ listener }) => listener);
        }
        let result: Array<Listener> = [ ];
        for (const { listeners } of this.#subs.values()) {
            result = result.concat(listeners.map(({ listener }) => listener));
        }
        return result;
    }

    async off(event: ProviderEvent, listener?: Listener): Promise<this> {
        const sub = await this.#hasSub(event);
        if (!sub) { return this; }

        if (listener) {
            const index = sub.listeners.map(({ listener }) => listener).indexOf(listener);
            if (index >= 0) { sub.listeners.splice(index, 1); }
        }

        if (!listener || sub.listeners.length === 0) {
            if (sub.started) { sub.subscriber.stop(); }
            this.#subs.delete(sub.tag);
        }

        return this;
    }

    async removeAllListeners(event?: ProviderEvent): Promise<this> {
        if (event) {
            const { tag, started, subscriber } = await this.#getSub(event);
            if (started) { subscriber.stop(); }
            this.#subs.delete(tag);
        } else {
            for (const [ tag, { started, subscriber } ] of this.#subs) {
                if (started) { subscriber.stop(); }
                this.#subs.delete(tag);
            }
        }
        return this;
    }

    // Alias for "on"
    async addListener(event: ProviderEvent, listener: Listener): Promise<this> {
       return await this.on(event, listener);
    }

    // Alias for "off"
    async removeListener(event: ProviderEvent, listener: Listener): Promise<this> {
       return this.off(event, listener);
    }

    // Sub-classes should override this to shutdown any sockets, etc.
    // but MUST call this super.shutdown.
    async shutdown(): Promise<void> {
        // Stop all listeners
        this.removeAllListeners();

        // Shut down all tiemrs
        for (const timerId of this.#timers.keys()) {
            this._clearTimeout(timerId);
        }
    }

    get paused(): boolean { return (this.#pausedState != null); }

    pause(dropWhilePaused?: boolean): void {
        if (this.#pausedState != null) {
            if (this.#pausedState == !!dropWhilePaused) { return; }
            return logger.throwError("cannot change pause type; resume first", "UNSUPPORTED_OPERATION", {
                operation: "pause"
            });
        }

        this._forEachSubscriber((s) => s.pause(dropWhilePaused));
        this.#pausedState = !!dropWhilePaused;

        for (const timer of this.#timers.values()) {
            // Clear the timer
            if (timer.timer) { clearTimeout(timer.timer); }

            // Remaining time needed for when we become unpaused
            timer.time = getTime() - timer.time;
        }
    }

    resume(): void {
        if (this.#pausedState == null) { return; }

        this._forEachSubscriber((s) => s.resume());
        this.#pausedState = null;
        for (const timer of this.#timers.values()) {
            // Remaining time when we were paused
            let timeout = timer.time;
            if (timeout < 0) { timeout = 0; }

            // Start time (in cause paused, so we con compute remaininf time)
            timer.time = getTime();

            // Start the timer
            setTimeout(timer.func, timeout);
        }
    }
}


function _parseString(result: string, start: number): null | string {
    try {
        const bytes = _parseBytes(result, start);
        if (bytes) { return toUtf8String(bytes); }
    } catch(error) { }
    return null;
}

function _parseBytes(result: string, start: number): null | string {
    if (result === "0x") { return null; }
    try {
        const offset = logger.getNumber(dataSlice(result, start, start + 32));
        const length = logger.getNumber(dataSlice(result, offset, offset + 32));

        return dataSlice(result, offset + 32, offset + 32 + length);
    } catch (error) { }
    return null;
}

function numPad(value: number): Uint8Array {
    const result = toArray(value);
    if (result.length > 32) { throw new Error("internal; should not happen"); }

    const padded = new Uint8Array(32);
    padded.set(result, 32 - result.length);
    return padded;
}

function bytesPad(value: Uint8Array): Uint8Array {
    if ((value.length % 32) === 0) { return value; }

    const result = new Uint8Array(Math.ceil(value.length / 32) * 32);
    result.set(value);
    return result;
}

const empty = new Uint8Array([ ]);

// ABI Encodes a series of (bytes, bytes, ...)
function encodeBytes(datas: Array<BytesLike>) {
    const result: Array<Uint8Array> = [ ];

    let byteCount = 0;

    // Add place-holders for pointers as we add items
    for (let i = 0; i < datas.length; i++) {
        result.push(empty);
        byteCount += 32;
    }

    for (let i = 0; i < datas.length; i++) {
        const data = logger.getBytes(datas[i]);

        // Update the bytes offset
        result[i] = numPad(byteCount);

        // The length and padded value of data
        result.push(numPad(data.length));
        result.push(bytesPad(data));
        byteCount += 32 + Math.ceil(data.length / 32) * 32;
    }

    return concat(result);
}

const zeros = "0x0000000000000000000000000000000000000000000000000000000000000000"
function parseOffchainLookup(data: string): CcipArgs {
    const result: CcipArgs = {
        sender: "", urls: [ ], calldata: "", selector: "", extraData: "", errorArgs: [ ]
    };

    if (dataLength(data) < 5 * 32) {
        throw new Error("insufficient OffchainLookup data");
    }

    const sender = dataSlice(data, 0, 32);
    if (dataSlice(sender, 0, 12) !== dataSlice(zeros, 0, 12)) {
        throw new Error("corrupt OffchainLookup sender");
    }
    result.sender = dataSlice(sender, 12);

    // Read the URLs from the response
    try {
        const urls: Array<string> = [];
        const urlsOffset = logger.getNumber(dataSlice(data, 32, 64));
        const urlsLength = logger.getNumber(dataSlice(data, urlsOffset, urlsOffset + 32));
        const urlsData = dataSlice(data, urlsOffset + 32);
        for (let u = 0; u < urlsLength; u++) {
            const url = _parseString(urlsData, u * 32);
            if (url == null) { throw new Error("abort"); }
            urls.push(url);
        }
        result.urls = urls;
    } catch (error) {
        throw new Error("corrupt OffchainLookup urls");
    }

    // Get the CCIP calldata to forward
    try {
        const calldata = _parseBytes(data, 64);
        if (calldata == null) { throw new Error("abort"); }
        result.calldata = calldata;
    } catch (error) { throw new Error("corrupt OffchainLookup calldata"); }

    // Get the callbackSelector (bytes4)
    if (dataSlice(data, 100, 128) !== dataSlice(zeros, 0, 28)) {
        throw new Error("corrupt OffchainLookup callbaackSelector");
    }
    result.selector = dataSlice(data, 96, 100);

    // Get the extra data to send back to the contract as context
    try {
        const extraData = _parseBytes(data, 128);
        if (extraData == null) { throw new Error("abort"); }
        result.extraData = extraData;
    } catch (error) { throw new Error("corrupt OffchainLookup extraData"); }

    result.errorArgs = "sender,urls,calldata,selector,extraData".split(/,/).map((k) => (<any>result)[k])


    return result;
}
