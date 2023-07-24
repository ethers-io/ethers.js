/**
 *  [[link-1rpc]] provides a third-party service for connecting to
 *  various blockchains over JSON-RPC.
 *
 *  **Supported Networks**
 *
 *  - Ethereum Mainnet (``mainnet``)
 *  - BNB Chain (``bnb``)
 *  - Polygon PoS (``matic``)
 *  - Polygon zkEVM (``polygon-zkevm``)
 *  - Avalanche (``avalanche``) 
 *  - Arbitrum (``arbitrum``)
 *  - Optimism (``optimism``)
 *  - Moonbeam (``moonbeam``)
 *  - Astar (``astar``)
 *  - ZkSync Era Mainnet (``zksync2-era``)
 *  - Fantom (``fantom``)
 *  - Celo (``celo``)
 *  - Klaytn (``klaytn``)
 *  - AltLayer Testnet (``altlayer-testnet``)
 *  - Aurora (``aurora``)
 *  - Base (``base``)
 *  - Harmony (``harmony``)
 *  - Linea (``linea``)
 *
 *  @_subsection: api/providers/thirdparty:1RPC  [providers-1rpc]
 */

import {
    defineProperties, FetchRequest, assertArgument
} from "../utils/index.js";

import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";

import type { AbstractProvider } from "./abstract-provider.js";
import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";


const defaultToken = "";

function getHost(name: string, api_key: string): string {
    let api_key_path: string = "";
    if (api_key !== null && api_key.length > 0) { api_key_path = "/".concat(api_key); }
    switch(name) {
        case "mainnet":
            return "1rpc.io".concat(api_key_path).concat("/eth");
        case "bnb":
            return "1rpc.io".concat(api_key_path).concat("/bnb");
        case "matic":
            return "1rpc.io".concat(api_key_path).concat("/matic");
        case "polygon-zkevm":
            return "1rpc.io".concat(api_key_path).concat("/polygon/zkevm");
        case "avalanche":
            return "1rpc.io".concat(api_key_path).concat("/avax/c");
        case "arbitrum":
            return "1rpc.io".concat(api_key_path).concat("/arb");
        case "optimism":
            return "1rpc.io".concat(api_key_path).concat("/op");
        case "moonbeam":
            return "1rpc.io".concat(api_key_path).concat("/glmr");
        case "astar":
            return "1rpc.io".concat(api_key_path).concat("/astr");
        case "zksync2-era":
            return "1rpc.io".concat(api_key_path).concat("/zksync2-era");
        case "fantom":
            return "1rpc.io".concat(api_key_path).concat("/ftm");
        case "celo":
            return "1rpc.io".concat(api_key_path).concat("/celo");
        case "klaytn":
            return "1rpc.io".concat(api_key_path).concat("/klay");
        case "altlayer-testnet":
            return "1rpc.io".concat(api_key_path).concat("/alt-testnet");
        case "aurora":
            return "1rpc.io".concat(api_key_path).concat("/aurora");
        case "base":
            return "1rpc.io".concat(api_key_path).concat("/base");
        case "harmony":
            return "1rpc.io".concat(api_key_path).concat("/one");
        case "linea":
            return "1rpc.io".concat(api_key_path).concat("/linea");
    }

    assertArgument(false, "unsupported network", "network", name);
}


/**
 *  The **OneRpcProvider** connects to the [[link-1rpc]]
 *  JSON-RPC end-points.
 *
 *  By default, a free endpoint without api key is used, which is
 *  appropriate for quick prototypes and simple scripts. To
 *  gain access to an increased rate-limit, it is highly
 *  recommended to [sign up here](link-1rpc).
 */
export class OneRpcProvider extends JsonRpcProvider implements CommunityResourcable {
    /**
     *  The API token.
     */
    readonly token!: string;

    /**
     *  Creates a new **OneRpcProvider**.
     */
    constructor(_network?: Networkish, token?: null | string) {
        if (_network == null) { _network = "mainnet"; }
        const network = Network.from(_network);
        if (token == null) { token = defaultToken; }

        const request = OneRpcProvider.getRequest(network, token);
        super(request, network, { staticNetwork: network });

        defineProperties<OneRpcProvider>(this, { token });
    }

    _getProvider(chainId: number): AbstractProvider {
        try {
            return new OneRpcProvider(chainId, this.token);
        } catch (error) { }
        return super._getProvider(chainId);
    }

    isCommunityResource(): boolean {
        return (this.token === defaultToken);
    }

    /**
     *  Returns a new request prepared for %%network%% and the
     *  %%token%%.
     */
    static getRequest(network: Network, api_key?: null | string): FetchRequest {
        if (api_key == null) { api_key = defaultToken; }
        const request = new FetchRequest(`https:/\/${ getHost(network.name, api_key) }`);
        request.allowGzip = true;

        return request;
    }
}
