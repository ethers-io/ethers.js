"use strict";

import { isHexString } from "@ethersproject/bytes";
import * as errors from "@ethersproject/errors";
import { Network } from "@ethersproject/networks";

import { UrlJsonRpcProvider } from "./url-json-rpc-provider";


const defaultProjectId = "84842078b09946638c03157f83405213"

export class InfuraProvider extends UrlJsonRpcProvider {
    get projectId(): string { return this.apiKey; }

    static getApiKey(apiKey: string): string {
        if (apiKey == null) { return defaultProjectId; }
        if (!isHexString(apiKey, 16)) {
            errors.throwArgumentError("invalid projectId", "projectId", apiKey);
        }
        return apiKey;
    }

    static getUrl(network: Network, apiKey: string): string {
        let host = null;
        switch(network.name) {
            case "homestead":
                host = "mainnet.infura.io";
                break;
            case "ropsten":
                host = "ropsten.infura.io";
                break;
            case "rinkeby":
                host = "rinkeby.infura.io";
                break;
            case "kovan":
                host = "kovan.infura.io";
                break;
            case "goerli":
                host = "goerli.infura.io";
                break;
            default:
                errors.throwError("unsupported network", errors.INVALID_ARGUMENT, {
                    argument: "network",
                    value: network
                });
        }

        return "https://" + host + "/v3/" + apiKey;
    }
}
