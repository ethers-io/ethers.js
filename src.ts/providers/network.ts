import {
    getStore, getBigInt, setStore, throwArgumentError
} from "../utils/index.js";

import { Formatter } from "./formatter.js";
import { EnsPlugin, GasCostPlugin } from "./plugins-network.js";

import type { BigNumberish } from "../utils/index.js";
import type { Freezable, Frozen } from "../utils/index.js";
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

const defaultFormatter = new Formatter();

export class Network implements Freezable<Network> {
    #props: {
      name: string,
      chainId: bigint,

      formatter: Formatter,

      plugins: Map<string, NetworkPlugin>
    };

    constructor(name: string, _chainId: BigNumberish, formatter?: Formatter) {
        const chainId = getBigInt(_chainId);
        if (formatter == null) { formatter = defaultFormatter; }
        const plugins = new Map();
        this.#props = { name, chainId, formatter, plugins };
    }

    toJSON(): any {
        return { name: this.name, chainId: this.chainId };
    }

    get name(): string { return getStore(this.#props, "name"); }
    set name(value: string) { setStore(this.#props, "name", value); }

    get chainId(): bigint { return getStore(this.#props, "chainId"); }
    set chainId(value: BigNumberish) { setStore(this.#props, "chainId", getBigInt(value, "chainId")); }

    get formatter(): Formatter { return getStore(this.#props, "formatter"); }
    set formatter(value: Formatter) { setStore(this.#props, "formatter", value); }

    get plugins(): Array<NetworkPlugin> {
        return Array.from(this.#props.plugins.values());
    }

    attachPlugin(plugin: NetworkPlugin): this {
        if (this.isFrozen()) { throw new Error("frozen"); }
        if (this.#props.plugins.get(plugin.name)) {
            throw new Error(`cannot replace existing plugin: ${ plugin.name } `);
        }
        this.#props.plugins.set(plugin.name, plugin.validate(this));
        return this;
    }

    getPlugin<T extends NetworkPlugin = NetworkPlugin>(name: string): null | T {
        return <T>(this.#props.plugins.get(name)) || null;
    }

    // Gets a list of Plugins which match basename, ignoring any fragment
    getPlugins<T extends NetworkPlugin = NetworkPlugin>(basename: string): Array<T> {
        return <Array<T>>(this.plugins.filter((p) => (p.name.split("#")[0] === basename)));
    }

    clone(): Network {
        const clone = new Network(this.name, this.chainId, this.formatter);
        this.plugins.forEach((plugin) => {
            clone.attachPlugin(plugin.clone());
        });
        return clone;
    }

    freeze(): Frozen<Network> {
        Object.freeze(this.#props);
        return this;
    }

    isFrozen(): boolean {
        return Object.isFrozen(this.#props);
    }

    computeIntrinsicGas(tx: TransactionLike): number {
        const costs = this.getPlugin<GasCostPlugin>("org.ethers.gas-cost") || (new GasCostPlugin());

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
            const accessList = this.formatter.accessList(tx.accessList);
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
        // Default network
        if (network == null) { return Network.from("homestead"); }

        // Canonical name or chain ID
        if (typeof(network) === "number") { network = BigInt(network); }
        if (typeof(network) === "string" || typeof(network) === "bigint") {
            const networkFunc = Networks.get(network);
            if (networkFunc) { return networkFunc(); }
            if (typeof(network) === "bigint") {
                return new Network("unknown", network);
            }

            throwArgumentError("unknown network", "network", network);
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
            if (typeof(network.name) !== "string" || typeof(network.chainId) !== "number") {
                throwArgumentError("invalid network object name or chainId", "network", network);
            }

            const custom = new Network(<string>(network.name), <number>(network.chainId));

            if ((<any>network).ensAddress || (<any>network).ensNetwork != null) {
                custom.attachPlugin(new EnsPlugin((<any>network).ensAddress, (<any>network).ensNetwork));
            }

            //if ((<any>network).layerOneConnection) {
            //    custom.attachPlugin(new LayerOneConnectionPlugin((<any>network).layerOneConnection));
            //}

            return custom;
        }

        return throwArgumentError("invalid network", "network", network);
    }

    /**
     *  Register %%nameOrChainId%% with a function which returns
     *  an instance of a Network representing that chain.
     */
    static register(nameOrChainId: string | number | bigint, networkFunc: () => Network): void {
        if (typeof(nameOrChainId) === "number") { nameOrChainId = BigInt(nameOrChainId); }
        const existing = Networks.get(nameOrChainId);
        if (existing) {
            throwArgumentError(`conflicting network for ${ JSON.stringify(existing.name) }`, "nameOrChainId", nameOrChainId);
        }
        Networks.set(nameOrChainId, networkFunc);
    }
}
