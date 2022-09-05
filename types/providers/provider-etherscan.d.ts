import { AbstractProvider } from "./abstract-provider.js";
import { Network } from "./network.js";
import { NetworkPlugin } from "./plugins-network.js";
import { PerformActionRequest } from "./abstract-provider.js";
import type { Networkish } from "./network.js";
import type { TransactionRequest } from "./provider.js";
export declare class EtherscanPlugin extends NetworkPlugin {
    readonly baseUrl: string;
    readonly communityApiKey: string;
    constructor(baseUrl: string, communityApiKey: string);
    clone(): EtherscanPlugin;
}
export declare class EtherscanProvider extends AbstractProvider {
    readonly network: Network;
    readonly apiKey: string;
    constructor(_network?: Networkish, apiKey?: string);
    getBaseUrl(): string;
    getUrl(module: string, params: Record<string, string>): string;
    getPostUrl(): string;
    getPostData(module: string, params: Record<string, any>): Record<string, any>;
    detectNetwork(): Promise<Network>;
    fetch(module: string, params: Record<string, any>, post?: boolean): Promise<any>;
    _getTransactionPostData(transaction: TransactionRequest): Record<string, string>;
    _checkError(req: PerformActionRequest, error: Error, transaction: any): never;
    _detectNetwork(): Promise<Network>;
    _perform(req: PerformActionRequest): Promise<any>;
    getNetwork(): Promise<Network>;
    getEtherPrice(): Promise<number>;
    isCommunityResource(): boolean;
}
//# sourceMappingURL=provider-etherscan.d.ts.map