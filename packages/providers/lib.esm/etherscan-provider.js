"use strict";
import { hexlify, hexValue } from "@ethersproject/bytes";
import { deepCopy, defineReadOnly } from "@ethersproject/properties";
import { fetchJson } from "@ethersproject/web";
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);
import { BaseProvider } from "./base-provider";
// The transaction has already been sanitized by the calls in Provider
function getTransactionString(transaction) {
    let result = [];
    for (let key in transaction) {
        if (transaction[key] == null) {
            continue;
        }
        let value = hexlify(transaction[key]);
        if ({ gasLimit: true, gasPrice: true, nonce: true, value: true }[key]) {
            value = hexValue(value);
        }
        result.push(key + "=" + value);
    }
    return result.join("&");
}
function getResult(result) {
    // getLogs, getHistory have weird success responses
    if (result.status == 0 && (result.message === "No records found" || result.message === "No transactions found")) {
        return result.result;
    }
    if (result.status != 1 || result.message != "OK") {
        // @TODO: not any
        let error = new Error("invalid response");
        error.result = JSON.stringify(result);
        throw error;
    }
    return result.result;
}
function getJsonResult(result) {
    if (result.jsonrpc != "2.0") {
        // @TODO: not any
        let error = new Error("invalid response");
        error.result = JSON.stringify(result);
        throw error;
    }
    if (result.error) {
        // @TODO: not any
        let error = new Error(result.error.message || "unknown error");
        if (result.error.code) {
            error.code = result.error.code;
        }
        if (result.error.data) {
            error.data = result.error.data;
        }
        throw error;
    }
    return result.result;
}
// The blockTag was normalized as a string by the Provider pre-perform operations
function checkLogTag(blockTag) {
    if (blockTag === "pending") {
        throw new Error("pending not supported");
    }
    if (blockTag === "latest") {
        return blockTag;
    }
    return parseInt(blockTag.substring(2), 16);
}
export class EtherscanProvider extends BaseProvider {
    constructor(network, apiKey) {
        logger.checkNew(new.target, EtherscanProvider);
        super(network);
        let name = "invalid";
        if (this.network) {
            name = this.network.name;
        }
        let baseUrl = null;
        switch (name) {
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
        defineReadOnly(this, "apiKey", apiKey);
    }
    perform(method, params) {
        let url = this.baseUrl;
        let apiKey = "";
        if (this.apiKey) {
            apiKey += "&apikey=" + this.apiKey;
        }
        let get = (url, procFunc) => {
            this.emit("debug", {
                action: "request",
                request: url,
                provider: this
            });
            return fetchJson(url, null, procFunc || getJsonResult).then((result) => {
                this.emit("debug", {
                    action: "response",
                    request: url,
                    response: deepCopy(result),
                    provider: this
                });
                return result;
            });
        };
        switch (method) {
            case "getBlockNumber":
                url += "/api?module=proxy&action=eth_blockNumber" + apiKey;
                return get(url);
            case "getGasPrice":
                url += "/api?module=proxy&action=eth_gasPrice" + apiKey;
                return get(url);
            case "getBalance":
                // Returns base-10 result
                url += "/api?module=account&action=balance&address=" + params.address;
                url += "&tag=" + params.blockTag + apiKey;
                return get(url, getResult);
            case "getTransactionCount":
                url += "/api?module=proxy&action=eth_getTransactionCount&address=" + params.address;
                url += "&tag=" + params.blockTag + apiKey;
                return get(url);
            case "getCode":
                url += "/api?module=proxy&action=eth_getCode&address=" + params.address;
                url += "&tag=" + params.blockTag + apiKey;
                return get(url, getJsonResult);
            case "getStorageAt":
                url += "/api?module=proxy&action=eth_getStorageAt&address=" + params.address;
                url += "&position=" + params.position;
                url += "&tag=" + params.blockTag + apiKey;
                return get(url, getJsonResult);
            case "sendTransaction":
                url += "/api?module=proxy&action=eth_sendRawTransaction&hex=" + params.signedTransaction;
                url += apiKey;
                return get(url).catch((error) => {
                    if (error.responseText) {
                        // "Insufficient funds. The account you tried to send transaction from does not have enough funds. Required 21464000000000 and got: 0"
                        if (error.responseText.toLowerCase().indexOf("insufficient funds") >= 0) {
                            logger.throwError("insufficient funds", Logger.errors.INSUFFICIENT_FUNDS, {});
                        }
                        // "Transaction with the same hash was already imported."
                        if (error.responseText.indexOf("same hash was already imported") >= 0) {
                            logger.throwError("nonce has already been used", Logger.errors.NONCE_EXPIRED, {});
                        }
                        // "Transaction gas price is too low. There is another transaction with same nonce in the queue. Try increasing the gas price or incrementing the nonce."
                        if (error.responseText.indexOf("another transaction with same nonce") >= 0) {
                            logger.throwError("replacement fee too low", Logger.errors.REPLACEMENT_UNDERPRICED, {});
                        }
                    }
                    throw error;
                });
            case "getBlock":
                if (params.blockTag) {
                    url += "/api?module=proxy&action=eth_getBlockByNumber&tag=" + params.blockTag;
                    if (params.includeTransactions) {
                        url += "&boolean=true";
                    }
                    else {
                        url += "&boolean=false";
                    }
                    url += apiKey;
                    return get(url);
                }
                throw new Error("getBlock by blockHash not implmeneted");
            case "getTransaction":
                url += "/api?module=proxy&action=eth_getTransactionByHash&txhash=" + params.transactionHash;
                url += apiKey;
                return get(url);
            case "getTransactionReceipt":
                url += "/api?module=proxy&action=eth_getTransactionReceipt&txhash=" + params.transactionHash;
                url += apiKey;
                return get(url);
            case "call": {
                let transaction = getTransactionString(params.transaction);
                if (transaction) {
                    transaction = "&" + transaction;
                }
                url += "/api?module=proxy&action=eth_call" + transaction;
                //url += "&tag=" + params.blockTag + apiKey;
                if (params.blockTag !== "latest") {
                    throw new Error("EtherscanProvider does not support blockTag for call");
                }
                url += apiKey;
                return get(url);
            }
            case "estimateGas": {
                let transaction = getTransactionString(params.transaction);
                if (transaction) {
                    transaction = "&" + transaction;
                }
                url += "/api?module=proxy&action=eth_estimateGas&" + transaction;
                url += apiKey;
                return get(url);
            }
            case "getLogs":
                url += "/api?module=logs&action=getLogs";
                try {
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
                            throw new Error("unsupported topic format");
                        }
                        let topic0 = params.filter.topics[0];
                        if (typeof (topic0) !== "string" || topic0.length !== 66) {
                            throw new Error("unsupported topic0 format");
                        }
                        url += "&topic0=" + topic0;
                    }
                }
                catch (error) {
                    return Promise.reject(error);
                }
                url += apiKey;
                let self = this;
                return get(url, getResult).then(function (logs) {
                    let txs = {};
                    let seq = Promise.resolve();
                    logs.forEach(function (log) {
                        seq = seq.then(function () {
                            if (log.blockHash != null) {
                                return null;
                            }
                            log.blockHash = txs[log.transactionHash];
                            if (log.blockHash == null) {
                                return self.getTransaction(log.transactionHash).then(function (tx) {
                                    txs[log.transactionHash] = tx.blockHash;
                                    log.blockHash = tx.blockHash;
                                    return null;
                                });
                            }
                            return null;
                        });
                    });
                    return seq.then(function () {
                        return logs;
                    });
                });
            case "getEtherPrice":
                if (this.network.name !== "homestead") {
                    return Promise.resolve(0.0);
                }
                url += "/api?module=stats&action=ethprice";
                url += apiKey;
                return get(url, getResult).then(function (result) {
                    return parseFloat(result.ethusd);
                });
            default:
                break;
        }
        return super.perform(method, params);
    }
    // @TODO: Allow startBlock and endBlock to be Promises
    getHistory(addressOrName, startBlock, endBlock) {
        let url = this.baseUrl;
        let apiKey = "";
        if (this.apiKey) {
            apiKey += "&apikey=" + this.apiKey;
        }
        if (startBlock == null) {
            startBlock = 0;
        }
        if (endBlock == null) {
            endBlock = 99999999;
        }
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
            return fetchJson(url, null, getResult).then((result) => {
                this.emit("debug", {
                    action: "response",
                    request: url,
                    response: deepCopy(result),
                    provider: this
                });
                let output = [];
                result.forEach((tx) => {
                    ["contractAddress", "to"].forEach(function (key) {
                        if (tx[key] == "") {
                            delete tx[key];
                        }
                    });
                    if (tx.creates == null && tx.contractAddress != null) {
                        tx.creates = tx.contractAddress;
                    }
                    let item = this.formatter.transactionResponse(tx);
                    if (tx.timeStamp) {
                        item.timestamp = parseInt(tx.timeStamp);
                    }
                    output.push(item);
                });
                return output;
            });
        });
    }
}
