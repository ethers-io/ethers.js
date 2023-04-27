/**
 *  About Alchemy
 *
 *  @_subsection: api/providers/thirdparty:Alchemy  [providers-alchemy]
 */
import { FetchRequest } from "../utils/index.js";
import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";
import type { AbstractProvider, PerformActionRequest } from "./abstract-provider.js";
import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";
/**
 *  The **AlchemyProvider** connects to the [[link-alchemy]]
 *  JSON-RPC end-points.
 *
 *  By default, a highly-throttled API key is used, which is
 *  appropriate for quick prototypes and simple scripts. To
 *  gain access to an increased rate-limit, it is highly
 *  recommended to [sign up here](link-alchemy-signup).
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