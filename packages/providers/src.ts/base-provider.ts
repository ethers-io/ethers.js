"use strict";

import {
    EventType,
    Filter,
    Listener,
    Log,
    Provider,
    TransactionReceipt,
    TransactionRequest,
    TransactionResponse
} from "@hethers/abstract-provider";
import { BigNumber } from "@ethersproject/bignumber";
import { arrayify, hexDataLength, hexlify } from "@ethersproject/bytes";
import { getNetwork, Network, Networkish, HederaNetworkConfigLike } from "@hethers/networks";
import { Deferrable, defineReadOnly, getStatic, resolveProperties } from "@ethersproject/properties";
import { Transaction } from "@hethers/transactions";
import { Timestamp, TransactionReceipt as HederaTransactionReceipt } from '@hashgraph/sdk';

import { Logger } from "@hethers/logger";
import { version } from "./_version";
const logger = new Logger(version);

import {Formatter} from "./formatter";
import {getAccountFromTransactionId, AccountLike, asAccountString, getAddressFromAccount} from "@hethers/address";
import {AccountBalanceQuery, AccountId, Client, NetworkName, Transaction as HederaTransaction} from "@hashgraph/sdk";
import axios from "axios";
import {base64} from "hethers/lib/utils";

const ZERO_HEDERA_TIMESTAMP = "1000000000.000000000";

//////////////////////////////
// Event Serializeing
// @ts-ignore
function checkTopic(topic: string): string {
    if (topic == null) {
        return "null";
    }
    if (hexDataLength(topic) !== 32) {
        logger.throwArgumentError("invalid topic", "topic", topic);
    }
    return topic.toLowerCase();
}

// @ts-ignore
function serializeTopics(topics: Array<string | Array<string>>): string {
    // Remove trailing null AND-topics; they are redundant
    topics = topics.slice();
    while (topics.length > 0 && topics[topics.length - 1] == null) {
        topics.pop();
    }

    return topics.map((topic) => {
        if (Array.isArray(topic)) {

            // Only track unique OR-topics
            const unique: { [topic: string]: boolean } = {}
            topic.forEach((topic) => {
                unique[checkTopic(topic)] = true;
            });

            // The order of OR-topics does not matter
            const sorted = Object.keys(unique);
            sorted.sort();

            return sorted.join("|");

        } else {
            return checkTopic(topic);
        }
    }).join("&");
}

function deserializeTopics(data: string): Array<string | Array<string>> {
    if (data === "") {
        return [];
    }

    return data.split(/&/g).map((topic) => {
        if (topic === "") {
            return [];
        }

        const comps = topic.split("|").map((topic) => {
            return ((topic === "null") ? null : topic);
        });

        return ((comps.length === 1) ? comps[0] : comps);
    });
}


//////////////////////////////
// Helper Object


function stall(duration: number): Promise<void> {
    return new Promise((resolve) => {
        setTimeout(resolve, duration);
    });
}

function base64ToHex(hash: string): string {
    return hexlify(base64.decode(hash));
}

//////////////////////////////
// Provider Object


/**
 *  EventType
 *   - "poll"
 *   - "didPoll"
 *   - "pending"
 *   - "error"
 *   - "network"
 *   - filter
 *   - topics array
 *   - transaction hash
 */

const PollableEvents = ["network", "pending", "poll"];

export class Event {
    readonly listener: Listener;
    readonly once: boolean;
    readonly tag: string;

    constructor(tag: string, listener: Listener, once: boolean) {
        defineReadOnly(this, "tag", tag);
        defineReadOnly(this, "listener", listener);
        defineReadOnly(this, "once", once);
    }

    get event(): EventType {
        switch (this.type) {
            case "tx":
                return this.hash;
            case "filter":
                return this.filter;
        }
        return this.tag;
    }

    get type(): string {
        return this.tag.split(":")[0]
    }

    get hash(): string {
        const comps = this.tag.split(":");
        if (comps[0] !== "tx") {
            return null;
        }
        return comps[1];
    }

