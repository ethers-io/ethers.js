import { defineProperties } from "@ethersproject/properties";
import { FetchRequest } from "@ethersproject/web";
import { showThrottleMessage } from "./community.js";
import { logger } from "./logger.js";
import { Network } from "./network.js";
import { StaticJsonRpcProvider } from "./provider-jsonrpc.js";
const defaultApiKey = "9f7d929b018cdffb338517efa06f58359e86ff1ffd350bc889738523659e7972";
function getHost(name) {
    switch (name) {
        case "homestead":
            return "rpc.ankr.com/eth";
        case "matic":
            return "rpc.ankr.com/polygon";
        case "arbitrum":
            return "rpc.ankr.com/arbitrum";
    }
    return logger.throwArgumentError("unsupported network", "network", name);
}
export class AnkrProvider extends StaticJsonRpcProvider {
    constructor(_network = "homestead", apiKey) {
        const network = Network.from(_network);
        if (apiKey == null) {
            apiKey = defaultApiKey;
        }
        const connection = AnkrProvider.getConnection(network, apiKey);
        super(connection, network);
        defineProperties(this, { apiKey });
        // Ankr does not support filterId, so we force polling
        super._setOptions({ polling: true });
    }
    _getProvider(chainId) {
        try {
            return new AnkrProvider(chainId, this.apiKey);
        }
        catch (error) { }
        return super._getProvider(chainId);
    }
    static getConnection(network, apiKey) {
        if (apiKey == null) {
            apiKey = defaultApiKey;
        }
        const request = new FetchRequest(`https:/\/${getHost(network.name)}/${apiKey}`);
        request.allowGzip = true;
        const throttleRetry = async (request, response, attempt) => {
            if (apiKey === defaultApiKey) {
                showThrottleMessage("AnkrProvider");
            }
            return true;
        };
        return { request, throttleRetry };
    }
    isCommunityResource() {
        return (this.apiKey === defaultApiKey);
    }
}
//# sourceMappingURL=provider-ankr.js.map