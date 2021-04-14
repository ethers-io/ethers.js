"use strict";

import { BlockTag, TransactionRequest, TransactionResponse } from "@ethersproject/abstract-provider";
import { hexlify, hexValue, isHexString } from "@ethersproject/bytes";
import { Network, Networkish } from "@ethersproject/networks";
import { deepCopy, defineReadOnly } from "@ethersproject/properties";
import { accessListify } from "@ethersproject/transactions";
import { ConnectionInfo, fetchJson } from "@ethersproject/web";

import { showThrottleMessage } from "./formatter";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { BaseProvider } from "./base-provider";


// The transaction has already been sanitized by the calls in Provider
function getTransactionPostData(transaction: TransactionRequest): Record<string, string> {
    const result: Record<string, string> = { };
    for (let key in transaction) {
        if ((<any>transaction)[key] == null) { continue; }
        let value = (<any>transaction)[key];
        // Quantity-types require no leading zero, unless 0
        if ((<any>{ type: true, gasLimit: true, gasPrice: true, nonce: true, value: true })[key]) {
            value = hexValue(hexlify(value));
        } else if (key === "accessList") {
            const sets = accessListify(value);
            value = '[' + sets.map((set) => {
                return `{address:"${ set.address }",storageKeys:["${ set.storageKeys.join('","') }"]}`;
            }).join(",") + "]";
        } else {
            value = hexlify(value);
        }
        result[key] = value;
    }
    return result;
}

function getResult(result: { status?: number, message?: string, result?: any }): any {
    // getLogs, getHistory have weird success responses
    if (result.status == 0 && (result.message === "No records found" || result.message === "No transactions found")) {
        return result.result;
    }

    if (result.status != 1 || result.message != "OK") {
        const error: any = new Error("invalid response");
        error.result = JSON.stringify(result);
        if ((result.result || "").toLowerCase().indexOf("rate limit") >= 0) {
            error.throttleRetry = true;
        }
        throw error;
    }

    return result.result;
}

function getJsonResult(result: { jsonrpc: string, result?: any, error?: { code?: number, data?: any, message?: string} } ): any {
    // This response indicates we are being throttled
    if (result && (<any>result).status == 0 && (<any>result).message == "NOTOK" && (result.result || "").toLowerCase().indexOf("rate limit") >= 0) {
        const error: any = new Error("throttled response");
        error.result = JSON.stringify(result);
        error.throttleRetry = true;
        throw error;
    }

    if (result.jsonrpc != "2.0") {
        // @TODO: not any
        const error: any = new Error("invalid response");
        error.result = JSON.stringify(result);
        throw error;
    }

    if (result.error) {
        // @TODO: not any
        const error: any = new Error(result.error.message || "unknown error");
        if (result.error.code) { error.code = result.error.code; }
        if (result.error.data) { error.data = result.error.data; }
        throw error;
    }

    return result.result;
}

// The blockTag was normalized as a string by the Provider pre-perform operations
function checkLogTag(blockTag: string): number | "latest" {
    if (blockTag === "pending") { throw new Error("pending not supported"); }
    if (blockTag === "latest") { return blockTag; }

    return parseInt(blockTag.substring(2), 16);
}


const defaultApiKey = "9D13ZE7XSBTJ94N9BNJ2MA33VMAY2YPIRB";

function checkError(method: string, error: any, transaction: any): any {
    // Undo the "convenience" some nodes are attempting to prevent backwards
    // incompatibility; maybe for v6 consider forwarding reverts as errors
    if (method === "call" && error.code === Logger.errors.SERVER_ERROR) {
        const e = error.error;
        if (e && e.message.match("reverted") && isHexString(e.data)) {
            return e.data;
        }
    }

    // Get the message from any nested error structure
    let message = error.message;
    if (error.code === Logger.errors.SERVER_ERROR) {
        if (error.error && typeof(error.error.message) === "string") {
            message = error.error.message;
        } else if (typeof(error.body) === "string") {
            message = error.body;
        } else if (typeof(error.responseText) === "string") {
            message = error.responseText;
        }
    }
    message = (message || "").toLowerCase();

    // "Insufficient funds. The account you tried to send transaction from does not have enough funds. Required 21464000000000 and got: 0"
    if (message.match(/insufficient funds/)) {
        logger.throwError("insufficient funds for intrinsic transaction cost", Logger.errors.INSUFFICIENT_FUNDS, {
           error, method, transaction
        });
    }

    // "Transaction with the same hash was already imported."
    if (message.match(/same hash was already imported|transaction nonce is too low/)) {
        logger.throwError("nonce has already been used", Logger.errors.NONCE_EXPIRED, {
           error, method, transaction
        });
    }

    // "Transaction gas price is too low. There is another transaction with same nonce in the queue. Try increasing the gas price or incrementing the nonce."
    if (message.match(/another transaction with same nonce/)) {
         logger.throwError("replacement fee too low", Logger.errors.REPLACEMENT_UNDERPRICED, {
            error, method, transaction
         });
    }

    if (message.match(/execution failed due to an exception/)) {
        logger.throwError("cannot estimate gas; transaction may fail or may require manual gas limit", Logger.errors.UNPREDICTABLE_GAS_LIMIT, {
            error, method, transaction
        });
    }

    throw error;
}

