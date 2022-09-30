"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Network = void 0;
const index_js_1 = require("../transaction/index.js");
const index_js_2 = require("../utils/index.js");
const plugins_network_js_1 = require("./plugins-network.js");
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
const Networks = new Map();
// @TODO: Add a _ethersNetworkObj variable to better detect network ovjects
class Network {
    #props;
    constructor(name, _chainId) {
        const chainId = (0, index_js_2.getBigInt)(_chainId);
        const plugins = new Map();
        this.#props = { name, chainId, plugins };
    }
    toJSON() {
        return { name: this.name, chainId: this.chainId };
    }
    get name() { return (0, index_js_2.getStore)(this.#props, "name"); }
    set name(value) { (0, index_js_2.setStore)(this.#props, "name", value); }
    get chainId() { return (0, index_js_2.getStore)(this.#props, "chainId"); }
    set chainId(value) { (0, index_js_2.setStore)(this.#props, "chainId", (0, index_js_2.getBigInt)(value, "chainId")); }
    get plugins() {
        return Array.from(this.#props.plugins.values());
    }
    attachPlugin(plugin) {
        if (this.#props.plugins.get(plugin.name)) {
            throw new Error(`cannot replace existing plugin: ${plugin.name} `);
        }
        this.#props.plugins.set(plugin.name, plugin.clone());
        return this;
    }
    getPlugin(name) {
        return (this.#props.plugins.get(name)) || null;
    }
    // Gets a list of Plugins which match basename, ignoring any fragment
    getPlugins(basename) {
        return (this.plugins.filter((p) => (p.name.split("#")[0] === basename)));
    }
    clone() {
        const clone = new Network(this.name, this.chainId);
        this.plugins.forEach((plugin) => {
            clone.attachPlugin(plugin.clone());
        });
        return clone;
    }
    /*
        freeze(): Frozen<Network> {
            Object.freeze(this.#props);
            return this;
        }
    
        isFrozen(): boolean {
            return Object.isFrozen(this.#props);
        }
    */
    computeIntrinsicGas(tx) {
        const costs = this.getPlugin("org.ethers.gas-cost") || (new plugins_network_js_1.GasCostPlugin());
        let gas = costs.txBase;
        if (tx.to == null) {
            gas += costs.txCreate;
        }
        if (tx.data) {
            for (let i = 2; i < tx.data.length; i += 2) {
                if (tx.data.substring(i, i + 2) === "00") {
                    gas += costs.txDataZero;
                }
                else {
                    gas += costs.txDataNonzero;
                }
            }
        }
        if (tx.accessList) {
            const accessList = (0, index_js_1.accessListify)(tx.accessList);
            for (const addr in accessList) {
                gas += costs.txAccessListAddress + costs.txAccessListStorageKey * accessList[addr].storageKeys.length;
            }
        }
        return gas;
    }
    /**
     *  Returns a new Network for the %%network%% name or chainId.
     */
    static from(network) {
        // Default network
        if (network == null) {
            return Network.from("mainnet");
        }
        // Canonical name or chain ID
        if (typeof (network) === "number") {
            network = BigInt(network);
        }
        if (typeof (network) === "string" || typeof (network) === "bigint") {
            const networkFunc = Networks.get(network);
            if (networkFunc) {
                return networkFunc();
            }
            if (typeof (network) === "bigint") {
                return new Network("unknown", network);
            }
            (0, index_js_2.throwArgumentError)("unknown network", "network", network);
        }
        // Clonable with network-like abilities
        if (typeof (network.clone) === "function") {
            const clone = network.clone();
            //if (typeof(network.name) !== "string" || typeof(network.chainId) !== "number") {
            //}
            return clone;
        }
        // Networkish
        if (typeof (network) === "object") {
            if (typeof (network.name) !== "string" || typeof (network.chainId) !== "number") {
                (0, index_js_2.throwArgumentError)("invalid network object name or chainId", "network", network);
            }
            const custom = new Network((network.name), (network.chainId));
            if (network.ensAddress || network.ensNetwork != null) {
                custom.attachPlugin(new plugins_network_js_1.EnsPlugin(network.ensAddress, network.ensNetwork));
            }
            //if ((<any>network).layerOneConnection) {
            //    custom.attachPlugin(new LayerOneConnectionPlugin((<any>network).layerOneConnection));
            //}
            return custom;
        }
        return (0, index_js_2.throwArgumentError)("invalid network", "network", network);
    }
    /**
     *  Register %%nameOrChainId%% with a function which returns
     *  an instance of a Network representing that chain.
     */
    static register(nameOrChainId, networkFunc) {
        if (typeof (nameOrChainId) === "number") {
            nameOrChainId = BigInt(nameOrChainId);
        }
        const existing = Networks.get(nameOrChainId);
        if (existing) {
            (0, index_js_2.throwArgumentError)(`conflicting network for ${JSON.stringify(existing.name)}`, "nameOrChainId", nameOrChainId);
        }
        Networks.set(nameOrChainId, networkFunc);
    }
}
exports.Network = Network;
//# sourceMappingURL=network.js.map