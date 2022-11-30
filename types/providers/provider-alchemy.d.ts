import { FetchRequest } from "../utils/index.js";
import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";
import type { AbstractProvider, PerformActionRequest } from "./abstract-provider.js";
import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";
/**
 *  The AlchemyProvider is backed by the [[alchemyapu]] API.
 *
 *  @_docloc: api/providers/thirdparty
 */
export declare class AlchemyProvider extends JsonRpcProvider implements CommunityResourcable {
    readonly apiKey: string;
    constructor(_network?: Networkish, apiKey?: null | string);
    _getProvider(chainId: number): AbstractProvider;
    _perform(req: PerformActionRequest): Promise<any>;
    isCommunityResource(): boolean;
    static getRequest(network: Network, apiKey?: string): FetchRequest;
}
//# sourceMappingURL=provider-alchemy.d.ts.map