"use strict";

import { Logger } from "@hethers/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { Network, Networkish, HederaNetworkConfigLike, HederaOperator, NodeUrlEntries } from "./types";

export {
    Network,
    Networkish,
    HederaNetworkConfigLike,
    HederaOperator,
    NodeUrlEntries
};

type DefaultProviderFunc = (providers: any, options?: any) => any;

interface Renetworkable extends DefaultProviderFunc {
    renetwork: (network: Network) => DefaultProviderFunc;
}

function isRenetworkable(value: any): value is Renetworkable {
    return (value && typeof(value.renetwork) === "function");
}

function hederaDefaultProvider(network: string | Network): Renetworkable {
    const func = function (providers: any, options?: any): any {
        if (options == null) {
            options = {};
        }
        const providerList: Array<any> = [];

        // TODO: JSON RPC provider, FallbackProvider for hedera
        if (providers.DefaultHederaProvider) {
            providerList.push(new providers.DefaultHederaProvider(network));
        }
        if (providerList.length === 0) {
            return null;
        }

        return providerList[0];
    };

    func.renetwork = function (network: Network) {
        return hederaDefaultProvider(network);
    };

    return func;
}

const networks: { [name: string]: Network } = {
    // hedera networks
    mainnet: {
        chainId: 290,
        name: 'mainnet',
        _defaultProvider: hederaDefaultProvider("mainnet")
    },
    testnet: {
        chainId: 291,
        name: 'testnet',
        _defaultProvider: hederaDefaultProvider("testnet")
    },
    previewnet: {
        chainId: 292,
        name: 'previewnet',
        _defaultProvider: hederaDefaultProvider("previewnet")
    }
}

/**
 *  getNetwork
 *
 *  Converts a named common networks or chain ID (network ID) to a Network
 *  and verifies a network is a valid Network..
 */
export function getNetwork(network: Networkish): Network {
    // No network (null)
    if (network == null) { return null; }

    if (typeof(network) === "number") {
        for (const name in networks) {
            const standard = networks[name];
            if (standard.chainId === network) {
                return {
                    name: standard.name,
                    chainId: standard.chainId,
                    ensAddress: (standard.ensAddress || null),
                    _defaultProvider: (standard._defaultProvider || null)
                };
            }
        }

        return {
            chainId: network,
            name: "unknown"
        };
    }

    if (typeof(network) === "string") {
        const standard = networks[network];
        if (standard == null) { return null; }
        return {
            name: standard.name,
            chainId: standard.chainId,
            ensAddress: standard.ensAddress,
            _defaultProvider: (standard._defaultProvider || null)
        };
    }

    const standard  = networks[network.name];

    // Not a standard network; check that it is a valid network in general
    if (!standard) {
        if (typeof(network.chainId) !== "number") {
            logger.throwArgumentError("invalid network chainId", "network", network);
        }
        return network;
    }

    // Make sure the chainId matches the expected network chainId (or is 0; disable EIP-155)
    if (network.chainId !== 0 && network.chainId !== standard.chainId) {
        logger.throwArgumentError("network chainId mismatch", "network", network);
    }

    // @TODO: In the next major version add an attach function to a defaultProvider
    // class and move the _defaultProvider internal to this file (extend Network)
    let defaultProvider: DefaultProviderFunc = network._defaultProvider || null;
    if (defaultProvider == null && standard._defaultProvider) {
        if (isRenetworkable(standard._defaultProvider)) {
            defaultProvider = standard._defaultProvider.renetwork(network);
        } else {
            defaultProvider = standard._defaultProvider;
        }
    }

    // Standard Network (allow overriding the ENS address)
    return {
        name: network.name,
        chainId: standard.chainId,
        ensAddress: (network.ensAddress || standard.ensAddress || null),
        _defaultProvider: defaultProvider
    };
}
