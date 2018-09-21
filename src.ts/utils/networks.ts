'use strict';

import * as errors from '../utils/errors';


export type Network = {
    name: string,
    chainId: number,
    ensAddress?: string,
}

export type Networkish = Network | string | number;


const homestead: Network = {
    chainId: 1,
    ensAddress: "0x314159265dd8dbb310642f98f50c066173c1259b",
    name: "homestead"
};

const ropsten: Network = {
    chainId: 3,
    ensAddress: "0x112234455c3a32fd11230c42e7bccd4a84e02010",
    name: "ropsten"
};

const networks: { [name: string]: { chainId: number, ensAddress?: string } } = {
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
    },

    classicTestnet: {
        chainId: 62
    }
}

/**
 *  getNetwork
 *
 *  Converts a named common networks or chain ID (network ID) to a Network
 *  and verifies a network is a valid Network..
 */
export function getNetwork(network: Networkish): Network {
    // No network (null) or unspecified (chainId = 0)
    if (!network) { return null; }

    if (typeof(network) === 'number') {
        for (var name in networks) {
            let n = networks[name];
            if (n.chainId === network) {
                return {
                    name: name,
                    chainId: n.chainId,
                    ensAddress: n.ensAddress
                };
            }
        }

        return {
            chainId: network,
            name: 'unknown'
        };
    }

    if (typeof(network) === 'string') {
        let n = networks[network];
        if (n == null) { return null; }
        return {
            name: network,
            chainId: n.chainId,
            ensAddress: n.ensAddress
        };
    }

    let n  = networks[network.name];

    // Not a standard network; check that it is a valid network in general
    if (!n) {
        if (typeof(network.chainId) !== 'number') {
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
