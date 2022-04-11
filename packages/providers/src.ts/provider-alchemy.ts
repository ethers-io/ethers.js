
import { defineProperties } from "@ethersproject/properties";
import { FetchRequest } from "@ethersproject/web";

import { showThrottleMessage } from "./community.js";
import { logger } from "./logger.js";
import { Network } from "./network.js";
import { StaticJsonRpcProvider } from "./provider-jsonrpc.js";

import type { ConnectionInfo, ThrottleRetryFunc } from "@ethersproject/web";

import type { AbstractProvider } from "./abstract-provider.js";
import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";


const defaultApiKey = "_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC"

function getHost(name: string): string {
    switch(name) {
        case "homestead":
            return "eth-mainnet.alchemyapi.io";
        case "ropsten":
            return "eth-ropsten.alchemyapi.io";
        case "rinkeby":
            return "eth-rinkeby.alchemyapi.io";
        case "goerli":
            return "eth-goerli.alchemyapi.io";
        case "kovan":
            return "eth-kovan.alchemyapi.io";
        case "matic":
            return "polygon-mainnet.g.alchemy.com";
        case "maticmum":
            return "polygon-mumbai.g.alchemy.com";
        case "arbitrum":
            return "arb-mainnet.g.alchemy.com";
        case "arbitrum-rinkeby":
            return "arb-rinkeby.g.alchemy.com";
        case "optimism":
            return "opt-mainnet.g.alchemy.com";
        case "optimism-kovan":
            return "opt-kovan.g.alchemy.com";
    }

    return logger.throwArgumentError("unsupported network", "network", name);
}

export class AlchemyProvider extends StaticJsonRpcProvider implements CommunityResourcable {
    readonly apiKey!: string;

    constructor(_network: Networkish = "homestead", apiKey?: null | string) {
        const network = Network.from(_network);
        if (apiKey == null) { apiKey = defaultApiKey; }
        super(AlchemyProvider.getConnection(network, apiKey), network);
        defineProperties<AlchemyProvider>(this, { apiKey });
    }

    _getProvider(chainId: number): AbstractProvider {
        try {
            return new AlchemyProvider(chainId, this.apiKey);
        } catch (error) { }
        return super._getProvider(chainId);
    }

    isCommunityResource(): boolean {
        return (this.apiKey === defaultApiKey);
    }

    static getConnection(network: Network, apiKey?: string): ConnectionInfo {
        if (apiKey == null) { apiKey = defaultApiKey; }

        const request = new FetchRequest(`https:/\/${ getHost(network.name) }/v2/${ apiKey }`);
        request.allowGzip = true;

        const throttleRetry: ThrottleRetryFunc = async (request, response, attempt) => {
            if (apiKey === defaultApiKey) { showThrottleMessage("alchemy"); }
            return true;
        }

        return { request, throttleRetry };
    }
}
