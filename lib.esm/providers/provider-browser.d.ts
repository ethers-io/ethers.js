import { JsonRpcApiPollingProvider } from "./provider-jsonrpc.js";
import type { JsonRpcError, JsonRpcPayload, JsonRpcResult, JsonRpcSigner } from "./provider-jsonrpc.js";
import type { Networkish } from "./network.js";
export interface Eip1193Provider {
    request(request: {
        method: string;
        params?: Array<any> | Record<string, any>;
    }): Promise<any>;
}
export type DebugEventBrowserProvider = {
    action: "sendEip1193Payload";
    payload: {
        method: string;
        params: Array<any>;
    };
} | {
    action: "receiveEip1193Result";
    result: any;
} | {
    action: "receiveEip1193Error";
    error: Error;
};
export declare class BrowserProvider extends JsonRpcApiPollingProvider {
    #private;
    constructor(ethereum: Eip1193Provider, network?: Networkish);
    send(method: string, params: Array<any> | Record<string, any>): Promise<any>;
    _send(payload: JsonRpcPayload | Array<JsonRpcPayload>): Promise<Array<JsonRpcResult | JsonRpcError>>;
    getRpcError(payload: JsonRpcPayload, error: JsonRpcError): Error;
    hasSigner(address: number | string): Promise<boolean>;
    getSigner(address?: number | string): Promise<JsonRpcSigner>;
}
//# sourceMappingURL=provider-browser.d.ts.map