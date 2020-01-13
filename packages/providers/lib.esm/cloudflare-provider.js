"use strict";
import { UrlJsonRpcProvider } from "./url-json-rpc-provider";
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);
export class CloudflareProvider extends UrlJsonRpcProvider {
    static getApiKey(apiKey) {
        if (apiKey != null) {
            logger.throwArgumentError("apiKey not supported for cloudflare", "apiKey", apiKey);
        }
        return null;
    }
    static getUrl(network, apiKey) {
        let host = null;
        switch (network.name) {
            case "homestead":
                host = "https://cloudflare-eth.com/";
                break;
            default:
                logger.throwArgumentError("unsupported network", "network", arguments[0]);
        }
        return host;
    }
}
