import { WebSocket as _WebSocket } from "./ws.js"; /*-browser*/
import { SocketProvider } from "./provider-socket.js";
/**
 *  A JSON-RPC provider which is backed by a WebSocket.
 *
 *  WebSockets are often preferred because they retain a live connection
 *  to a server, which permits more instant access to events.
 *
 *  However, this incurs higher server infrasturture costs, so additional
 *  resources may be required to host your own WebSocket nodes and many
 *  third-party services charge additional fees for WebSocket endpoints.
 */
export class WebSocketProvider extends SocketProvider {
    #connect;
    #websocket;
    #pingTimeout;
    #keepAliveInterval;
    get websocket() {
        if (this.#websocket == null) {
            throw new Error("websocket closed");
        }
        return this.#websocket;
    }
    constructor(url, network, options) {
        super(network, options);
        if (typeof (url) === "string") {
            this.#connect = () => { return new _WebSocket(url); };
            this.#websocket = this.#connect();
        }
        else if (typeof (url) === "function") {
            this.#connect = url;
            this.#websocket = url();
        }
        else {
            this.#connect = null;
            this.#websocket = url;
        }
        this.websocket.onopen = async () => {
            try {
                await this._start();
                this.resume();
                this.#startKeepAlive();
            }
            catch (error) {
                console.log("failed to start WebsocketProvider", error);
                // @TODO: now what? Attempt reconnect?
            }
        };
        this.websocket.onmessage = (message) => {
            this._processMessage(message.data);
        };
        this.websocket.onclose = (event) => {
            this.#stopKeepAlive();
            this.pause(true);
            if (this.#connect) {
                this.#websocket = this.#connect();
                this.#websocket.onopen = this.websocket.onopen;
                this.#websocket.onmessage = this.websocket.onmessage;
                this.#websocket.onclose = this.websocket.onclose;
                this.#websocket.onping = this.websocket.onping;
                this.#websocket.onpong = this.websocket.onpong;
            }
        };
        this.websocket.onping = () => {
            if (this.#pingTimeout) {
                clearTimeout(this.#pingTimeout);
                this.#pingTimeout = null;
            }
            this.websocket.pong();
        };
        this.websocket.onpong = () => {
            if (this.#pingTimeout) {
                clearTimeout(this.#pingTimeout);
                this.#pingTimeout = null;
            }
        };
    }
    #startKeepAlive() {
        this.#keepAliveInterval = setInterval(() => {
            if (this.#websocket && this.#websocket.readyState === 1) {
                this.#websocket.ping();
                this.#pingTimeout = setTimeout(() => {
                    if (this.#websocket) {
                        this.#websocket.close();
                    }
                }, 15000);
            }
        }, 7500);
    }
    #stopKeepAlive() {
        if (this.#keepAliveInterval) {
            clearInterval(this.#keepAliveInterval);
            this.#keepAliveInterval = null;
        }
        if (this.#pingTimeout) {
            clearTimeout(this.#pingTimeout);
            this.#pingTimeout = null;
        }
    }
    async _write(message) {
        this.websocket.send(message);
    }
    async destroy() {
        this.#stopKeepAlive();
        if (this.#websocket != null) {
            this.#websocket.close();
            this.#websocket = null;
        }
        super.destroy();
    }
}