    get filter(): Filter {
        const comps = this.tag.split(":");
        if (comps[0] !== "filter") {
            return null;
        }
        const address = comps[1];

        const topics = deserializeTopics(comps[2]);
        const filter: Filter = {};

        if (topics.length > 0) {
            filter.topics = topics;
        }
        if (address && address !== "*") {
            filter.address = address;
        }

        return filter;
    }

    pollable(): boolean {
        return (this.tag.indexOf(":") >= 0 || PollableEvents.indexOf(this.tag) >= 0);
    }
}

export interface Avatar {
    url: string;
    linkage: Array<{ type: string, content: string }>;
}

let defaultFormatter: Formatter = null;
const MIRROR_NODE_TRANSACTIONS_ENDPOINT = '/api/v1/transactions/';
const MIRROR_NODE_CONTRACTS_RESULTS_ENDPOINT = '/api/v1/contracts/results/';
const MIRROR_NODE_CONTRACTS_ENDPOINT = '/api/v1/contracts/';

let nextPollId = 1;

export class BaseProvider extends Provider {
    _networkPromise: Promise<Network>;
    _network: Network;

    _events: Array<Event>;

    _pollingInterval: number;

    _poller: NodeJS.Timer;
    _bootstrapPoll: NodeJS.Timer;

    formatter: Formatter;
    _emittedEvents: { [key: string]: boolean }
    _previousPollingTimestamps: { [key: string]: Timestamp }

    readonly anyNetwork: boolean;
    private readonly hederaClient: Client;
    private readonly _mirrorNodeUrl: string; // initial mirror node URL, which is resolved from the provider's network

    constructor(network: Networkish | Promise<Network> | HederaNetworkConfigLike) {
        logger.checkNew(new.target, Provider);
        super();

        this._events = [];
        this._emittedEvents = {};
        this._previousPollingTimestamps = {};
        this.formatter = new.target.getFormatter();
        // If network is any, this Provider allows the underlying
        // network to change dynamically, and we auto-detect the
        // current network
        defineReadOnly(this, "anyNetwork", (network === "any"));
        if (this.anyNetwork) {
            network = this.detectNetwork();
        }

        if (network instanceof Promise) {
            this._networkPromise = network;
            // Squash any "unhandled promise" errors; that do not need to be handled
            network.catch((error) => {
            });

            // Trigger initial network setting (async)
            this._ready().catch((error) => {
            });
        } else {
            if (!isHederaNetworkConfigLike(network)) {
                const asDefaultNetwork = network as Network;
                // defineReadOnly(this, "_network", getNetwork(network));
                this._network = getNetwork(asDefaultNetwork);
                this._networkPromise = Promise.resolve(this._network);
                const knownNetwork = getStatic<(network: Networkish) => Network>(new.target, "getNetwork")(asDefaultNetwork);
                if (knownNetwork) {
                    defineReadOnly(this, "_network", knownNetwork);
                    this.emit("network", knownNetwork);
                } else {
                    logger.throwArgumentError("invalid network", "network", network);
                }
                this.hederaClient = Client.forName(mapNetworkToHederaNetworkName(asDefaultNetwork));
                this._mirrorNodeUrl = resolveMirrorNetworkUrl(this._network);
            } else {
                const asHederaNetwork = network as HederaNetworkConfigLike;
                this.hederaClient = Client.forNetwork(asHederaNetwork.network);
                this._mirrorNodeUrl = asHederaNetwork.mirrorNodeUrl;
                defineReadOnly(this, "_network", {
                    // FIXME: chainId
                    chainId: 0,
                    name: this.hederaClient.networkName
                });
            }
        }

        this._pollingInterval = 3000;
    }

