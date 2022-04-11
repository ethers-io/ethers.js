var __classPrivateFieldSet = (this && this.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _WebSocketProvider_websocket;
import { WebSocket } from "ws"; /*-browser*/
import { SocketProvider } from "./provider-socket.js";
export class WebSocketProvider extends SocketProvider {
    constructor(url, network) {
        super(network);
        _WebSocketProvider_websocket.set(this, void 0);
        if (typeof (url) === "string") {
            __classPrivateFieldSet(this, _WebSocketProvider_websocket, new WebSocket(url), "f");
        }
        else {
            __classPrivateFieldSet(this, _WebSocketProvider_websocket, url, "f");
        }
        this.websocket.onopen = () => {
            this._start();
        };
        this.websocket.onmessage = (message) => {
            this._processMessage(message.data);
        };
    }
    get websocket() { return __classPrivateFieldGet(this, _WebSocketProvider_websocket, "f"); }
    async _write(message) {
        this.websocket.send(message);
    }
}
_WebSocketProvider_websocket = new WeakMap();
//# sourceMappingURL=provider-websocket.js.map