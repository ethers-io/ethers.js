"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebSocketProvider = void 0;
const ws_js_1 = require("./ws.js"); /*-browser*/
const provider_socket_js_1 = require("./provider-socket.js");
class WebSocketProvider extends provider_socket_js_1.SocketProvider {
    url;
    #websocket;
    get websocket() { return this.#websocket; }
    constructor(url, network) {
        super(network);
        if (typeof (url) === "string") {
            this.#websocket = new ws_js_1.WebSocket(url);
        }
        else {
            this.#websocket = url;
        }
        this.websocket.onopen = () => {
            this._start();
        };
        this.websocket.onmessage = (message) => {
            this._processMessage(message.data);
        };
    }
    async _write(message) {
        this.websocket.send(message);
    }
}
exports.WebSocketProvider = WebSocketProvider;
//# sourceMappingURL=provider-websocket.js.map