    async _ready(): Promise<Network> {
        if (this._network == null) {
            let network: Network = null;
            if (this._networkPromise) {
                try {
                    network = await this._networkPromise;
                } catch (error) {
                }
            }

            // Try the Provider's network detection (this MUST throw if it cannot)
            if (network == null) {
                network = await this.detectNetwork();
            }

            // Possible this call stacked so do not call defineReadOnly again
            if (this._network == null) {
                if (this.anyNetwork) {
                    // this._network = network;
                    defineReadOnly(this, "_network", network);
                } else {
                    this._network = network;
                }
                this.emit("network", network, null);
            }
        }

        return this._network;
    }

    // @TODO: Remove this and just create a singleton formatter
    static getFormatter(): Formatter {
        if (defaultFormatter == null) {
            defaultFormatter = new Formatter();
        }
        return defaultFormatter;
    }

    // @TODO: Remove this and just use getNetwork
    static getNetwork(network: Networkish): Network {
        return getNetwork((network == null) ? "mainnet" : network);
    }

    get network(): Network {
        return this._network;
    }

    public _checkMirrorNode(): void {
        if (!this._mirrorNodeUrl) logger.throwError("missing provider", Logger.errors.UNSUPPORTED_OPERATION);
    }

    // This method should query the network if the underlying network
    // can change, such as when connected to a JSON-RPC backend
    // With the current hedera implementation, we do not support changeable networks,
    // thus we do not need to query at this level
    async detectNetwork(): Promise<Network> {
        this._networkPromise = Promise.resolve(this._network);
        return this._networkPromise;
    }

    async getNetwork(): Promise<Network> {
        const network = await this._ready();

        // Make sure we are still connected to the same network; this is
        // only an external call for backends which can have the underlying
        // network change spontaneously
        const currentNetwork = await this.detectNetwork();
        if (network.chainId !== currentNetwork.chainId) {

            // We are allowing network changes, things can get complex fast;
            // make sure you know what you are doing if you use "any"
            if (this.anyNetwork) {
                this._network = currentNetwork;
                // The "network" event MUST happen before this method resolves
                // so any events have a chance to unregister, so we stall an
                // additional event loop before returning from /this/ call
                this.emit("network", currentNetwork, network);
                await stall(0);

                return this._network;
            }

            const error = logger.makeError("underlying network changed", Logger.errors.NETWORK_ERROR, {
                event: "changed",
                network: network,
                detectedNetwork: currentNetwork
            });

            this.emit("error", error);
            throw error;
        }

        return network;
    }

    get pollingInterval(): number {
        return this._pollingInterval;
    }

    set pollingInterval(value: number) {
        if (typeof (value) !== "number" || value <= 0 || parseInt(String(value)) != value) {
            throw new Error("invalid polling interval");
        }
        this._pollingInterval = value;
    }

    async waitForTransaction(transactionId: string, timeout?: number): Promise<TransactionReceipt> {
        return this._waitForTransaction(transactionId, timeout);
    }

    async _waitForTransaction(transactionId: string, timeout: number): Promise<TransactionReceipt> {
        let remainingTimeout = timeout;
        return new Promise(async (resolve, reject) => {
            while (remainingTimeout == null || remainingTimeout > 0) {
                const txResponse = await this.getTransaction(transactionId);
                if (txResponse == null) {
                    await new Promise((resolve) => {
                        setTimeout(resolve, this._pollingInterval);
                    });
                    if (remainingTimeout != null) remainingTimeout -= this._pollingInterval;
                } else {
                    return resolve(this.formatter.receiptFromResponse(txResponse));
                }
            }
            reject(logger.makeError("timeout exceeded", Logger.errors.TIMEOUT, {timeout: timeout}));
        });
    }

    /**
     *  AccountBalance query implementation, using the hashgraph sdk.
     *  It returns the tinybar balance of the given address.
     *
     * @param accountLike The address to check balance of
     */
    async getBalance(accountLike: AccountLike | Promise<AccountLike>): Promise<BigNumber> {
        accountLike = await accountLike;
        const account = asAccountString(accountLike);
        try {
            const balance = await new AccountBalanceQuery()
                .setAccountId(AccountId.fromString(account))
                .execute(this.hederaClient);
            return BigNumber.from(balance.hbars.toTinybars().toNumber());
        } catch (error) {
            return logger.throwError("bad result from backend", Logger.errors.SERVER_ERROR, {
                method: "AccountBalanceQuery",
                params: {address: accountLike},
                error
            });
        }
    }

