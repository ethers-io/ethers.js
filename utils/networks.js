'use strict';
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var errors = __importStar(require("../errors"));
function ethDefaultProvider(network) {
    return function (providers) {
        var providerList = [];
        if (providers.InfuraProvider) {
            providerList.push(new providers.InfuraProvider(network));
        }
        if (providers.EtherscanProvider) {
            providerList.push(new providers.EtherscanProvider(network));
        }
        if (providerList.length === 0) {
            return null;
        }
        if (providers.FallbackProvider) {
            return new providers.FallbackProvider(providerList);
            ;
        }
        return providerList[0];
    };
}
function etcDefaultProvider(url, network) {
    return function (providers) {
        if (providers.JsonRpcProvider) {
            return new providers.JsonRpcProvider(url, network);
        }
        return null;
    };
}
var homestead = {
    chainId: 1,
    ensAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    name: "homestead",
    _defaultProvider: ethDefaultProvider('homestead')
};
var ropsten = {
    chainId: 3,
    ensAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    name: "ropsten",
    _defaultProvider: ethDefaultProvider('ropsten')
};
var networks = {
    unspecified: {
        chainId: 0,
        name: 'unspecified'
    },
    homestead: homestead,
    mainnet: homestead,
    morden: {
        chainId: 2,
        name: 'morden'
    },
    ropsten: ropsten,
    testnet: ropsten,
    rinkeby: {
        chainId: 4,
        ensAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
        name: 'rinkeby',
        _defaultProvider: ethDefaultProvider('rinkeby')
    },
    goerli: {
        chainId: 5,
        ensAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
        name: "goerli",
        _defaultProvider: ethDefaultProvider('goerli')
    },
    kovan: {
        chainId: 42,
        name: 'kovan',
        _defaultProvider: ethDefaultProvider('kovan')
    },
    classic: {
        chainId: 61,
        name: 'classic',
        _defaultProvider: etcDefaultProvider('https://web3.gastracker.io', 'classic')
    },
    classicTestnet: {
        chainId: 62,
        name: 'classicTestnet',
        _defaultProvider: etcDefaultProvider('https://web3.gastracker.io/morden', 'classicTestnet')
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
    if (typeof (network) === 'number') {
        for (var name_1 in networks) {
            var n_1 = networks[name_1];
            if (n_1.chainId === network) {
                return {
                    name: n_1.name,
                    chainId: n_1.chainId,
                    ensAddress: (n_1.ensAddress || null),
                    _defaultProvider: (n_1._defaultProvider || null)
                };
            }
        }
        return {
            chainId: network,
            name: 'unknown'
        };
    }
    if (typeof (network) === 'string') {
        var n_2 = networks[network];
        if (n_2 == null) {
            return null;
        }
        return {
            name: n_2.name,
            chainId: n_2.chainId,
            ensAddress: n_2.ensAddress,
            _defaultProvider: (n_2._defaultProvider || null)
        };
    }
    var n = networks[network.name];
    // Not a standard network; check that it is a valid network in general
    if (!n) {
        if (typeof (network.chainId) !== 'number') {
            errors.throwError('invalid network chainId', errors.INVALID_ARGUMENT, { arg: 'network', value: network });
        }
        return network;
    }
    // Make sure the chainId matches the expected network chainId (or is 0; disable EIP-155)
    if (network.chainId !== 0 && network.chainId !== n.chainId) {
        errors.throwError('network chainId mismatch', errors.INVALID_ARGUMENT, { arg: 'network', value: network });
    }
    // Standard Network (allow overriding the ENS address)
    return {
        name: network.name,
        chainId: n.chainId,
        ensAddress: (network.ensAddress || n.ensAddress || null),
        _defaultProvider: (network._defaultProvider || n._defaultProvider || null)
    };
}
exports.getNetwork = getNetwork;
