/**
 *  [[link-infura]] provides a third-party service for connecting to
 *  various blockchains over JSON-RPC.
 *
 *  **Supported Networks**
 *
 *  - Ethereum Mainnet (``mainnet``)
 *  - Goerli Testnet (``goerli``)
 *  - Sepolia Testnet (``sepolia``)
 *  - Arbitrum (``arbitrum``)
 *  - Arbitrum Goerli Testnet (``arbitrum-goerli``)
 *  - Arbitrum Sepolia Testnet (``arbitrum-sepolia``)
 *  - Base (``base``)
 *  - Base Goerlia Testnet (``base-goerli``)
 *  - Base Sepolia Testnet (``base-sepolia``)
 *  - BNB Smart Chain Mainnet (``bnb``)
 *  - BNB Smart Chain Testnet (``bnbt``)
 *  - Linea (``linea``)
 *  - Linea Goerli Testnet (``linea-goerli``)
 *  - Linea Sepolia Testnet (``linea-sepolia``)
 *  - Optimism (``optimism``)
 *  - Optimism Goerli Testnet (``optimism-goerli``)
 *  - Optimism Sepolia Testnet (``optimism-sepolia``)
 *  - Polygon (``matic``)
 *  - Polygon Amoy Testnet (``matic-amoy``)
 *  - Polygon Mumbai Testnet (``matic-mumbai``)
 *
 *  @_subsection: api/providers/thirdparty:INFURA  [providers-infura]
 */
import {
    defineProperties, FetchRequest, assert, assertArgument
} from "../utils/index.js";

import { showThrottleMessage } from "./community.js";
import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";
import { WebSocketProvider } from "./provider-websocket.js";

import type { AbstractProvider } from "./abstract-provider.js";
import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";


const defaultAPIKey = "84842078b09946638c03157f83405213";

function getHost(name: string): string {
    switch(name) {
        case "mainnet":
            return "mainnet.infura.io";
        case "goerli":
            return "goerli.infura.io";
        case "sepolia":
            return "sepolia.infura.io";

        case "arbitrum":
            return "arbitrum-mainnet.infura.io";
        case "arbitrum-goerli":
            return "arbitrum-goerli.infura.io";
        case "arbitrum-sepolia":
            return "arbitrum-sepolia.infura.io";
        case "base":
            return "base-mainnet.infura.io";
        case "base-goerlia":
            return "base-goerli.infura.io";
        case "base-sepolia":
            return "base-sepolia.infura.io";
        case "bnb":
            return "bnbsmartchain-mainnet.infura.io";
        case "bnbt":
            return "bnbsmartchain-testnet.infura.io";
        case "linea":
            return "linea-mainnet.infura.io";
        case "linea-goerli":
            return "linea-goerli.infura.io";
        case "linea-sepolia":
            return "linea-sepolia.infura.io";
        case "matic":
            return "polygon-mainnet.infura.io";
        case "matic-amoy":
            return "polygon-amoy.infura.io";
        case "matic-mumbai":
            return "polygon-mumbai.infura.io";
        case "optimism":
            return "optimism-mainnet.infura.io";
        case "optimism-goerli":
            return "optimism-goerli.infura.io";
        case "optimism-sepolia":
            return "optimism-sepolia.infura.io";
    }

    assertArgument(false, "unsupported network", "network", name);
}

/**
 *  The **InfuraWebSocketProvider** connects to the [[link-infura]]
 *  WebSocket end-points.
 *
 *  By default, a highly-throttled API key is used, which is
 *  appropriate for quick prototypes and simple scripts. To
 *  gain access to an increased rate-limit, it is highly
 *  recommended to [sign up here](link-infura-signup).
 */
export class InfuraWebSocketProvider extends WebSocketProvider implements CommunityResourcable {

    /**
     *  The API key for the INFURA connection.
     */
    readonly APIKey!: string;

    /**
     *  The Project Secret.
     *
     *  If null, no authenticated requests are made. This should not
     *  be used outside of private contexts.
     */
    readonly projectSecret!: null | string;

    /**
     *  Creates a new **InfuraWebSocketProvider**.
     */
    constructor(network?: Networkish, APIKey?: string) {
        const provider = new InfuraProvider(network, APIKey);

        const req = provider._getConnection();
        assert(!req.credentials, "INFURA WebSocket project secrets unsupported",
            "UNSUPPORTED_OPERATION", { operation: "InfuraProvider.getWebSocketProvider()" });

        const url = req.url.replace(/^http/i, "ws").replace("/v3/", "/ws/v3/");
        super(url, provider._network);

        defineProperties<InfuraWebSocketProvider>(this, {
            APIKey: provider.APIKey,
            projectSecret: provider.projectSecret
        });
    }

    isCommunityResource(): boolean {
        return (this.APIKey === defaultAPIKey);
    }
}

/**
 *  The **InfuraProvider** connects to the [[link-infura]]
 *  JSON-RPC end-points.
 *
 *  By default, a highly-throttled API key is used, which is
 *  appropriate for quick prototypes and simple scripts. To
 *  gain access to an increased rate-limit, it is highly
 *  recommended to [sign up here](link-infura-signup).
 */
export class InfuraProvider extends JsonRpcProvider implements CommunityResourcable {
    /**
     *  The API key for the INFURA connection.
     */
    readonly APIKey!: string;

    /**
     *  The Project Secret.
     *
     *  If null, no authenticated requests are made. This should not
     *  be used outside of private contexts.
     */
    readonly projectSecret!: null | string;

    /**
     *  Creates a new **InfuraProvider**.
     */
    constructor(_network?: Networkish, APIKey?: null | string, projectSecret?: null | string) {
        if (_network == null) { _network = "mainnet"; }
        const network = Network.from(_network);
        if (APIKey == null) { APIKey = defaultAPIKey; }
        if (projectSecret == null) { projectSecret = null; }

        const request = InfuraProvider.getRequest(network, APIKey, projectSecret);
        super(request, network, { staticNetwork: network });

        defineProperties<InfuraProvider>(this, { APIKey, projectSecret });
    }

    _getProvider(chainId: number): AbstractProvider {
        try {
            return new InfuraProvider(chainId, this.APIKey, this.projectSecret);
        } catch (error) { }
        return super._getProvider(chainId);
    }

    isCommunityResource(): boolean {
        return (this.APIKey === defaultAPIKey);
    }

    /**
     *  Creates a new **InfuraWebSocketProvider**.
     */
    static getWebSocketProvider(network?: Networkish, APIKey?: string): InfuraWebSocketProvider {
        return new InfuraWebSocketProvider(network, APIKey);
    }

    /**
     *  Returns a prepared request for connecting to %%network%%
     *  with %%APIKey%% and %%projectSecret%%.
     */
    static getRequest(network: Network, APIKey?: null | string, projectSecret?: null | string): FetchRequest {
        if (APIKey == null) { APIKey = defaultAPIKey; }
        if (projectSecret == null) { projectSecret = null; }

        const request = new FetchRequest(`https:/\/${ getHost(network.name) }/v3/${ APIKey }`);
        request.allowGzip = true;
        if (projectSecret) { request.setCredentials("", projectSecret); }

        if (APIKey === defaultAPIKey) {
            request.retryFunc = async (request, response, attempt) => {
                showThrottleMessage("InfuraProvider");
                return true;
            };
        }

        return request;
    }
}
