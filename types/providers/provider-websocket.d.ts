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
export type WebSocketCreator = () => WebSocketLike;
export declare class WebSocketProvider extends SocketProvider {
    #private;
    get websocket(): WebSocketLike;
    constructor(url: string | WebSocketLike | WebSocketCreator, network?: Networkish);
    _write(message: string): Promise<void>;
    destroy(): Promise<void>;
}
//# sourceMappingURL=provider-websocket.d.ts.map