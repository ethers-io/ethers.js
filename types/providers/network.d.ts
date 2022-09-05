import { Formatter } from "./formatter.js";
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
export declare type Networkish = Network | number | bigint | string | {
    name?: string;
    chainId?: number;
    ensAddress?: string;
    ensNetwork?: number;
};
export declare class Network implements Freezable<Network> {
    #private;
    constructor(name: string, _chainId: BigNumberish, formatter?: Formatter);
    toJSON(): any;
    get name(): string;
    set name(value: string);
    get chainId(): bigint;
    set chainId(value: BigNumberish);
    get formatter(): Formatter;
    set formatter(value: Formatter);
    get plugins(): Array<NetworkPlugin>;
    attachPlugin(plugin: NetworkPlugin): this;
    getPlugin<T extends NetworkPlugin = NetworkPlugin>(name: string): null | T;
    getPlugins<T extends NetworkPlugin = NetworkPlugin>(basename: string): Array<T>;
    clone(): Network;
    freeze(): Frozen<Network>;
    isFrozen(): boolean;
    computeIntrinsicGas(tx: TransactionLike): number;
    static from(network?: Networkish): Network;
    static register(nameOrChainId: string | number | bigint, networkFunc: () => Network): void;
}
//# sourceMappingURL=network.d.ts.map