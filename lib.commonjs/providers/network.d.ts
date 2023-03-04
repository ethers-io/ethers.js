/**
 *  About networks
 *
 *  @_subsection: api/providers:Networks  [networks]
 */
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
    name?: string;
    chainId?: number;
    ensAddress?: string;
    ensNetwork?: number;
};
export declare class Network {
    #private;
    constructor(name: string, chainId: BigNumberish);
    toJSON(): any;
    get name(): string;
    set name(value: string);
    get chainId(): bigint;
    set chainId(value: BigNumberish);
    get plugins(): Array<NetworkPlugin>;
    attachPlugin(plugin: NetworkPlugin): this;
    getPlugin<T extends NetworkPlugin = NetworkPlugin>(name: string): null | T;
    getPlugins<T extends NetworkPlugin = NetworkPlugin>(basename: string): Array<T>;
    clone(): Network;
    computeIntrinsicGas(tx: TransactionLike): number;
    /**
     *  Returns a new Network for the %%network%% name or chainId.
     */
    static from(network?: Networkish): Network;
    /**
     *  Register %%nameOrChainId%% with a function which returns
     *  an instance of a Network representing that chain.
     */
    static register(nameOrChainId: string | number | bigint, networkFunc: () => Network): void;
}
