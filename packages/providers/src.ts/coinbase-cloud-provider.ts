"use strict";

import { Network } from "@ethersproject/networks";
import { ConnectionInfo } from "@ethersproject/web";

import { CommunityResourcable, showThrottleMessage } from "./formatter";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
import { UrlJsonRpcProvider } from "./url-json-rpc-provider";

const logger = new Logger(version);

type NetworkAPIKeySet = {
    apiUsername: string,
    apiPassword: string,
}

type DefaultAPIKeySet = Record<string, NetworkAPIKeySet>;

// This key was provided to ethers.js by CoinbaseCloud to be used by the
// default provider, but it is recommended that for your own
// production environments, that you acquire your own API key at:
//   https://console.cloud.coinbase.com/node
const defaultApiKey: DefaultAPIKeySet = {
    homestead: {
        apiUsername: '2SEFVGWHMEWI6OHYPAJF',
        apiPassword: 'CA4YUUWG5BK7HDTCU7YSQAIAYQPXUCGGHTSYQWDE'
    },
    goerli: {
        apiUsername: 'ETXHDWNMUYRNESSMP2UV',
        apiPassword: 'CAB6WRNTTLZBDGOD4BVYJFHTAGZMMOJFGDNN2DHW'
    }
}

export class CoinbaseCloudProvider extends UrlJsonRpcProvider implements CommunityResourcable {
    readonly apiKey: any;

    static getApiKey(apiKey: any): any {
        if (apiKey == null) {
            return defaultApiKey;
        }
        if (apiKey.apiUsername == null || apiKey.apiPassword == null) {
            logger.throwError("invalid apiKey, apiUsername and apiPassword cannot be null");
        }
        logger.assertArgument((typeof(apiKey.apiUsername) === "string"),
            "apiUsername is required", "apiUsername", apiKey.apiUsername);
        logger.assertArgument((typeof(apiKey.apiPassword) === "string"),
            "apiPassword is required", "apiPassword", apiKey.apiPassword);

        return apiKey;
    }

    static isDefaultKey(apiKey: any): boolean {
        return apiKey === defaultApiKey;
    }

    static getApiUser(network: Network, apiKey: any): string {
        if (CoinbaseCloudProvider.isDefaultKey(apiKey)) {
            return defaultApiKey[network.name].apiUsername;
        }
        return apiKey.apiUsername;
    };

    static getApiPassword(network: Network, apiKey: any): string {
        if (CoinbaseCloudProvider.isDefaultKey(apiKey)) {
            return defaultApiKey[network.name].apiPassword;
        }
        return apiKey.apiPassword;
    };

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

        let user = CoinbaseCloudProvider.getApiUser(network, apiKey);
        let password = CoinbaseCloudProvider.getApiPassword(network, apiKey);

        let connectionInfo = {
            allowGzip: true,
            url: ("https:/" + "/" + host),
            throttleCallback: (attempt: number, url: string) => {
                if (this.isDefaultKey(apiKey)) {
                    showThrottleMessage();
                }
                return Promise.resolve(true);
            },
            user,
            password,
        }

        return connectionInfo;
    }

    isCommunityResource(): boolean {
        return CoinbaseCloudProvider.isDefaultKey(this.apiKey);
    }
}