    /**
     *  Get contract bytecode implementation, using the REST Api.
     *  It returns the bytecode, or a default value as string.
     *
     * @param accountLike The address to get code for
     * @param throwOnNonExisting Whether or not to throw exception if address is not a contract
     */
    async getCode(accountLike: AccountLike | Promise<AccountLike>, throwOnNonExisting?: boolean): Promise<string> {
        this._checkMirrorNode();
        accountLike = await accountLike;
        const account = asAccountString(accountLike);
        try {
            let {data} = await axios.get(this._mirrorNodeUrl + MIRROR_NODE_CONTRACTS_ENDPOINT + account);
            return data.bytecode ? hexlify(data.bytecode) : `0x`;
        } catch (error) {
            if (error.response && error.response.status &&
                (error.response.status != 404 || (error.response.status == 404 && throwOnNonExisting))) {
                logger.throwError("bad result from backend", Logger.errors.SERVER_ERROR, {
                    method: "ContractByteCodeQuery",
                    params: {address: accountLike},
                    error
                });
            }
            return "0x";
        }
    }

    // This should be called by any subclass wrapping a TransactionResponse
    _wrapTransaction(tx: Transaction, hash?: string, receipt?: HederaTransactionReceipt): TransactionResponse {
        if (hash != null && hexDataLength(hash) !== 48) {
            throw new Error("invalid response - sendTransaction");
        }

        const result = <TransactionResponse>tx;
        if (!result.customData) result.customData = {};
        if (receipt && receipt.fileId) {
            result.customData.fileId = receipt.fileId.toString();
        }
        if (receipt && receipt.contractId) {
            result.customData.contractId = receipt.contractId.toSolidityAddress();
        }
        if (receipt && receipt.accountId) {
            result.customData.accountId = receipt.accountId;
        }

        // Check the hash we expect is the same as the hash the server reported
        if (hash != null && tx.hash !== hash) {
            logger.throwError("Transaction hash mismatch from Provider.sendTransaction.", Logger.errors.UNKNOWN_ERROR, {
                expectedHash: tx.hash,
                returnedHash: hash
            });
        }

        result.wait = async (timeout?: number) => {
            const receipt = await this._waitForTransaction(tx.transactionId, timeout);
            if (receipt.status === 0) {
                logger.throwError("transaction failed", Logger.errors.CALL_EXCEPTION, {
                    transactionHash: tx.hash,
                    transaction: tx,
                    receipt: receipt
                });
            }
            return receipt;
        };
        return result;
    }

    public getHederaClient(): Client {
        return this.hederaClient;
    }

    public getHederaNetworkConfig(): AccountId[] {
        return this.hederaClient._network.getNodeAccountIdsForExecute();
    }

    async sendTransaction(signedTransaction: string | Promise<string>): Promise<TransactionResponse> {
        signedTransaction = await signedTransaction;
        const txBytes = arrayify(signedTransaction);
        const hederaTx = HederaTransaction.fromBytes(txBytes);
        const ethersTx = await this.formatter.transaction(signedTransaction);
        const txHash = hexlify(await hederaTx.getTransactionHash());
        try {
            // TODO once we have fallback provider use `provider.perform("sendTransaction")`
            // TODO Before submission verify that the nodeId is the one that the provider is connected to
            const resp = await hederaTx.execute(this.hederaClient);
            const receipt = await resp.getReceipt(this.hederaClient);
            return this._wrapTransaction(ethersTx, txHash, receipt);
        } catch (error) {
            const err = logger.makeError(error.message, error.status?.toString());
            (<any>err).transaction = ethersTx;
            (<any>err).transactionHash = txHash;
            throw err;
        }
    }

