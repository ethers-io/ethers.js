import { BigNumberish } from "@ethersproject/logger";
import type { Network } from "./network.js";
import type { Provider } from "./provider.js";
export declare class NetworkPlugin {
    readonly name: string;
    constructor(name: string);
    clone(): NetworkPlugin;
    validate(network: Network): NetworkPlugin;
}
export declare type GasCostParameters = {
    txBase?: number;
    txCreate?: number;
    txDataZero?: number;
    txDataNonzero?: number;
    txAccessListStorageKey?: number;
    txAccessListAddress?: number;
};
export declare class GasCostPlugin extends NetworkPlugin {
    readonly effectiveBlock: number;
    readonly txBase: number;
    readonly txCreate: number;
    readonly txDataZero: number;
    readonly txDataNonzero: number;
    readonly txAccessListStorageKey: number;
    readonly txAccessListAddress: number;
    constructor(effectiveBlock?: number, costs?: GasCostParameters);
    clone(): GasCostPlugin;
}
export declare class EnsPlugin extends NetworkPlugin {
    readonly address: string;
    readonly targetNetwork: number;
    constructor(address?: null | string, targetNetwork?: null | number);
    clone(): EnsPlugin;
    validate(network: Network): this;
}
export declare class MaxPriorityFeePlugin extends NetworkPlugin {
    readonly priorityFee: bigint;
    constructor(priorityFee: BigNumberish);
    getPriorityFee(provider: Provider): Promise<bigint>;
    clone(): MaxPriorityFeePlugin;
}
//# sourceMappingURL=plugins-network.d.ts.map