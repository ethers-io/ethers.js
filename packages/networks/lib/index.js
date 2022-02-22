"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNetwork = void 0;
var logger_1 = require("@hethers/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
function isRenetworkable(value) {
    return (value && typeof (value.renetwork) === "function");
}
function hederaDefaultProvider(network) {
    var func = function (providers, options) {
        if (options == null) {
            options = {};
        }
        var providerList = [];
        // TODO: JSON RPC provider, FallbackProvider for hedera
        if (providers.DefaultHederaProvider) {
            providerList.push(new providers.DefaultHederaProvider(network));
        }
        if (providerList.length === 0) {
            return null;
        }
        return providerList[0];
    };
    func.renetwork = function (network) {
        return hederaDefaultProvider(network);
    };
    return func;
}
var networks = {
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
};
/**
 *  getNetwork
 *
 *  Converts a named common networks or chain ID (network ID) to a Network
 *  and verifies a network is a valid Network..
 */
function getNetwork(network) {
    // No network (null)
    if (network == null) {
        return null;
    }
    if (typeof (network) === "number") {
        for (var name_1 in networks) {
            var standard_1 = networks[name_1];
            if (standard_1.chainId === network) {
                return {
                    name: standard_1.name,
                    chainId: standard_1.chainId,
                    ensAddress: (standard_1.ensAddress || null),
                    _defaultProvider: (standard_1._defaultProvider || null)
                };
            }
        }
        return {
            chainId: network,
            name: "unknown"
        };
    }
    if (typeof (network) === "string") {
        var standard_2 = networks[network];
        if (standard_2 == null) {
            return null;
        }
        return {
            name: standard_2.name,
            chainId: standard_2.chainId,
            ensAddress: standard_2.ensAddress,
            _defaultProvider: (standard_2._defaultProvider || null)
        };
    }
    var standard = networks[network.name];
    // Not a standard network; check that it is a valid network in general
    if (!standard) {
        if (typeof (network.chainId) !== "number") {
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
    var defaultProvider = network._defaultProvider || null;
    if (defaultProvider == null && standard._defaultProvider) {
        if (isRenetworkable(standard._defaultProvider)) {
            defaultProvider = standard._defaultProvider.renetwork(network);
        }
        else {
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
exports.getNetwork = getNetwork;
//# sourceMappingURL=index.js.map