export class EtherscanProvider extends BaseProvider{
    readonly baseUrl: string;
    readonly apiKey: string;

    constructor(network?: Networkish, apiKey?: string) {
        logger.checkNew(new.target, EtherscanProvider);

        super(network);

        let name = "invalid";
        if (this.network) { name = this.network.name; }

        let baseUrl = null;
        switch(name) {
            case "homestead":
                baseUrl = "https://api.etherscan.io";
                break;
            case "ropsten":
                baseUrl = "https://api-ropsten.etherscan.io";
                break;
            case "rinkeby":
                baseUrl = "https://api-rinkeby.etherscan.io";
                break;
            case "kovan":
                baseUrl = "https://api-kovan.etherscan.io";
                break;
            case "goerli":
                baseUrl = "https://api-goerli.etherscan.io";
                break;
            default:
                throw new Error("unsupported network");
        }

        defineReadOnly(this, "baseUrl", baseUrl);
        defineReadOnly(this, "apiKey", apiKey || defaultApiKey);
    }

    async detectNetwork(): Promise<Network> {
        return this.network;
    }

    async perform(method: string, params: any): Promise<any> {
        let url = this.baseUrl + "/api";

        let apiKey = "";
        if (this.apiKey) { apiKey += "&apikey=" + this.apiKey; }

        const get = async (url: string, payload: Record<string, string>, procFunc?: (value: any) => any): Promise<any> => {
            this.emit("debug", {
                action: "request",
                request: url,
                provider: this
            });


            const connection: ConnectionInfo = {
                url: url,
                throttleSlotInterval: 1000,
                throttleCallback: (attempt: number, url: string) => {
                    if (this.isCommunityResource()) {
                        showThrottleMessage();
                    }
                    return Promise.resolve(true);
                }
            };

            let payloadStr: string = null;
            if (payload) {
                connection.headers = { "content-type": "application/x-www-form-urlencoded; charset=UTF-8" };
                payloadStr = Object.keys(payload).map((key) => {
                    return `${ key }=${ payload[key] }`
                }).join("&");
            }

            const result = await fetchJson(connection, payloadStr, procFunc || getJsonResult);

            this.emit("debug", {
                action: "response",
                request: url,
                response: deepCopy(result),
                provider: this
            });

            return result;
        };

        switch (method) {
            case "getBlockNumber":
                url += "?module=proxy&action=eth_blockNumber" + apiKey;
                return get(url, null);

            case "getGasPrice":
                url += "?module=proxy&action=eth_gasPrice" + apiKey;
                return get(url, null);

            case "getBalance":
                // Returns base-10 result
                url += "?module=account&action=balance&address=" + params.address;
                url += "&tag=" + params.blockTag + apiKey;
                return get(url, null, getResult);

            case "getTransactionCount":
                url += "?module=proxy&action=eth_getTransactionCount&address=" + params.address;
                url += "&tag=" + params.blockTag + apiKey;
                return get(url, null);


            case "getCode":
                url += "?module=proxy&action=eth_getCode&address=" + params.address;
                url += "&tag=" + params.blockTag + apiKey;
                return get(url, null);

            case "getStorageAt":
                url += "?module=proxy&action=eth_getStorageAt&address=" + params.address;
                url += "&position=" + params.position;
                url += "&tag=" + params.blockTag + apiKey;
                return get(url, null);


            case "sendTransaction":
                return get(url, {
                    module: "proxy",
                    action: "eth_sendRawTransaction",
                    hex: params.signedTransaction,
                    apikey: this.apiKey
                }).catch((error) => {
                    return checkError("sendTransaction", error, params.signedTransaction);
                });

            case "getBlock":
                if (params.blockTag) {
                    url += "?module=proxy&action=eth_getBlockByNumber&tag=" + params.blockTag;
                    if (params.includeTransactions) {
                        url += "&boolean=true";
                    } else {
                        url += "&boolean=false";
                    }
                    url += apiKey;
                    return get(url, null);
                }
                throw new Error("getBlock by blockHash not implemented");

            case "getTransaction":
                url += "?module=proxy&action=eth_getTransactionByHash&txhash=" + params.transactionHash;
                url += apiKey;
                return get(url, null);

            case "getTransactionReceipt":
                url += "?module=proxy&action=eth_getTransactionReceipt&txhash=" + params.transactionHash;
                url += apiKey;
                return get(url, null);


            case "call": {
                if (params.blockTag !== "latest") {
                    throw new Error("EtherscanProvider does not support blockTag for call");
                }

                const postData = getTransactionPostData(params.transaction);
                postData.module = "proxy";
                postData.action = "eth_call";
                postData.apikey = this.apiKey;

                try {
                    return await get(url, postData);
                } catch (error) {
                    return checkError("call", error, params.transaction);
                }
            }

            case "estimateGas": {
                const postData = getTransactionPostData(params.transaction);
                postData.module = "proxy";
                postData.action = "eth_estimateGas";
                postData.apikey = this.apiKey;

                try {
                    return await get(url, postData);
                } catch (error) {
                    return checkError("estimateGas", error, params.transaction);
                }
            }

            case "getLogs": {
                url += "?module=logs&action=getLogs";

                if (params.filter.fromBlock) {
                    url += "&fromBlock=" + checkLogTag(params.filter.fromBlock);
                }

                if (params.filter.toBlock) {
                    url += "&toBlock=" + checkLogTag(params.filter.toBlock);
                }

                if (params.filter.address) {
                    url += "&address=" + params.filter.address;
                }

                // @TODO: We can handle slightly more complicated logs using the logs API
                if (params.filter.topics && params.filter.topics.length > 0) {
                    if (params.filter.topics.length > 1) {
                        logger.throwError("unsupported topic count", Logger.errors.UNSUPPORTED_OPERATION, { topics: params.filter.topics });
                    }

                    if (params.filter.topics.length === 1) {
                        const topic0 = params.filter.topics[0];
                        if (typeof(topic0) !== "string" || topic0.length !== 66) {
                            logger.throwError("unsupported topic format", Logger.errors.UNSUPPORTED_OPERATION, { topic0: topic0 });
                        }
                        url += "&topic0=" + topic0;
                    }
                }

                url += apiKey;

                const logs: Array<any> = await get(url, null, getResult);

                // Cache txHash => blockHash
                let blocks: { [tag: string]: string } = {};

                // Add any missing blockHash to the logs
                for (let i = 0; i < logs.length; i++) {
                    const log = logs[i];
                    if (log.blockHash != null) { continue; }
                    if (blocks[log.blockNumber] == null) {
                        const block = await this.getBlock(log.blockNumber);
                        if (block) {
                            blocks[log.blockNumber] = block.hash;
                        }
                    }
                    log.blockHash = blocks[log.blockNumber];
                }

                return logs;
            }

            case "getEtherPrice":
                if (this.network.name !== "homestead") { return 0.0; }
                url += "?module=stats&action=ethprice";
                url += apiKey;
                return parseFloat((await get(url, null, getResult)).ethusd);

            default:
                break;
         }

        return super.perform(method, params);
    }

