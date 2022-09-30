import { defineProperties, FetchRequest, throwArgumentError } from "../utils/index.js";
import { showThrottleMessage } from "./community.js";
import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";
const defaultApiKey = "9f7d929b018cdffb338517efa06f58359e86ff1ffd350bc889738523659e7972";
function getHost(name) {
    switch (name) {
        case "mainnet":
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
    return throwArgumentError("unsupported network", "network", name);
}
export class AnkrProvider extends JsonRpcProvider {
    apiKey;
    constructor(_network = "mainnet", apiKey) {
        const network = Network.from(_network);
        if (apiKey == null) {
            apiKey = defaultApiKey;
        }
        // Ankr does not support filterId, so we force polling
        const options = { polling: true, staticNetwork: network };
        const request = AnkrProvider.getRequest(network, apiKey);
        super(request, network, options);
        defineProperties(this, { apiKey });
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
        const request = new FetchRequest(`https:/\/${getHost(network.name)}/${apiKey}`);
        request.allowGzip = true;
        if (apiKey === defaultApiKey) {
            request.retryFunc = async (request, response, attempt) => {
                showThrottleMessage("AnkrProvider");
                return true;
            };
        }
        return request;
    }
    isCommunityResource() {
        return (this.apiKey === defaultApiKey);
    }
}
//# sourceMappingURL=provider-ankr.js.map