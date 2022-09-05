import type { AbstractProvider, Subscriber } from "./abstract-provider.js";
import type { EventFilter, OrphanFilter, ProviderEvent } from "./provider.js";
export declare function getPollingSubscriber(provider: AbstractProvider, event: ProviderEvent): Subscriber;
export declare class PollingBlockSubscriber implements Subscriber {
    #private;
    constructor(provider: AbstractProvider);
    get pollingInterval(): number;
    set pollingInterval(value: number);
    start(): void;
    stop(): void;
    pause(dropWhilePaused?: boolean): void;
    resume(): void;
}
export declare class OnBlockSubscriber implements Subscriber {
    #private;
    constructor(provider: AbstractProvider);
    _poll(blockNumber: number, provider: AbstractProvider): Promise<void>;
    start(): void;
    stop(): void;
    pause(dropWhilePaused?: boolean): void;
    resume(): void;
}
export declare class PollingOrphanSubscriber extends OnBlockSubscriber {
    #private;
    constructor(provider: AbstractProvider, filter: OrphanFilter);
    _poll(blockNumber: number, provider: AbstractProvider): Promise<void>;
}
export declare class PollingTransactionSubscriber extends OnBlockSubscriber {
    #private;
    constructor(provider: AbstractProvider, hash: string);
    _poll(blockNumber: number, provider: AbstractProvider): Promise<void>;
}
export declare class PollingEventSubscriber implements Subscriber {
    #private;
    constructor(provider: AbstractProvider, filter: EventFilter);
    start(): void;
    stop(): void;
    pause(dropWhilePaused?: boolean): void;
    resume(): void;
}
//# sourceMappingURL=subscriber-polling.d.ts.map