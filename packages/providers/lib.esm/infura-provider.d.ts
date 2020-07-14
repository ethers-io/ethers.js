import { Network, Networkish } from "@ethersproject/networks";
import { ConnectionInfo } from "@ethersproject/web";
import { WebSocketProvider } from "./websocket-provider";
import { UrlJsonRpcProvider } from "./url-json-rpc-provider";
export declare class InfuraProvider extends UrlJsonRpcProvider {
    readonly projectId: string;
    readonly projectSecret: string;
    static getWebSocketProvider(network?: Networkish, apiKey?: any): WebSocketProvider;
    static getApiKey(apiKey: any): any;
    static getUrl(network: Network, apiKey: any): ConnectionInfo;
}
