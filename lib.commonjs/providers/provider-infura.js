"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InfuraProvider = void 0;
const properties_js_1 = require("../utils/properties.js");
const fetch_js_1 = require("../utils/fetch.js");
const community_js_1 = require("./community.js");
const logger_js_1 = require("../utils/logger.js");
const network_js_1 = require("./network.js");
const provider_jsonrpc_js_1 = require("./provider-jsonrpc.js");
const defaultProjectId = "84842078b09946638c03157f83405213";
function getHost(name) {
    switch (name) {
        case "homestead":
            return "mainnet.infura.io";
        case "ropsten":
            return "ropsten.infura.io";
        case "rinkeby":
            return "rinkeby.infura.io";
        case "kovan":
            return "kovan.infura.io";
        case "goerli":
            return "goerli.infura.io";
        case "matic":
            return "polygon-mainnet.infura.io";
        case "maticmum":
            return "polygon-mumbai.infura.io";
        case "optimism":
            return "optimism-mainnet.infura.io";
        case "optimism-kovan":
            return "optimism-kovan.infura.io";
        case "arbitrum":
            return "arbitrum-mainnet.infura.io";
        case "arbitrum-rinkeby":
            return "arbitrum-rinkeby.infura.io";
    }
    return logger_js_1.logger.throwArgumentError("unsupported network", "network", name);
}
class InfuraProvider extends provider_jsonrpc_js_1.JsonRpcProvider {
    projectId;
    projectSecret;
    constructor(_network = "homestead", projectId, projectSecret) {
        const network = network_js_1.Network.from(_network);
        if (projectId == null) {
            projectId = defaultProjectId;
        }
        if (projectSecret == null) {
            projectSecret = null;
        }
        const request = InfuraProvider.getRequest(network, projectId, projectSecret);
        super(request, network, { staticNetwork: network });
        (0, properties_js_1.defineProperties)(this, { projectId, projectSecret });
    }
    _getProvider(chainId) {
        try {
            return new InfuraProvider(chainId, this.projectId, this.projectSecret);
        }
        catch (error) { }
        return super._getProvider(chainId);
    }
    static getRequest(network, projectId, projectSecret) {
        if (projectId == null) {
            projectId = defaultProjectId;
        }
        if (projectSecret == null) {
            projectSecret = null;
        }
        const request = new fetch_js_1.FetchRequest(`https:/\/${getHost(network.name)}/v3/${projectId}`);
        request.allowGzip = true;
        if (projectSecret) {
            request.setCredentials("", projectSecret);
        }
        if (projectId === defaultProjectId) {
            request.retryFunc = async (request, response, attempt) => {
                (0, community_js_1.showThrottleMessage)("InfuraProvider");
                return true;
            };
        }
        return request;
    }
    isCommunityResource() {
        return (this.projectId === defaultProjectId);
    }
}
exports.InfuraProvider = InfuraProvider;
//# sourceMappingURL=provider-infura.js.map