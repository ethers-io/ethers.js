
"use strict";

import { Network, Networkish } from "@ethersproject/networks";
import { defineReadOnly, getStatic } from "@ethersproject/properties";
import { ConnectionInfo } from "@ethersproject/web";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { JsonRpcProvider, JsonRpcSigner } from "./json-rpc-provider";

type getUrlFunc = (network: Network, apiKey: string) => string | ConnectionInfo;

export abstract class UrlJsonRpcProvider extends JsonRpcProvider {
    readonly apiKey: any;

    constructor(network?: Networkish, apiKey?: any) {
        logger.checkAbstract(new.target, UrlJsonRpcProvider);

        // Normalize the Network and API Key
        network = getStatic<(network: Networkish) => Network>(new.target, "getNetwork")(network);
        apiKey = getStatic<(apiKey: string) => string>(new.target, "getApiKey")(apiKey);

        const connection = getStatic<getUrlFunc>(new.target, "getUrl")(network, apiKey);

        super(connection, network);

        if (typeof(apiKey) === "string") {
            defineReadOnly(this, "apiKey", apiKey);
        } else if (apiKey != null) {
            Object.keys(apiKey).forEach((key) => {
                defineReadOnly<any, any>(this, key, apiKey[key]);
            });
        }
    }

    async detectNetwork(): Promise<Network> {
        return this.network;
    }

    _startPending(): void {
        logger.warn("WARNING: API provider does not support pending filters");
    }

    getSigner(address?: string): JsonRpcSigner {
        return logger.throwError(
            "API provider does not support signing",
            Logger.errors.UNSUPPORTED_OPERATION,
            { operation: "getSigner" }
        );
    }

    listAccounts(): Promise<Array<string>> {
        return Promise.resolve([]);
    }

    // Return a defaultApiKey if null, otherwise validate the API key
    static getApiKey(apiKey: any): any {
        return apiKey;
    }

    // Returns the url or connection for the given network and API key. The
    // API key will have been sanitized by the getApiKey first, so any validation
    // or transformations can be done there.
    static getUrl(network: Network, apiKey: any): string | ConnectionInfo {
        return logger.throwError("not implemented; sub-classes must override getUrl", Logger.errors.NOT_IMPLEMENTED, {
            operation: "getUrl"
        });
    }
}