    async _getFilter(filter: Filter | Promise<Filter>): Promise<Filter> {
        filter = await filter;

        const result: any = {};

        if (filter.address != null) {
            result.address = filter.address.toString();
        }

        ["topics"].forEach((key) => {
            if ((<any>filter)[key] == null) {
                return;
            }
            result[key] = (<any>filter)[key];
        });

        ["fromTimestamp", "toTimestamp"].forEach((key) => {
            if ((<any>filter)[key] == null) {
                return;
            }
            result[key] = (<any>filter)[key];
        });

        return this.formatter.filter(await resolveProperties(result));
    }

    async estimateGas(transaction: Deferrable<TransactionRequest>): Promise<BigNumber> {
        return logger.throwArgumentError("estimateGas not implemented", Logger.errors.NOT_IMPLEMENTED, {
            operation: "estimateGas"
        });
    }

    /**
     * Transaction record query implementation using the mirror node REST API.
     *
     * @param transactionIdOrTimestamp - id or consensus timestamp of the transaction to search for
     */
    async getTransaction(transactionIdOrTimestamp: string | Promise<string>): Promise<TransactionResponse> {
        this._checkMirrorNode();
        transactionIdOrTimestamp = await transactionIdOrTimestamp;
        let transactionsEndpoint = MIRROR_NODE_TRANSACTIONS_ENDPOINT;
        !transactionIdOrTimestamp.includes("-") ? transactionsEndpoint += ('?timestamp=' + transactionIdOrTimestamp) : transactionsEndpoint += transactionIdOrTimestamp;
        try {
            let {data} = await axios.get(this._mirrorNodeUrl + transactionsEndpoint);
            if (data) {
                const filtered = data.transactions.filter((e: { result: string; }) => e.result != 'DUPLICATE_TRANSACTION');
                if (filtered.length > 0) {
                    let record: any;
                    record = {
                        chainId: this._network.chainId,
                        transactionId: filtered[0].transaction_id,
                        result: filtered[0].result,
                        customData: {}
                    };

                    const transactionName = filtered[0].name;
                    if (transactionName === 'CRYPTOCREATEACCOUNT') {
                        record.from = getAccountFromTransactionId(filtered[0].transaction_id);
                        record.timestamp = filtered[0].consensus_timestamp;

                        // Different endpoints of the mirror node API returns hashes in different formats.
                        // In order to ensure consistency with data from MIRROR_NODE_CONTRACTS_ENDPOINT
                        // the hash from MIRROR_NODE_TRANSACTIONS_ENDPOINT is base64 decoded and then converted to hex.
                        record.hash = base64ToHex(filtered[0].transaction_hash);

                        record.accountAddress = getAddressFromAccount(filtered[0].entity_id);
                    } else if (transactionName === 'CRYPTOTRANSFER') {
                        record.from = getAccountFromTransactionId(filtered[0].transaction_id);
                        record.timestamp = filtered[0].consensus_timestamp;
                        record.hash = base64ToHex(filtered[0].transaction_hash);

                        let charityFee = 0;
                        const toTransfers = filtered[0].transfers.filter(function (t: any) {
                            if (t.account == filtered[0].node) {
                                charityFee = filtered[0].charged_tx_fee - t.amount;
                                return false;
                            }
                            return t.account != record.from;
                        }).filter(function (t: any) {
                            return t.amount != charityFee;
                        });

                        if (toTransfers.length > 1) {
                            record.transfersList = toTransfers;
                        } else {
                            record.to = toTransfers[0].account;
                            record.amount = toTransfers[0].amount;
                        }
                    } else {
                        const contractsEndpoint = MIRROR_NODE_CONTRACTS_RESULTS_ENDPOINT + filtered[0].transaction_id;
                        const dataWithLogs = await axios.get(this._mirrorNodeUrl + contractsEndpoint);
                        record = Object.assign({}, record, {...dataWithLogs.data});
                    }

                    return this.formatter.responseFromRecord(record);
                }
            }
        } catch (error) {
            if (error && error.response && error.response.status != 404) {
                logger.throwError("bad result from backend", Logger.errors.SERVER_ERROR, {
                    method: "TransactionResponseQuery",
                    error
                });
            }
        }
        return null;
    }

