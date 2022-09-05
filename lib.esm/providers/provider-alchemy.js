import { defineProperties } from "../utils/properties.js";
import { FetchRequest } from "../utils/fetch.js";
import { showThrottleMessage } from "./community.js";
import { logger } from "../utils/logger.js";
import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";
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
export class AlchemyProvider extends JsonRpcProvider {
    apiKey;
    constructor(_network = "homestead", apiKey) {
        const network = Network.from(_network);
        if (apiKey == null) {
            apiKey = defaultApiKey;
        }
        const request = AlchemyProvider.getRequest(network, apiKey);
        super(request, network, { staticNetwork: network });
        defineProperties(this, { apiKey });
    }
    _getProvider(chainId) {
        try {
            return new AlchemyProvider(chainId, this.apiKey);
        }
        catch (error) { }
        return super._getProvider(chainId);
    }
    async _perform(req) {
        // https://docs.alchemy.com/reference/trace-transaction
        if (req.method === "getTransactionResult") {
            const trace = await this.send("trace_transaction", [req.hash]);
            if (trace == null) {
                return null;
            }
            let data;
            let error = false;
            try {
                data = trace[0].result.output;
                error = (trace[0].error === "Reverted");
            }
            catch (error) { }
            if (data) {
                if (error) {
                    logger.throwError("an error occurred during transaction executions", "CALL_EXCEPTION", {
                        data
                    });
                }
                return data;
            }
            return logger.throwError("could not parse trace result", "BAD_DATA", { value: trace });
        }
        return await super._perform(req);
    }
    isCommunityResource() {
        return (this.apiKey === defaultApiKey);
    }
    static getRequest(network, apiKey) {
        if (apiKey == null) {
            apiKey = defaultApiKey;
        }
        const request = new FetchRequest(`https:/\/${getHost(network.name)}/v2/${apiKey}`);
        request.allowGzip = true;
        if (apiKey === defaultApiKey) {
            request.retryFunc = async (request, response, attempt) => {
                showThrottleMessage("alchemy");
                return true;
            };
        }
        return request;
    }
}
//# sourceMappingURL=provider-alchemy.js.map