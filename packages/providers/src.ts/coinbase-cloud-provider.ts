"use strict";

import { Network } from "@ethersproject/networks";
import { ConnectionInfo } from "@ethersproject/web";

import { CommunityResourcable, showThrottleMessage } from "./formatter";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { UrlJsonRpcProvider } from "./url-json-rpc-provider";

// This key was provided to ethers.js by CoinbaseCloud to be used by the
// default provider, but it is recommended that for your own
// production environments, that you acquire your own API key at:
//   https://console.cloud.coinbase.com/node
const defaultApiKey = {
    apiUsername: '7DLUS3D6XHLYQJU3RWJR',
    apiPassword: 'BKFFDTSVWMIFO5O6BYRCCQBSHT7NXNXJOEQ3HDVE'
}

export class CoinbaseCloudProvider extends UrlJsonRpcProvider implements CommunityResourcable {
    readonly apiKey: any;

    static getApiKey(apiKey: any): any {
        if (apiKey == null) { return defaultApiKey; }
        if (apiKey.apiUsername == null || apiKey.apiPassword == null) {
            logger.throwError("invalid apiKey, apiUsername and apiPassword cannot be null");
        }
        logger.assertArgument((typeof(apiKey.apiUsername) === "string"),
            "apiUsername is required", "apiUsername", apiKey.apiUsername);
        logger.assertArgument((typeof(apiKey.apiPassword) === "string"),
            "apiPassword is required", "apiPassword", apiKey.apiPassword);

        return apiKey;
    }

    static getUrl(network: Network, apiKey: any): ConnectionInfo {
        let host = null;
        switch (network.name) {
            case "homestead":
                host = "mainnet.ethereum.coinbasecloud.net";
                break;
            case "goerli":
                host = "goerli.ethereum.coinbasecloud.net";
                break;
            default:
               logger.throwArgumentError("unsupported network", "network", arguments[0]);
        }

        return {
            allowGzip: true,
            url: ("https:/" + "/" + host),
            throttleCallback: (attempt: number, url: string) => {
                if (apiKey === defaultApiKey) {
                    showThrottleMessage();
                }
                return Promise.resolve(true);
            },
            user: apiKey.apiUsername,
            password: apiKey.apiPassword
        };
    }

    isCommunityResource(): boolean {
        return (this.apiKey.apiUsername === defaultApiKey.apiUsername);
    }
}
