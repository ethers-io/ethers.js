/**
 *  About Quicknode
 *
 *  @_subsection: api/providers/thirdparty:QuickNode  [backend-quicknode]
 */
import { FetchRequest } from "../utils/index.js";
import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";
import type { AbstractProvider } from "./abstract-provider.js";
import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";
/**
 *  About QuickNode
 */
export declare class QuickNodeProvider extends JsonRpcProvider implements CommunityResourcable {
    readonly token: string;
    constructor(_network?: Networkish, token?: null | string);
    _getProvider(chainId: number): AbstractProvider;
    isCommunityResource(): boolean;
    static getRequest(network: Network, token?: null | string): FetchRequest;
}
//# sourceMappingURL=provider-quicknode.d.ts.map