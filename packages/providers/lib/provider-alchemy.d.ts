import { Network } from "./network.js";
import { StaticJsonRpcProvider } from "./provider-jsonrpc.js";
import type { ConnectionInfo } from "@ethersproject/web";
import type { AbstractProvider } from "./abstract-provider.js";
import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";
export declare class AlchemyProvider extends StaticJsonRpcProvider implements CommunityResourcable {
    readonly apiKey: string;
    constructor(_network?: Networkish, apiKey?: null | string);
    _getProvider(chainId: number): AbstractProvider;
    isCommunityResource(): boolean;
    static getConnection(network: Network, apiKey?: string): ConnectionInfo;
}
//# sourceMappingURL=provider-alchemy.d.ts.map