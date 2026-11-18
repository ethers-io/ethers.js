/// <reference lib="es2021.weakref" />

import assert from "assert";

import { WebSocketProvider } from "../index.js";
import type { SocketSubscriber, Subscriber, Subscription, WebSocketLike } from "../index.js";
import { stall } from "./utils.js";

class ObservedProvider extends WebSocketProvider {
    observe: null | ((subscriber: SocketSubscriber) => void) = null;

    _getSubscriber(subscription: Subscription): Subscriber {
        const subscriber = super._getSubscriber(subscription);
        if (subscription.type === "block") {
            this.observe?.(<SocketSubscriber>subscriber);
        }
        return subscriber;
    }
}

async function createProvider(options: {
    holdSubscriptions?: boolean, holdUnsubscribes?: boolean,
    reuseIds?: boolean, rejectUnsubscribe?: boolean
} = { }) {
    const subscriptions: Array<string> = [ ];
    const unsubscribed: Array<string> = [ ];
    const held: Array<() => void> = [ ];
    const heldUnsubscribes: Array<() => void> = [ ];

    const socket: WebSocketLike = {
        onopen: null, onmessage: null, onerror: null, readyState: 1,
        send(message: string): void {
            const request = JSON.parse(message);
            let result: string | boolean;
            switch (request.method) {
                case "eth_chainId":
                    result = "0x1";
                    break;
                case "eth_subscribe":
                    result = options.reuseIds ? "0x1": "0x" + (subscriptions.length + 1).toString(16);
                    subscriptions.push(result);
                    break;
                case "eth_unsubscribe":
                    unsubscribed.push(request.params[0]);
                    result = true;
                    break;
                default:
                    throw new Error("unexpected RPC method: " + request.method);
            }
            const reply = () => socket.onmessage?.({ data: JSON.stringify(
                options.rejectUnsubscribe && request.method === "eth_unsubscribe"
                    ? { jsonrpc: "2.0", id: request.id, error: { code: -32000, message: "unsubscribe failed" } }
                    : { jsonrpc: "2.0", id: request.id, result }
            ) });
            if (options.holdSubscriptions && request.method === "eth_subscribe") {
                held.push(reply);
            } else if (options.holdUnsubscribes && request.method === "eth_unsubscribe") {
                heldUnsubscribes.push(reply);
            } else {
                queueMicrotask(reply);
            }
        },
        close(): void { }
    };
    const provider = new ObservedProvider(socket, 1);
    await socket.onopen?.();
    return {
        provider, subscriptions, unsubscribed, held, heldUnsubscribes,
        notify(id: string, result: any = { number: "0x10" }): void {
            socket.onmessage?.({ data: JSON.stringify({
                jsonrpc: "2.0", method: "eth_subscription",
                params: { subscription: id, result }
            }) });
        }
    };
}

async function waitFor(check: () => boolean): Promise<void> {
    for (let i = 0; i < 1000; i++) {
        if (check()) { return; }
        await stall(1);
    }
    assert.fail("socket operation did not finish");
}

function observeDispatches(provider: ObservedProvider): () => number {
    let dispatches = 0;
    provider.observe = (subscriber) => {
        const handleMessage = subscriber._handleMessage.bind(subscriber);
        subscriber._handleMessage = (message: any) => {
            dispatches++;
            handleMessage(message);
        };
    };
    return () => dispatches;
}

