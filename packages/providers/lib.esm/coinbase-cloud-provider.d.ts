import { Network } from "@ethersproject/networks";
import { ConnectionInfo } from "@ethersproject/web";
import { UrlJsonRpcProvider } from "./url-json-rpc-provider";
export declare class CoinbaseCloudProvider extends UrlJsonRpcProvider {
    static getApiKey(apiKey: any): any;
    static getUrl(network: Network, apiKey: any): ConnectionInfo;
}
//# sourceMappingURL=coinbase-cloud-provider.d.ts.map