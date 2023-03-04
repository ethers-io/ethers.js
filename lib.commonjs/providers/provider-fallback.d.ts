import { AbstractProvider } from "./abstract-provider.js";
import { Network } from "./network.js";
import type { PerformActionRequest } from "./abstract-provider.js";
import type { Networkish } from "./network.js";
/**
 *  A configuration entry for how to use a [[Provider]].
 */
export interface FallbackProviderConfig {
    provider: AbstractProvider;
    stallTimeout?: number;
    priority?: number;
    weight?: number;
}
/**
 *  The statistics and state maintained for a [[Provider]].
 */
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
/**
 *  Additional options to configure a [[FallbackProvider]].
 */
export type FallbackProviderOptions = {
    quorum: number;
    eventQuorum: number;
    eventWorkers: number;
};
/**
 *  A Fallback Provider.
 *
 */
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
    destroy(): Promise<void>;
}
