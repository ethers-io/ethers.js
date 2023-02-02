/**
 *  About networks
 *
 *  @_subsection: api/providers:Networks  [networks]
 */

import { accessListify } from "../transaction/index.js";
import { getBigInt, assertArgument } from "../utils/index.js";

import { EnsPlugin, GasCostPlugin } from "./plugins-network.js";
//import { EtherscanPlugin } from "./provider-etherscan-base.js";

import type { BigNumberish } from "../utils/index.js";
import type { TransactionLike } from "../transaction/index.js";

import type { NetworkPlugin } from "./plugins-network.js";


/**
 *  A Networkish can be used to allude to a Network, by specifing:
 *  - a [[Network]] object
 *  - a well-known (or registered) network name
 *  - a well-known (or registered) chain ID
 *  - an object with sufficient details to describe a network
 */
export type Networkish = Network | number | bigint | string | {
    name?: string,
    chainId?: number,
    //layerOneConnection?: Provider,
    ensAddress?: string,
    ensNetwork?: number
};




/* * * *
// Networks which operation against an L2 can use this plugin to
// specify how to access L1, for the purpose of resolving ENS,
// for example.
export class LayerOneConnectionPlugin extends NetworkPlugin {
    readonly provider!: Provider;
// @TODO: Rename to ChainAccess and allow for connecting to any chain
    constructor(provider: Provider) {
        super("org.ethers.plugins.layer-one-connection");
        defineProperties<LayerOneConnectionPlugin>(this, { provider });
    }

    clone(): LayerOneConnectionPlugin {
        return new LayerOneConnectionPlugin(this.provider);
    }
}
*/

/* * * *
export class PriceOraclePlugin extends NetworkPlugin {
    readonly address!: string;

    constructor(address: string) {
        super("org.ethers.plugins.price-oracle");
        defineProperties<PriceOraclePlugin>(this, { address });
    }

    clone(): PriceOraclePlugin {
        return new PriceOraclePlugin(this.address);
    }
}
*/

// Networks or clients with a higher need for security (such as clients
// that may automatically make CCIP requests without user interaction)
// can use this plugin to anonymize requests or intercept CCIP requests
// to notify and/or receive authorization from the user
/* * * *
export type FetchDataFunc = (req: Frozen<FetchRequest>) => Promise<FetchRequest>;
export class CcipPreflightPlugin extends NetworkPlugin {
    readonly fetchData!: FetchDataFunc;

    constructor(fetchData: FetchDataFunc) {
        super("org.ethers.plugins.ccip-preflight");
        defineProperties<CcipPreflightPlugin>(this, { fetchData });
    }

    clone(): CcipPreflightPlugin {
        return new CcipPreflightPlugin(this.fetchData);
    }
}
*/

const Networks: Map<string | bigint, () => Network> = new Map();

// @TODO: Add a _ethersNetworkObj variable to better detect network ovjects

export class Network {
    #name: string;
    #chainId: bigint;

    #plugins: Map<string, NetworkPlugin>;

    constructor(name: string, chainId: BigNumberish) {
        this.#name = name;
        this.#chainId = getBigInt(chainId);
        this.#plugins = new Map();
    }

    toJSON(): any {
        return { name: this.name, chainId: this.chainId };
    }

