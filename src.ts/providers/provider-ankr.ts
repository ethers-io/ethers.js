import {
    defineProperties, FetchRequest, throwArgumentError
} from "../utils/index.js";

import { AbstractProvider } from "./abstract-provider.js";
import { showThrottleMessage } from "./community.js";
import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";

import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";


const defaultApiKey = "9f7d929b018cdffb338517efa06f58359e86ff1ffd350bc889738523659e7972";

function getHost(name: string): string {
    switch (name) {
        case "mainnet":
            return "rpc.ankr.com/eth";
        case "ropsten":
            return "rpc.ankr.com/eth_ropsten";
        case "rinkeby":
            return "rpc.ankr.com/eth_rinkeby";
        case "goerli":
            return "rpc.ankr.com/eth_goerli";
        case "matic":
            return "rpc.ankr.com/polygon";
        case "arbitrum":
            return "rpc.ankr.com/arbitrum";
    }
    return throwArgumentError("unsupported network", "network", name);
}


export class AnkrProvider extends JsonRpcProvider implements CommunityResourcable {
    readonly apiKey!: string;

    constructor(_network: Networkish = "mainnet", apiKey?: null | string) {
        const network = Network.from(_network);
        if (apiKey == null) { apiKey = defaultApiKey; }

        // Ankr does not support filterId, so we force polling
        const options = { polling: true, staticNetwork: network };

        const request = AnkrProvider.getRequest(network, apiKey);
        super(request, network, options);

        defineProperties<AnkrProvider>(this, { apiKey });
    }

    _getProvider(chainId: number): AbstractProvider {
        try {
            return new AnkrProvider(chainId, this.apiKey);
        } catch (error) { }
        return super._getProvider(chainId);
    }

    static getRequest(network: Network, apiKey?: null | string): FetchRequest {
        if (apiKey == null) { apiKey = defaultApiKey; }

        const request = new FetchRequest(`https:/\/${ getHost(network.name) }/${ apiKey }`);
        request.allowGzip = true;

        if (apiKey === defaultApiKey) {
            request.retryFunc = async (request, response, attempt) => {
                showThrottleMessage("AnkrProvider");
                return true;
            };
        }

        return request;
    }

    isCommunityResource(): boolean {
        return (this.apiKey === defaultApiKey);
    }
}
