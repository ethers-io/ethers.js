export declare type Listener = (...args: Array<any>) => void;
export interface EventEmitterable<T> {
    on(event: T, listener: Listener): Promise<this>;
    once(event: T, listener: Listener): Promise<this>;
    emit(event: T, ...args: Array<any>): Promise<boolean>;
    listenerCount(event?: T): Promise<number>;
    listeners(event?: T): Promise<Array<Listener>>;
    off(event: T, listener?: Listener): Promise<this>;
    removeAllListeners(event?: T): Promise<this>;
    addListener(event: T, listener: Listener): Promise<this>;
    removeListener(event: T, listener: Listener): Promise<this>;
}
export declare class EventPayload<T> {
    #private;
    readonly filter: T;
    readonly emitter: EventEmitterable<T>;
    constructor(emitter: EventEmitterable<T>, listener: null | Listener, filter: T);
    removeListener(): Promise<void>;
}
//# sourceMappingURL=events.d.ts.map