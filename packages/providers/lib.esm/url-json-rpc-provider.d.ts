import { Network, Networkish } from "@ethersproject/networks";
import { ConnectionInfo } from "@ethersproject/web";
import { JsonRpcProvider, JsonRpcSigner } from "./json-rpc-provider";
export declare class StaticJsonRpcProvider extends JsonRpcProvider {
    detectNetwork(): Promise<Network>;
}
export declare abstract class UrlJsonRpcProvider extends StaticJsonRpcProvider {
    readonly apiKey: any;
    constructor(network?: Networkish, apiKey?: any);
    _startPending(): void;
    getSigner(address?: string): JsonRpcSigner;
    listAccounts(): Promise<Array<string>>;
    static getApiKey(apiKey: any): any;
    static getUrl(network: Network, apiKey: any): string | ConnectionInfo;
}
