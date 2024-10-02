/**
 *  [[link-blockscout]] provides a third-party service for connecting to
 *  various blockchains over JSON-RPC.
 *
 *  **Supported Networks**
 *
 *  - Ethereum Mainnet (``mainnet``)
 *  - Sepolia Testnet (``eth-sepolia``)
 *  - Holesky Testnet (``eth-holesky``)
 *  - Arbitrum One (``arbitrum``)
 *  - Arbitrum Nova (``arbitrum-nova``)
 *  - Arbitrum Sepolia (``arbitrum-sepolia``)
 *  - Base Mainnet (``base``)
 *  - Base Sepolia Testnet (``base-sepolia``)
 *  - Gnosis Chain (``gnosis``)
 *  - Gnosis Chiado Testnet (``gnosis-chiado``)
 *  - Optimism Mainnet (``optimism``)
 *  - Optimism Sepolia Testnet (``optimism-sepolia``)
 *  - Polygon (``matic``)
 *  - Polygon zkEVM (``matic-zkevm``)
 *  - zkSync Era Mainnet (``zksync``)
 *  - zkSync Sepolia Testnet (``zksync-sepolia``)
 *
 *  @_subsection: api/providers/thirdparty:Blockscout  [providers-blockscout]
 */
import {
    defineProperties, FetchRequest, assertArgument
} from "../utils/index.js";

import { AbstractProvider } from "./abstract-provider.js";
import { showThrottleMessage } from "./community.js";
import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";

import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";
import type { JsonRpcError, JsonRpcPayload } from "./provider-jsonrpc.js";


const defaultApiKey = "";

function getHost(name: string): string {
    const baseDomain = "blockscout.com"
    const apiPath = "/api/eth-rpc"
    switch (name) {
        case "mainnet":
            return `eth.${baseDomain}${apiPath}`;
        case "sepolia":
            return `eth-sepolia.${baseDomain}${apiPath}`;
        case "eth-holesky":
            return `eth-holesky.${baseDomain}${apiPath}`;
        case "gnosis":
            return `gnosis.${baseDomain}${apiPath}`;
        case "gnosis-chiado":
            return `gnosis-chiado.${baseDomain}${apiPath}`;
        case "arbitrum":
            return `arbitrum.${baseDomain}${apiPath}`;
        case "arbitrum-nova":
            return `arbitrum-nova.${baseDomain}${apiPath}`;
        case "arbitrum-sepolia":
            return `arbitrum-sepolia.${baseDomain}${apiPath}`;
        case "base":
            return `base.${baseDomain}${apiPath}`;
        case "base-sepolia":
            return `base-sepolia.${baseDomain}${apiPath}`;
        case "matic":
            return `polygon.${baseDomain}${apiPath}`;
        case "matic-zkevm":
            return `zkevm.${baseDomain}${apiPath}`;
        case "optimism":
            return `optimism.${baseDomain}${apiPath}`;
        case "optimism-sepolia":
            return `optimism-sepolia.${baseDomain}${apiPath}`;
        case "zksync":
            return `zksync.${baseDomain}${apiPath}`;
        case "zksync-sepolia":
            return `zksync-sepolia.${baseDomain}${apiPath}`;
        default:
    }

    assertArgument(false, "unsupported network", "network", name);
}


/**
 *  The **BlockscoutProvider** connects to the [[link-blockscout]]
 *  JSON-RPC end-points.
 *
 *  By default, a highly-throttled API key is used, which is
 *  appropriate for quick prototypes and simple scripts. To
 *  gain access to an increased rate-limit, it is highly
 *  recommended to [sign up here](link-blockscout-signup).
 */
export class BlockscoutProvider extends JsonRpcProvider implements CommunityResourcable {

    /**
     *  The API key for the Blockscout connection.
     */
    readonly apiKey!: string;

    /**
     *  Create a new **BlockscoutProvider**.
     *
     *  By default connecting to ``mainnet`` with a highly throttled
     *  API key.
     */
    constructor(_network?: Networkish, apiKey?: null | string) {
        if (_network == null) { _network = "mainnet"; }
        const network = Network.from(_network);
        if (apiKey == null) { apiKey = defaultApiKey; }

        // Blockscout does not support filterId, so we force polling
        const options = { polling: true, staticNetwork: network };

        const request = BlockscoutProvider.getRequest(network, apiKey);
        super(request, network, options);

        defineProperties<BlockscoutProvider>(this, { apiKey });
    }

    _getProvider(chainId: number): AbstractProvider {
        try {
            return new BlockscoutProvider(chainId, this.apiKey);
        } catch (error) { }
        return super._getProvider(chainId);
    }

    /**
     *  Returns a prepared request for connecting to %%network%% with
     *  %%apiKey%%.
     */
    static getRequest(network: Network, apiKey?: null | string): FetchRequest {
        if (apiKey == null) { apiKey = defaultApiKey; }

        const request = new FetchRequest(`https:/\/${ getHost(network.name) }?apikey=${ apiKey }`);
        request.allowGzip = true;

        if (apiKey === defaultApiKey) {
            request.retryFunc = async (request, response, attempt) => {
                showThrottleMessage("BlockscoutProvider");
                return true;
            };
        }

        return request;
    }

    getRpcError(payload: JsonRpcPayload, error: JsonRpcError): Error {
        if (payload.method === "eth_sendRawTransaction") {
            if (error && error.error && error.error.message === "INTERNAL_ERROR: could not replace existing tx") {
                error.error.message = "replacement transaction underpriced";
            }
        }

        return super.getRpcError(payload, error);
    }

    isCommunityResource(): boolean {
        return (this.apiKey === defaultApiKey);
    }
}
