import assert from "assert";

import {
    WebSocketProvider
} from "../index.js";

import type {
    WebSocketLike
} from "../index.js";

class MockWebSocket implements WebSocketLike {
    onopen: null | ((...args: Array<any>) => any);
    onmessage: null | ((...args: Array<any>) => any);
    onerror: null | ((...args: Array<any>) => any);
    onclose: null | ((...args: Array<any>) => any);
    readyState: number;

    constructor() {
        this.onopen = null;
        this.onmessage = null;
        this.onerror = null;
        this.onclose = null;
        this.readyState = 1;
    }

    send(payload: any): void { }
    close(code?: number, reason?: string): void { }
}

function stall(duration: number): Promise<void> {
    return new Promise((resolve) => { setTimeout(resolve, duration); });
}

describe("Test WebSocketProvider", function() {
    it("emits close events from the websocket", async function() {
        const websocket = new MockWebSocket();
        const provider = new WebSocketProvider(websocket);

        const closeEvent = { code: 1006, reason: "connection lost" };
        let result: null | typeof closeEvent = null;

        await provider.once("close", (event) => {
            result = event;
        });

        const onclose = websocket.onclose;
        assert.ok(onclose, "websocket has onclose handler");
        onclose(closeEvent);

        await stall(0);
        assert.equal(result, closeEvent);

        await provider.destroy();
    });
});
