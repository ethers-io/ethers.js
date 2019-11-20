"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
function ethDefaultProvider(network) {
    return function (providers, options) {
        if (options == null) {
            options = {};
        }
        var providerList = [];
        if (providers.InfuraProvider) {
            try {
                providerList.push(new providers.InfuraProvider(network, options.infura));
            }
            catch (error) { }
        }
        if (providers.EtherscanProvider) {
            try {
                providerList.push(new providers.EtherscanProvider(network, options.etherscan));
            }
            catch (error) { }
        }
        /* NodeSmith is being discontinued on 2019-12-20
        if (providers.NodesmithProvider) {
            try {
                providerList.push(new providers.NodesmithProvider(network, options.nodesmith));
            } catch(error) { }
        }
        */
        if (providers.AlchemyProvider) {
            try {
                providerList.push(new providers.AlchemyProvider(network, options.alchemy));
            }
            catch (error) { }
        }
        if (providers.CloudflareProvider) {
            try {
                providerList.push(new providers.CloudflareProvider(network));
            }
            catch (error) { }
        }
        if (providerList.length === 0) {
            return null;
        }
        if (providers.FallbackProvider) {
            var quorum = providerList.length / 2;
            if (options.quorum != null) {
                quorum = options.quorum;
            }
            else if (quorum > 2) {
                quorum = 2;
            }
            return new providers.FallbackProvider(providerList, quorum);
        }
        return providerList[0];
    };
}
function etcDefaultProvider(url, network) {
    return function (providers, options) {
        if (providers.JsonRpcProvider) {
            return new providers.JsonRpcProvider(url, network);
        }
        return null;
    };
}
var homestead = {
    chainId: 1,
    ensAddress: "0x314159265dd8dbb310642f98f50c066173c1259b",
    name: "homestead",
    _defaultProvider: ethDefaultProvider("homestead")
};
var ropsten = {
    chainId: 3,
    ensAddress: "0x112234455c3a32fd11230c42e7bccd4a84e02010",
    name: "ropsten",
    _defaultProvider: ethDefaultProvider("ropsten")
};
var networks = {
    unspecified: {
        chainId: 0,
        name: "unspecified"
    },
    homestead: homestead,
    mainnet: homestead,
    morden: {
        chainId: 2,
        name: "morden"
    },
    ropsten: ropsten,
    testnet: ropsten,
    rinkeby: {
        chainId: 4,
        ensAddress: "0xe7410170f87102DF0055eB195163A03B7F2Bff4A",
        name: "rinkeby",
        _defaultProvider: ethDefaultProvider("rinkeby")
    },
    kovan: {
        chainId: 42,
        name: "kovan",
        _defaultProvider: ethDefaultProvider("kovan")
    },
    goerli: {
        chainId: 5,
        ensAddress: "0x112234455c3a32fd11230c42e7bccd4a84e02010",
        name: "goerli",
        _defaultProvider: ethDefaultProvider("goerli")
    },
    classic: {
        chainId: 61,
        name: "classic",
        _defaultProvider: etcDefaultProvider("https://web3.gastracker.io", "classic")
    },
    classicTestnet: {
        chainId: 62,
        name: "classicTestnet",
        _defaultProvider: etcDefaultProvider("https://web3.gastracker.io/morden", "classicTestnet")
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
    // Standard Network (allow overriding the ENS address)
    return {
        name: network.name,
        chainId: standard.chainId,
        ensAddress: (network.ensAddress || standard.ensAddress || null),
        _defaultProvider: (network._defaultProvider || standard._defaultProvider || null)
    };
}
exports.getNetwork = getNetwork;
