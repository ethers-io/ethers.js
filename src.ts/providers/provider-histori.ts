/**
 *  [[link-histori]] provides a third-party service for connecting to
 *  various blockchains over JSON-RPC.
 *
 *  **Supported Networks**
 *
 *  - Ethereum Mainnet (``mainnet``)
 *  - Polygon PoS Mainnet (``matic``)
 *  - zkSync Era Mainnet (``zksync``)
 *  - Ethereum Sepolia Testnet (``sepolia``)
 *  - Optimism Mainnet (``optimism``)
 *  - Arbitrum Mainnet (``arbitrum``)
 *  - Base (``base``)
 *  - Polygon zkEVM Mainnet (``polygon-zkevm``)
 *  - Binance Smart Chain Mainnet (BSC) (``bnb``)
 *  - Avalanche Mainnet (``avalanche``)
 *  - ApeChain Mainnet (``apechain``)
 *  - Linea Mainnet (``linea``)
 *  - Scroll Mainnet (``scroll``)
 *  - Blast Mainnet (``blast``)
 *  - Mantle Mainnet (``mantle``)
 *  - Celo Mainnet (``celo``)
 *  - WorldChain Mainnet (``worldchain``)
 *  - Palm Mainnet (``palm``)
 *  - Shape Mainnet (``shape``)
 *  - Geist Mainnet (``geist``)
 *  - Arbitrum Nova (``arbitrum-nova``)
 *  - Astar Mainnet (``astar``)
 *  - ZetaChain Mainnet (``zetachain``)
 *  - Fantom Mainnet (``fantom``)
 *  - Fraxtal Mainnet (``fraxtal``)
 *  - Berachain bArtio (``berachain``)
 *  - Zora Mainnet (``zora``)
 *  - Polynomial Mainnet (``polynomial``)
 *  - Flow EVM Mainnet (``flow-evm``)
 *  - Lens Testnet (``lens``)
 *  - Soneium Minato Testnet (``soneium-minato``)
 *  - Rootstock Mainnet (``rsk``)
 *  - Unichain Testnet (``unichain``)
 *  - Gnosis Mainnet (``xdai``)
 *  - Aurora Mainnet (``aurora``)
 *  - Kaia Mainnet (``kaia``)
 *  - Aleph Zero EVM Mainnet (``aleph-zero``)
 *  - Harmony (``harmony``)
 *  - Immutable zkEVM (``immutable``)
 *  - Kava Mainnet (``kava``)
 *  - Kroma Mainnet (``kroma``)
 *  - Lisk Mainnet (``lisk``)
 *  - Manta Pacific Mainnet (``manta``)
 *  - Metal L2 Mainnet (``metal-l2``)
 *  - Moonbeam Mainnet (``moonbeam``)
 *  - Neon Mainnet (``neon``)
 *  - Ronin Mainnet (Axie Infinity) (``ronin``)
 *  - Sei Mainnet (``sei``)
 *  - Taiko Mainnet (``taiko``)
 *  - Telos Mainnet (``telos``)
 *  - X Layer Mainnet (``xlayer``)
 *  - Zircuit Mainnet (``zircuit``)
 *
 *  @_subsection: api/providers/thirdparty:Histori  [providers-histori]
 */

