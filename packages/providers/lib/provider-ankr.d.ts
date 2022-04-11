import { AbstractProvider } from "./abstract-provider.js";
import { Network } from "./network.js";
import { StaticJsonRpcProvider } from "./provider-jsonrpc.js";
import type { ConnectionInfo } from "@ethersproject/web";
import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";
export declare class AnkrProvider extends StaticJsonRpcProvider implements CommunityResourcable {
    readonly apiKey: string;
    constructor(_network?: Networkish, apiKey?: null | string);
    _getProvider(chainId: number): AbstractProvider;
    static getConnection(network: Network, apiKey?: null | string): ConnectionInfo;
    isCommunityResource(): boolean;
}
//# sourceMappingURL=provider-ankr.d.ts.map