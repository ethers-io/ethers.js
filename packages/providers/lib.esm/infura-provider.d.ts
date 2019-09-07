import { Network } from "@ethersproject/networks";
import { UrlJsonRpcProvider } from "./url-json-rpc-provider";
export declare class InfuraProvider extends UrlJsonRpcProvider {
    readonly projectId: string;
    static getApiKey(apiKey: string): string;
    static getUrl(network: Network, apiKey: string): string;
}
