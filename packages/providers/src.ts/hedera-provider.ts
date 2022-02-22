import {  HederaNetworkConfigLike } from "@hethers/networks";
import { BaseProvider } from "./base-provider";
import { AccountLike } from "@hethers/address";

/**
 * Provides support for connecting to custom network by specifying consensus and mirror node url.
 */
export default class HederaProvider extends BaseProvider {
    constructor(nodeId: AccountLike, consensusNodeUrl: string, mirrorNodeUrl: string) {
        const props :HederaNetworkConfigLike = {
            network:{}
        };
        props.network[consensusNodeUrl] = nodeId.toString();
        super({
            network:(props as HederaNetworkConfigLike).network,
            mirrorNodeUrl,
        });
    }
}
