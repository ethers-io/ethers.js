/**
 *  [Chainstack](https://chainstack.com/) provides a third-party service for connecting to
 *  various blockchains over JSON-RPC.
 *
 *  **Supported Networks**
 *
 *  - Ethereum Mainnet (``mainnet``)
 *  - Arbitrum (``arbitrum``)
 *  - BNB Smart Chain Mainnet (``bnb``)
 *  - Polygon (``matic``)
 *  - Base (``base``)
 *  - Optimism (``optimism``)
 *  - Sepolia Testnet (``sepolia``)
 *  - Holeski Testnet (``holeski``)
 *  - Arbitrum Sepolia Testnet (``arbitrum-sepolia``)
 *  - BNB Smart Chain Testnet (``bnbt``)
 *  - Polygon Amoy Testnet (``matic-amoy``) 
 *  - Base Sepolia Testnet (``base-sepolia``)
 *  - Optimism Sepolia Testnet (``optimism-sepolia``)  
 *
 *  @_subsection: api/providers/thirdparty:Chainstack  [providers-chainstack]
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


function getApiKey(name: string): string {
    switch (name) {
        case "mainnet": return "39f1d67cedf8b7831010a665328c9197";
        case "arbitrum": return "0550c209db33c3abf4cc927e1e18cea1";
        case "bnb": return "98b5a77e531614387366f6fc5da097f8";
        case "matic": return "cd9d4d70377471aa7c142ec4a4205249";
        case "base": return "f7e96b2c9129bcd7a571125c3e2a9672";
        case "optimism": return "c33ecbe4ae1be1311452ed472d8ad46a";
        case "sepolia": return "2376020706e35a4756462faf9a71b208";
        case "holesky": return "631810e152d4046bb660e08bcec92794";
        case "arbitrum-sepolia`": return "3aea296a4ff0b638245e2b40dda113fb";
        case "bnbt": return "5643c7df594dcdfb01304de11331f795";
        case "matic-amoy": return "241d9f34fee2c4c1c86efa9821534067";
        case "base-sepolia": return "a23461eb9b2026654d5507fe6a92085a";
        case "optimism-sepolia": return "4cd31436760a1d9d0912bceeeced641b";
    }

    assertArgument(false, "unsupported network", "network", name);
}

function getHost(name: string): string {
    switch(name) {
        case "mainnet":
            return "ethereum-mainnet.core.chainstack.com";
        case "arbitrum":
            return "arbitrum-mainnet.core.chainstack.com";
        case "bnb":
            return "bsc-mainnet.core.chainstack.com";
        case "matic":
            return "polygon-mainnet.core.chainstack.com";
        case "base":
            return "base-mainnet.core.chainstack.com";
        case "optimism":
            return "optimism-mainnet.core.chainstack.com";
        case "sepolia":
            return "ethereum-sepolia.core.chainstack.com";
        case "holesky":
            return "ethereum-holesky.core.chainstack.com";
        case "arbitrum-sepolia":
            return "arbitrum-sepolia.core.chainstack.com";
        case "bnbt":
            return "bsc-testnet.core.chainstack.com";
        case "matic-amoy":
            return "polygon-amoy.core.chainstack.com";
        case "base-sepolia":
            return "base-sepolia.core.chainstack.com";
        case "optimism-sepolia":
            return "optimism-sepolia.core.chainstack.com";
    }

    assertArgument(false, "unsupported network", "network", name);
}

/**
 *  The **ChainstackProvider** connects to the [Chainstack](https://chainstack.com/)
 *  JSON-RPC end-points.
 *
 *  By default, a highly-throttled API key is used, which is
 *  appropriate for quick prototypes and simple scripts. To
 *  gain access to an increased rate-limit, it is highly
 *  recommended to [sign up here](link-chainstack).
 */
export class ChainstackProvider extends JsonRpcProvider implements CommunityResourcable {
    /**
     *  The API key for the Chainstack connection.
     */
    readonly apiKey!: string;

    /**
     *  Creates a new **ChainstackProvider**.
     */
    constructor(_network?: Networkish, apiKey?: null | string) {
        if (_network == null) { _network = "mainnet"; }
        const network = Network.from(_network);

        if (apiKey == null) { apiKey = getApiKey(network.name); }

        const request = ChainstackProvider.getRequest(network, apiKey);
        super(request, network, { staticNetwork: network });

        defineProperties<ChainstackProvider>(this, { apiKey });
    }

    _getProvider(chainId: number): AbstractProvider {
        try {
            return new ChainstackProvider(chainId, this.apiKey);
        } catch (error) { }
        return super._getProvider(chainId);
    }

    isCommunityResource(): boolean {
        return (this.apiKey === getApiKey(this._network.name));
    }

    /**
     *  Returns a prepared request for connecting to %%network%%
     *  with %%apiKey%% and %%projectSecret%%.
     */
    static getRequest(network: Network, apiKey?: null | string): FetchRequest {
        if (apiKey == null) { apiKey = getApiKey(network.name); }

        const request = new FetchRequest(`https:/\/${ getHost(network.name) }/${ apiKey }`);
        request.allowGzip = true;

        if (apiKey === getApiKey(network.name)) {
            request.retryFunc = async (request, response, attempt) => {
                showThrottleMessage("ChainstackProvider");
                return true;
            };
        }

        return request;
    }
}
