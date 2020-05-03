"use strict";

import { Network, Networkish } from "@ethersproject/networks";
import { ConnectionInfo } from "@ethersproject/web";

import { WebSocketProvider } from "./websocket-provider";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { UrlJsonRpcProvider } from "./url-json-rpc-provider";


const defaultProjectId = "84842078b09946638c03157f83405213"

export class InfuraProvider extends UrlJsonRpcProvider {
    readonly projectId: string;
    readonly projectSecret: string;

    static getWebSocketProvider(network: Networkish, apiKey: any): WebSocketProvider {
        const provider = new InfuraProvider(network, apiKey);
        const connection = provider.connection;
        if (connection.password) {
            logger.throwError("INFURA WebSocket project secrets unsupported", Logger.errors.UNSUPPORTED_OPERATION, {
                operation: "InfuraProvider.getWebSocketProvider()"
            });
        }

        const url = connection.url.replace(/^http/i, "ws").replace("/v3/", "/ws/v3/");
        return new WebSocketProvider(url, network);
    }

    static getApiKey(apiKey: any): any {
        const apiKeyObj: { apiKey: string, projectId: string, projectSecret: string } = {
            apiKey: defaultProjectId,
            projectId: defaultProjectId,
            projectSecret: null
        };

        if (apiKey == null) { return apiKeyObj; }

        if (typeof(apiKey) === "string") {
            apiKeyObj.projectId = apiKey;

        } else if (apiKey.projectSecret != null) {
            if (typeof(apiKey.projectId) !== "string") {
                logger.throwArgumentError("projectSecret requires a projectId", "projectId", apiKey.projectId);
            }
            if (typeof(apiKey.projectSecret) !== "string") {
                logger.throwArgumentError("invalid projectSecret", "projectSecret", "[REDACTED]");
            }
            apiKeyObj.projectId = apiKey.projectId;
            apiKeyObj.projectSecret = apiKey.projectSecret;

        } else if (apiKey.projectId) {
            apiKeyObj.projectId = apiKey.projectId;
        }

        apiKeyObj.apiKey = apiKeyObj.projectId;

        return apiKeyObj;
    }

    static getUrl(network: Network, apiKey: any): string | ConnectionInfo {
        let host: string = null;
        switch(network.name) {
            case "homestead":
                host = "mainnet.infura.io";
                break;
            case "ropsten":
                host = "ropsten.infura.io";
                break;
            case "rinkeby":
                host = "rinkeby.infura.io";
                break;
            case "kovan":
                host = "kovan.infura.io";
                break;
            case "goerli":
                host = "goerli.infura.io";
                break;
            default:
                logger.throwError("unsupported network", Logger.errors.INVALID_ARGUMENT, {
                    argument: "network",
                    value: network
                });
        }

        const connection: ConnectionInfo = {
             url: ("https:/" + "/" + host + "/v3/" + apiKey.projectId)
        };

        if (apiKey.projectSecret != null) {
            connection.user = "";
            connection.password = apiKey.projectSecret
        }

        return connection;
    }
}
