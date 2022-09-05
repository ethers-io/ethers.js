
/*
import { defineProperties } from "@ethersproject/properties";
export type EventCommon = "block" | "debug" | "blockObject";

export type Event = EventCommon | string | { address?: string, topics: Array<string | Array<string>> }

export type EventLike = Event | Array<string>;

export function getTag(eventName: Event): string {
    if (typeof(eventName) === "string") { return eventName; }

    if (typeof(eventName) === "object") {
        return (eventName.address || "*") + (eventName.topics || []).map((topic) => {
            if (typeof(topic) === "string") { return topic; }
            return topic.join("|");
        }).join("&");
    }

    throw new Error("FOO");
}

export function getEvent(tag: string): Event {
}

let nextId = 1;

export class Subscriber {
    readonly id!: number;
    readonly tag!: string;

    #paused: boolean;
    #blockNumber: number;

    constructor(tag: string) {
        this.#paused = false;
        this.#blockNumber = -1;
        defineProperties<Subscriber>(this, { id: nextId++, tag });
    }

    get blockNumber(): number {
        return this.#blockNumber;
    }
    _setBlockNumber(blockNumber: number): void { this.#blockNumber = blockNumber; }

    setup(): void { }
    teardown(): void { }

    isPaused(): boolean { return this.#paused; }
    pause(): void { this.#paused = true; }
    resume(): void { this.#paused = false; }

    resubscribeInfo(): string { return this.tag; }
    resubscribe(info: string): boolean { return true; }
}
*/