    /**
     * Transaction record query implementation using the mirror node REST API.
     *
     * @param transactionId - id of the transaction to search for
     */
    async getTransactionReceipt(transactionId: string | Promise<string>): Promise<TransactionReceipt> {
        return logger.throwError("getTransactionReceipt not implemented", Logger.errors.NOT_IMPLEMENTED, {
            operation: 'getTransactionReceipt'
        })

        // await this.getNetwork();
        // transactionId = await transactionId;
        // try {
        //     let receipt = await new TransactionReceiptQuery()
        //         .setTransactionId(transactionId)
        //         .execute(this.hederaClient);
        //     console.log("getTransactionReceipt: ", receipt);
        //     return null;
        // } catch (error) {
        //     return logger.throwError("bad result from backend", Logger.errors.SERVER_ERROR, {
        //         method: "TransactionGetReceiptQuery",
        //         error
        //     });
        // }
    }

    /**
     *  Get contract logs implementation, using the REST Api.
     *  It returns the logs array, or a default value [].
     *  Throws an exception, when the result size exceeds the given limit.
     *
     * @param filter The parameters to filter logs by.
     */
    async getLogs(filter: Filter | Promise<Filter>): Promise<Array<Log>> {

        this._checkMirrorNode();
        const params = await resolveProperties({filter: this._getFilter(filter)});
        // set default values
        params.filter.fromTimestamp = params.filter.fromTimestamp || ZERO_HEDERA_TIMESTAMP;
        params.filter.toTimestamp = params.filter.toTimestamp || Timestamp.generate().toString();
        const fromTimestampFilter = '&timestamp=gte%3A' + params.filter.fromTimestamp;
        const toTimestampFilter = '&timestamp=lte%3A' + params.filter.toTimestamp;
        const limit = 100;
        const oversizeResponseLength = limit + 1;
        let epContractsLogs = '/api/v1/contracts/' + params.filter.address + '/results/logs?limit=' + oversizeResponseLength;
        if (params.filter.topics && params.filter.topics.length > 0) {
            for (let i = 0; i < params.filter.topics.length; i++) {
                const topic = params.filter.topics[i];
                if (typeof topic === "string") {
                    epContractsLogs += `&topic${i}=${topic}`;
                } else {
                    return logger.throwArgumentError("OR on topics", Logger.errors.UNSUPPORTED_OPERATION, params.filter.topics);
                }
            }
        }
        const requestUrl = this._mirrorNodeUrl + epContractsLogs + toTimestampFilter + fromTimestampFilter;
        try {
            let {data} = await axios.get(requestUrl);
            if (data) {
                const mappedLogs = this.formatter.logsMapper(data.logs);
                if (mappedLogs.length == oversizeResponseLength) {
                    logger.throwError(`query returned more than ${limit} results`, Logger.errors.SERVER_ERROR);
                }
                return Formatter.arrayOf(this.formatter.filterLog.bind(this.formatter))(mappedLogs);
            }
        } catch (error) {
            const errorParams = {method: "ContractLogsQuery", error}
            if (error.response && error.response.status != 404) {
                logger.throwError("bad result from backend", Logger.errors.SERVER_ERROR, errorParams);
            }
            logger.throwError(error.message, error.code, errorParams);
        }
        return [];
    }

    async getHbarPrice(): Promise<number> {
        return logger.throwError("NOT_IMPLEMENTED", Logger.errors.NOT_IMPLEMENTED);
    }

    /* Events, Event Listeners & Polling */

    _startEvent(event: Event): void {
        this.polling = (this._events.filter((e) => e.pollable()).length > 0);
        this._previousPollingTimestamps[event.tag] = Timestamp.generate();
    }

