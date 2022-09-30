import { WebSocket as _WebSocket } from "./ws.js"; /*-browser*/
import { SocketProvider } from "./provider-socket.js";
export class WebSocketProvider extends SocketProvider {
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
            this.#websocket = new _WebSocket(url);
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
//# sourceMappingURL=provider-websocket.js.map