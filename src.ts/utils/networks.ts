'use strict';

import * as errors from '../errors';


export type Network = {
    name: string,
    chainId: number,
    ensAddress?: string,
    _defaultProvider?: (providers: any) => any
}

export type Networkish = Network | string | number;

function ethDefaultProvider(network: string): (providers: any) => any {
    return function(providers: any): any {
        let providerList: Array<any> = [];

        if (providers.InfuraProvider) {
            providerList.push(new providers.InfuraProvider(network));
        }

        if (providers.EtherscanProvider) {
            providerList.push(new providers.EtherscanProvider(network));
        }

        if (providerList.length === 0) { return null; }

        if (providers.FallbackProvider) {
            return new providers.FallbackProvider(providerList);;
        }

        return providerList[0];
    }
}

function etcDefaultProvider(url: string, network: string): (providers: any) => any {
    return function(providers: any): any {
        if (providers.JsonRpcProvider) {
            return new providers.JsonRpcProvider(url, network);
        }

        return null;
    }
}

const homestead: Network = {
    chainId: 1,
    ensAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    name: "homestead",
    _defaultProvider: ethDefaultProvider('homestead')
};

const ropsten: Network = {
    chainId: 3,
    ensAddress: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    name: "ropsten",
    _defaultProvider: ethDefaultProvider('ropsten')
};

const networks: { [name: string]: Network } = {
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

    if (typeof(network) === 'number') {
        for (let name in networks) {
            let n = networks[name];
            if (n.chainId === network) {
                return {
                    name: n.name,
                    chainId: n.chainId,
                    ensAddress: (n.ensAddress || null),
                    _defaultProvider: (n._defaultProvider || null)
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
            name: n.name,
            chainId: n.chainId,
            ensAddress: n.ensAddress,
            _defaultProvider: (n._defaultProvider || null)
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

    // Standard Network (allow overriding the ENS address)
    return {
        name: network.name,
        chainId: n.chainId,
        ensAddress: (network.ensAddress || n.ensAddress || null),
        _defaultProvider: (network._defaultProvider || n._defaultProvider || null)
    };
}