describe("Socket subscription cleanup", function() {
    it("keeps a subscription while another listener remains", async function() {
        const mock = await createProvider();
        const first = () => { };
        const received: Array<number> = [ ];
        const second = (block: number) => { received.push(block); };
        try {
            await mock.provider.on("block", first);
            await mock.provider.on("block", second);
            await waitFor(() => mock.subscriptions.length === 1);
            await stall(0);
            await mock.provider.off("block", first);
            mock.notify(mock.subscriptions[0]);
            await waitFor(() => received.length === 1);
            assert.deepEqual(received, [ 16 ]);
            assert.equal(mock.unsubscribed.length, 0);
            await mock.provider.off("block", second);
            await waitFor(() => mock.unsubscribed.length === 1);
        } finally {
            await mock.provider.destroy();
        }
    });

    it("keeps other subscriptions and providers active", async function() {
        const first = await createProvider();
        const second = await createProvider();
        const listener = () => { };
        const pending: Array<string> = [ ];
        const blocks: Array<number> = [ ];
        try {
            await first.provider.on("block", listener);
            await first.provider.on("pending", (hash: string) => { pending.push(hash); });
            await second.provider.on("block", (block: number) => { blocks.push(block); });
            await waitFor(() => first.subscriptions.length === 2 && second.subscriptions.length === 1);
            await first.provider.off("block", listener);
            await waitFor(() => first.unsubscribed.length === 1);
            first.notify(first.subscriptions[1], "0x1234");
            second.notify(second.subscriptions[0]);
            await waitFor(() => pending.length === 1 && blocks.length === 1);
            assert.deepEqual(pending, [ "0x1234" ]);
            assert.deepEqual(blocks, [ 16 ]);
        } finally {
            await first.provider.destroy();
            await second.provider.destroy();
        }
    });

    it("delivers notifications received before the subscription response", async function() {
        const mock = await createProvider({ holdSubscriptions: true });
        const blocks: Array<number> = [ ];
        try {
            await mock.provider.on("block", (block: number) => { blocks.push(block); });
            await waitFor(() => mock.held.length === 1);
            mock.notify(mock.subscriptions[0]);
            mock.held[0]();
            await waitFor(() => blocks.length === 1);
            assert.deepEqual(blocks, [ 16 ]);
        } finally {
            await mock.provider.destroy();
        }
    });

    for (const mode of [ "off", "once", "removeAllListeners" ]) {
        it("removes stopped subscribers after " + mode, async function() {
            const mock = await createProvider();
            const dispatches = observeDispatches(mock.provider);
            const listener = () => { };
            try {
                if (mode === "once") {
                    await mock.provider.once("block", listener);
                } else {
                    await mock.provider.on("block", listener);
                }
                await waitFor(() => mock.subscriptions.length === 1);
                await stall(0);
                if (mode === "off") {
                    await mock.provider.off("block", listener);
                } else if (mode === "once") {
                    mock.notify(mock.subscriptions[0]);
                } else {
                    await mock.provider.removeAllListeners();
                }
                await waitFor(() => mock.unsubscribed.length === 1);
                const before = dispatches();
                mock.notify(mock.subscriptions[0]);
                await stall(0);
                assert.equal(dispatches(), before, "stopped subscriber was still routed a message");
                assert.equal(await mock.provider.listenerCount("block"), 0);
            } finally {
                await mock.provider.destroy();
            }
        });
    }

    it("cleans up when off precedes the subscription response", async function() {
        const mock = await createProvider({ holdSubscriptions: true });
        const dispatches = observeDispatches(mock.provider);
        const listener = () => { };
        try {
            await mock.provider.on("block", listener);
            await waitFor(() => mock.held.length === 1);
            await mock.provider.off("block", listener);
            mock.held[0]();
            await waitFor(() => mock.unsubscribed.length === 1);
            mock.notify(mock.subscriptions[0]);
            await stall(0);
            assert.equal(dispatches(), 0, "cancelled subscription was still registered");
        } finally {
            await mock.provider.destroy();
        }
    });

    it("does not replay cancelled notifications when a subscription ID is reused", async function() {
        const mock = await createProvider({ holdUnsubscribes: true, reuseIds: true });
        const listener = () => { };
        const blocks: Array<number> = [ ];
        try {
            await mock.provider.on("block", listener);
            await waitFor(() => mock.subscriptions.length === 1);
            await mock.provider.off("block", listener);
            await waitFor(() => mock.heldUnsubscribes.length === 1);
            mock.notify(mock.subscriptions[0], { number: "0xff" });
            mock.heldUnsubscribes[0]();
            await stall(0);
            await mock.provider.on("block", (block: number) => { blocks.push(block); });
            await waitFor(() => mock.subscriptions.length === 2);
            await stall(0);
            assert.deepEqual(blocks, [ ], "cancelled notification was replayed to a new subscription");
            mock.notify(mock.subscriptions[1]);
            await waitFor(() => blocks.length === 1);
            assert.deepEqual(blocks, [ 16 ]);
        } finally {
            await mock.provider.destroy();
        }
    });

    it("allows an already stopped subscriber to stop again", async function() {
        const mock = await createProvider();
        let subscriber: null | SocketSubscriber = null;
        mock.provider.observe = (value) => { subscriber = value; };
        try {
            const listener = () => { };
            await mock.provider.on("block", listener);
            await waitFor(() => mock.subscriptions.length === 1);
            await mock.provider.off("block", listener);
            await waitFor(() => mock.unsubscribed.length === 1);
            assert.ok(subscriber != null);
            assert.doesNotThrow(() => subscriber!.stop());
            await stall(0);
            assert.equal(mock.unsubscribed.length, 1);
        } finally {
            await mock.provider.destroy();
        }
    });

    it("reports failed unsubscribe requests without retaining the subscriber", async function() {
        const mock = await createProvider({ rejectUnsubscribe: true });
        const dispatches = observeDispatches(mock.provider);
        const errors: Array<unknown> = [ ];
        try {
            await mock.provider.on("error", (error: unknown) => { errors.push(error); });
            const listener = () => { };
            await mock.provider.on("block", listener);
            await waitFor(() => mock.subscriptions.length === 1);
            await mock.provider.off("block", listener);
            await waitFor(() => errors.length === 1);
            mock.notify(mock.subscriptions[0]);
            await stall(0);
            assert.equal(dispatches(), 0);
            assert.equal(await mock.provider.listenerCount("block"), 0);
            assert.equal(mock.unsubscribed.length, 1);
        } finally {
            await mock.provider.destroy();
        }
    });

    for (const holdUnsubscribes of [ false, true ]) {
        it("releases stopped subscribers " + (holdUnsubscribes ? "before": "after") + " unsubscribe completes", async function() {
            const gc = globalThis.gc;
            if (typeof(gc) !== "function" || typeof(WeakRef) === "undefined") {
                this.skip();
            }
            const mock = await createProvider({ holdUnsubscribes });
            const references: Array<WeakRef<SocketSubscriber>> = [ ];
            mock.provider.observe = (subscriber) => { references.push(new WeakRef(subscriber)); };
            try {
                for (let i = 0; i < 50; i++) {
                    const listener = () => { };
                    await mock.provider.on("block", listener);
                    await waitFor(() => mock.subscriptions.length === i + 1);
                    await mock.provider.off("block", listener);
                    await waitFor(() => mock.unsubscribed.length === i + 1);
                }
                const control = new WeakRef({ });
                for (let i = 0; i < 10; i++) {
                    await stall(0);
                    gc!();
                }
                assert.equal(control.deref(), undefined, "GC control object was not collected");
                assert.equal(await mock.provider.listenerCount("block"), 0);
                assert.equal(references.length, 50);
                assert.equal(references.filter((ref) => ref.deref() != null).length, 0,
                    "stopped subscribers are still strongly retained");
            } finally {
                await mock.provider.destroy();
            }
        });
    }
});
