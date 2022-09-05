"use strict";
/*
import { Subscriber } from "./abstract-provider.js";

export class HotSwapSubscriber implements Subscriber {
    #target?: Subscriber;

    _switchSubscriber(subscriber: Subscriber): void {
        this.#target = subscriber;
    }

    start(): void {
        if (this.#target) { return this.#target.start(); }
        return super.start();
    }

    stop(): void {
        if (this.#target) { return this.#target.stop(); }
        return super.stop();
    }

    pause(dropWhilePaused?: boolean): void {
        if (this.#target) { return this.#target.pause(dropWhilePaused); }
        return super.pause(dropWhilePaused);
    }

    resume(): void {
        if (this.#target) { return this.#target.resume(); }
        return super.resume();
    }

    set pollingInterval(value: number) {
        if (this.#target) { return this.#target.pollingInterval = value; }
        return super.pollingInterval = value;
    }

    get pollingInterval(): number {
        if (this.#target) { return this.#target.pollingInterval; }
        return super.pollingInterval;
    }
}
*/
//# sourceMappingURL=subscriber-hotswap.js.map