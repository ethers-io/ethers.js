/**
 *  Explain events...
 *
 *  @_section api/utils/events:Events  [about-events]
 */
import { defineProperties } from "./properties.js";

export type Listener = (...args: Array<any>) => void;

export interface EventEmitterable<T> {
    on(event: T, listener: Listener): Promise<this>;
    once(event: T, listener: Listener): Promise<this>;
    emit(event: T, ...args: Array<any>): Promise<boolean>;
    listenerCount(event?: T): Promise<number>;
    listeners(event?: T): Promise<Array<Listener>>;
    off(event: T, listener?: Listener): Promise<this>;
    removeAllListeners(event?: T): Promise<this>;

    // Alias for "on"
    addListener(event: T, listener: Listener): Promise<this>;

    // Alias for "off"
    removeListener(event: T, listener: Listener): Promise<this>;
}

export class EventPayload<T> {
    readonly filter!: T;

    readonly emitter!: EventEmitterable<T>;
    readonly #listener: null | Listener;

    constructor(emitter: EventEmitterable<T>, listener: null | Listener, filter: T) {
        this.#listener = listener;
        defineProperties<EventPayload<any>>(this, { emitter, filter });
    }

    async removeListener(): Promise<void> {
        if (this.#listener == null) { return; }
        await this.emitter.off(this.filter, this.#listener);
    }
}
