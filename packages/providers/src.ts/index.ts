"use strict";

import {
    EventType,
    FeeData,
    Filter,
    Log,
    Listener,
    Provider,
    TransactionReceipt,
    TransactionRequest,
    TransactionResponse
} from "@hethers/abstract-provider";

import { getNetwork } from "@hethers/networks";
import { Network, Networkish } from "@hethers/networks";

import { BaseProvider } from "./base-provider";

import { DefaultHederaProvider } from "./default-hedera-provider";
import { Formatter } from "./formatter";

import { Logger } from "@hethers/logger";
import { version } from "./_version";
import HederaProvider from "./hedera-provider";

const logger = new Logger(version);

////////////////////////
// Helper Functions

function getDefaultProvider(network?: Networkish, options?: any): BaseProvider {
    if (network == null) { network = "mainnet"; }

    // If passed a URL, figure out the right type of provider based on the scheme
    if (typeof (network) === "string") {

        // Handle http and ws (and their secure variants)
        const match = network.match(/^(ws|http)s?:/i);
        if (match) {
            logger.throwArgumentError("unsupported URL scheme", "network", network);
        }
    }

    const n = getNetwork(network);
    if (!n || !n._defaultProvider) {
        logger.throwError("unsupported getDefaultProvider network", Logger.errors.NETWORK_ERROR, {
            operation: "getDefaultProvider",
            network: network
        });
    }

    return n._defaultProvider({
        HederaProvider,
        DefaultHederaProvider,
    }, options);
}

////////////////////////
// Exports

export {

    // Abstract Providers (or Abstract-ish)
    Provider,
    BaseProvider,

    ///////////////////////
    // Concrete Providers


    DefaultHederaProvider,
    HederaProvider,
    ///////////////////////
    // Signer


    ///////////////////////
    // Functions

    getDefaultProvider,
    getNetwork,

    ///////////////////////
    // Objects

    Formatter,


    ///////////////////////
    // Types

    EventType,
    FeeData,
    Filter,
    Log,
    Listener,
    TransactionReceipt,
    TransactionRequest,
    TransactionResponse,

    Network,
    Networkish
};