    _stopEvent(event: Event): void {
        this.polling = (this._events.filter((e) => e.pollable()).length > 0);
        delete this._previousPollingTimestamps[event.tag];
    }

    perform(method: string, params: any): Promise<any> {
        return logger.throwError(method + " not implemented", Logger.errors.NOT_IMPLEMENTED, {operation: method});
    }

    _addEventListener(eventName: EventType, listener: Listener, once: boolean): this {
        const event = new Event(getEventTag(eventName), listener, once)
        this._events.push(event);
        this._startEvent(event);
        return this;
    }

    on(eventName: EventType, listener: Listener): this {
        return this._addEventListener(eventName, listener, false);
    }

    once(eventName: EventType, listener: Listener): this {
        return this._addEventListener(eventName, listener, true);
    }

    emit(eventName: EventType, ...args: Array<any>): boolean {
        let result = false;

        let stopped: Array<Event> = [];

        let eventTag = getEventTag(eventName);
        this._events = this._events.filter((event) => {
            if (event.tag !== eventTag) {
                return true;
            }

            setTimeout(() => {
                event.listener.apply(this, args);
            }, 0);

            result = true;

            if (event.once) {
                stopped.push(event);
                return false;
            }

            return true;
        });

        stopped.forEach((event) => {
            this._stopEvent(event)
        });
        return result;
    }

    listenerCount(eventName?: EventType): number {
        if (!eventName) {
            return this._events.length;
        }

        let eventTag = getEventTag(eventName);
        return this._events.filter((event) => {
            return (event.tag === eventTag);
        }).length;
    }

    listeners(eventName?: EventType): Array<Listener> {
        if (eventName == null) {
            return this._events.map((event) => event.listener);
        }

        let eventTag = getEventTag(eventName);
        return this._events
            .filter((event) => (event.tag === eventTag))
            .map((event) => event.listener);
    }

    off(eventName: EventType, listener?: Listener): this {
        if (listener == null) {
            return this.removeAllListeners(eventName);
        }

        const stopped: Array<Event> = [];

        let found = false;

        let eventTag = getEventTag(eventName);
        this._events = this._events.filter((event) => {
            if (event.tag !== eventTag || event.listener != listener) {
                return true;
            }
            if (found) {
                return true;
            }
            found = true;
            stopped.push(event);
            return false;
        });

        stopped.forEach((event) => {
            this._stopEvent(event);
        });

        return this;
    }

    removeAllListeners(eventName?: EventType): this {
        let stopped: Array<Event> = [];
        if (eventName == null) {
            stopped = this._events;

            this._events = [];
        } else {
            const eventTag = getEventTag(eventName);
            this._events = this._events.filter((event) => {
                if (event.tag !== eventTag) {
                    return true;
                }
                stopped.push(event);
                return false;
            });
        }

        stopped.forEach((event) => {
            this._stopEvent(event);
        });
        return this;
    }

    get polling(): boolean {
        return (this._poller != null);
    }

    set polling(value: boolean) {
        if (value && !this._poller) {
            this._poller = setInterval(() => {
                this.poll();
            }, this.pollingInterval);

            if (!this._bootstrapPoll) {
                this._bootstrapPoll = setTimeout(() => {
                    this.poll();

                    // We block additional polls until the polling interval
                    // is done, to prevent overwhelming the poll function
                    this._bootstrapPoll = setTimeout(() => {
                        // If polling was disabled, something may require a poke
                        // since starting the bootstrap poll and it was disabled
                        if (!this._poller) {
                            this.poll();
                        }

                        // Clear out the bootstrap so we can do another
                        this._bootstrapPoll = null;
                    }, this.pollingInterval);
                }, 0);
            }

        } else if (!value && this._poller) {
            clearInterval(this._poller);
            this._poller = null;
        }
    }

