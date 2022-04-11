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
var _IpcSocketProvider_socket;
import { connect } from "net";
import { SocketProvider } from "./provider-socket.js";
// @TODO: Is this sufficient? Is this robust? Will newlines occur between
// all payloads and only between payloads?
function splitBuffer(data) {
    const messages = [];
    let lastStart = 0;
    while (true) {
        const nl = data.indexOf(10, lastStart);
        if (nl === -1) {
            break;
        }
        messages.push(data.subarray(lastStart, nl).toString().trim());
        lastStart = nl + 1;
    }
    return { messages, remaining: data.subarray(lastStart) };
}
export class IpcSocketProvider extends SocketProvider {
    constructor(path, network) {
        super(network);
        _IpcSocketProvider_socket.set(this, void 0);
        __classPrivateFieldSet(this, _IpcSocketProvider_socket, connect(path), "f");
        this.socket.on("ready", () => { this._start(); });
        let response = Buffer.alloc(0);
        this.socket.on("data", (data) => {
            response = Buffer.concat([response, data]);
            const { messages, remaining } = splitBuffer(response);
            messages.forEach((message) => {
                this._processMessage(message);
            });
            response = remaining;
        });
        this.socket.on("end", () => {
            this.emit("close");
            this.socket.destroy();
            this.socket.end();
        });
    }
    get socket() { return __classPrivateFieldGet(this, _IpcSocketProvider_socket, "f"); }
    stop() {
        this.socket.destroy();
        this.socket.end();
    }
    async _write(message) {
        console.log(">>>", message);
        this.socket.write(message);
    }
}
_IpcSocketProvider_socket = new WeakMap();
/*

import { defineProperties } from "@ethersproject/properties";

import { SocketLike, SocketProvider } from "./provider-socket.js";

import type { Socket } from "net";

export class SocketWrapper implements SocketLike {
    #socket: Socket;

    constructor(path: string) {
        this.#socket = connect(path);
    }

    send(data: string): void {
        this.#socket.write(data, () => { });
    }

    addEventListener(event: string, listener: (data: string) => void): void {
        //this.#socket.on(event, (value: ) => {
        //});
    }

    close(): void {
    }
}

export class IpcProvider extends SocketProvider {
    readonly path!: string;

    constructor(path: string) {
        super(new SocketWrapper(path));
        defineProperties<IpcProvider>(this, { path });
    }
}
*/
//# sourceMappingURL=provider-ipcsocket.js.map