    // @TODO: Allow startBlock and endBlock to be Promises
    getHistory(addressOrName: string | Promise<string>, startBlock?: BlockTag, endBlock?: BlockTag): Promise<Array<TransactionResponse>> {

        let url = this.baseUrl;

        let apiKey = "";
        if (this.apiKey) { apiKey += "&apikey=" + this.apiKey; }

        if (startBlock == null) { startBlock = 0; }
        if (endBlock == null) { endBlock = 99999999; }

        return this.resolveName(addressOrName).then((address) => {
            url += "/api?module=account&action=txlist&address=" + address;
            url += "&startblock=" + startBlock;
            url += "&endblock=" + endBlock;
            url += "&sort=asc" + apiKey;

            this.emit("debug", {
                action: "request",
                request: url,
                provider: this
            });

            const connection = {
                url: url,
                throttleSlotInterval: 1000,
                throttleCallback: (attempt: number, url: string) => {
                    if (this.apiKey === defaultApiKey) {
                        showThrottleMessage();
                    }
                    return Promise.resolve(true);
                }
            }

            return fetchJson(connection, null, getResult).then((result: Array<any>) => {
                this.emit("debug", {
                    action: "response",
                    request: url,
                    response: deepCopy(result),
                    provider: this
                });

                let output: Array<TransactionResponse> = [];
                result.forEach((tx) => {
                    ["contractAddress", "to"].forEach(function(key) {
                        if (tx[key] == "") { delete tx[key]; }
                    });
                    if (tx.creates == null && tx.contractAddress != null) {
                        tx.creates = tx.contractAddress;
                    }
                    let item = this.formatter.transactionResponse(tx);
                    if (tx.timeStamp) { item.timestamp = parseInt(tx.timeStamp); }
                    output.push(item);
                });
                return output;
            });
        });
    }

    isCommunityResource(): boolean {
        return (this.apiKey === defaultApiKey);
    }
}