    get name(): string { return this.#name; }
    set name(value: string) { this.#name =  value; }

    get chainId(): bigint { return this.#chainId; }
    set chainId(value: BigNumberish) { this.#chainId = getBigInt(value, "chainId"); }

    get plugins(): Array<NetworkPlugin> {
        return Array.from(this.#plugins.values());
    }

    attachPlugin(plugin: NetworkPlugin): this {
        if (this.#plugins.get(plugin.name)) {
            throw new Error(`cannot replace existing plugin: ${ plugin.name } `);
        }
        this.#plugins.set(plugin.name, plugin.clone());
        return this;
    }

    getPlugin<T extends NetworkPlugin = NetworkPlugin>(name: string): null | T {
        return <T>(this.#plugins.get(name)) || null;
    }

    // Gets a list of Plugins which match basename, ignoring any fragment
    getPlugins<T extends NetworkPlugin = NetworkPlugin>(basename: string): Array<T> {
        return <Array<T>>(this.plugins.filter((p) => (p.name.split("#")[0] === basename)));
    }

    clone(): Network {
        const clone = new Network(this.name, this.chainId);
        this.plugins.forEach((plugin) => {
            clone.attachPlugin(plugin.clone());
        });
        return clone;
    }

    computeIntrinsicGas(tx: TransactionLike): number {
        const costs = this.getPlugin<GasCostPlugin>("org.ethers.plugins.network.GasCost") || (new GasCostPlugin());

        let gas = costs.txBase;
        if (tx.to == null) { gas += costs.txCreate; }
        if (tx.data) {
            for (let i = 2; i < tx.data.length; i += 2) {
                if (tx.data.substring(i, i + 2) === "00") {
                    gas += costs.txDataZero;
                } else {
                    gas += costs.txDataNonzero;
                }
            }
        }

        if (tx.accessList) {
            const accessList = accessListify(tx.accessList);
            for (const addr in accessList) {
                gas += costs.txAccessListAddress + costs.txAccessListStorageKey * accessList[addr].storageKeys.length;
            }
        }

        return gas;
    }

    /**
     *  Returns a new Network for the %%network%% name or chainId.
     */
    static from(network?: Networkish): Network {
        injectCommonNetworks();

        // Default network
        if (network == null) { return Network.from("mainnet"); }

        // Canonical name or chain ID
        if (typeof(network) === "number") { network = BigInt(network); }
        if (typeof(network) === "string" || typeof(network) === "bigint") {
            const networkFunc = Networks.get(network);
            if (networkFunc) { return networkFunc(); }
            if (typeof(network) === "bigint") {
                return new Network("unknown", network);
            }

            assertArgument(false, "unknown network", "network", network);
        }

        // Clonable with network-like abilities
        if (typeof((<Network>network).clone) === "function") {
            const clone = (<Network>network).clone();
            //if (typeof(network.name) !== "string" || typeof(network.chainId) !== "number") {
            //}
            return clone;
        }

        // Networkish
        if (typeof(network) === "object") {
            assertArgument(typeof(network.name) === "string" && typeof(network.chainId) === "number",
                "invalid network object name or chainId", "network", network);

            const custom = new Network(<string>(network.name), <number>(network.chainId));

            if ((<any>network).ensAddress || (<any>network).ensNetwork != null) {
                custom.attachPlugin(new EnsPlugin((<any>network).ensAddress, (<any>network).ensNetwork));
            }

            //if ((<any>network).layerOneConnection) {
            //    custom.attachPlugin(new LayerOneConnectionPlugin((<any>network).layerOneConnection));
            //}

            return custom;
        }

        assertArgument(false, "invalid network", "network", network);
    }

    /**
     *  Register %%nameOrChainId%% with a function which returns
     *  an instance of a Network representing that chain.
     */
    static register(nameOrChainId: string | number | bigint, networkFunc: () => Network): void {
        if (typeof(nameOrChainId) === "number") { nameOrChainId = BigInt(nameOrChainId); }
        const existing = Networks.get(nameOrChainId);
        if (existing) {
            assertArgument(false, `conflicting network for ${ JSON.stringify(existing.name) }`, "nameOrChainId", nameOrChainId);
        }
        Networks.set(nameOrChainId, networkFunc);
    }
}


type Options = {
    ensNetwork?: number;
    priorityFee?: number
    altNames?: Array<string>;
    etherscan?: { url: string, apiKey: string };
};

// See: https://chainlist.org
let injected = false;
function injectCommonNetworks(): void {
    if (injected) { return; }
    injected = true;

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
/*
            if (options.etherscan) {
                const { url, apiKey } = options.etherscan;
                network.attachPlugin(new EtherscanPlugin(url, apiKey));
            }
*/
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

    registerEth("mainnet", 1, { ensNetwork: 1, altNames: [ "homestead" ] });
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
