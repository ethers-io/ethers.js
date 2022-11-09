import { AbstractProvider } from "./abstract-provider.js";
import { Network } from "./network.js";
import type { PerformActionRequest } from "./abstract-provider.js";
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
    get providerConfigs(): Array<FallbackProviderState>;
    _detectNetwork(): Promise<Network>;
    _translatePerform(provider: AbstractProvider, req: PerformActionRequest): Promise<any>;
    _perform<T = any>(req: PerformActionRequest): Promise<T>;
}
//# sourceMappingURL=provider-fallback.d.ts.map