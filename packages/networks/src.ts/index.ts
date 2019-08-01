"use strict";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { Network, Networkish } from "./types";

export {
    Network,
    Networkish
};

function ethDefaultProvider(network: string): (providers: any) => any {
    return function(providers: any, options?: any): any {
        if (options == null) { options = { }; }
        let providerList: Array<any> = [];

        if (providers.InfuraProvider) {
            try {
                providerList.push(new providers.InfuraProvider(network, options.infura));
            } catch(error) { }
        }

        if (providers.EtherscanProvider) {
            try {
                providerList.push(new providers.EtherscanProvider(network, options.etherscan));
            } catch(error) { }
        }

        if (providers.NodesmithProvider) {
            try {
                providerList.push(new providers.NodesmithProvider(network, options.nodesmith));
            } catch(error) { }
        }

        if (providers.AlchemyProvider) {
            try {
                providerList.push(new providers.AlchemyProvider(network, options.alchemy));
            } catch(error) { }
        }

        if (providerList.length === 0) { return null; }

        if (providers.FallbackProvider) {
            return new providers.FallbackProvider(providerList);;
        }

        return providerList[0];
    }
}

function etcDefaultProvider(url: string, network: string): (providers: any) => any {
    return function(providers: any, options?: any): any {
        if (providers.JsonRpcProvider) {
            return new providers.JsonRpcProvider(url, network);
        }

        return null;
    }
}

const homestead: Network = {
    chainId: 1,
    ensAddress: "0x314159265dd8dbb310642f98f50c066173c1259b",
    name: "homestead",
    _defaultProvider: ethDefaultProvider("homestead")
};

const ropsten: Network = {
    chainId: 3,
    ensAddress: "0x112234455c3a32fd11230c42e7bccd4a84e02010",
    name: "ropsten",
    _defaultProvider: ethDefaultProvider("ropsten")
};

const networks: { [name: string]: Network } = {
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
        for (let name in networks) {
            let standard = networks[name];
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
        let standard = networks[network];
        if (standard == null) { return null; }
        return {
            name: standard.name,
            chainId: standard.chainId,
            ensAddress: standard.ensAddress,
            _defaultProvider: (standard._defaultProvider || null)
        };
    }

    let standard  = networks[network.name];

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

    // Standard Network (allow overriding the ENS address)
    return {
        name: network.name,
        chainId: standard.chainId,
        ensAddress: (network.ensAddress || standard.ensAddress || null),
        _defaultProvider: (network._defaultProvider || standard._defaultProvider || null)
    };
}
