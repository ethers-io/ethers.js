import { WebSocket as _WebSocket } from "./ws.js"; /*-browser*/
import { SocketProvider } from "./provider-socket.js";
export class WebSocketProvider extends SocketProvider {
    url;
    #websocket;
    get websocket() { return this.#websocket; }
    constructor(url, network) {
        super(network);
        if (typeof (url) === "string") {
            this.#websocket = new _WebSocket(url);
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
//# sourceMappingURL=provider-websocket.js.map