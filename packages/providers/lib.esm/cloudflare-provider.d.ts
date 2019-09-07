import { Network } from "@ethersproject/networks";
import { UrlJsonRpcProvider } from "./url-json-rpc-provider";
export declare class CloudflareProvider extends UrlJsonRpcProvider {
    static getUrl(network: Network, apiKey?: string): string;
}
