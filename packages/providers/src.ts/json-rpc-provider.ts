"use strict";

// See: https://github.com/ethereum/wiki/wiki/JSON-RPC

import { Provider, TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { Signer } from "@ethersproject/abstract-signer";
import { BigNumber } from "@ethersproject/bignumber";
import { Bytes, hexlify, hexValue } from "@ethersproject/bytes";
import { Network, Networkish } from "@ethersproject/networks";
import { checkProperties, deepCopy, defineReadOnly, getStatic, resolveProperties, shallowCopy } from "@ethersproject/properties";
import { toUtf8Bytes } from "@ethersproject/strings";
import { ConnectionInfo, fetchJson, poll } from "@ethersproject/web";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { BaseProvider, Event } from "./base-provider";


function timer(timeout: number): Promise<any> {
    return new Promise(function(resolve) {
        setTimeout(resolve, timeout);
    });
}

function getResult(payload: { error?: { code?: number, data?: any, message?: string }, result?: any }): any {
    if (payload.error) {
        // @TODO: not any
        let error: any = new Error(payload.error.message);
        error.code = payload.error.code;
        error.data = payload.error.data;
        throw error;
    }

    return payload.result;
}

function getLowerCase(value: string): string {
    if (value) { return value.toLowerCase(); }
    return value;
}

const _constructorGuard = {};

export class JsonRpcSigner extends Signer {
    readonly provider: JsonRpcProvider;
    _index: number;
    _address: string;

    constructor(constructorGuard: any, provider: JsonRpcProvider, addressOrIndex?: string | number) {
        logger.checkNew(new.target, JsonRpcSigner);

        super();

        if (constructorGuard !== _constructorGuard) {
            throw new Error("do not call the JsonRpcSigner constructor directly; use provider.getSigner");
        }

        defineReadOnly(this, "provider", provider);

        if (addressOrIndex == null) { addressOrIndex = 0; }

        if (typeof(addressOrIndex) === "string") {
            defineReadOnly(this, "_address", this.provider.formatter.address(addressOrIndex));
            defineReadOnly(this, "_index", null);

        } else if (typeof(addressOrIndex) === "number") {
            defineReadOnly(this, "_index", addressOrIndex);
            defineReadOnly(this, "_address", null);

        } else {
            logger.throwArgumentError("invalid address or index", "addressOrIndex", addressOrIndex);
        }
    }

    connect(provider: Provider): JsonRpcSigner {
        return logger.throwError("cannot alter JSON-RPC Signer connection", Logger.errors.UNSUPPORTED_OPERATION, {
            operation: "connect"
        });
    }

    connectUnchecked(): JsonRpcSigner {
        return new UncheckedJsonRpcSigner(_constructorGuard, this.provider, this._address || this._index);
    }

    getAddress(): Promise<string> {
        if (this._address) {
            return Promise.resolve(this._address);
        }

        return this.provider.send("eth_accounts", []).then((accounts) => {
            if (accounts.length <= this._index) {
                logger.throwError("unknown account #" + this._index, Logger.errors.UNSUPPORTED_OPERATION, {
                    operation: "getAddress"
                });
            }
            return this.provider.formatter.address(accounts[this._index])
        });
    }

    sendUncheckedTransaction(transaction: TransactionRequest): Promise<string> {
        transaction = shallowCopy(transaction);

        let fromAddress = this.getAddress().then((address) => {
            if (address) { address = address.toLowerCase(); }
            return address;
        });

        // The JSON-RPC for eth_sendTransaction uses 90000 gas; if the user
        // wishes to use this, it is easy to specify explicitly, otherwise
        // we look it up for them.
        if (transaction.gasLimit == null) {
            let estimate = shallowCopy(transaction);
            estimate.from = fromAddress;
            transaction.gasLimit = this.provider.estimateGas(estimate);
        }

        return Promise.all([
            resolveProperties(transaction),
            fromAddress
        ]).then((results) => {
            let tx = results[0];
            let hexTx = (<any>this.provider.constructor).hexlifyTransaction(tx);
            hexTx.from = results[1];
            return this.provider.send("eth_sendTransaction", [ hexTx ]).then((hash) => {
                return hash;
            }, (error) => {
                if (error.responseText) {
                    // See: JsonRpcProvider.sendTransaction (@TODO: Expose a ._throwError??)
                    if (error.responseText.indexOf("insufficient funds") >= 0) {
                        logger.throwError("insufficient funds", Logger.errors.INSUFFICIENT_FUNDS, {
                            transaction: tx
                        });
                    }
                    if (error.responseText.indexOf("nonce too low") >= 0) {
                        logger.throwError("nonce has already been used", Logger.errors.NONCE_EXPIRED, {
                            transaction: tx
                        });
                    }
                    if (error.responseText.indexOf("replacement transaction underpriced") >= 0) {
                        logger.throwError("replacement fee too low", Logger.errors.REPLACEMENT_UNDERPRICED, {
                            transaction: tx
                        });
                    }
                }
                throw error;
            });
        });
    }

    signTransaction(transaction: TransactionRequest): Promise<string> {
        return logger.throwError("signing transactions is unsupported", Logger.errors.UNSUPPORTED_OPERATION, {
            operation: "signTransaction"
        });
    }

    sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse> {
        return this.sendUncheckedTransaction(transaction).then((hash) => {
            return poll(() => {
                return this.provider.getTransaction(hash).then((tx: TransactionResponse) => {
                    if (tx === null) { return undefined; }
                    return this.provider._wrapTransaction(tx, hash);
                });
            }, { onceBlock: this.provider }).catch((error: Error) => {
                (<any>error).transactionHash = hash;
                throw error;
            });
        });
    }

    signMessage(message: Bytes | string): Promise<string> {
        let data = ((typeof(message) === "string") ? toUtf8Bytes(message): message);
        return this.getAddress().then((address) => {

            // https://github.com/ethereum/wiki/wiki/JSON-RPC#eth_sign
            return this.provider.send("eth_sign", [ address.toLowerCase(), hexlify(data) ]);
        });
    }

    unlock(password: string): Promise<boolean> {
        let provider = this.provider;

        return this.getAddress().then(function(address) {
            return provider.send("personal_unlockAccount", [ address.toLowerCase(), password, null ]);
        });
    }
}

class UncheckedJsonRpcSigner extends JsonRpcSigner {
    sendTransaction(transaction: TransactionRequest): Promise<TransactionResponse> {
        return this.sendUncheckedTransaction(transaction).then((hash) => {
            return <TransactionResponse>{
                hash: hash,
                nonce: null,
                gasLimit: null,
                gasPrice: null,
                data: null,
                value: null,
                chainId: null,
                confirmations: 0,
                from: null,
                wait: (confirmations?: number) => { return this.provider.waitForTransaction(hash, confirmations); }
            };
        });
    }
}

const allowedTransactionKeys: { [ key: string ]: boolean } = {
    chainId: true, data: true, gasLimit: true, gasPrice:true, nonce: true, to: true, value: true
}

export class JsonRpcProvider extends BaseProvider {
    readonly connection: ConnectionInfo;

    _pendingFilter: Promise<number>;
    _nextId: number;

    constructor(url?: ConnectionInfo | string, network?: Networkish) {
        logger.checkNew(new.target, JsonRpcProvider);

        let networkOrReady: Networkish | Promise<Network> = network;

        // The network is unknown, query the JSON-RPC for it
        if (networkOrReady == null) {
            networkOrReady = new Promise((resolve, reject) => {
                setTimeout(() => {
                    this.detectNetwork().then((network) => {
                        resolve(network);
                    }, (error) => {
                        reject(error);
                    });
                }, 0);
            });
        }

        super(networkOrReady);

        // Default URL
        if (!url) { url = getStatic<() => string>(this.constructor, "defaultUrl")(); }

        if (typeof(url) === "string") {
            defineReadOnly(this, "connection",Object.freeze({
                url: url
            }));
        } else {
            defineReadOnly(this, "connection", Object.freeze(shallowCopy(url)));
        }

        this._nextId = 42;
    }

    static defaultUrl(): string {
        return "http:/\/localhost:8545";
    }

    async detectNetwork(): Promise<Network> {
        await timer(0);

        let chainId = null;
        try {
            chainId = await this.send("eth_chainId", [ ]);
        } catch (error) {
            try {
                chainId = await this.send("net_version", [ ]);
            } catch (error) { }
        }

        if (chainId != null) {
            const getNetwork = getStatic<(network: Networkish) => Network>(this.constructor, "getNetwork");
            try {
                return getNetwork(BigNumber.from(chainId).toNumber());
            } catch (error) {
                return logger.throwError("could not detect network", Logger.errors.NETWORK_ERROR, {
                    chainId: chainId,
                    serverError: error
                });
            }
        }

        return logger.throwError("could not detect network", Logger.errors.NETWORK_ERROR);
    }

    getSigner(addressOrIndex?: string | number): JsonRpcSigner {
        return new JsonRpcSigner(_constructorGuard, this, addressOrIndex);
    }

    getUncheckedSigner(addressOrIndex?: string | number): UncheckedJsonRpcSigner {
        return this.getSigner(addressOrIndex).connectUnchecked();
    }

    listAccounts(): Promise<Array<string>> {
        return this.send("eth_accounts", []).then((accounts: Array<string>) => {
            return accounts.map((a) => this.formatter.address(a));
        });
    }

    send(method: string, params: Array<any>): Promise<any> {
        let request = {
            method: method,
            params: params,
            id: (this._nextId++),
            jsonrpc: "2.0"
        };

        this.emit("debug", {
            action: "request",
            request: deepCopy(request),
            provider: this
        });

        return fetchJson(this.connection, JSON.stringify(request), getResult).then((result) => {
            this.emit("debug", {
                action: "response",
                request: request,
                response: result,
                provider: this
            });

            return result;

        }, (error) => {
            this.emit("debug", {
                action: "response",
                error: error,
                request: request,
                provider: this
            });

            throw error;
        });
    }

    prepareRequest(method: string, params: any): [ string, Array<any> ] {
        switch (method) {
            case "getBlockNumber":
                return [ "eth_blockNumber", [] ];

            case "getGasPrice":
                return [ "eth_gasPrice", [] ];

            case "getBalance":
                return [ "eth_getBalance", [ getLowerCase(params.address), params.blockTag ] ];

            case "getTransactionCount":
                return [ "eth_getTransactionCount", [ getLowerCase(params.address), params.blockTag ] ];

            case "getCode":
                return [ "eth_getCode", [ getLowerCase(params.address), params.blockTag ] ];

            case "getStorageAt":
                return [ "eth_getStorageAt", [ getLowerCase(params.address), params.position, params.blockTag ] ];

            case "sendTransaction":
                return [ "eth_sendRawTransaction", [ params.signedTransaction ] ]

            case "getBlock":
                if (params.blockTag) {
                    return [ "eth_getBlockByNumber", [ params.blockTag, !!params.includeTransactions ] ];
                } else if (params.blockHash) {
                    return [ "eth_getBlockByHash", [ params.blockHash, !!params.includeTransactions ] ];
                }
                return null;

            case "getTransaction":
                return [ "eth_getTransactionByHash", [ params.transactionHash ] ];

            case "getTransactionReceipt":
                return [ "eth_getTransactionReceipt", [ params.transactionHash ] ];

            case "call": {
                const hexlifyTransaction = getStatic<(t: TransactionRequest, a?: { [key: string]: boolean }) => { [key: string]: string }>(this.constructor, "hexlifyTransaction");
                return [ "eth_call", [ hexlifyTransaction(params.transaction, { from: true }), params.blockTag ] ];
            }

            case "estimateGas": {
                const hexlifyTransaction = getStatic<(t: TransactionRequest, a?: { [key: string]: boolean }) => { [key: string]: string }>(this.constructor, "hexlifyTransaction");
                return [ "eth_estimateGas", [ hexlifyTransaction(params.transaction, { from: true }) ] ];
            }

            case "getLogs":
                if (params.filter && params.filter.address != null) {
                    params.filter.address = getLowerCase(params.filter.address);
                }
                return [ "eth_getLogs", [ params.filter ] ];

            default:
                break;
        }

        return null;
    }

    perform(method: string, params: any): Promise<any> {
        const args = this.prepareRequest(method,  params);

        if (args == null) {
            logger.throwError(method + " not implemented", Logger.errors.NOT_IMPLEMENTED, { operation: method });
        }

        // We need a little extra logic to process errors from sendTransaction
        if (method === "sendTransaction") {
            return this.send(args[0], args[1]).catch((error) => {
                if (error.responseText) {
                    // "insufficient funds for gas * price + value"
                    if (error.responseText.indexOf("insufficient funds") > 0) {
                        logger.throwError("insufficient funds", Logger.errors.INSUFFICIENT_FUNDS, { });
                    }
                    // "nonce too low"
                    if (error.responseText.indexOf("nonce too low") > 0) {
                        logger.throwError("nonce has already been used", Logger.errors.NONCE_EXPIRED, { });
                    }
                    // "replacement transaction underpriced"
                    if (error.responseText.indexOf("replacement transaction underpriced") > 0) {
                        logger.throwError("replacement fee too low", Logger.errors.REPLACEMENT_UNDERPRICED, { });
                    }
                }
                throw error;
            });
        }

        return this.send(args[0], args[1])
    }

    _startEvent(event: Event): void {
        if (event.tag === "pending") { this._startPending(); }
        super._startEvent(event);
    }

    _startPending(): void {
        if (this._pendingFilter != null) { return; }
        let self = this;

        let pendingFilter: Promise<number> = this.send("eth_newPendingTransactionFilter", []);
        this._pendingFilter = pendingFilter;

        pendingFilter.then(function(filterId) {
            function poll() {
                self.send("eth_getFilterChanges", [ filterId ]).then(function(hashes: Array<string>) {
                    if (self._pendingFilter != pendingFilter) { return null; }

                    let seq = Promise.resolve();
                    hashes.forEach(function(hash) {
                        // @TODO: This should be garbage collected at some point... How? When?
                        self._emitted["t:" + hash.toLowerCase()] = "pending";
                        seq = seq.then(function() {
                            return self.getTransaction(hash).then(function(tx) {
                                self.emit("pending", tx);
                                return null;
                            });
                        });
                    });

                    return seq.then(function() {
                        return timer(1000);
                    });
                }).then(function() {
                    if (self._pendingFilter != pendingFilter) {
                        self.send("eth_uninstallFilter", [ filterId ]);
                        return;
                    }
                    setTimeout(function() { poll(); }, 0);

                    return null;
                }).catch((error: Error) => { });
            }
            poll();

            return filterId;
        }).catch((error: Error) => { });
    }

    _stopEvent(event: Event): void {
        if (event.tag === "pending" && this.listenerCount("pending") === 0) {
            this._pendingFilter = null;
        }
        super._stopEvent(event);
    }


    // Convert an ethers.js transaction into a JSON-RPC transaction
    //  - gasLimit => gas
    //  - All values hexlified
    //  - All numeric values zero-striped
    //  - All addresses are lowercased
    // NOTE: This allows a TransactionRequest, but all values should be resolved
    //       before this is called
    // @TODO: This will likely be removed in future versions and prepareRequest
    //        will be the preferred method for this.
    static hexlifyTransaction(transaction: TransactionRequest, allowExtra?: { [key: string]: boolean }): { [key: string]: string } {
        // Check only allowed properties are given
        const allowed = shallowCopy(allowedTransactionKeys);
        if (allowExtra) {
            for (let key in allowExtra) {
                if (allowExtra[key]) { allowed[key] = true; }
            }
        }
        checkProperties(transaction, allowed);

        const result: { [key: string]: string } = {};

        // Some nodes (INFURA ropsten; INFURA mainnet is fine) do not like leading zeros.
        ["gasLimit", "gasPrice", "nonce", "value"].forEach(function(key) {
            if ((<any>transaction)[key] == null) { return; }
            const value = hexValue((<any>transaction)[key]);
            if (key === "gasLimit") { key = "gas"; }
            result[key] = value;
        });

        ["from", "to", "data"].forEach(function(key) {
            if ((<any>transaction)[key] == null) { return; }
            result[key] = hexlify((<any>transaction)[key]);
        });

        return result;
    }
}
