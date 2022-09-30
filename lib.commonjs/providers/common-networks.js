"use strict";
/**
 *  Exports the same Network as "./network.js" except with common
 *  networks injected registered.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.Network = exports.injectCommonNetworks = void 0;
const plugins_network_js_1 = require("./plugins-network.js");
const provider_etherscan_base_js_1 = require("./provider-etherscan-base.js");
const network_js_1 = require("./network.js");
Object.defineProperty(exports, "Network", { enumerable: true, get: function () { return network_js_1.Network; } });
// See: https://chainlist.org
function injectCommonNetworks() {
    /// Register popular Ethereum networks
    function registerEth(name, chainId, options) {
        const func = function () {
            const network = new network_js_1.Network(name, chainId);
            // We use 0 to disable ENS
            if (options.ensNetwork != null) {
                network.attachPlugin(new plugins_network_js_1.EnsPlugin(null, options.ensNetwork));
            }
            if (options.priorityFee) {
                //                network.attachPlugin(new MaxPriorityFeePlugin(options.priorityFee));
            }
            if (options.etherscan) {
                const { url, apiKey } = options.etherscan;
                network.attachPlugin(new provider_etherscan_base_js_1.EtherscanPlugin(url, apiKey));
            }
            network.attachPlugin(new plugins_network_js_1.GasCostPlugin());
            return network;
        };
        // Register the network by name and chain ID
        network_js_1.Network.register(name, func);
        network_js_1.Network.register(chainId, func);
        if (options.altNames) {
            options.altNames.forEach((name) => {
                network_js_1.Network.register(name, func);
            });
        }
    }
    registerEth("mainnet", 1, { ensNetwork: 1, altNames: ["homestead"] });
    registerEth("ropsten", 3, { ensNetwork: 3 });
    registerEth("rinkeby", 4, { ensNetwork: 4 });
    registerEth("goerli", 5, { ensNetwork: 5 });
    registerEth("kovan", 42, { ensNetwork: 42 });
    registerEth("classic", 61, {});
    registerEth("classicKotti", 6, {});
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
exports.injectCommonNetworks = injectCommonNetworks;
injectCommonNetworks();
//# sourceMappingURL=common-networks.js.map