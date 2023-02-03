import type { AbstractProvider, Subscriber } from "./abstract-provider.js";
import type { EventFilter } from "./provider.js";
import type { JsonRpcApiProvider } from "./provider-jsonrpc.js";
/**
 *  Some backends support subscribing to events using a Filter ID.
 *
 *  When subscribing with this technique, the node issues a unique
 *  //Filter ID//. At this point the node dedicates resources to
 *  the filter, so that periodic calls to follow up on the //Filter ID//
 *  will receive any events since the last call.
 *
 *  @_docloc: api/providers/abstract-provider
 */
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
/**
 *  A **FilterIdSubscriber** for receiving contract events.
 *
 *  @_docloc: api/providers/abstract-provider
 */
export declare class FilterIdEventSubscriber extends FilterIdSubscriber {
    #private;
    constructor(provider: JsonRpcApiProvider, filter: EventFilter);
    _recover(provider: AbstractProvider): Subscriber;
    _subscribe(provider: JsonRpcApiProvider): Promise<string>;
    _emitResults(provider: JsonRpcApiProvider, results: Array<any>): Promise<void>;
}
/**
 *  A **FilterIdSubscriber** for receiving pending transactions events.
 *
 *  @_docloc: api/providers/abstract-provider
 */
export declare class FilterIdPendingSubscriber extends FilterIdSubscriber {
    _subscribe(provider: JsonRpcApiProvider): Promise<string>;
    _emitResults(provider: JsonRpcApiProvider, results: Array<any>): Promise<void>;
}
