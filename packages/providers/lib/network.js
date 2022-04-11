var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Network_props;
import { getStore, setStore } from "@ethersproject/properties";
import { Formatter } from "./formatter.js";
import { logger } from "./logger.js";
import { EnsPlugin, GasCostPlugin } from "./plugins-network.js";
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
const defaultFormatter = new Formatter();
export class Network {
    constructor(name, _chainId, formatter) {
        _Network_props.set(this, void 0);
        const chainId = logger.getBigInt(_chainId);
        if (formatter == null) {
            formatter = defaultFormatter;
        }
        const plugins = new Map();
        __classPrivateFieldSet(this, _Network_props, { name, chainId, formatter, plugins }, "f");
    }
    toJSON() {
        return { name: this.name, chainId: this.chainId };
    }
    get name() { return getStore(__classPrivateFieldGet(this, _Network_props, "f"), "name"); }
    set name(value) { setStore(__classPrivateFieldGet(this, _Network_props, "f"), "name", value); }
    get chainId() { return getStore(__classPrivateFieldGet(this, _Network_props, "f"), "chainId"); }
    set chainId(value) { setStore(__classPrivateFieldGet(this, _Network_props, "f"), "chainId", logger.getBigInt(value, "chainId")); }
    get formatter() { return getStore(__classPrivateFieldGet(this, _Network_props, "f"), "formatter"); }
    set formatter(value) { setStore(__classPrivateFieldGet(this, _Network_props, "f"), "formatter", value); }
    get plugins() {
        return Array.from(__classPrivateFieldGet(this, _Network_props, "f").plugins.values());
    }
    attachPlugin(plugin) {
        if (this.isFrozen()) {
            throw new Error("frozen");
        }
        if (__classPrivateFieldGet(this, _Network_props, "f").plugins.get(plugin.name)) {
            throw new Error(`cannot replace existing plugin: ${plugin.name} `);
        }
        __classPrivateFieldGet(this, _Network_props, "f").plugins.set(plugin.name, plugin.validate(this));
        return this;
    }
    getPlugin(name) {
        return (__classPrivateFieldGet(this, _Network_props, "f").plugins.get(name)) || null;
    }
    // Gets a list of Plugins which match basename, ignoring any fragment
    getPlugins(basename) {
        return (this.plugins.filter((p) => (p.name.split("#")[0] === basename)));
    }
    clone() {
        const clone = new Network(this.name, this.chainId, this.formatter);
        this.plugins.forEach((plugin) => {
            clone.attachPlugin(plugin.clone());
        });
        return clone;
    }
    freeze() {
        Object.freeze(__classPrivateFieldGet(this, _Network_props, "f"));
        return this;
    }
    isFrozen() {
        return Object.isFrozen(__classPrivateFieldGet(this, _Network_props, "f"));
    }
    computeIntrinsicGas(tx) {
        const costs = this.getPlugin("org.ethers.gas-cost") || (new GasCostPlugin());
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
            const accessList = this.formatter.accessList(tx.accessList);
            for (const addr in accessList) {
                gas += costs.txAccessListAddress + costs.txAccessListStorageKey * accessList[addr].storageKeys.length;
            }
        }
        return gas;
    }
    static from(network) {
        // Default network
        if (network == null) {
            return Network.from("homestead");
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
            logger.throwArgumentError("unknown network", "network", network);
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
                logger.throwArgumentError("invalid network object name or chainId", "network", network);
            }
            const custom = new Network((network.name), (network.chainId));
            if (network.ensAddress || network.ensNetwork != null) {
                custom.attachPlugin(new EnsPlugin(network.ensAddress, network.ensNetwork));
            }
            //if ((<any>network).layerOneConnection) {
            //    custom.attachPlugin(new LayerOneConnectionPlugin((<any>network).layerOneConnection));
            //}
            return custom;
        }
        return logger.throwArgumentError("invalid network", "network", network);
    }
    static register(nameOrChainId, networkFunc) {
        if (typeof (nameOrChainId) === "number") {
            nameOrChainId = BigInt(nameOrChainId);
        }
        const existing = Networks.get(nameOrChainId);
        if (existing) {
            logger.throwArgumentError(`conflicting network for ${JSON.stringify(existing.name)}`, "nameOrChainId", nameOrChainId);
        }
        Networks.set(nameOrChainId, networkFunc);
    }
}
_Network_props = new WeakMap();
//# sourceMappingURL=network.js.map