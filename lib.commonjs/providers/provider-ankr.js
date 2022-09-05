"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnkrProvider = void 0;
const properties_js_1 = require("../utils/properties.js");
const fetch_js_1 = require("../utils/fetch.js");
const community_js_1 = require("./community.js");
const logger_js_1 = require("../utils/logger.js");
const network_js_1 = require("./network.js");
const provider_jsonrpc_js_1 = require("./provider-jsonrpc.js");
const defaultApiKey = "9f7d929b018cdffb338517efa06f58359e86ff1ffd350bc889738523659e7972";
function getHost(name) {
    switch (name) {
        case "homestead":
            return "rpc.ankr.com/eth";
        case "ropsten":
            return "rpc.ankr.com/eth_ropsten";
        case "rinkeby":
            return "rpc.ankr.com/eth_rinkeby";
        case "goerli":
            return "rpc.ankr.com/eth_goerli";
        case "matic":
            return "rpc.ankr.com/polygon";
        case "arbitrum":
            return "rpc.ankr.com/arbitrum";
    }
    return logger_js_1.logger.throwArgumentError("unsupported network", "network", name);
}
class AnkrProvider extends provider_jsonrpc_js_1.JsonRpcProvider {
    apiKey;
    constructor(_network = "homestead", apiKey) {
        const network = network_js_1.Network.from(_network);
        if (apiKey == null) {
            apiKey = defaultApiKey;
        }
        // Ankr does not support filterId, so we force polling
        const options = { polling: true, staticNetwork: network };
        const request = AnkrProvider.getRequest(network, apiKey);
        super(request, network, options);
        (0, properties_js_1.defineProperties)(this, { apiKey });
    }
    _getProvider(chainId) {
        try {
            return new AnkrProvider(chainId, this.apiKey);
        }
        catch (error) { }
        return super._getProvider(chainId);
    }
    static getRequest(network, apiKey) {
        if (apiKey == null) {
            apiKey = defaultApiKey;
        }
        const request = new fetch_js_1.FetchRequest(`https:/\/${getHost(network.name)}/${apiKey}`);
        request.allowGzip = true;
        if (apiKey === defaultApiKey) {
            request.retryFunc = async (request, response, attempt) => {
                (0, community_js_1.showThrottleMessage)("AnkrProvider");
                return true;
            };
        }
        return request;
    }
    isCommunityResource() {
        return (this.apiKey === defaultApiKey);
    }
}
exports.AnkrProvider = AnkrProvider;
//# sourceMappingURL=provider-ankr.js.map