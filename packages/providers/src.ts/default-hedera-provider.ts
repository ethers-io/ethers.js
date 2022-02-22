import { BaseProvider } from "./base-provider";
import { Networkish } from "@hethers/networks";

// contains predefined, sdk acceptable hedera network strings
export enum HederaNetworks {
    TESTNET = "testnet",
    PREVIEWNET = "previewnet",
    MAINNET = "mainnet"
}

/**
 * The hedera provider uses the hashgraph module to establish a connection to the Hedera network.
 * As every provider, this one also gives us read-only access.
 *
 * Constructable with a string or a number, which automatically resolves to a hedera network via the hashgraph SDK.
 */
export class DefaultHederaProvider extends BaseProvider {
    constructor(network: Networkish) {
        super(network);
    }
}

