import { defineProperties } from "@ethersproject/properties";
import { FetchRequest } from "@ethersproject/web";
import { showThrottleMessage } from "./community.js";
import { logger } from "./logger.js";
import { Network } from "./network.js";
import { StaticJsonRpcProvider } from "./provider-jsonrpc.js";
const defaultApiKey = "_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC";
function getHost(name) {
    switch (name) {
        case "homestead":
            return "eth-mainnet.alchemyapi.io";
        case "ropsten":
            return "eth-ropsten.alchemyapi.io";
        case "rinkeby":
            return "eth-rinkeby.alchemyapi.io";
        case "goerli":
            return "eth-goerli.alchemyapi.io";
        case "kovan":
            return "eth-kovan.alchemyapi.io";
        case "matic":
            return "polygon-mainnet.g.alchemy.com";
        case "maticmum":
            return "polygon-mumbai.g.alchemy.com";
        case "arbitrum":
            return "arb-mainnet.g.alchemy.com";
        case "arbitrum-rinkeby":
            return "arb-rinkeby.g.alchemy.com";
        case "optimism":
            return "opt-mainnet.g.alchemy.com";
        case "optimism-kovan":
            return "opt-kovan.g.alchemy.com";
    }
    return logger.throwArgumentError("unsupported network", "network", name);
}
export class AlchemyProvider extends StaticJsonRpcProvider {
    constructor(_network = "homestead", apiKey) {
        const network = Network.from(_network);
        if (apiKey == null) {
            apiKey = defaultApiKey;
        }
        super(AlchemyProvider.getConnection(network, apiKey), network);
        defineProperties(this, { apiKey });
    }
    _getProvider(chainId) {
        try {
            return new AlchemyProvider(chainId, this.apiKey);
        }
        catch (error) { }
        return super._getProvider(chainId);
    }
    isCommunityResource() {
        return (this.apiKey === defaultApiKey);
    }
    static getConnection(network, apiKey) {
        if (apiKey == null) {
            apiKey = defaultApiKey;
        }
        const request = new FetchRequest(`https:/\/${getHost(network.name)}/v2/${apiKey}`);
        request.allowGzip = true;
        const throttleRetry = async (request, response, attempt) => {
            if (apiKey === defaultApiKey) {
                showThrottleMessage("alchemy");
            }
            return true;
        };
        return { request, throttleRetry };
    }
}
//# sourceMappingURL=provider-alchemy.js.map