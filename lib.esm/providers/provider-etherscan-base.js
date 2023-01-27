import { AbiCoder } from "../abi/index.js";
import { accessListify, Transaction } from "../transaction/index.js";
import { defineProperties, hexlify, toQuantity, FetchRequest, assert, assertArgument, isError, toUtf8String } from "../utils/index.js";
import { AbstractProvider } from "./abstract-provider.js";
import { Network } from "./network.js";
import { NetworkPlugin } from "./plugins-network.js";
import { showThrottleMessage } from "./community.js";
const THROTTLE = 2000;
const EtherscanPluginId = "org.ethers.plugins.Etherscan";
/**
 *  Aboud Cloudflare...
 *
 *  @_docloc: api/providers/thirdparty:Etherscan
 */
export class EtherscanPlugin extends NetworkPlugin {
    baseUrl;
    communityApiKey;
    constructor(baseUrl, communityApiKey) {
        super(EtherscanPluginId);
        //if (communityApiKey == null) { communityApiKey = null; }
        defineProperties(this, { baseUrl, communityApiKey });
    }
    clone() {
        return new EtherscanPlugin(this.baseUrl, this.communityApiKey);
    }
}
let nextId = 1;
/**
 *  Aboud Etherscan...
 *
 *  @_docloc: api/providers/thirdparty:Etherscan
 */
