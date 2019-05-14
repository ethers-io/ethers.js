"use strict";

import * as errors from "@ethersproject/errors";
import { getNetwork, Network, Networkish } from "@ethersproject/networks";
import { defineReadOnly } from "@ethersproject/properties";

import { JsonRpcProvider, JsonRpcSigner } from "./json-rpc-provider";

export class UrlJsonRpcProvider extends JsonRpcProvider {
    readonly apiKey: string;

    constructor(network?: Networkish, apiKey?: string) {
        errors.checkAbstract(new.target, UrlJsonRpcProvider);

        network = getNetwork((network == null) ? "homestead": network);
        apiKey = new.target.getApiKey(apiKey);

        let url = new.target.getUrl(network, apiKey);

        super(url, network);

        defineReadOnly(this, "apiKey", apiKey);
    }

    _startPending(): void {
        errors.warn("WARNING: API provider does not support pending filters");
    }

    getSigner(address?: string): JsonRpcSigner {
        errors.throwError(
            "API provider does not support signing",
            errors.UNSUPPORTED_OPERATION,
            { operation: "getSigner" }
        );
        return null;
    }

    listAccounts(): Promise<Array<string>> {
        return Promise.resolve([]);
    }

    // Return a defaultApiKey if null, otherwise validate the API key
    static getApiKey(apiKey: string): string {
        return apiKey;
    }

    // Returns the url for the given network and API key
    static getUrl(network: Network, apiKey: string): string {
        return errors.throwError("not implemented; sub-classes must override getUrl", errors.NOT_IMPLEMENTED, {
            operation: "getUrl"
        });
    }

}
