

import { WebSocket as _WebSocket } from "./ws.js"; /*-browser*/

import { SocketProvider } from "./provider-socket.js";

import type { Networkish } from "./network.js";

export interface WebSocketLike {
    onopen: null | ((...args: Array<any>) => any);
    onmessage: null | ((...args: Array<any>) => any);
    onerror: null | ((...args: Array<any>) => any);

    readyState: number;

    send(payload: any): void;
    close(code?: number, reason?: string): void;
}

export class WebSocketProvider extends SocketProvider {
    #websocket: null | WebSocketLike;
    get websocket(): WebSocketLike {
        if (this.#websocket == null) { throw new Error("websocket closed"); }
        return this.#websocket;
    }

    constructor(url: string | WebSocketLike, network?: Networkish) {
        super(network);
        if (typeof(url) === "string") {
            this.#websocket = new _WebSocket(url);
        } else {
            this.#websocket = url;
        }

        this.websocket.onopen = async () => {
            try {
                await this._start()
            } catch (error) {
                console.log("failed to start WebsocketProvider", error);
                // @TODO: now what? Attempt reconnect?
            }
        };

        this.websocket.onmessage = (message: { data: string }) => {
            this._processMessage(message.data);
        };
    }

    async _write(message: string): Promise<void> {
        this.websocket.send(message);
    }

    async destroy(): Promise<void> {
        if (this.#websocket == null) { return; }
        this.#websocket.close();
        this.#websocket = null;
    }
}
