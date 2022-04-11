import { AlchemyProvider, AnkrProvider, CloudflareProvider, EtherscanProvider, InfuraProvider, PocketProvider, FallbackProvider, } from "../index.js";
;
const allNetworks = ["default", "homestead"];
const ProviderCreators = [
    {
        name: "AlchemyProvider",
        networks: allNetworks,
        create: function (network) {
            return new AlchemyProvider(network, "YrPw6SWb20vJDRFkhWq8aKnTQ8JRNRHM");
        }
    },
    {
        name: "AnkrProvider",
        networks: ["homestead", "matic", "arbitrum"],
        create: function (network) {
            return new AnkrProvider(network);
        }
    },
    {
        name: "CloudflareProvider",
        networks: ["default", "homestead"],
        create: function (network) {
            return new CloudflareProvider(network);
        }
    },
    {
        name: "EtherscanProvider",
        networks: allNetworks,
        create: function (network) {
            return new EtherscanProvider(network, "FPFGK6JSW2UHJJ2666FG93KP7WC999MNW7");
        }
    },
    {
        name: "InfuraProvider",
        networks: allNetworks,
        create: function (network) {
            return new InfuraProvider(network, "49a0efa3aaee4fd99797bfa94d8ce2f1");
        }
    },
    {
        name: "PocketProvider",
        networks: allNetworks,
        create: function (network) {
            const apiKeys = {
                homestead: "6004bcd10040261633ade990",
                ropsten: "6004bd4d0040261633ade991",
                rinkeby: "6004bda20040261633ade994",
                goerli: "6004bd860040261633ade992",
            };
            return new PocketProvider(network, apiKeys[network]);
        }
    },
    {
        name: "FallbackProvider",
        networks: allNetworks,
        create: function (network) {
            const providers = [];
            for (const creator of ProviderCreators) {
                if (creator.name === "FallbackProvider") {
                    continue;
                }
                if (creator.networks.indexOf(network) >= 0) {
                    const provider = creator.create(network);
                    if (provider) {
                        providers.push(provider);
                    }
                }
            }
            return new FallbackProvider(providers);
        }
    },
];
export const providerNames = Object.freeze(ProviderCreators.map((c) => (c.name)));
function getCreator(provider) {
    const creators = ProviderCreators.filter((c) => (c.name === provider));
    if (creators.length === 1) {
        return creators[0];
    }
    return null;
}
export function getProviderNetworks(provider) {
    const creator = getCreator(provider);
    if (creator) {
        return creator.networks;
    }
    return [];
}
export function getProvider(provider, network) {
    const creator = getCreator(provider);
    if (creator) {
        return creator.create(network);
    }
    return null;
}
export function connect(network) {
    const provider = getProvider("InfuraProvider", network);
    if (provider == null) {
        throw new Error(`could not connect to ${network}`);
    }
    return provider;
}
//# sourceMappingURL=create-provider.js.map