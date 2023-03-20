import { AlchemyProvider, 
//    AnkrProvider,
//    CloudflareProvider,
EtherscanProvider, InfuraProvider, PocketProvider, QuickNodeProvider, FallbackProvider, isError, } from "../index.js";
;
const ethNetworks = ["default", "mainnet", "goerli"];
//const maticNetworks = [ "matic", "maticmum" ];
const ProviderCreators = [
    {
        name: "AlchemyProvider",
        networks: ethNetworks,
        create: function (network) {
            return new AlchemyProvider(network, "YrPw6SWb20vJDRFkhWq8aKnTQ8JRNRHM");
        }
    },
    /*
    {
        name: "AnkrProvider",
        networks: ethNetworks.concat([ "matic", "arbitrum" ]),
        create: function(network: string) {
            return new AnkrProvider(network);
        }
    },
    */
    /*
    {
        name: "CloudflareProvider",
        networks: [ "default", "mainnet" ],
        create: function(network: string) {
            return new CloudflareProvider(network);
        }
    },
    */
    {
        name: "EtherscanProvider",
        networks: ethNetworks,
        create: function (network) {
            return new EtherscanProvider(network, "FPFGK6JSW2UHJJ2666FG93KP7WC999MNW7");
        }
    },
    {
        name: "InfuraProvider",
        networks: ethNetworks,
        create: function (network) {
            return new InfuraProvider(network, "49a0efa3aaee4fd99797bfa94d8ce2f1");
        }
    },
    {
        name: "InfuraWebsocketProvider",
        networks: ethNetworks,
        create: function (network) {
            return InfuraProvider.getWebSocketProvider(network, "49a0efa3aaee4fd99797bfa94d8ce2f1");
        }
    },
    {
        name: "PocketProvider",
        networks: ethNetworks,
        create: function (network) {
            return new PocketProvider(network);
        }
    },
    {
        name: "QuickNodeProvider",
        networks: ethNetworks,
        create: function (network) {
            return new QuickNodeProvider(network);
        }
    },
    {
        name: "FallbackProvider",
        networks: ethNetworks,
        create: function (network) {
            const providers = [];
            for (const providerName of ["AlchemyProvider", "AnkrProvider", "EtherscanProvider", "InfuraProvider"]) {
                const provider = getProvider(providerName, network);
                if (provider) {
                    providers.push(provider);
                }
            }
            if (providers.length === 0) {
                throw new Error("UNSUPPORTED NETWORK");
            }
            return new FallbackProvider(providers);
        }
    },
];
let setup = false;
const cleanup = [];
export function setupProviders() {
    after(function () {
        for (const func of cleanup) {
            func();
        }
    });
    setup = true;
}
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
    if (setup == false) {
        throw new Error("MUST CALL setupProviders in root context");
    }
    const creator = getCreator(provider);
    try {
        if (creator) {
            const provider = creator.create(network);
            if (provider) {
                cleanup.push(() => { provider.destroy(); });
            }
            return provider;
        }
    }
    catch (error) {
        if (!isError(error, "INVALID_ARGUMENT")) {
            throw error;
        }
    }
    return null;
}
export function checkProvider(provider, network) {
    const creator = getCreator(provider);
    return (creator != null);
}
export function connect(network) {
    const provider = getProvider("InfuraProvider", network);
    if (provider == null) {
        throw new Error(`could not connect to ${network}`);
    }
    return provider;
}
//# sourceMappingURL=create-provider.js.map