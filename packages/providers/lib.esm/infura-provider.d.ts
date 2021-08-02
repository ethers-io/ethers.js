import { Network, Networkish } from "@ethersproject/networks";
import { ConnectionInfo } from "@ethersproject/web";
import { FilterByFilterId } from '@ethersproject/abstract-provider';
import { WebSocketProvider } from "./websocket-provider";
import { CommunityResourcable } from "./formatter";
import { UrlJsonRpcProvider } from "./url-json-rpc-provider";
export declare class InfuraWebSocketProvider extends WebSocketProvider implements CommunityResourcable {
    readonly apiKey: string;
    readonly projectId: string;
    readonly projectSecret: string;
    constructor(network?: Networkish, apiKey?: any);
    isCommunityResource(): boolean;
}
export declare class InfuraProvider extends UrlJsonRpcProvider {
    readonly projectId: string;
    readonly projectSecret: string;
    readonly installedFilters: {
        [key: string]: FilterByFilterId;
    };
    constructor(network?: Networkish, apiKey?: any);
    static getWebSocketProvider(network?: Networkish, apiKey?: any): InfuraWebSocketProvider;
    static getApiKey(apiKey: any): any;
    static getUrl(network: Network, apiKey: any): ConnectionInfo;
    isCommunityResource(): boolean;
    updateTransactionEvents(runners: Array<Promise<void>>, blockNumber?: number): void;
    private checkInstalledFilters;
}
//# sourceMappingURL=infura-provider.d.ts.map