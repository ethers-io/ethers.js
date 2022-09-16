import { FetchRequest } from "../utils/index.js";
import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";
import type { AbstractProvider } from "./abstract-provider.js";
import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";
export declare class InfuraProvider extends JsonRpcProvider implements CommunityResourcable {
    readonly projectId: string;
    readonly projectSecret: null | string;
    constructor(_network?: Networkish, projectId?: null | string, projectSecret?: null | string);
    _getProvider(chainId: number): AbstractProvider;
    static getRequest(network: Network, projectId?: null | string, projectSecret?: null | string): FetchRequest;
    isCommunityResource(): boolean;
}
//# sourceMappingURL=provider-infura.d.ts.map