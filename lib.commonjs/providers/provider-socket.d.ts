/**
 *  Generic long-lived socket provider.
 *
 *  Sub-classing notes
 *  - a sub-class MUST call the `_start()` method once connected
 *  - a sub-class MUST override the `_write(string)` method
 *  - a sub-class MUST call `_processMessage(string)` for each message
 *
 *  @_subsection: api/providers/abstract-provider
 */
import { JsonRpcApiProvider } from "./provider-jsonrpc.js";
import type { Subscriber, Subscription } from "./abstract-provider.js";
import type { EventFilter } from "./provider.js";
import type { JsonRpcError, JsonRpcPayload, JsonRpcResult } from "./provider-jsonrpc.js";
import type { Networkish } from "./network.js";
export declare class SocketSubscriber implements Subscriber {
    #private;
    get filter(): Array<any>;
    constructor(provider: SocketProvider, filter: Array<any>);
    start(): void;
    stop(): void;
    pause(dropWhilePaused?: boolean): void;
    resume(): void;
    _handleMessage(message: any): void;
    _emit(provider: SocketProvider, message: any): Promise<void>;
}
export declare class SocketBlockSubscriber extends SocketSubscriber {
    constructor(provider: SocketProvider);
    _emit(provider: SocketProvider, message: any): Promise<void>;
}
export declare class SocketPendingSubscriber extends SocketSubscriber {
    constructor(provider: SocketProvider);
    _emit(provider: SocketProvider, message: any): Promise<void>;
}
export declare class SocketEventSubscriber extends SocketSubscriber {
    #private;
    get logFilter(): EventFilter;
    constructor(provider: SocketProvider, filter: EventFilter);
    _emit(provider: SocketProvider, message: any): Promise<void>;
}
/**
 *  SocketProvider...
 *
 */
export declare class SocketProvider extends JsonRpcApiProvider {
    #private;
    constructor(network?: Networkish);
    _getSubscriber(sub: Subscription): Subscriber;
    _register(filterId: number | string, subscriber: SocketSubscriber): void;
    _send(payload: JsonRpcPayload | Array<JsonRpcPayload>): Promise<Array<JsonRpcResult | JsonRpcError>>;
    _processMessage(message: string): Promise<void>;
    _write(message: string): Promise<void>;
}
//# sourceMappingURL=provider-socket.d.ts.map