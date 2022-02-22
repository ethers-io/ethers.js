import { BaseProvider } from "./base-provider";
/**
 * Provides support for connecting to custom network by specifying consensus and mirror node url.
 */
export default class HederaProvider extends BaseProvider {
    constructor(nodeId, consensusNodeUrl, mirrorNodeUrl) {
        const props = {
            network: {}
        };
        props.network[consensusNodeUrl] = nodeId.toString();
        super({
            network: props.network,
            mirrorNodeUrl,
        });
    }
}
//# sourceMappingURL=hedera-provider.js.map