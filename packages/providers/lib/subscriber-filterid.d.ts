import type { AbstractProvider, Subscriber } from "./abstract-provider.js";
import type { EventFilter } from "./provider.js";
import type { JsonRpcApiProvider } from "./provider-jsonrpc.js";
export declare class FilterIdSubscriber implements Subscriber {
    #private;
    constructor(provider: JsonRpcApiProvider);
    _subscribe(provider: JsonRpcApiProvider): Promise<string>;
    _emitResults(provider: AbstractProvider, result: Array<any>): Promise<void>;
    _recover(provider: AbstractProvider): Subscriber;
    start(): void;
    stop(): void;
    pause(dropWhilePaused?: boolean): void;
    resume(): void;
}
export declare class FilterIdEventSubscriber extends FilterIdSubscriber {
    #private;
    constructor(provider: JsonRpcApiProvider, filter: EventFilter);
    _recover(provider: AbstractProvider): Subscriber;
    _subscribe(provider: JsonRpcApiProvider): Promise<string>;
    _emitResults(provider: JsonRpcApiProvider, results: Array<any>): Promise<void>;
}
export declare class FilterIdPendingSubscriber extends FilterIdSubscriber {
    _subscribe(provider: JsonRpcApiProvider): Promise<string>;
    _emitResults(provider: JsonRpcApiProvider, results: Array<any>): Promise<void>;
}
//# sourceMappingURL=subscriber-filterid.d.ts.map