"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IpcSocketProvider = void 0;
const net_1 = require("net");
const provider_socket_js_1 = require("./provider-socket.js");
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
class IpcSocketProvider extends provider_socket_js_1.SocketProvider {
    #socket;
    get socket() { return this.#socket; }
    constructor(path, network) {
        super(network);
        this.#socket = (0, net_1.connect)(path);
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
    stop() {
        this.socket.destroy();
        this.socket.end();
    }
    async _write(message) {
        console.log(">>>", message);
        this.socket.write(message);
    }
}
exports.IpcSocketProvider = IpcSocketProvider;
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