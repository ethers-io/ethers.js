"use strict";

import { Network, Networkish } from "@ethersproject/networks";
import { defineReadOnly, getStatic } from "@ethersproject/properties";

import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);

import { JsonRpcProvider, JsonRpcSigner } from "./json-rpc-provider";

export abstract class UrlJsonRpcProvider extends JsonRpcProvider {
    readonly apiKey: string;

    constructor(network?: Networkish, apiKey?: string) {
        logger.checkAbstract(new.target, UrlJsonRpcProvider);

        // Normalize the Network and API Key
        network = getStatic<(network: Networkish) => Network>(new.target, "getNetwork")(network);
        apiKey = getStatic<(apiKey: string) => string>(new.target, "getApiKey")(apiKey);

        const url = getStatic<(network: Network, apiKey: string) => string>(new.target, "getUrl")(network, apiKey);

        super(url, network);

        defineReadOnly(this, "apiKey", apiKey);
    }

    _startPending(): void {
        logger.warn("WARNING: API provider does not support pending filters");
    }

    getSigner(address?: string): JsonRpcSigner {
        logger.throwError(
            "API provider does not support signing",
            Logger.errors.UNSUPPORTED_OPERATION,
            { operation: "getSigner" }
        );
        return null;
    }

    listAccounts(): Promise<Array<string>> {
        return Promise.resolve([]);
    }
/*
    static getNetwork(network?: Networkish): Network {
        return getNetwork((network == null) ? "homestead": network);
    }
*/
    // Return a defaultApiKey if null, otherwise validate the API key
    static getApiKey(apiKey: string): string {
        return apiKey;
    }

    // Returns the url for the given network and API key
    static getUrl(network: Network, apiKey: string): string {
        return logger.throwError("not implemented; sub-classes must override getUrl", Logger.errors.NOT_IMPLEMENTED, {
            operation: "getUrl"
        });
    }
}
