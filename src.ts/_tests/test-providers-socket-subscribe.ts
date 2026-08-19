import assert from "assert";

import { makeError } from "../index.js";

import { SocketProvider, SocketBlockSubscriber } from "../providers/provider-socket.js";

import type {
    JsonRpcPayload, JsonRpcResult, JsonRpcError
} from "../providers/provider-jsonrpc.js";

class MockSocketProvider extends SocketProvider {
    _sendResolvers: Map<number, { resolve: (v: any) => void, reject: (e: any) => void }> = new Map();
    _lastPayload: JsonRpcPayload | null = null;

    constructor() {
        super("mainnet", { staticNetwork: true });
    }

    async _write(message: string): Promise<void> {
        // no-op
    }

    init(): void {
        this._start();
    }

    override async _send(payload: JsonRpcPayload | Array<JsonRpcPayload>): Promise<Array<JsonRpcResult | JsonRpcError>> {
        if (Array.isArray(payload)) { throw new Error("unexpected batch"); }
        this._lastPayload = payload;

        return new Promise((resolve, reject) => {
            this._sendResolvers.set(payload.id, {
                resolve: (result: any) => resolve([{ id: payload.id, result }]),
                reject: (error: any) => reject(error),
            });
        });
    }

    respondTo(id: number, result: any): void {
        const r = this._sendResolvers.get(id);
        if (r) { r.resolve(result); this._sendResolvers.delete(id); }
    }

    rejectTo(id: number, error: any): void {
        const r = this._sendResolvers.get(id);
        if (r) { r.reject(error); this._sendResolvers.delete(id); }
    }
}

describe("SocketSubscriber error handling", function () {
    let unhandledRejections: Array<any>;
    let handler: (reason: any) => void;

    beforeEach(function () {
        unhandledRejections = [];
        handler = (reason: any) => { unhandledRejections.push(reason); };
        process.on("unhandledRejection", handler);
    });

    afterEach(function () {
        process.removeListener("unhandledRejection", handler);
        assert.equal(unhandledRejections.length, 0,
            `unexpected unhandled rejections: ${unhandledRejections.map((r) => r?.message || r)}`);
    });

    it("should emit error event when eth_subscribe is rejected", async function () {
        this.timeout(5000);

        const provider = new MockSocketProvider();
        provider.init();

        const sub = new SocketBlockSubscriber(provider as any);

        const errorReceived = new Promise<any>((resolve) => {
            provider.on("error", (err: any) => {
                resolve(err);
            });
        });

        sub.start();

        await new Promise((r) => setTimeout(r, 50));

        const payloadId = provider._lastPayload!.id;
        provider.rejectTo(payloadId, makeError("subscription rejected", "UNKNOWN_ERROR", {}));

        const error = await errorReceived;
        assert.ok(error, "error event should have been emitted");
        assert.ok(error.message.includes("failed to subscribe"),
            `error message should mention subscribe failure, got: ${error.message}`);

        // Let microtasks settle to catch any stray unhandled rejections
        await new Promise((r) => setTimeout(r, 100));
    });

    it("should not throw when stop is called on a failed subscription", async function () {
        this.timeout(5000);

        const provider = new MockSocketProvider();
        provider.init();

        const sub = new SocketBlockSubscriber(provider as any);
        sub.start();

        await new Promise((r) => setTimeout(r, 50));

        const payloadId = provider._lastPayload!.id;

        provider.on("error", () => { /* expected */ });

        provider.rejectTo(payloadId, makeError("subscription rejected", "UNKNOWN_ERROR", {}));

        await new Promise((r) => setTimeout(r, 50));

        assert.doesNotThrow(() => {
            sub.stop();
        });

        await new Promise((r) => setTimeout(r, 100));
    });

    it("should not send eth_unsubscribe when subscription failed", async function () {
        this.timeout(5000);

        const provider = new MockSocketProvider();
        provider.init();

        const sub = new SocketBlockSubscriber(provider as any);
        sub.start();

        await new Promise((r) => setTimeout(r, 50));

        const payloadId = provider._lastPayload!.id;
        provider.on("error", () => { /* expected */ });
        provider.rejectTo(payloadId, makeError("subscription rejected", "UNKNOWN_ERROR", {}));

        await new Promise((r) => setTimeout(r, 50));

        // Clear last payload so we can detect if stop() sends anything
        provider._lastPayload = null;

        sub.stop();

        await new Promise((r) => setTimeout(r, 100));

        // No eth_unsubscribe should have been sent
        assert.equal(provider._lastPayload, null,
            "stop() should not send eth_unsubscribe for a failed subscription");
    });
});
