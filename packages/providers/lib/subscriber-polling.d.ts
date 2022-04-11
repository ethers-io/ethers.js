import type { Subscriber } from "./abstract-provider.js";
import type { EventFilter, OrphanFilter, Provider, ProviderEvent } from "./provider.js";
export declare function getPollingSubscriber(provider: Provider, event: ProviderEvent): Subscriber;
export declare class PollingBlockSubscriber implements Subscriber {
    #private;
    constructor(provider: Provider);
    get pollingInterval(): number;
    set pollingInterval(value: number);
    start(): void;
    stop(): void;
    pause(dropWhilePaused?: boolean): void;
    resume(): void;
}
export declare class OnBlockSubscriber implements Subscriber {
    #private;
    constructor(provider: Provider);
    _poll(blockNumber: number, provider: Provider): Promise<void>;
    start(): void;
    stop(): void;
    pause(dropWhilePaused?: boolean): void;
    resume(): void;
}
export declare class PollingOrphanSubscriber extends OnBlockSubscriber {
    #private;
    constructor(provider: Provider, filter: OrphanFilter);
    _poll(blockNumber: number, provider: Provider): Promise<void>;
}
export declare class PollingTransactionSubscriber extends OnBlockSubscriber {
    #private;
    constructor(provider: Provider, hash: string);
    _poll(blockNumber: number, provider: Provider): Promise<void>;
}
export declare class PollingEventSubscriber implements Subscriber {
    #private;
    constructor(provider: Provider, filter: EventFilter);
    start(): void;
    stop(): void;
    pause(dropWhilePaused?: boolean): void;
    resume(): void;
}
//# sourceMappingURL=subscriber-polling.d.ts.map