    async poll(): Promise<void> {
        const pollId = nextPollId++;
        // purge the old events
        this.purgeOldEvents();
        // Track all running promises, so we can trigger a post-poll once they are complete
        const runners: Array<Promise<void>> = [];

        // Emit a poll event with the current timestamp
        const now = Timestamp.generate();
        this.emit("poll", pollId, now.toDate().getTime());

        this._events.forEach((event) => {
            switch (event.type) {
                case "filter": {
                    const filter = event.filter;
                    let from = this._previousPollingTimestamps[event.tag];
                    // ensure we don't get from == to
                    from = from.plusNanos(1);
                    filter.fromTimestamp = from.toString();
                    filter.toTimestamp = now.toString();
                    const runner = this.getLogs(filter).then((logs) => {
                        if (logs.length === 0) {
                            return;
                        }
                        logs.forEach((log: Log) => {
                            if (!this._emittedEvents[log.timestamp]) {
                                this.emit(filter, log);
                                this._emittedEvents[log.timestamp] = true;
                                const [logTsSeconds, logTsNanos] = log.timestamp.split(".").map(parseInt);
                                const logTimestamp = new Timestamp(logTsSeconds, logTsNanos);
                                // longInstance.compare(other) returns -1 when other > this, 0 when they are equal and 1 then this > other
                                if (this._previousPollingTimestamps[event.tag].compare(logTimestamp) == -1) {
                                    this._previousPollingTimestamps[event.tag] = logTimestamp;
                                }
                            }
                        });
                    }).catch((error: Error) => {
                        this.emit("error", error);
                    });
                    runners.push(runner);

                    break;
                }
            }
        });
        // Once all events for this loop have been processed, emit "didPoll"
        Promise.all(runners).then(() => {
            this.emit("didPoll", pollId);
        }).catch((error) => {
            this.emit("error", error);
        });
        return;
    }

    purgeOldEvents() {
        for (let emittedEventsKey in this._emittedEvents) {
            const [sec, nano] = emittedEventsKey.split(".").map(parseInt);
            const ts = new Timestamp(sec, nano);
            const now = Timestamp.generate();
            // clean up events which are significantly old - older than 3 minutes
            const threeMinutes = 1000 * 1000 * 1000 * 60 * 3;
            if (ts.compare(now.plusNanos(threeMinutes)) == -1) {
                delete this._emittedEvents[emittedEventsKey];
            }
        }
    }
}

// resolves network string to a hedera network name
function mapNetworkToHederaNetworkName(net: Network | string | number | Promise<Network>) {
    switch (net) {
        case 'mainnet':
            return NetworkName.Mainnet;
        case 'previewnet':
            return NetworkName.Previewnet;
        case 'testnet':
            return NetworkName.Testnet;
        default:
            logger.throwArgumentError("Invalid network name", "network", net);
            return null;
    }
}

// resolves the mirror node url from the given provider network.
function resolveMirrorNetworkUrl(net: Network): string {
    switch (net.name) {
        case 'mainnet':
            return 'https://mainnet.mirrornode.hedera.com';
        case 'previewnet':
            return 'https://previewnet.mirrornode.hedera.com';
        case 'testnet':
            return 'https://testnet.mirrornode.hedera.com';
        default:
            logger.throwArgumentError("Invalid network name", "network", net);
            return null;
    }
}

function isHederaNetworkConfigLike(cfg: HederaNetworkConfigLike | Networkish): cfg is HederaNetworkConfigLike {
    return (cfg as HederaNetworkConfigLike).network !== undefined;
}

function getEventTag(eventName: EventType): string {
    if (typeof (eventName) === "string") {
        eventName = eventName.toLowerCase();

        if (hexDataLength(eventName) === 32) {
            return "tx:" + eventName;
        }

        if (eventName.indexOf(":") === -1) {
            return eventName;
        }

    } else if (Array.isArray(eventName)) {
        return "filter:*:" + serializeTopics(eventName);

    } else if (eventName && typeof (eventName) === "object") {
        return "filter:" + (eventName.address || "*") + ":" + serializeTopics(eventName.topics || []);
    }

    throw new Error("invalid event - " + eventName);
}
