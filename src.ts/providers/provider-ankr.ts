import {
    defineProperties, FetchRequest, assertArgument
} from "../utils/index.js";

import { AbstractProvider } from "./abstract-provider.js";
import { showThrottleMessage } from "./community.js";
import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";

import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";
import type { JsonRpcError, JsonRpcPayload } from "./provider-jsonrpc.js";


const defaultApiKey = "9f7d929b018cdffb338517efa06f58359e86ff1ffd350bc889738523659e7972";

function getHost(name: string): string {
    switch (name) {
        case "mainnet":
            return "rpc.ankr.com/eth";
        case "goerli":
            return "rpc.ankr.com/eth_goerli";
        case "matic":
            return "rpc.ankr.com/polygon";
        case "arbitrum":
            return "rpc.ankr.com/arbitrum";
    }

    assertArgument(false, "unsupported network", "network", name);
}


/**
 *  About Ankr...
 *
 *  @_docloc: api/providers/thirdparty
 */
export class AnkrProvider extends JsonRpcProvider implements CommunityResourcable {
    readonly apiKey!: string;

    constructor(_network?: Networkish, apiKey?: null | string) {
        if (_network == null) { _network = "mainnet"; }
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

    getRpcError(payload: JsonRpcPayload, error: JsonRpcError): Error {
        if (payload.method === "eth_sendRawTransaction") {
            if (error && error.error && error.error.message === "INTERNAL_ERROR: could not replace existing tx") {
                error.error.message = "replacement transaction underpriced";
            }
        }

        return super.getRpcError(payload, error);
    }

    isCommunityResource(): boolean {
        return (this.apiKey === defaultApiKey);
    }
}
