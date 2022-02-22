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

/**
 * Always composes a hedera timestamp from the given string/numeric input.
 * May lose precision - JavaScript's floating point loss
 *
 * @param timestamp - the timestamp to be formatted
 */
 function composeHederaTimestamp(timestamp: number | string): string {
    if (typeof timestamp === "number") {
        const tsCopy = timestamp.toString();
        let seconds = tsCopy.slice(0, 10);
        if (seconds.length < 10) {
            for (let i = seconds.length; i < 10; i++) {
                seconds += "0";
            }
        }
        let nanosTemp = tsCopy.slice(seconds.length);
        if (nanosTemp.length < 9) {
            for (let i = nanosTemp.length; i < 9; i++) {
                nanosTemp += "0";
            }
        }
        return `${seconds}.${nanosTemp}`;
    } else if (typeof timestamp === "string") {
        if (timestamp.includes(".")) {
            // already formatted
            const split = timestamp.split(".");
            if (split[0].length === 10 && split[1].length === 9) {
                return timestamp;
            }
            // floating point number - we lose precision
            return composeHederaTimestamp(parseInt(timestamp.split('.')[0]));
        } else {
            return composeHederaTimestamp(parseInt(timestamp));
        }
    } else {
        // not a string, neither a number
        return logger.throwArgumentError('invalid timestamp', Logger.errors.INVALID_ARGUMENT, {timestamp});
    }
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
    composeHederaTimestamp,

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