export class BaseEtherscanProvider extends AbstractProvider {
    network;
    apiKey;
    #plugin;
    constructor(_network, apiKey) {
        super();
        const network = Network.from(_network);
        this.#plugin = network.getPlugin(EtherscanPluginId);
        if (apiKey == null && this.#plugin) {
            apiKey = this.#plugin.communityApiKey;
        }
        defineProperties(this, { apiKey, network });
        // Test that the network is supported by Etherscan
        this.getBaseUrl();
    }
    getBaseUrl() {
        if (this.#plugin) {
            return this.#plugin.baseUrl;
        }
        switch (this.network.name) {
            case "mainnet":
                return "https:/\/api.etherscan.io";
            case "goerli":
                return "https:/\/api-goerli.etherscan.io";
            case "sepolia":
                return "https:/\/api-sepolia.etherscan.io";
            case "arbitrum":
                return "https:/\/api.arbiscan.io";
            case "arbitrum-goerli":
                return "https:/\/api-goerli.arbiscan.io";
            case "matic":
                return "https:/\/api.polygonscan.com";
            case "maticmum":
                return "https:/\/api-testnet.polygonscan.com";
            case "optimism":
                return "https:/\/api-optimistic.etherscan.io";
            case "optimism-goerli":
                return "https:/\/api-goerli-optimistic.etherscan.io";
            default:
        }
        assertArgument(false, "unsupported network", "network", this.network);
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
        const id = nextId++;
        const url = (post ? this.getPostUrl() : this.getUrl(module, params));
        const payload = (post ? this.getPostData(module, params) : null);
        this.emit("debug", { action: "sendRequest", id, url, payload: payload });
        const request = new FetchRequest(url);
        request.setThrottleParams({ slotInterval: 1000 });
        request.retryFunc = (req, resp, attempt) => {
            if (this.isCommunityResource()) {
                showThrottleMessage("Etherscan");
            }
            return Promise.resolve(true);
        };
        request.processFunc = async (request, response) => {
            const result = response.hasBody() ? JSON.parse(toUtf8String(response.body)) : {};
            const throttle = ((typeof (result.result) === "string") ? result.result : "").toLowerCase().indexOf("rate limit") >= 0;
            if (module === "proxy") {
                // This JSON response indicates we are being throttled
                if (result && result.status == 0 && result.message == "NOTOK" && throttle) {
                    this.emit("debug", { action: "receiveError", id, reason: "proxy-NOTOK", error: result });
                    response.throwThrottleError(result.result, THROTTLE);
                }
            }
            else {
                if (throttle) {
                    this.emit("debug", { action: "receiveError", id, reason: "null result", error: result.result });
                    response.throwThrottleError(result.result, THROTTLE);
                }
            }
            return response;
        };
        if (payload) {
            request.setHeader("content-type", "application/x-www-form-urlencoded; charset=UTF-8");
            request.body = Object.keys(payload).map((k) => `${k}=${payload[k]}`).join("&");
        }
        const response = await request.send();
        try {
            response.assertOk();
        }
        catch (error) {
            this.emit("debug", { action: "receiveError", id, error, reason: "assertOk" });
            assert(false, "response error", "SERVER_ERROR", { request, response });
        }
        if (!response.hasBody()) {
            this.emit("debug", { action: "receiveError", id, error: "missing body", reason: "null body" });
            assert(false, "missing response", "SERVER_ERROR", { request, response });
        }
        const result = JSON.parse(toUtf8String(response.body));
        if (module === "proxy") {
            if (result.jsonrpc != "2.0") {
                this.emit("debug", { action: "receiveError", id, result, reason: "invalid JSON-RPC" });
                assert(false, "invalid JSON-RPC response (missing jsonrpc='2.0')", "SERVER_ERROR", { request, response, info: { result } });
            }
            if (result.error) {
                this.emit("debug", { action: "receiveError", id, result, reason: "JSON-RPC error" });
                assert(false, "error response", "SERVER_ERROR", { request, response, info: { result } });
            }
            this.emit("debug", { action: "receiveRequest", id, result });
            return result.result;
        }
        else {
            // getLogs, getHistory have weird success responses
            if (result.status == 0 && (result.message === "No records found" || result.message === "No transactions found")) {
                this.emit("debug", { action: "receiveRequest", id, result });
                return result.result;
            }
            if (result.status != 1 || (typeof (result.message) === "string" && !result.message.match(/^OK/))) {
                this.emit("debug", { action: "receiveError", id, result });
                assert(false, "error response", "SERVER_ERROR", { request, response, info: { result } });
            }
            this.emit("debug", { action: "receiveRequest", id, result });
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
                value = toQuantity(value);
            }
            else if (key === "accessList") {
                value = "[" + accessListify(value).map((set) => {
                    return `{address:"${set.address}",storageKeys:["${set.storageKeys.join('","')}"]}`;
                }).join(",") + "]";
            }
            else {
                value = hexlify(value);
            }
            result[key] = value;
        }
        return result;
    }
    _checkError(req, error, transaction) {
        // Pull any message out if, possible
        let message = "";
        if (isError(error, "SERVER_ERROR")) {
            // Check for an error emitted by a proxy call
            try {
                message = error.info.result.error.message;
            }
            catch (e) { }
            if (!message) {
                try {
                    message = error.info.message;
                }
                catch (e) { }
            }
        }
        if (req.method === "estimateGas") {
            if (!message.match(/revert/i) && message.match(/insufficient funds/i)) {
                assert(false, "insufficient funds", "INSUFFICIENT_FUNDS", {
                    transaction: req.transaction
                });
            }
        }
        if (req.method === "call" || req.method === "estimateGas") {
            if (message.match(/execution reverted/i)) {
                let data = "";
                try {
                    data = error.info.result.error.data;
                }
                catch (error) { }
                const e = AbiCoder.getBuiltinCallException(req.method, req.transaction, data);
                e.info = { request: req, error };
                throw e;
            }
        }
        if (message) {
            if (req.method === "broadcastTransaction") {
                const transaction = Transaction.from(req.signedTransaction);
                if (message.match(/replacement/i) && message.match(/underpriced/i)) {
                    assert(false, "replacement fee too low", "REPLACEMENT_UNDERPRICED", {
                        transaction
                    });
                }
                if (message.match(/insufficient funds/)) {
                    assert(false, "insufficient funds for intrinsic transaction cost", "INSUFFICIENT_FUNDS", {
                        transaction
                    });
                }
                if (message.match(/same hash was already imported|transaction nonce is too low|nonce too low/)) {
                    assert(false, "nonce has already been used", "NONCE_EXPIRED", {
                        transaction
                    });
                }
            }
        }
        // Something we could not process
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
            case "getStorage":
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
                assert(false, "getBlock by blockHash not supported by Etherscan", "UNSUPPORTED_OPERATION", {
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
        if (this.network.name !== "mainnet") {
            return 0.0;
        }
        return parseFloat((await this.fetch("stats", { action: "ethprice" })).ethusd);
    }
    isCommunityResource() {
        const plugin = this.network.getPlugin(EtherscanPluginId);
        if (plugin) {
            return (plugin.communityApiKey === this.apiKey);
        }
        return (this.apiKey == null);
    }
}
//# sourceMappingURL=provider-etherscan-base.js.map