import { AbstractProvider } from "./abstract-provider.js";
import { Network } from "./network.js";
import type { PerformActionRequest, Subscriber, Subscription } from "./abstract-provider.js";
import type { Networkish } from "./network.js";
export interface FallbackProviderConfig {
    provider: AbstractProvider;
    stallTimeout?: number;
    priority?: number;
    weight?: number;
}
export interface FallbackProviderState extends Required<FallbackProviderConfig> {
    blockNumber: number;
    requests: number;
    errorResponses: number;
    lateResponses: number;
    outOfSync: number;
    unsupportedEvents: number;
    rollingDuration: number;
    score: number;
}
export declare type FallbackProviderOptions = {
    quorum: number;
    eventQuorum: number;
    eventWorkers: number;
};
export declare class FallbackProvider extends AbstractProvider {
    #private;
    readonly quorum: number;
    readonly eventQuorum: number;
    readonly eventWorkers: number;
    constructor(providers: Array<AbstractProvider | FallbackProviderConfig>, network?: Networkish);
    _detectNetwork(): Promise<Readonly<{
        toJSON: () => any;
        name: string;
        chainId: bigint;
        formatter: Readonly<import("./formatter.js").Formatter>;
        readonly plugins: readonly import("./plugins-network.js").NetworkPlugin[];
        attachPlugin: (plugin: import("./plugins-network.js").NetworkPlugin) => Network;
        getPlugin: <T extends import("./plugins-network.js").NetworkPlugin = import("./plugins-network.js").NetworkPlugin>(name: string) => T | null;
        getPlugins: <T_1 extends import("./plugins-network.js").NetworkPlugin = import("./plugins-network.js").NetworkPlugin>(basename: string) => T_1[];
        clone: () => Network;
        freeze: () => Readonly<any>;
        isFrozen: () => boolean;
        computeIntrinsicGas: (tx: import("@ethersproject/transactions").TransactionLike<string>) => number;
    }>>;
    _getSubscriber(sub: Subscription): Subscriber;
    _perform<T = any>(req: PerformActionRequest): Promise<T>;
}
//# sourceMappingURL=provider-fallback.d.ts.map