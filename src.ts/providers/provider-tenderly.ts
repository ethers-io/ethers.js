/**
 *  [[link-tenderly]] provides a third-party service for connecting to
 *  various blockchains over JSON-RPC.
 *
 *  **Supported Networks**
 *
 *  - Ethereum Mainnet (``mainnet``)
 *  - Goerli Testnet (``goerli``)
 *  - Sepolia Testnet (``sepolia``)
 *  - Polygon Mainnet (``polygon``)
 *  - Polygon Mumbai Testnet (``polygon-mumbai``)
 *  - Optimism Mainnet (``optimism``)
 *  - Optimism Goerli Testnet (``optimism-goerli``)
 *  - Base Mainnet (``base``)
 *  - Base Goerli Testnet (``base-goerli``)
 *  - Boba Ethereum (``boba-ethereum``)
 *  - Boba BNB (``boba-bnb``)
 *  - Boba BNB Testnet (``boba-bnb-testnet``)
 *
 *  @_subsection: api/providers/thirdparty:Tenderly  [providers-tenderly]
 */
import {
    defineProperties, FetchRequest, assertArgument
} from "../utils/index.js";

import { showThrottleMessage } from "./community.js";
import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";

import type { AbstractProvider } from "./abstract-provider.js";
import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";

// The public RPC endpoint doesn't require
// API key, but it's rate-limited
const defaultApiKey = "";

function getHost(name: string): string {
    switch(name) {
        case "mainnet":
            return "mainnet.gateway.tenderly.co";
        case "goerli":
            return "goerli.gateway.tenderly.co";
        case "sepolia":
            return "sepolia.gateway.tenderly.co";
        case "polygon":
            return "polygon.gateway.tenderly.co";
        case "polygon-mumbai":
            return "polygon-mumbai.gateway.tenderly.co";
        case "optimism":
            return "optimism.gateway.tenderly.co";
        case "optimism-goerli":
            return "optimism-goerli.gateway.tenderly.co";
        case "base":
            return "base.gateway.tenderly.co";
        case "base-goerli":
            return "base-goerli.gateway.tenderly.co";
        case "boba-ethereum":
            return "boba-ethereum.gateway.tenderly.co";
        case "boba-bnb":
            return "boba-bnb.gateway.tenderly.co";
        case "boba-bnb-testnet":
            return "boba-bnb-testnet.gateway.tenderly.co";
    }

    assertArgument(false, "unsupported network", "network", name);
}

/**
 *  The **TenderlyProvider** connects to the [[link-tenderly]]
 *  JSON-RPC end-points.
 *
 *  By default, a highly-throttled API key is used, which is
 *  appropriate for quick prototypes and simple scripts. To
 *  gain access to an increased rate-limit, it is highly
 *  recommended to [sign up here](link-tenderly-signup).
 */
export class TenderlyProvider extends JsonRpcProvider implements CommunityResourcable {
    /**
     *  The API key for the Tenderly connection.
     */
    readonly apiKey!: string;

    /**
     *  Create a new **TenderlyProvider**.
     *
     *  By default connecting to ``mainnet`` with a highly throttled
     *  API key.
     */
    constructor(_network?: Networkish, apiKey?: null | string) {
        if (_network == null) { _network = "mainnet"; }
        const network = Network.from(_network);
        if (apiKey == null) { apiKey = defaultApiKey; }

        const request = TenderlyProvider.getRequest(network, apiKey);
        super(request, network, { staticNetwork: network });

        defineProperties<TenderlyProvider>(this, { apiKey });
    }

    _getProvider(chainId: number): AbstractProvider {
        try {
            return new TenderlyProvider(chainId, this.apiKey);
        } catch (error) { }
        return super._getProvider(chainId);
    }

    isCommunityResource(): boolean {
        return (this.apiKey === defaultApiKey);
    }

    /**
     *  Returns a prepared request for connecting to %%network%% with
     *  %%apiKey%%.
     */
    static getRequest(network: Network, apiKey?: string): FetchRequest {
        if (apiKey == null) { apiKey = defaultApiKey; }

        const request = new FetchRequest(`https:/\/${ getHost(network.name) }/${ apiKey }`);
        request.allowGzip = true;

        if (apiKey === defaultApiKey) {
            request.retryFunc = async (request, response, attempt) => {
                showThrottleMessage("TenderlyProvider");
                return true;
            }
        }

        return request;
    }
}
