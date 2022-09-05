import { defineProperties } from "../utils/properties.js";
import { FetchRequest } from "../utils/fetch.js";

import { showThrottleMessage } from "./community.js";
import { logger } from "../utils/logger.js";
import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";

import type { AbstractProvider } from "./abstract-provider.js";
import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";


const defaultProjectId = "84842078b09946638c03157f83405213";

function getHost(name: string): string {
    switch(name) {
        case "homestead":
            return "mainnet.infura.io";
        case "ropsten":
            return "ropsten.infura.io";
        case "rinkeby":
            return "rinkeby.infura.io";
        case "kovan":
            return "kovan.infura.io";
        case "goerli":
            return "goerli.infura.io";
        case "matic":
            return "polygon-mainnet.infura.io";
        case "maticmum":
            return "polygon-mumbai.infura.io";
        case "optimism":
            return "optimism-mainnet.infura.io";
        case "optimism-kovan":
            return "optimism-kovan.infura.io";
        case "arbitrum":
            return "arbitrum-mainnet.infura.io";
        case "arbitrum-rinkeby":
            return "arbitrum-rinkeby.infura.io";
    }

    return logger.throwArgumentError("unsupported network", "network", name);
}


export class InfuraProvider extends JsonRpcProvider implements CommunityResourcable {
    readonly projectId!: string;
    readonly projectSecret!: null | string;

    constructor(_network: Networkish = "homestead", projectId?: null | string, projectSecret?: null | string) {
        const network = Network.from(_network);
        if (projectId == null) { projectId = defaultProjectId; }
        if (projectSecret == null) { projectSecret = null; }

        const request = InfuraProvider.getRequest(network, projectId, projectSecret);
        super(request, network, { staticNetwork: network });

        defineProperties<InfuraProvider>(this, { projectId, projectSecret });
    }

    _getProvider(chainId: number): AbstractProvider {
        try {
            return new InfuraProvider(chainId, this.projectId, this.projectSecret);
        } catch (error) { }
        return super._getProvider(chainId);
    }

    static getRequest(network: Network, projectId?: null | string, projectSecret?: null | string): FetchRequest {
        if (projectId == null) { projectId = defaultProjectId; }
        if (projectSecret == null) { projectSecret = null; }

        const request = new FetchRequest(`https:/\/${ getHost(network.name) }/v3/${ projectId }`);
        request.allowGzip = true;
        if (projectSecret) { request.setCredentials("", projectSecret); }

        if (projectId === defaultProjectId) {
            request.retryFunc = async (request, response, attempt) => {
                showThrottleMessage("InfuraProvider");
                return true;
            };
        }

        return request;
    }

    isCommunityResource(): boolean {
        return (this.projectId === defaultProjectId);
    }
}
