'use strict';
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
var errors = __importStar(require("../utils/errors"));
var homestead = {
    chainId: 1,
    ensAddress: "0x314159265dd8dbb310642f98f50c066173c1259b",
    name: "homestead"
};
var ropsten = {
    chainId: 3,
    ensAddress: "0x112234455c3a32fd11230c42e7bccd4a84e02010",
    name: "ropsten"
};
var networks = {
    unspecified: {
        chainId: 0
    },
    homestead: homestead,
    mainnet: homestead,
    morden: {
        chainId: 2
    },
    ropsten: ropsten,
    testnet: ropsten,
    rinkeby: {
        chainId: 4,
        ensAddress: "0xe7410170f87102DF0055eB195163A03B7F2Bff4A"
    },
    kovan: {
        chainId: 42
    },
    classic: {
        chainId: 61
    }
};
/**
 *  getNetwork
 *
 *  Converts a named common networks or chain ID (network ID) to a Network
 *  and verifies a network is a valid Network..
 */
function getNetwork(network) {
    // No network (null) or unspecified (chainId = 0)
    if (!network) {
        return null;
    }
    if (typeof (network) === 'number') {
        for (var name in networks) {
            var n_1 = networks[name];
            if (n_1.chainId === network) {
                return {
                    name: name,
                    chainId: n_1.chainId,
                    ensAddress: n_1.ensAddress
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
            name: network,
            chainId: n_2.chainId,
            ensAddress: n_2.ensAddress
        };
    }
    var n = networks[network.name];
    // Not a standard network; check that it is a valid network in general
    if (!n) {
        if (typeof (n.chainId) !== 'number') {
            errors.throwError('invalid network chainId', errors.INVALID_ARGUMENT, { arg: 'network', value: network });
        }
        return network;
    }
    // Make sure the chainId matches the expected network chainId (or is 0; disable EIP-155)
    if (network.chainId !== 0 && network.chainId !== n.chainId) {
        errors.throwError('network chainId mismatch', errors.INVALID_ARGUMENT, { arg: 'network', value: network });
    }
    // Standard Network
    return {
        name: network.name,
        chainId: n.chainId,
        ensAddress: n.ensAddress
    };
}
exports.getNetwork = getNetwork;
