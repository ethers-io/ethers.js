"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketProvider = void 0;
const ws_js_1 = require("./ws.js"); /*-browser*/
const provider_socket_js_1 = require("./provider-socket.js");
class WebSocketProvider extends provider_socket_js_1.SocketProvider {
    #websocket;
    get websocket() {
        if (this.#websocket == null) {
            throw new Error("websocket closed");
        }
        return this.#websocket;
    }
    constructor(url, network) {
        super(network);
        if (typeof (url) === "string") {
            this.#websocket = new ws_js_1.WebSocket(url);
        }
        else {
            this.#websocket = url;
        }
        this.websocket.onopen = async () => {
            try {
                await this._start();
            }
            catch (error) {
                console.log("failed to start WebsocketProvider", error);
                // @TODO: now what? Attempt reconnect?
            }
        };
        this.websocket.onmessage = (message) => {
            this._processMessage(message.data);
        };
    }
    async _write(message) {
        this.websocket.send(message);
    }
    async destroy() {
        if (this.#websocket == null) {
            return;
        }
        this.#websocket.close();
        this.#websocket = null;
    }
}
exports.WebSocketProvider = WebSocketProvider;
//# sourceMappingURL=provider-websocket.js.map