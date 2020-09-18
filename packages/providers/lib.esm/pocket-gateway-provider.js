"use strict";
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);
import { UrlJsonRpcProvider } from "./url-json-rpc-provider";
const defaultApplicationId = "5f3ab133f7ca96c59972ff51";
export class PocketGatewayProvider extends UrlJsonRpcProvider {
    static getApiKey(apiKey) {
        const apiKeyObj = {
            applicationId: defaultApplicationId,
            applicationSecretKey: null,
            applicationOrigin: null,
            applicationUserAgent: null
        };
        if (apiKey == null) {
            return apiKeyObj;
        }
        // Parse applicationId and applicationSecretKey
        if (typeof (apiKey) === "string") {
            apiKeyObj.applicationId = apiKey;
        }
        else if (apiKey.applicationSecretKey != null) {
            logger.assertArgument((typeof (apiKey.applicationId) === "string"), "applicationSecretKey requires an applicationId", "applicationId", apiKey.applicationId);
            logger.assertArgument((typeof (apiKey.applicationSecretKey) === "string"), "invalid applicationSecretKey", "applicationSecretKey", "[*********]");
            apiKeyObj.applicationId = apiKey.applicationId;
            apiKeyObj.applicationSecretKey = apiKey.applicationSecretKey;
        }
        else if (apiKey.applicationId) {
            apiKeyObj.applicationId = apiKey.applicationId;
        }
        // Parse Origin
        if (typeof (apiKey.applicationOrigin) === "string") {
            apiKeyObj.applicationOrigin = apiKey.applicationOrigin;
        }
        // Parse User Agent
        if (typeof (apiKey.applicationUserAgent) === "string") {
            apiKeyObj.applicationUserAgent = apiKey.applicationUserAgent;
        }
        return apiKeyObj;
    }
    static getUrl(network, apiKey) {
        let host = null;
        switch (network ? network.name : "unknown") {
            case "homestead":
                host = "eth-mainnet.gateway.pokt.network";
                break;
            default:
                logger.throwError("unsupported network", Logger.errors.INVALID_ARGUMENT, {
                    argument: "network",
                    value: network
                });
        }
        const connection = {
            url: ("https:/" + "/" + host + "/v1/" + apiKey.applicationId),
        };
        // Initialize empty headers
        connection.headers = {};
        // Apply application secret key
        if (apiKey.applicationSecretKey != null) {
            connection.user = "";
            connection.password = apiKey.applicationSecretKey;
        }
        // Apply origin header
        if (apiKey.applicationOrigin != null) {
            connection.headers["Origin"] = apiKey.applicationOrigin;
        }
        // Apply user agent header
        if (apiKey.applicationUserAgent != null) {
            connection.headers["User-Agent"] = apiKey.applicationUserAgent;
        }
        return connection;
    }
}
//# sourceMappingURL=pocket-gateway-provider.js.map