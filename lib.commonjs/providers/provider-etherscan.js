"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EtherscanProvider = exports.EtherscanPlugin = void 0;
const data_js_1 = require("../utils/data.js");
const maths_js_1 = require("../utils/maths.js");
const errors_js_1 = require("../utils/errors.js");
const properties_js_1 = require("../utils/properties.js");
const utf8_js_1 = require("../utils/utf8.js");
const fetch_js_1 = require("../utils/fetch.js");
if (false) {
    console.log(data_js_1.isHexString, errors_js_1.isError);
} // @TODO
const abstract_provider_js_1 = require("./abstract-provider.js");
const network_js_1 = require("./network.js");
const plugins_network_js_1 = require("./plugins-network.js");
const logger_js_1 = require("../utils/logger.js");
const defaultApiKey = "9D13ZE7XSBTJ94N9BNJ2MA33VMAY2YPIRB";
const EtherscanPluginId = "org.ethers.plugins.etherscan";
class EtherscanPlugin extends plugins_network_js_1.NetworkPlugin {
    baseUrl;
    communityApiKey;
    constructor(baseUrl, communityApiKey) {
        super(EtherscanPluginId);
        //if (communityApiKey == null) { communityApiKey = null; }
        (0, properties_js_1.defineProperties)(this, { baseUrl, communityApiKey });
    }
    clone() {
        return new EtherscanPlugin(this.baseUrl, this.communityApiKey);
    }
}
exports.EtherscanPlugin = EtherscanPlugin;
class EtherscanProvider extends abstract_provider_js_1.AbstractProvider {
    network;
    apiKey;
    constructor(_network, apiKey) {
        super();
        const network = network_js_1.Network.from(_network);
        if (apiKey == null) {
            const plugin = network.getPlugin(EtherscanPluginId);
            if (plugin) {
                apiKey = plugin.communityApiKey;
            }
            else {
                apiKey = defaultApiKey;
            }
        }
        (0, properties_js_1.defineProperties)(this, { apiKey, network });
        // Test that the network is supported by Etherscan
        this.getBaseUrl();
    }
    getBaseUrl() {
        const plugin = this.network.getPlugin(EtherscanPluginId);
        if (plugin) {
            return plugin.baseUrl;
        }
        switch (this.network.name) {
            case "homestead":
                return "https:/\/api.etherscan.io";
            case "ropsten":
                return "https:/\/api-ropsten.etherscan.io";
            case "rinkeby":
                return "https:/\/api-rinkeby.etherscan.io";
            case "kovan":
                return "https:/\/api-kovan.etherscan.io";
            case "goerli":
                return "https:/\/api-goerli.etherscan.io";
            default:
        }
        return logger_js_1.logger.throwArgumentError("unsupported network", "network", this.network);
    }
    getUrl(module, params) {
        const query = Object.keys(params).reduce((accum, key) => {
            const value = params[key];
            if (value != null) {
                accum += `&${key}=${value}`;
            }
            return accum;
        }, "");
        const apiKey = ((this.apiKey) ? `&apikey=${this.apiKey}` : "");
        return `${this.getBaseUrl()}/api?module=${module}${query}${apiKey}`;
    }
    getPostUrl() {
        return `${this.getBaseUrl()}/api`;
    }
    getPostData(module, params) {
        params.module = module;
        params.apikey = this.apiKey;
        return params;
    }
    async detectNetwork() {
        return this.network;
    }
    async fetch(module, params, post) {
        const url = (post ? this.getPostUrl() : this.getUrl(module, params));
        const payload = (post ? this.getPostData(module, params) : null);
        /*
        this.emit("debug", {
            action: "request",
            request: url,
            provider: this
        });
        */
        const request = new fetch_js_1.FetchRequest(url);
        request.processFunc = async (request, response) => {
            const result = response.hasBody() ? JSON.parse((0, utf8_js_1.toUtf8String)(response.body)) : {};
            const throttle = ((typeof (result.result) === "string") ? result.result : "").toLowerCase().indexOf("rate limit") >= 0;
            if (module === "proxy") {
                // This JSON response indicates we are being throttled
                if (result && result.status == 0 && result.message == "NOTOK" && throttle) {
                    response.throwThrottleError(result.result);
                }
            }
            else {
                if (throttle) {
                    response.throwThrottleError(result.result);
                }
            }
            return response;
        };
        // @TODO:
        //throttleSlotInterval: 1000,
        if (payload) {
            request.setHeader("content-type", "application/x-www-form-urlencoded; charset=UTF-8");
            request.body = Object.keys(payload).map((k) => `${k}=${payload[k]}`).join("&");
        }
        const response = await request.send();
        response.assertOk();
        if (!response.hasBody()) {
            throw new Error();
        }
        /*
        this.emit("debug", {
            action: "response",
            request: url,
            response: deepCopy(result),
            provider: this
        });
        */
        const result = JSON.parse((0, utf8_js_1.toUtf8String)(response.body));
        if (module === "proxy") {
            if (result.jsonrpc != "2.0") {
                // @TODO: not any
                const error = new Error("invalid response");
                error.result = JSON.stringify(result);
                throw error;
            }
            if (result.error) {
                // @TODO: not any
                const error = new Error(result.error.message || "unknown error");
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
        else {
            // getLogs, getHistory have weird success responses
            if (result.status == 0 && (result.message === "No records found" || result.message === "No transactions found")) {
                return result.result;
            }
            if (result.status != 1 || result.message != "OK") {
                const error = new Error("invalid response");
                error.result = JSON.stringify(result);
                //        if ((result.result || "").toLowerCase().indexOf("rate limit") >= 0) {
                //            error.throttleRetry = true;
                //        }
                throw error;
            }
            return result.result;
        }
    }
    // The transaction has already been sanitized by the calls in Provider
    _getTransactionPostData(transaction) {
        const result = {};
        for (let key in transaction) {
            if (transaction[key] == null) {
                continue;
            }
            let value = transaction[key];
            if (key === "type" && value === 0) {
                continue;
            }
            // Quantity-types require no leading zero, unless 0
            if ({ type: true, gasLimit: true, gasPrice: true, maxFeePerGs: true, maxPriorityFeePerGas: true, nonce: true, value: true }[key]) {
                value = (0, maths_js_1.toQuantity)((0, data_js_1.hexlify)(value));
            }
            else if (key === "accessList") {
                value = "[" + this.network.formatter.accessList(value).map((set) => {
                    return `{address:"${set.address}",storageKeys:["${set.storageKeys.join('","')}"]}`;
                }).join(",") + "]";
            }
            else {
                value = (0, data_js_1.hexlify)(value);
            }
            result[key] = value;
        }
        return result;
    }
    _checkError(req, error, transaction) {
        /*
            let body = "";
            if (isError(error, Logger.Errors.SERVER_ERROR) && error.response && error.response.hasBody()) {
                body = toUtf8String(error.response.body);
            }
            console.log(body);
    
            // Undo the "convenience" some nodes are attempting to prevent backwards
            // incompatibility; maybe for v6 consider forwarding reverts as errors
            if (method === "call" && body) {
    
                // Etherscan keeps changing their string
                if (body.match(/reverted/i) || body.match(/VM execution error/i)) {
    
                    // Etherscan prefixes the data like "Reverted 0x1234"
                    let data = e.data;
                    if (data) { data = "0x" + data.replace(/^.*0x/i, ""); }
                    if (!isHexString(data)) { data = "0x"; }
    
                    logger.throwError("call exception", Logger.Errors.CALL_EXCEPTION, {
                        error, data
                    });
                }
            }
    
            // Get the message from any nested error structure
            let message = error.message;
            if (isError(error, Logger.Errors.SERVER_ERROR)) {
                if (error.error && typeof(error.error.message) === "string") {
                    message = error.error.message;
                } else if (typeof(error.body) === "string") {
                    message = error.body;
                } else if (typeof(error.responseText) === "string") {
                    message = error.responseText;
                }
            }
            message = (message || "").toLowerCase();
    
            // "Insufficient funds. The account you tried to send transaction from
            // does not have enough funds. Required 21464000000000 and got: 0"
            if (message.match(/insufficient funds/)) {
                logger.throwError("insufficient funds for intrinsic transaction cost", Logger.Errors.INSUFFICIENT_FUNDS, {
                   error, transaction, info: { method }
                });
            }
    
            // "Transaction with the same hash was already imported."
            if (message.match(/same hash was already imported|transaction nonce is too low|nonce too low/)) {
                logger.throwError("nonce has already been used", Logger.Errors.NONCE_EXPIRED, {
                   error, transaction, info: { method }
                });
            }
    
            // "Transaction gas price is too low. There is another transaction with
            // same nonce in the queue. Try increasing the gas price or incrementing the nonce."
            if (message.match(/another transaction with same nonce/)) {
                 logger.throwError("replacement fee too low", Logger.Errors.REPLACEMENT_UNDERPRICED, {
                    error, transaction, info: { method }
                 });
            }
    
            if (message.match(/execution failed due to an exception|execution reverted/)) {
                logger.throwError("cannot estimate gas; transaction may fail or may require manual gas limit", Logger.Errors.UNPREDICTABLE_GAS_LIMIT, {
                    error, transaction, info: { method }
                });
            }
    */
        throw error;
    }
    async _detectNetwork() {
        return this.network;
    }
    async _perform(req) {
        switch (req.method) {
            case "chainId":
                return this.network.chainId;
            case "getBlockNumber":
                return this.fetch("proxy", { action: "eth_blockNumber" });
            case "getGasPrice":
                return this.fetch("proxy", { action: "eth_gasPrice" });
            case "getBalance":
                // Returns base-10 result
                return this.fetch("account", {
                    action: "balance",
                    address: req.address,
                    tag: req.blockTag
                });
            case "getTransactionCount":
                return this.fetch("proxy", {
                    action: "eth_getTransactionCount",
                    address: req.address,
                    tag: req.blockTag
                });
            case "getCode":
                return this.fetch("proxy", {
                    action: "eth_getCode",
                    address: req.address,
                    tag: req.blockTag
                });
            case "getStorageAt":
                return this.fetch("proxy", {
                    action: "eth_getStorageAt",
                    address: req.address,
                    position: req.position,
                    tag: req.blockTag
                });
            case "broadcastTransaction":
                return this.fetch("proxy", {
                    action: "eth_sendRawTransaction",
                    hex: req.signedTransaction
                }, true).catch((error) => {
                    return this._checkError(req, error, req.signedTransaction);
                });
            case "getBlock":
                if ("blockTag" in req) {
                    return this.fetch("proxy", {
                        action: "eth_getBlockByNumber",
                        tag: req.blockTag,
                        boolean: (req.includeTransactions ? "true" : "false")
                    });
                }
                return logger_js_1.logger.throwError("getBlock by blockHash not supported by Etherscan", "UNSUPPORTED_OPERATION", {
                    operation: "getBlock(blockHash)"
                });
            case "getTransaction":
                return this.fetch("proxy", {
                    action: "eth_getTransactionByHash",
                    txhash: req.hash
                });
            case "getTransactionReceipt":
                return this.fetch("proxy", {
                    action: "eth_getTransactionReceipt",
                    txhash: req.hash
                });
            case "call": {
                if (req.blockTag !== "latest") {
                    throw new Error("EtherscanProvider does not support blockTag for call");
                }
                const postData = this._getTransactionPostData(req.transaction);
                postData.module = "proxy";
                postData.action = "eth_call";
                try {
                    return await this.fetch("proxy", postData, true);
                }
                catch (error) {
                    return this._checkError(req, error, req.transaction);
                }
            }
            case "estimateGas": {
                const postData = this._getTransactionPostData(req.transaction);
                postData.module = "proxy";
                postData.action = "eth_estimateGas";
                try {
                    return await this.fetch("proxy", postData, true);
                }
                catch (error) {
                    return this._checkError(req, error, req.transaction);
                }
            }
            /*
                        case "getLogs": {
                            // Needs to complain if more than one address is passed in
                            const args: Record<string, any> = { action: "getLogs" }
            
                            if (params.filter.fromBlock) {
                                args.fromBlock = checkLogTag(params.filter.fromBlock);
                            }
            
                            if (params.filter.toBlock) {
                                args.toBlock = checkLogTag(params.filter.toBlock);
                            }
            
                            if (params.filter.address) {
                                args.address = params.filter.address;
                            }
            
                            // @TODO: We can handle slightly more complicated logs using the logs API
                            if (params.filter.topics && params.filter.topics.length > 0) {
                                if (params.filter.topics.length > 1) {
                                    logger.throwError("unsupported topic count", Logger.Errors.UNSUPPORTED_OPERATION, { topics: params.filter.topics });
                                }
                                if (params.filter.topics.length === 1) {
                                    const topic0 = params.filter.topics[0];
                                    if (typeof(topic0) !== "string" || topic0.length !== 66) {
                                        logger.throwError("unsupported topic format", Logger.Errors.UNSUPPORTED_OPERATION, { topic0: topic0 });
                                    }
                                    args.topic0 = topic0;
                                }
                            }
            
                            const logs: Array<any> = await this.fetch("logs", args);
            
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
            */
            default:
                break;
        }
        return super._perform(req);
    }
    async getNetwork() {
        return this.network;
    }
    async getEtherPrice() {
        if (this.network.name !== "homestead") {
            return 0.0;
        }
        return parseFloat((await this.fetch("stats", { action: "ethprice" })).ethusd);
    }
    isCommunityResource() {
        const plugin = this.network.getPlugin(EtherscanPluginId);
        if (plugin) {
            return (plugin.communityApiKey === this.apiKey);
        }
        return (defaultApiKey === this.apiKey);
    }
}
exports.EtherscanProvider = EtherscanProvider;
/*
(async function() {
    const provider = new EtherscanProvider();
    console.log(provider);
    console.log(await provider.getBlockNumber());
    / *
    provider.on("block", (b) => {
        console.log("BB", b);
    });
    console.log(await provider.getTransactionReceipt("0xa5ded92f548e9f362192f9ab7e5b3fbc9b5a919a868e29247f177d49ce38de6e"));

    provider.once("0xa5ded92f548e9f362192f9ab7e5b3fbc9b5a919a868e29247f177d49ce38de6e", (tx) => {
        console.log("TT", tx);
    });
    * /
    try {
        console.log(await provider.getBlock(100));
    } catch (error) {
        console.log(error);
    }

    try {
        console.log(await provider.getBlock(13821768));
    } catch (error) {
        console.log(error);
    }

})();
*/
//# sourceMappingURL=provider-etherscan.js.map