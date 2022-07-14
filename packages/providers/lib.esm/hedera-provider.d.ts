import { BaseProvider, ProviderOptions } from "./base-provider";
import { AccountLike } from "@hethers/address";
/**
 * Provides support for connecting to custom network by specifying consensus and mirror node url.
 */
export default class HederaProvider extends BaseProvider {
    constructor(nodeId: AccountLike, consensusNodeUrl: string, mirrorNodeUrl: string, options?: ProviderOptions);
}
//# sourceMappingURL=hedera-provider.d.ts.map