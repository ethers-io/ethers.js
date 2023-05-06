/**
 *
 *
 *  Paths
 *  /index.js => dist/ethers.js
 *  /tests/utils.js => in-memory hijack
 *  /static/* => output/*
 *    - index.html
 *    - assert.js
 *  /tests/* => lib.esm/_tests/*
 */
/// <reference types="node" />
import { WebSocket } from "ws";
import { Server } from "http";
export declare function getMime(filename: string): string;
export declare class CDPSession {
    #private;
    readonly websocket: WebSocket;
    constructor(url: string);
    get target(): string;
    get ready(): Promise<void>;
    get done(): Promise<number>;
    send(method: string, params: any): Promise<any>;
    _send(method: string, params: any): Promise<any>;
    navigate(url: string): Promise<void>;
}
export type Options = {
    port?: number;
    redirects?: Record<string, string>;
};
export declare function start(_root: string, options: Options): Promise<Server>;
//# sourceMappingURL=test-browser.d.ts.map