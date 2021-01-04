"use strict";

import { Network } from "@ethersproject/networks";
import { ConnectionInfo } from "@ethersproject/web";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { UrlJsonRpcProvider } from "./url-json-rpc-provider";

const defaultApplicationId = "5f3ab133f7ca96c59972ff51"
const defaultLoadBalancer = "5f7c8e5edb07b3eabd388511"

enum EndpointType {
    LoadBalancer = "LoadBalancer",
    Application = "Application"
}

export class PocketGatewayProvider extends UrlJsonRpcProvider {

    static getApiKey(apiKey: any): any {
        let apiKeyObj = PocketApiKeyObject.build(apiKey);
        return apiKeyObj;
    }

    static getUrl(network: Network, apiKey: any): ConnectionInfo {
        let host: string = null;
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

        const connection: ConnectionInfo = {
            url: PocketApiKeyObject.getUrl(apiKey, host),
        };

        // Initialize empty headers
        connection.headers = {}

        // Apply application secret key
        if (apiKey.applicationSecretKey != null) {
            connection.user = "";
            connection.password = apiKey.applicationSecretKey
        }

        return connection;
    }

    isCommunityResource(): boolean {
        if (typeof (this.apiKey) === "string") {
            return (this.apiKey === defaultApplicationId || this.apiKey === defaultLoadBalancer);
        }

        return (this.apiKey.applicationId === defaultApplicationId || this.apiKey.applicationId === defaultLoadBalancer);
    }
}

export class PocketApiKeyObject {
    applicationId: string = defaultLoadBalancer;
    endpointType: string = EndpointType.LoadBalancer;
    applicationSecretKey: string = null;
    applicationOrigin: string = null;
    applicationUserAgent: string = null;

    static build(apiKey: any): PocketApiKeyObject {
        if (apiKey == null)
            return new PocketApiKeyObject();

        var apiKeyObj = new PocketApiKeyObject();

        // Parse Origin
        if (typeof (apiKey.applicationOrigin) === "string") {
            apiKeyObj.applicationOrigin = apiKey.applicationOrigin;
        }
        // Parse User Agent
        if (typeof (apiKey.applicationUserAgent) === "string") {
            apiKeyObj.applicationUserAgent = apiKey.applicationUserAgent;
        }

        if (typeof (apiKey.endpointType) === "string") {
            switch (apiKey.endpointType.toLowerCase()) {
                case "application":
                    apiKeyObj.endpointType = EndpointType.Application
                    apiKeyObj.applicationId = defaultApplicationId;
                    break;
                default:
                    apiKeyObj.endpointType = EndpointType.LoadBalancer
                    apiKeyObj.applicationId = defaultLoadBalancer;
                    break;
            }
        }

        switch (true) {
            case typeof (apiKey) === "string":
                apiKeyObj.applicationId = apiKey;
                break;
            case apiKey.applicationSecretKey != null:
                logger.assertArgument((typeof (apiKey.applicationId) === "string"), "applicationSecretKey requires an applicationId", "applicationId", apiKey.applicationId);
                logger.assertArgument((typeof (apiKey.applicationSecretKey) === "string"), "invalid applicationSecretKey", "applicationSecretKey", "[*********]");
                apiKeyObj.applicationId = apiKey.applicationId;
                apiKeyObj.applicationSecretKey = apiKey.applicationSecretKey;
                break;
            case apiKey.applicationId:
                apiKeyObj.applicationId = apiKey;
                break;
        }

        return apiKeyObj;
    }

    static getUrl(apiKey: any, host: string): string {
        var url: string = ("https:/" + "/" + host + "/v1/lb/" + apiKey.applicationId)

        if (typeof (apiKey.endpointType) === "string" && apiKey.endpointType.toLowerCase() === "application") {
            url = ("https:/" + "/" + host + "/v1/" + apiKey.applicationId)
        }

        return url
    }
}
