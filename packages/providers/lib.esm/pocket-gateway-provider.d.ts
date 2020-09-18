import { Network } from "@ethersproject/networks";
import { ConnectionInfo } from "@ethersproject/web";
import { UrlJsonRpcProvider } from "./url-json-rpc-provider";
export declare class PocketGatewayProvider extends UrlJsonRpcProvider {
    readonly applicationId: string;
    readonly applicationSecretKey: string;
    readonly applicationOrigin: string;
    readonly applicationUserAgent: string;
    static getApiKey(apiKey: any): any;
    static getUrl(network: Network, apiKey: any): ConnectionInfo;
}
