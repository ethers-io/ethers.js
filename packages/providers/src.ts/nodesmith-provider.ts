"use strict";

import * as errors from "@ethersproject/errors";

import { Network } from "@ethersproject/networks";
import { UrlJsonRpcProvider } from "./url-json-rpc-provider";


// Special API key provided by Nodesmith for ethers.js
const defaultApiKey = "ETHERS_JS_SHARED";

export class NodesmithProvider extends UrlJsonRpcProvider {

    static getApiKey(apiKey: string): string {
        return apiKey || defaultApiKey;
    }

    static getUrl(network: Network, apiKey?: string): string {
        let host = null;
        switch (network.name) {
            case "homestead":
                host = "https://ethereum.api.nodesmith.io/v1/mainnet/jsonrpc";
                break;
            case "ropsten":
                host = "https://ethereum.api.nodesmith.io/v1/ropsten/jsonrpc";
                break;
            case "rinkeby":
                host = "https://ethereum.api.nodesmith.io/v1/rinkeby/jsonrpc";
                break;
            case "goerli":
                host = "https://ethereum.api.nodesmith.io/v1/goerli/jsonrpc";
                break;
            case "kovan":
                host = "https://ethereum.api.nodesmith.io/v1/kovan/jsonrpc";
                break;
            default:
               errors.throwArgumentError("unsupported network", "network", arguments[0]);
        }

        return (host + "?apiKey=" + apiKey);
    }
}
