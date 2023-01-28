/**
 *  [[link-etherscan]] provides a third-party service for connecting to
 *  various blockchains over a combination of JSON-RPC and custom API
 *  endpoints.
 *
 *  **Supported Networks**
 *
 *  - Ethereum Mainnet (``mainnet``)
 *  - Goerli Testnet (``goerli``)
 *  - Sepolia Testnet (``sepolia``)
 *  - Arbitrum (``arbitrum``)
 *  - Arbitrum Goerli Testnet (``arbitrum-goerli``)
 *  - Optimism (``optimism``)
 *  - Optimism Goerli Testnet (``optimism-goerli``)
 *  - Polygon (``matic``)
 *  - Polygon Mumbai Testnet (``maticmum``)
 *
 *  @_subsection api/providers/thirdparty:Etherscan  [providers-etherscan]
 */
import { BaseEtherscanProvider } from "./provider-etherscan-base.js";
import { Contract } from "../contract/index.js";
/**
 *  The **EtherscanProvider** connects to the [[link-etherscan]]
 *  JSON-RPC end-points.
 *
 *  By default, requests are highly-throttled, which is
 *  appropriate for quick prototypes and simple scripts. To
 *  gain access to an increased rate-limit, it is highly
 *  recommended to [sign up here](link-etherscan-signup).
 */
export declare class EtherscanProvider extends BaseEtherscanProvider {
    /**
     *  Resolves to a [Contract]] for %%address%%, using the
     *  Etherscan API to retreive the Contract ABI.
     */
    getContract(_address: string): Promise<null | Contract>;
}
//# sourceMappingURL=provider-etherscan.d.ts.map