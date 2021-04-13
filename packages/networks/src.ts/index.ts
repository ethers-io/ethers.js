"use strict";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { Network, Networkish } from "./types";
import {  
    HOMESTEAD_NETWORK,
    ROPSTEN_NETWORK,
    CLASSIC_MORDOR_NETWORK,
    UNSPECIFIED_NETWORK,
    MORDEN_NETWORK,
    RINKEBY_NETWORK,
    KOVAN_NETWORK,
    GOERLI_NETWORK,
    CLASSIC_NETWORK,
    CLASSIC_MORDEN_NETWORK,
    CLASSIC_KOTTI_NETWORK
} from "./constants";

export {
    Network,
    Networkish,
    HOMESTEAD_NETWORK,
    ROPSTEN_NETWORK,
    CLASSIC_MORDOR_NETWORK,
    UNSPECIFIED_NETWORK,
    MORDEN_NETWORK,
    RINKEBY_NETWORK,
    KOVAN_NETWORK,
    GOERLI_NETWORK,
    CLASSIC_NETWORK,
    CLASSIC_MORDEN_NETWORK,
    CLASSIC_KOTTI_NETWORK
};

type DefaultProviderFunc = (providers: any, options?: any) => any;

interface Renetworkable extends DefaultProviderFunc {
    renetwork: (network: Network) => DefaultProviderFunc;
};

function isRenetworkable(value: any): value is Renetworkable {
    return (value && typeof(value.renetwork) === "function");
}

function ethDefaultProvider(network: string | Network): Renetworkable {
    const func = function(providers: any, options?: any): any {
        if (options == null) { options = { }; }
        const providerList: Array<any> = [];

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

        if (providers.AlchemyProvider) {
            // These networks are currently faulty on Alchemy as their
            // network does not handle the Berlin hardfork, which is
            // live on these ones.
            // @TODO: This goes away once AlchemyAPI has upgraded their nodes
            const skip = [ GOERLI_NETWORK.name, ROPSTEN_NETWORK.name, RINKEBY_NETWORK.name ];
            try {
                const provider = new providers.AlchemyProvider(network, options.alchemy);
                if (provider.network && skip.indexOf(provider.network.name) === -1) {
                    providerList.push(provider);
                }
            } catch(error) { }
        }

        if (providers.PocketProvider) {
            // These networks are currently faulty on Alchemy as their
            // network does not handle the Berlin hardfork, which is
            // live on these ones.
            // @TODO: This goes away once Pocket has upgraded their nodes
            const skip = [ GOERLI_NETWORK.name, ROPSTEN_NETWORK.name, RINKEBY_NETWORK.name ];
            try {
                const provider = new providers.PocketProvider(network);
                if (provider.network && skip.indexOf(provider.network.name) === -1) {
                    providerList.push(provider);
                }
            } catch(error) { }
        }

        if (providers.CloudflareProvider) {
            try {
                providerList.push(new providers.CloudflareProvider(network));
            } catch(error) { }
        }

        if (providerList.length === 0) { return null; }

        if (providers.FallbackProvider) {
            let quorum = 1;
            if (options.quorum != null) {
                quorum = options.quorum;
            } else if (network === HOMESTEAD_NETWORK.name) {
                quorum = 2;
            }
            return new providers.FallbackProvider(providerList, quorum);
        }

        return providerList[0];
    };

    func.renetwork = function(network: Network) {
        return ethDefaultProvider(network);
    };

    return func;
}

function etcDefaultProvider(url: string, network: string | Network): Renetworkable {
    const func = function(providers: any, options?: any): any {
        if (providers.JsonRpcProvider) {
            return new providers.JsonRpcProvider(url, network);
        }

        return null;
    };

    func.renetwork = function(network: Network) {
        return etcDefaultProvider(url, network);
    };

    return func;
}

const homestead: Network = {
    ...HOMESTEAD_NETWORK,
    _defaultProvider: ethDefaultProvider(HOMESTEAD_NETWORK.name)
};

const ropsten: Network = {
    ...ROPSTEN_NETWORK,
    _defaultProvider: ethDefaultProvider(ROPSTEN_NETWORK.name)
};

const classicMordor: Network = {
    ...CLASSIC_MORDOR_NETWORK,
    _defaultProvider: etcDefaultProvider("https://www.ethercluster.com/mordor", CLASSIC_MORDOR_NETWORK.name)
};

const networks: { [name: string]: Network } = {
    unspecified: UNSPECIFIED_NETWORK,

    homestead: homestead,
    mainnet: homestead,

    morden: MORDEN_NETWORK,

    ropsten: ropsten,
    testnet: ropsten,

    rinkeby: {
        ...RINKEBY_NETWORK,
        _defaultProvider: ethDefaultProvider(RINKEBY_NETWORK.name)
    },

    kovan: {
        ...KOVAN_NETWORK,
        _defaultProvider: ethDefaultProvider(KOVAN_NETWORK.name)
    },

    goerli: {
        ...GOERLI_NETWORK,
        _defaultProvider: ethDefaultProvider(GOERLI_NETWORK.name)
     },


    // ETC (See: #351)
    classic: {
        ...CLASSIC_NETWORK,
        _defaultProvider: etcDefaultProvider("https://www.ethercluster.com/etc", CLASSIC_NETWORK.name)
    },

    classicMorden: CLASSIC_MORDEN_NETWORK,

    classicMordor: classicMordor,
    classicTestnet: classicMordor,

    classicKotti: {
        ...CLASSIC_KOTTI_NETWORK,
        _defaultProvider: etcDefaultProvider("https://www.ethercluster.com/kotti", CLASSIC_KOTTI_NETWORK.name)
    },
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