import {
    defineProperties,
    resolveProperties,
    assert,
    assertArgument,
    FetchRequest,
  } from "../utils/index.js";
  
  import { showThrottleMessage } from "./community.js";
  import { Network } from "./network.js";
  import { JsonRpcProvider } from "./provider-jsonrpc.js";
  
  import type {
    AbstractProvider,
    PerformActionRequest,
  } from "./abstract-provider.js";
  import type { CommunityResourcable } from "./community.js";
  import type { Networkish } from "./network.js";
  
  const defaultProjectId = "8ry9f6t9dct1se2hlagxnd9n2a";
  
  // see https://docs.histori.xyz/docs/networks
  function resolveNetworkId(name: string): string {
      // Combined mappings for shorthand and full names
      const networkMapping: Record<string, string> = {
          mainnet: "eth-mainnet", // for backwards compatibility with current network namings
          sepolia: "eth-sepolia", // for backwards compatibility with current network namings
          arbitrum: "arbitrum-mainnet", // for backwards compatibility with current network namings
          base: "base-mainnet", // for backwards compatibility with current network namings
          matic: "matic-mainnet",
          optimism: "optimism-mainnet",
          bnb: "bsc-mainnet",
          linea: "linea-mainnet",
          xdai: "gnosis-mainnet",
          "eth-mainnet": "eth-mainnet",
          "matic-mainnet": "matic-mainnet",
          "zksync-mainnet": "zksync-mainnet",
          "eth-sepolia": "eth-sepolia",
          "optimism-mainnet": "optimism-mainnet",
          "arbitrum-mainnet": "arbitrum-mainnet",
          "base-mainnet": "base-mainnet",
          "polygon-zkevm-mainnet": "polygon-zkevm-mainnet",
          "bsc-mainnet": "bsc-mainnet",
          "avalanche-mainnet": "avalanche-mainnet",
          "apechain-mainnet": "apechain-mainnet",
          "linea-mainnet": "linea-mainnet",
          "scroll-mainnet": "scroll-mainnet",
          "blast-mainnet": "blast-mainnet",
          "mantle-mainnet": "mantle-mainnet",
          "celo-mainnet": "celo-mainnet",
          "worldchain-mainnet": "worldchain-mainnet",
          "palm-mainnet": "palm-mainnet",
          "shape-mainnet": "shape-mainnet",
          "geist-mainnet": "geist-mainnet",
          "arbitrum-nova-mainnet": "arbitrum-nova-mainnet",
          "astar-mainnet": "astar-mainnet",
          "zetachain-mainnet": "zetachain-mainnet",
          "fantom-mainnet": "fantom-mainnet",
          "fraxtal-mainnet": "fraxtal-mainnet",
          "berachain-testnet": "berachain-testnet",
          "zora-mainnet": "zora-mainnet",
          "polynomial-mainnet": "polynomial-mainnet",
          "flow-evm-mainnet": "flow-evm-mainnet",
          "lens-testnet": "lens-testnet",
          "soneium-minato-testnet": "soneium-minato-testnet",
          "rsk-mainnet": "rsk-mainnet",
          "unichain-sepolia-testnet": "unichain-sepolia-testnet",
          "gnosis-mainnet": "gnosis-mainnet",
          "aurora-mainnet": "aurora-mainnet",
          "kaia-mainnet": "kaia-mainnet",
          "aleph-zero-mainnet": "aleph-zero-mainnet",
          "harmony-mainnet": "harmony-mainnet",
          "immutable-mainnet": "immutable-mainnet",
          "kava-mainnet": "kava-mainnet",
          "kroma-mainnet": "kroma-mainnet",
          "lisk-mainnet": "lisk-mainnet",
          "manta-mainnet": "manta-mainnet",
          "metal-l2-mainnet": "metal-l2-mainnet",
          "moonbeam-mainnet": "moonbeam-mainnet",
          "neon-mainnet": "neon-mainnet",
          "ronin-mainnet": "ronin-mainnet",
          "sei-mainnet": "sei-mainnet",
          "taiko-mainnet": "taiko-mainnet",
          "telos-mainnet": "telos-mainnet",
          "xlayer-mainnet": "xlayer-mainnet",
          "zircuit-mainnet": "zircuit-mainnet",
      };
  
      // Perform a single lookup in the networkMapping
      const resolvedNetworkId = networkMapping[name] ?? networkMapping[`${name}-mainnet`];
  
      if (resolvedNetworkId) {
          return resolvedNetworkId;
      }
  
      // If not found, throw an error
      assertArgument(false, `Unsupported network: ${name}`, "network", name);
  }
  
  /**
   *  The **HistoriProvider** connects to the [[link-histori]]
   *  JSON-RPC end-points.
   *
   *  By default, a highly-throttled API key is used, which is
   *  appropriate for quick prototypes and simple scripts. To
   *  gain access to an increased rate-limit, it is highly
   *  recommended to [sign up here](link-histori-signup).
   *
   *  @_docloc: api/providers/thirdparty
   */
  export class HistoriProvider
    extends JsonRpcProvider
    implements CommunityResourcable
  {
    readonly projectId!: string;
  
    constructor(_network?: Networkish, projectId?: null | string) {
      if (_network == null) {
        _network = "mainnet";
      }
      const network = Network.from(_network);
      if (projectId == null) {
        projectId = defaultProjectId;
      }
  
      const request = HistoriProvider.getRequest(network, projectId);
      super(request, network, { staticNetwork: network });
  
      defineProperties<HistoriProvider>(this, { projectId });
    }
  
    _getProvider(chainId: number): AbstractProvider {
      try {
        return new HistoriProvider(chainId, this.projectId);
      } catch (error) {}
      return super._getProvider(chainId);
    }
  
    async _perform(req: PerformActionRequest): Promise<any> {
      // https://docs.alchemy.com/reference/trace-transaction
      if (req.method === "getTransactionResult") {
        const { trace, tx } = await resolveProperties({
          trace: this.send("trace_transaction", [req.hash]),
          tx: this.getTransaction(req.hash),
        });
        if (trace == null || tx == null) {
          return null;
        }
  
        let data: undefined | string;
        let error = false;
        try {
          data = trace[0].result.output;
          error = trace[0].error === "Reverted";
        } catch (error) {}
  
        if (data) {
          assert(
            !error,
            "an error occurred during transaction executions",
            "CALL_EXCEPTION",
            {
              action: "getTransactionResult",
              data,
              reason: null,
              transaction: tx,
              invocation: null,
              revert: null, // @TODO
            }
          );
          return data;
        }
  
        assert(false, "could not parse trace result", "BAD_DATA", {
          value: trace,
        });
      }
  
      return await super._perform(req);
    }
  
    isCommunityResource(): boolean {
      return this.projectId === defaultProjectId;
    }
  
    static getRequest(network: Network, projectId?: string): FetchRequest {
      if (projectId == null) {
        projectId = defaultProjectId;
      }
  
      const request = new FetchRequest(
        `https:/\/node.histori.xyz/${resolveNetworkId(network.name)}/${projectId}`
      );
      request.allowGzip = true;
  
      if (projectId === defaultProjectId) {
        request.retryFunc = async (request, response, attempt) => {
          showThrottleMessage("Histori");
          return true;
        };
      }
  
      return request;
    }
  }
  