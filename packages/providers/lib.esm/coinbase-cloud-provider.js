"use strict";
import { showThrottleMessage } from "./formatter";
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);
import { UrlJsonRpcProvider } from "./url-json-rpc-provider";
export class CoinbaseCloudProvider extends UrlJsonRpcProvider {
    static getApiKey(apiKey) {
        if (apiKey == null) {
            logger.throwError("invalid apiKey, cannot be null");
        }
        if (apiKey.apiUsername == null || apiKey.apiPassword == null) {
            logger.throwError("invalid apiKey, apiUsername and apiPassword cannot be null");
        }
        logger.assertArgument((typeof (apiKey.apiUsername) === "string"), "apiUsername is required", "apiUsername", apiKey.apiUsername);
        logger.assertArgument((typeof (apiKey.apiPassword) === "string"), "apiPassword is required", "apiPassword", apiKey.apiPassword);
        return apiKey;
    }
    static getUrl(network, apiKey) {
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
            throttleCallback: (attempt, url) => {
                showThrottleMessage();
                return Promise.resolve(true);
            },
            user: apiKey.apiUsername,
            password: apiKey.apiPassword
        };
    }
}
//# sourceMappingURL=coinbase-cloud-provider.js.map