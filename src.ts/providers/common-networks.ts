
/**
 *  Exports the same Network as "./network.js" except with common
 *  networks injected registered.
 */

import { EnsPlugin, GasCostPlugin } from "./plugins-network.js";
import { EtherscanPlugin } from "./provider-etherscan.js";

import { Network } from "./network.js";

type Options = {
    ensNetwork?: number;
    priorityFee?: number
    altNames?: Array<string>;
    etherscan?: { url: string, apiKey: string };
};

// See: https://chainlist.org
export function injectCommonNetworks(): void {

    /// Register popular Ethereum networks
    function registerEth(name: string, chainId: number, options: Options): void {
        const func = function() {
            const network = new Network(name, chainId);

            // We use 0 to disable ENS
            if (options.ensNetwork != null) {
                network.attachPlugin(new EnsPlugin(null, options.ensNetwork));
            }

            if (options.priorityFee) {
//                network.attachPlugin(new MaxPriorityFeePlugin(options.priorityFee));
            }

            if (options.etherscan) {
                const { url, apiKey } = options.etherscan;
                network.attachPlugin(new EtherscanPlugin(url, apiKey));
            }

            network.attachPlugin(new GasCostPlugin());

            return network;
        };

        // Register the network by name and chain ID
        Network.register(name, func);
        Network.register(chainId, func);

        if (options.altNames) {
            options.altNames.forEach((name) => {
                Network.register(name, func);
            });
        }
    }

    registerEth("homestead", 1, { ensNetwork: 1, altNames: [ "mainnet" ] });
    registerEth("ropsten", 3, { ensNetwork: 3 });
    registerEth("rinkeby", 4, { ensNetwork: 4 });
    registerEth("goerli", 5, { ensNetwork: 5 });
    registerEth("kovan", 42, { ensNetwork: 42 });

    registerEth("classic", 61, { });
    registerEth("classicKotti", 6, { });

    registerEth("xdai", 100, { ensNetwork: 1 });

    // Polygon has a 35 gwei maxPriorityFee requirement
    registerEth("matic", 137, {
        ensNetwork: 1,
//        priorityFee: 35000000000,
        etherscan: {
            apiKey: "W6T8DJW654GNTQ34EFEYYP3EZD9DD27CT7",
            url: "https:/\/api.polygonscan.com/"
        }
    });
    registerEth("maticMumbai", 80001, {
//        priorityFee: 35000000000,
        etherscan: {
            apiKey: "W6T8DJW654GNTQ34EFEYYP3EZD9DD27CT7",
            url: "https:/\/api-testnet.polygonscan.com/"
        }
    });

    registerEth("bnb", 56, {
        ensNetwork: 1,
        etherscan: {
            apiKey: "EVTS3CU31AATZV72YQ55TPGXGMVIFUQ9M9",
            url: "http:/\/api.bscscan.com"
        }
    });
    registerEth("bnbt", 97, {
        etherscan: {
            apiKey: "EVTS3CU31AATZV72YQ55TPGXGMVIFUQ9M9",
            url: "http:/\/api-testnet.bscscan.com"
        }
    });
}

injectCommonNetworks();

export { Network };
