import { Network } from "@ethersproject/networks";
import { UrlJsonRpcProvider } from "./url-json-rpc-provider";
export declare class AlchemyProvider extends UrlJsonRpcProvider {
    readonly apiKey: string;
    static getApiKey(apiKey: any): any;
    static getUrl(network: Network, apiKey: string): string;
}
