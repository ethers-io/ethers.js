import { BaseProvider } from "./base-provider";
// contains predefined, sdk acceptable hedera network strings
export var HederaNetworks;
(function (HederaNetworks) {
    HederaNetworks["TESTNET"] = "testnet";
    HederaNetworks["PREVIEWNET"] = "previewnet";
    HederaNetworks["MAINNET"] = "mainnet";
})(HederaNetworks || (HederaNetworks = {}));
/**
 * The hedera provider uses the hashgraph module to establish a connection to the Hedera network.
 * As every provider, this one also gives us read-only access.
 *
 * Constructable with a string or a number, which automatically resolves to a hedera network via the hashgraph SDK.
 */
export class DefaultHederaProvider extends BaseProvider {
    constructor(network) {
        super(network);
    }
}
//# sourceMappingURL=default-hedera-provider.js.map