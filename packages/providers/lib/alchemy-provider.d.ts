import { Network, Networkish } from "@ethersproject/networks";
import { ConnectionInfo } from "@ethersproject/web";
import { WebSocketProvider } from "./websocket-provider";
import { UrlJsonRpcProvider } from "./url-json-rpc-provider";
export declare class AlchemyProvider extends UrlJsonRpcProvider {
    static getWebSocketProvider(network?: Networkish, apiKey?: any): WebSocketProvider;
    static getApiKey(apiKey: any): any;
    static getUrl(network: Network, apiKey: string): ConnectionInfo;
}
