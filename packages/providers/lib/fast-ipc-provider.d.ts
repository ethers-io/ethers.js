import { Networkish } from "@ethersproject/networks";
import { Event } from "./base-provider";
import { JsonRpcProvider } from "./json-rpc-provider";
export declare class FastIpcProvider extends JsonRpcProvider {
    private static NEXT_ID;
    private readonly _requests;
    private readonly _subIds;
    private readonly _subs;
    private readonly _socket;
    private _lastChunk;
    constructor(path: string, network?: Networkish);
    get pollingInterval(): number;
    set pollingInterval(_: number);
    resetEventsBlock(_: number): void;
    poll(): Promise<void>;
    set polling(value: boolean);
    send(method: string, params?: Array<any>): Promise<any>;
    _subscribe(tag: string, param: Array<any>, process: (res: any) => void): Promise<void>;
    _startEvent(event: Event): void;
    _stopEvent(event: Event): void;
    destroy(): Promise<void>;
    private rejectAllAndDestroy;
    private parseBuffer;
    private handleNotification;
    private handleSubscription;
}
//# sourceMappingURL=fast-ipc-provider.d.ts.map