"use strict";
import { getNetwork } from "@ethersproject/networks";
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
        let url = getStatic((new.target), "getUrl")(network, apiKey);
        super(url, network);
        defineReadOnly(this, "apiKey", apiKey);
    }
    _startPending() {
        logger.warn("WARNING: API provider does not support pending filters");
    }
    getSigner(address) {
        logger.throwError("API provider does not support signing", Logger.errors.UNSUPPORTED_OPERATION, { operation: "getSigner" });
        return null;
    }
    listAccounts() {
        return Promise.resolve([]);
    }
    static getNetwork(network) {
        return getNetwork((network == null) ? "homestead" : network);
    }
    // Return a defaultApiKey if null, otherwise validate the API key
    static getApiKey(apiKey) {
        return apiKey;
    }
    // Returns the url for the given network and API key
    static getUrl(network, apiKey) {
        return logger.throwError("not implemented; sub-classes must override getUrl", Logger.errors.NOT_IMPLEMENTED, {
            operation: "getUrl"
        });
    }
}
