import { Network } from "./network.js";
import { StaticJsonRpcProvider } from "./provider-jsonrpc.js";
import type { ConnectionInfo } from "@ethersproject/web";
import type { AbstractProvider } from "./abstract-provider.js";
import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";
export declare class InfuraProvider extends StaticJsonRpcProvider implements CommunityResourcable {
    readonly projectId: string;
    readonly projectSecret: null | string;
    constructor(_network?: Networkish, projectId?: null | string, projectSecret?: null | string);
    _getProvider(chainId: number): AbstractProvider;
    static getConnection(network: Network, projectId?: null | string, projectSecret?: null | string): ConnectionInfo;
    isCommunityResource(): boolean;
}
//# sourceMappingURL=provider-infura.d.ts.map