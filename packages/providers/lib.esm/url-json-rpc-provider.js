"use strict";
import { defineReadOnly, getStatic } from "@ethersproject/properties";
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);
import { JsonRpcProvider } from "./json-rpc-provider";
export class UrlJsonRpcProvider extends JsonRpcProvider {
    constructor(network, apiKey) {
        logger.checkAbstract(new.target, UrlJsonRpcProvider);
        // Normalize the Network and API Key
        network = getStatic((new.target), "getNetwork")(network);
        apiKey = getStatic((new.target), "getApiKey")(apiKey);
        const connection = getStatic((new.target), "getUrl")(network, apiKey);
        super(connection, network);
        if (typeof (apiKey) === "string") {
            defineReadOnly(this, "apiKey", apiKey);
        }
        else if (apiKey != null) {
            Object.keys(apiKey).forEach((key) => {
                defineReadOnly(this, key, apiKey[key]);
            });
        }
    }
    _startPending() {
        logger.warn("WARNING: API provider does not support pending filters");
    }
    getSigner(address) {
        return logger.throwError("API provider does not support signing", Logger.errors.UNSUPPORTED_OPERATION, { operation: "getSigner" });
    }
    listAccounts() {
        return Promise.resolve([]);
    }
    // Return a defaultApiKey if null, otherwise validate the API key
    static getApiKey(apiKey) {
        return apiKey;
    }
    // Returns the url or connection for the given network and API key. The
    // API key will have been sanitized by the getApiKey first, so any validation
    // or transformations can be done there.
    static getUrl(network, apiKey) {
        return logger.throwError("not implemented; sub-classes must override getUrl", Logger.errors.NOT_IMPLEMENTED, {
            operation: "getUrl"
        });
    }
}
