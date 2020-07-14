"use strict";

import { Network, Networkish } from "@ethersproject/networks";
import { ConnectionInfo } from "@ethersproject/web";

import { showThrottleMessage } from "./formatter";
import { WebSocketProvider } from "./websocket-provider";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { UrlJsonRpcProvider } from "./url-json-rpc-provider";

// This key was provided to ethers.js by Alchemy to be used by the
// default provider, but it is recommended that for your own
// production environments, that you acquire your own API key at:
//   https://dashboard.alchemyapi.io

const defaultApiKey = "_gg7wSSi0KMBsdKnGVfHDueq6xMB9EkC"

export class AlchemyProvider extends UrlJsonRpcProvider {

    static getWebSocketProvider(network?: Networkish, apiKey?: any): WebSocketProvider {
        const provider = new AlchemyProvider(network, apiKey);

        const url = provider.connection.url.replace(/^http/i, "ws")
                                           .replace(".alchemyapi.", ".ws.alchemyapi.");

        return new WebSocketProvider(url, provider.network);
    }

    static getApiKey(apiKey: any): any {
        if (apiKey == null) { return defaultApiKey; }
        if (apiKey && typeof(apiKey) !== "string") {
            logger.throwArgumentError("invalid apiKey", "apiKey", apiKey);
        }
        return apiKey;
    }

    static getUrl(network: Network, apiKey: string): ConnectionInfo {
        let host = null;
        switch (network.name) {
            case "homestead":
                host = "eth-mainnet.alchemyapi.io/v2/";
                break;
            case "ropsten":
                host = "eth-ropsten.alchemyapi.io/v2/";
                break;
            case "rinkeby":
                host = "eth-rinkeby.alchemyapi.io/v2/";
                break;
            case "goerli":
                host = "eth-goerli.alchemyapi.io/v2/";
                break;
            case "kovan":
                host = "eth-kovan.alchemyapi.io/v2/";
                break;
            default:
               logger.throwArgumentError("unsupported network", "network", arguments[0]);
        }

        return {
            url: ("https:/" + "/" + host + apiKey),
            throttleCallback: (attempt: number, url: string) => {
                if (apiKey === defaultApiKey) {
                    showThrottleMessage();
                }
                return Promise.resolve(true);
            }
        };
    }
}
