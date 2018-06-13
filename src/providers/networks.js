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
// @TODO: Make these all read-only with defineProperty
exports.networks = {
    "unspecified": {
        "chainId": 0,
        "name": "unspecified"
    },
    "homestead": {
        "chainId": 1,
        "ensAddress": "0x314159265dd8dbb310642f98f50c066173c1259b",
        "name": "homestead"
    },
    "mainnet": {
        "chainId": 1,
        "ensAddress": "0x314159265dd8dbb310642f98f50c066173c1259b",
        "name": "homestead"
    },
    "morden": {
        "chainId": 2,
        "name": "morden"
    },
    "ropsten": {
        "chainId": 3,
        "ensAddress": "0x112234455c3a32fd11230c42e7bccd4a84e02010",
        "name": "ropsten"
    },
    "testnet": {
        "chainId": 3,
        "ensAddress": "0x112234455c3a32fd11230c42e7bccd4a84e02010",
        "name": "ropsten"
    },
    "rinkeby": {
        "chainId": 4,
        "name": "rinkeby"
    },
    "kovan": {
        "chainId": 42,
        "name": "kovan"
    },
    "classic": {
        "chainId": 61,
        "name": "classic"
    }
};
/**
 *  getNetwork
 *
 *  If the network is a the name of a common network, return that network.
 *  Otherwise, if it is a network object, verify the chain ID is valid
 *  for that network. Otherwise, return the network.
 *
 */
function getNetwork(network) {
    // No network (null) or unspecified (chainId = 0)
    if (!network) {
        return null;
    }
    if (typeof (network) === 'number') {
        for (var key in exports.networks) {
            var n = exports.networks[key];
            if (n.chainId === network) {
                return n;
            }
        }
        return null;
    }
    if (typeof (network) === 'string') {
        return exports.networks[network] || null;
    }
    var networkObj = exports.networks[network.name];
    // Not a standard network; check that it is a valid network in general
    if (!networkObj) {
        if (typeof (network.chainId) !== 'number') {
            errors.throwError('invalid network chainId', errors.INVALID_ARGUMENT, { name: 'network', value: network });
        }
        return network;
    }
    // Make sure the chainId matches the expected network chainId (or is 0; disable EIP-155)
    if (network.chainId != 0 && network.chainId !== networkObj.chainId) {
        errors.throwError('network chainId mismatch', errors.INVALID_ARGUMENT, { name: 'network', value: network });
    }
    return networkObj;
}
exports.getNetwork = getNetwork;
