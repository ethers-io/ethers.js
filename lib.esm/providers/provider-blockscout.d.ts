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
import { FetchRequest } from "../utils/index.js";
import { AbstractProvider } from "./abstract-provider.js";
import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";
import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";
import type { JsonRpcError, JsonRpcPayload } from "./provider-jsonrpc.js";
/**
 *  The **BlockscoutProvider** connects to the [[link-blockscout]]
 *  JSON-RPC end-points.
 *
 *  By default, a highly-throttled API key is used, which is
 *  appropriate for quick prototypes and simple scripts. To
 *  gain access to an increased rate-limit, it is highly
 *  recommended to [sign up here](link-blockscout-signup).
 */
export declare class BlockscoutProvider extends JsonRpcProvider implements CommunityResourcable {
    /**
     *  The API key for the Blockscout connection.
     */
    readonly apiKey: string;
    /**
     *  Create a new **BlockscoutProvider**.
     *
     *  By default connecting to ``mainnet`` with a highly throttled
     *  API key.
     */
    constructor(_network?: Networkish, apiKey?: null | string);
    _getProvider(chainId: number): AbstractProvider;
    /**
     *  Returns a prepared request for connecting to %%network%% with
     *  %%apiKey%%.
     */
    static getRequest(network: Network, apiKey?: null | string): FetchRequest;
    getRpcError(payload: JsonRpcPayload, error: JsonRpcError): Error;
    isCommunityResource(): boolean;
}
//# sourceMappingURL=provider-blockscout.d.ts.map