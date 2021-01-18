import { Network } from "@ethersproject/networks";
import { ConnectionInfo } from "@ethersproject/web";
import { UrlJsonRpcProvider } from "./url-json-rpc-provider";
export declare class PocketGatewayProvider extends UrlJsonRpcProvider {
    static getApiKey(apiKey: any): any;
    static getUrl(network: Network, apiKey: any): ConnectionInfo;
    isCommunityResource(): boolean;
}
export declare class PocketApiKeyObject {
    applicationId: string;
    endpointType: string;
    applicationSecretKey: string;
    applicationOrigin: string;
    applicationUserAgent: string;
    static build(apiKey: any): PocketApiKeyObject;
    static getDefaultAppForHost(host: string): string;
    static getDefaultLoadBalancerForHost(host: string): string;
    static getUrl(apiKey: any, host: string): string;
}
