import { logger } from "./logger.js";

import type { Numeric } from "@ethersproject/logger";

import type { Listener } from "./events.js"


export class Signal {
    #listeners: Array<Listener>;
    #reason: null | "invalidated" | "timeout" | "cancel";
    #timer: null | NodeJS.Timer;

    constructor(_timeout?: Numeric) {
        this.#listeners = [ ];
        this.#reason = null;

        this.#timer = null;
        if (_timeout != null) {
            this.#timer = setTimeout(() => {
                this.#invalidate("timeout");
            }, logger.getNumber(_timeout, "timeout"));
            if (this.#timer.unref) { this.#timer.unref(); }
        }
    }

    // Whether the Signal has been invalidated; if true, any newly added
    // llistener will immediately receive a "invalidated" event
    get invalidated(): boolean { return (this.#reason === "invalidated"); }

    // Sends a "cancel" signal to all listeners
    cancel(): boolean {
        return this.#invalidate("cancel");
    }

    // Stops the Signal, without signalling; any new listeners will
    // receive an "invalidated" event on registration.
    #invalidate(reason: "cancel" | "invalidated" | "timeout"): boolean {
        if (this.#reason) { return false; }

        if (this.#timer != null) { clearTimeout(this.#timer); }

        this.#reason = reason;

        if (reason !== "invalidated") {
            const listeners = this.#listeners.slice();
            listeners.forEach((listener) => {
                try {
                    listener.call(this, reason, this.#makeError());
                } catch (error) { }
            });
        }

        return true;
    }

    invalidate(): boolean {
        return this.#invalidate("invalidated");
    }

    #makeError(): Error {
        const reason = this.#reason || "unknown"
        return logger.makeError(reason, "TIMEOUT", { operation: "signal", reason });
    }

    addListener(listener: Listener): this {
        this.#listeners.push(listener);
        if (this.#reason) {
            try {
                setTimeout(() => {
                    listener.call(this, this.#reason, this.#makeError());
                }, 0);
            } catch (error) { }
        }
        return this;
    }

    removeListener(listener: Listener): this {
        const index = this.#listeners.indexOf(listener);
        if (index >= 0) { this.#listeners.splice(index, 1); }
        return this;
    }

    //link(other: Signal): void {
    //    this.on((event: "timeout" | "cancel") => { other.#invalidate(event); });
    //}
}
