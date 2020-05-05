"use strict";
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);
import { UrlJsonRpcProvider } from "./url-json-rpc-provider";
// This key was provided to ethers.js by Alchemy to be used by the
// default provider, but it is recommended that for your own
// production environments, that you acquire your own API key at:
//   https://dashboard.alchemyapi.io
const defaultApiKey = "_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC";
export class AlchemyProvider extends UrlJsonRpcProvider {
    static getApiKey(apiKey) {
        if (apiKey == null) {
            return defaultApiKey;
        }
        if (apiKey && typeof (apiKey) !== "string") {
            logger.throwArgumentError("invalid apiKey", "apiKey", apiKey);
        }
        return apiKey;
    }
    static getUrl(network, apiKey) {
        let host = null;
        switch (network.name) {
            case "homestead":
                host = "eth-mainnet.alchemyapi.io/jsonrpc/";
                break;
            case "ropsten":
                host = "eth-ropsten.alchemyapi.io/jsonrpc/";
                break;
            case "rinkeby":
                host = "eth-rinkeby.alchemyapi.io/jsonrpc/";
                break;
            case "goerli":
                host = "eth-goerli.alchemyapi.io/jsonrpc/";
                break;
            case "kovan":
                host = "eth-kovan.alchemyapi.io/jsonrpc/";
                break;
            default:
                logger.throwArgumentError("unsupported network", "network", arguments[0]);
        }
        return ("https:/" + "/" + host + apiKey);
    }
}
