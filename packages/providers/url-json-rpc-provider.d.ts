import { Network, Networkish } from "@ethersproject/networks";
import { JsonRpcProvider, JsonRpcSigner } from "./json-rpc-provider";
export declare class UrlJsonRpcProvider extends JsonRpcProvider {
    readonly apiKey: string;
    constructor(network?: Networkish, apiKey?: string);
    _startPending(): void;
    getSigner(address?: string): JsonRpcSigner;
    listAccounts(): Promise<Array<string>>;
    static getApiKey(apiKey: string): string;
    static getUrl(network: Network, apiKey: string): string;
}
