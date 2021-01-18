"use strict";

import { Network } from "@ethersproject/networks";
import { ConnectionInfo } from "@ethersproject/web";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { UrlJsonRpcProvider } from "./url-json-rpc-provider";

const defaultApplicationId = "defaultApp"
const defaultLoadBalancer = "defaultLoadBalancer"

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
            case "mainnet":
                host = "eth-mainnet.gateway.pokt.network";
                break;
            case "ropsten":
                host = "eth-ropsten.gateway.pokt.network";
                break;
            case "goerli":
                host = "eth-ropsten.gateway.pokt.network";
                break;
            case "rinkeby":
                host = "eth-rinkeby.gateway.pokt.network";
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
        } else if (typeof (this.apiKey) === "object") {
            return (this.apiKey.applicationId === defaultApplicationId || this.apiKey.applicationId === defaultLoadBalancer);
        }
        return true
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
            case apiKey !== null && typeof(apiKey.applicationId) === "string":
                apiKeyObj.applicationId = apiKey.applicationId;
                break;
        }

        return apiKeyObj;
    }

    static getDefaultAppForHost(host: string): string {
        let defaultAppId: string = null;
        switch (host) {
            case "eth-mainnet.gateway.pokt.network":
                defaultAppId = "6004b7060aea5b606775f4d9"
                break;
            case "eth-ropsten.gateway.pokt.network":
                defaultAppId = "6004b9aa0aea5b606775f4de"
                break;
            case "eth-goerli.gateway.pokt.network":
                defaultAppId = "6004b9e30aea5b606775f4df"
                break;
            case "eth-rinkeby.gateway.pokt.network":
                defaultAppId = "6004ba310aea5b606775f4e0"
                break;
            default:
                logger.throwError("unsupported host for default app", Logger.errors.INVALID_ARGUMENT, {
                    argument: "host",
                    value: host
                });
        }
        return defaultAppId
    }

    static getDefaultLoadBalancerForHost(host: string): string {
        let defaultLbId: string = null;
        switch (host) {
            case "eth-mainnet.gateway.pokt.network":
                defaultLbId = "6004bcd10040261633ade990"
                break;
            case "eth-ropsten.gateway.pokt.network":
                defaultLbId = "6004bd4d0040261633ade991"
                break;
            case "eth-goerli.gateway.pokt.network":
                defaultLbId = "6004bd860040261633ade992"
                break;
            case "eth-rinkeby.gateway.pokt.network":
                defaultLbId = "6004bda20040261633ade994"
                break;
            default:
                logger.throwError("unsupported host for default app", Logger.errors.INVALID_ARGUMENT, {
                    argument: "host",
                    value: host
                });
        }
        return defaultLbId
    }

    static getUrl(apiKey: any, host: string): string {
        var appId: string = null
        if (apiKey.applicationId === defaultLoadBalancer) {
            appId = PocketApiKeyObject.getDefaultLoadBalancerForHost(host)
        } else {
            appId = apiKey.applicationId
        }

        var url: string = `https://${host}/v1/lb/${appId}`

        if (typeof (apiKey.endpointType) === "string" && apiKey.endpointType.toLowerCase() === "application") {
            if (appId === defaultApplicationId) {
                appId = PocketApiKeyObject.getDefaultAppForHost(host)
            } else {
                appId = apiKey.applicationId
            }
            url = ("https:/" + "/" + host + "/v1/" + appId)
        }

        return url
    }
}
