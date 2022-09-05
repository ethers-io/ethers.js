import { FetchRequest } from "../utils/fetch.js";
import { AbstractProvider } from "./abstract-provider.js";
import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";
import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";
export declare class AnkrProvider extends JsonRpcProvider implements CommunityResourcable {
    readonly apiKey: string;
    constructor(_network?: Networkish, apiKey?: null | string);
    _getProvider(chainId: number): AbstractProvider;
    static getRequest(network: Network, apiKey?: null | string): FetchRequest;
    isCommunityResource(): boolean;
}
//# sourceMappingURL=provider-ankr.d.ts.map