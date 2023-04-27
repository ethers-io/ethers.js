/// <reference types="node" />
import { SocketProvider } from "./provider-socket.js";
import type { Socket } from "net";
import type { Networkish } from "./network.js";
export declare class IpcSocketProvider extends SocketProvider {
    #private;
    get socket(): Socket;
    constructor(path: string, network?: Networkish);
    destroy(): void;
    _write(message: string): Promise<void>;
}
//# sourceMappingURL=provider-ipcsocket.d.ts.map