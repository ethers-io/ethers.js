/**
 * [[link-llamanodes]] provides public and premium RPCs with 
 * industry leading features, crypto payments, and no contracts.
 * 
 *  **Supported Networks**
 *
 *  - Arbitrum (``arbitrum``)
 *  - Base (``base``)
 *  - BNB Chain (``bnb``)
 *  - Goerli Testnet [Beta] (``goerli``)
 *  - Ethereum Mainnet (``mainnet``)
 *  - Optimism (``optimism``)
 *  - Polygon (``matic``)
 *
 *  @_subsection: api/providers/thirdparty:LlamaNodes  [providers-llamanodes]
 */
import { defineProperties, assertArgument, FetchRequest } from "../utils/index.js";

import { showThrottleMessage } from "./community.js";
import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";
import { WebSocketProvider } from "./provider-websocket.js";

import type { AbstractProvider } from "./abstract-provider.js";
import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";


function getHost(name: string): string {
    switch(name) {
        case "arbitrum":
            return "arbitrbum.llamarpc.com";
        case "base":
            return "base.llamarpc.com";
        case "bnb":
            return "binance.llamarpc.com"
        case "goerli":
            return "goerli.llamarpc.com";
        case "mainnet":
            return "eth.llamarpc.com";
        case "matic":
            return "polygon.llamarpc.com";
        case "optimism":
            return "optimism.llamarpc.om";
    }

    assertArgument(false, "unsupported network", "network", name);
}

/**
 *  The **LlamaNodesWebSocketProvider** connects to the [[link-llamanodes]]
 *  WebSocket end-points.
 *
 *  By default, a highly-throttled API key is used, which is
 *  appropriate for quick prototypes and simple scripts. To
 *  gain access to an increased rate-limit, it is highly
 *  recommended to [sign up here](link-llamanodes-signup).
 */
export class LlamaNodesWebSocketProvider extends WebSocketProvider implements CommunityResourcable {
    readonly apiKey?: string;

    constructor(network?: Networkish, apiKey?: string) {
        const provider = new LlamaNodesProvider(network, apiKey);

        const req = provider._getConnection();

        const url = req.url.replace(/^http/i, "ws");
        super(url, network);

        defineProperties<LlamaNodesWebSocketProvider>(this, { apiKey });
    }

    isCommunityResource(): boolean {
        return (this.apiKey == null);
    }
}

/**
 *  The **LLamaNodesProvider** connects to the [[link-llamanodes]]
 *  JSON-RPC end-points.
 *
 *  By default, a highly-throttled API key is used, which is
 *  appropriate for quick prototypes and simple scripts. To
 *  gain access to an increased rate-limit, it is highly
 *  recommended to [sign up here](link-llamanodes-signup).
 *
 *  @_docloc: api/providers/thirdparty
 */
export class LlamaNodesProvider extends JsonRpcProvider implements CommunityResourcable {
    readonly apiKey?: string;

    constructor(_network?: Networkish, apiKey?: string) {
        if (_network == null) { _network = "mainnet"; }
        const network = Network.from(_network);

        const request = LlamaNodesProvider.getRequest(network, apiKey);
        super(request, network, { staticNetwork: network });

        defineProperties<LlamaNodesProvider>(this, { apiKey });
    }

    _getProvider(chainId: number): AbstractProvider {
        try {
            return new LlamaNodesProvider(chainId, this.apiKey);
        } catch (error) { }
        return super._getProvider(chainId);
    }

    isCommunityResource(): boolean {
        return (this.apiKey == null);
    }

    static getRequest(network: Network, apiKey?: string): FetchRequest {
        const request = new FetchRequest(`https:/\/${ getHost(network.name) }${ apiKey != null ? `/rpc/${ apiKey }` : ''}`);
        request.allowGzip = true;

        if (apiKey == null) {
            request.retryFunc = async (request, response, attempt) => {
                showThrottleMessage("llamanodes");
                return true;
            }
        }

        return request;
    }
}
