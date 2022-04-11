import { Network } from "./network.js";
import { StaticJsonRpcProvider } from "./provider-jsonrpc.js";
import type { ConnectionInfo } from "@ethersproject/web";
import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";
export declare class PocketProvider extends StaticJsonRpcProvider implements CommunityResourcable {
    readonly applicationId: string;
    readonly applicationSecretKey: null | string;
    readonly loadBalancer: boolean;
    constructor(_network?: Networkish, _appId?: null | string, _secretKey?: null | string, _loadBalancer?: boolean);
    static getConnection(network: Network, _appId?: null | string, _secretKey?: null | string, _loadBalancer?: boolean): ConnectionInfo;
    isCommunityResource(): boolean;
}
//# sourceMappingURL=provider-pocket.d.ts.map