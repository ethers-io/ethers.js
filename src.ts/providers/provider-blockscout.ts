
/**
 *  [[link-blockscout]] provides a third-party service for connecting to
 *  various blockchains over JSON-RPC.
 *
 *  **Supported Networks**
 *
 *  - Ethereum Mainnet (``mainnet``)
 *  - Sepolia Testnet (``sepolia``)
 *  - Holesky Testnet (``holesky``)
 *  - Ethereum Classic (``classic``)
 *  - Arbitrum (``arbitrum``)
 *  - Base (``base``)
 *  - Base Sepolia Testnet (``base-sepolia``)
 *  - Gnosis (``xdai``)
 *  - Optimism (``optimism``)
 *  - Optimism Sepolia Testnet (``optimism-sepolia``)
 *  - Polygon (``matic``)
 *
 *  @_subsection: api/providers/thirdparty:Blockscout  [providers-blockscout]
 */
import {
    defineProperties, FetchRequest, assertArgument
} from "../utils/index.js";

import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";

import type { AbstractProvider } from "./abstract-provider.js";
import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";


function getUrl(name: string): string {
    switch(name) {
        case "mainnet":
            return "https:/\/eth.blockscout.com/api/eth-rpc";
        case "sepolia":
            return "https:/\/eth-sepolia.blockscout.com/api/eth-rpc";
        case "holesky":
            return "https:/\/eth-holesky.blockscout.com/api/eth-rpc";

        case "classic":
            return "https:/\/etc.blockscout.com/api/eth-rpc";

        case "arbitrum":
            return "https:/\/arbitrum.blockscout.com/api/eth-rpc";

        case "base":
            return "https:/\/base.blockscout.com/api/eth-rpc";
        case "base-sepolia":
            return "https:/\/base-sepolia.blockscout.com/api/eth-rpc";

        case "matic":
            return "https:/\/polygon.blockscout.com/api/eth-rpc";

        case "optimism":
            return "https:/\/optimism.blockscout.com/api/eth-rpc";
        case "optimism-sepolia":
            return "https:/\/optimism-sepolia.blockscout.com/api/eth-rpc";

        case "xdai":
            return "https:/\/gnosis.blockscout.com/api/eth-rpc";
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
 *  recommended to [sign up here](link-blockscout).
 */
export class BlockscoutProvider extends JsonRpcProvider implements CommunityResourcable {
    /**
     *  The API key.
     */
    readonly apiKey!: null | string;

    /**
     *  Creates a new **BlockscoutProvider**.
     */
    constructor(_network?: Networkish, apiKey?: null | string) {
        if (_network == null) { _network = "mainnet"; }
        const network = Network.from(_network);

        if (apiKey == null) { apiKey = null; }

        const request = BlockscoutProvider.getRequest(network);
        super(request, network, { staticNetwork: network });

        defineProperties<BlockscoutProvider>(this, { apiKey });
    }

    _getProvider(chainId: number): AbstractProvider {
        try {
            return new BlockscoutProvider(chainId, this.apiKey);
        } catch (error) { }
        return super._getProvider(chainId);
    }

    isCommunityResource(): boolean {
        return (this.apiKey === null);
    }

    /**
     *  Returns a prepared request for connecting to %%network%%
     *  with %%apiKey%%.
     */
    static getRequest(network: Network): FetchRequest {
        const request = new FetchRequest(getUrl(network.name));
        request.allowGzip = true;
        return request;
    }
}
