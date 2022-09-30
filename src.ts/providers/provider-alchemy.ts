
import {
    defineProperties, FetchRequest, throwArgumentError, throwError
} from "../utils/index.js";

import { showThrottleMessage } from "./community.js";
import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";

import type { AbstractProvider, PerformActionRequest } from "./abstract-provider.js";
import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";


const defaultApiKey = "_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC"

function getHost(name: string): string {
    switch(name) {
        case "mainnet":
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

    return throwArgumentError("unsupported network", "network", name);
}

export class AlchemyProvider extends JsonRpcProvider implements CommunityResourcable {
    readonly apiKey!: string;

    constructor(_network: Networkish = "mainnet", apiKey?: null | string) {
        const network = Network.from(_network);
        if (apiKey == null) { apiKey = defaultApiKey; }

        const request = AlchemyProvider.getRequest(network, apiKey);
        super(request, network, { staticNetwork: network });

        defineProperties<AlchemyProvider>(this, { apiKey });
    }

    _getProvider(chainId: number): AbstractProvider {
        try {
            return new AlchemyProvider(chainId, this.apiKey);
        } catch (error) { }
        return super._getProvider(chainId);
    }

    async _perform(req: PerformActionRequest): Promise<any> {

        // https://docs.alchemy.com/reference/trace-transaction
        if (req.method === "getTransactionResult") {
            const trace = await this.send("trace_transaction", [ req.hash ]);
            if (trace == null) { return null; }

            let data: undefined | string;
            let error = false;
            try {
                data = trace[0].result.output;
                error = (trace[0].error === "Reverted");
            } catch (error) { }

            if (data) {
                if (error) {
                    throwError("an error occurred during transaction executions", "CALL_EXCEPTION", {
                        data
                    });
                }
                return data;
            }

            return throwError("could not parse trace result", "BAD_DATA", { value: trace });
        }

        return await super._perform(req);
    }

    isCommunityResource(): boolean {
        return (this.apiKey === defaultApiKey);
    }

    static getRequest(network: Network, apiKey?: string): FetchRequest {
        if (apiKey == null) { apiKey = defaultApiKey; }

        const request = new FetchRequest(`https:/\/${ getHost(network.name) }/v2/${ apiKey }`);
        request.allowGzip = true;

        if (apiKey === defaultApiKey) {
            request.retryFunc = async (request, response, attempt) => {
                showThrottleMessage("alchemy");
                return true;
            }
        }

        return request;
    }
}
