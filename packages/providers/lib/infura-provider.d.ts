import { Network } from "@ethersproject/networks";
import { ConnectionInfo } from "@ethersproject/web";
import { UrlJsonRpcProvider } from "./url-json-rpc-provider";
export declare class InfuraProvider extends UrlJsonRpcProvider {
    readonly projectId: string;
    readonly projectSecret: string;
    static getApiKey(apiKey: any): any;
    static getUrl(network: Network, apiKey: any): string | ConnectionInfo;
}
