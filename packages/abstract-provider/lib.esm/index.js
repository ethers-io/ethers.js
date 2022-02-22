"use strict";
import { defineReadOnly } from "@ethersproject/properties";
import { Logger } from "@hethers/logger";
import { version } from "./_version";
const logger = new Logger(version);
///////////////////////////////
// Exported Abstracts
export class Provider {
    constructor() {
        logger.checkAbstract(new.target, Provider);
        defineReadOnly(this, "_isProvider", true);
    }
    getHederaClient() {
        return logger.throwError("getHederaClient not implemented", Logger.errors.NOT_IMPLEMENTED, {
            operation: 'getHederaClient'
        });
    }
    getHederaNetworkConfig() {
        return logger.throwError("getHederaNetworkConfig not implemented", Logger.errors.NOT_IMPLEMENTED, {
            operation: 'getHederaNetworkConfig'
        });
    }
    // Latest State
    getGasPrice() {
        return logger.throwArgumentError("getGasPrice not implemented", Logger.errors.NOT_IMPLEMENTED, {
            operation: "getGasPrice"
        });
    }
    // Alias for "on"
    addListener(eventName, listener) {
        return this.on(eventName, listener);
    }
    // Alias for "off"
    removeListener(eventName, listener) {
        return this.off(eventName, listener);
    }
    static isProvider(value) {
        return !!(value && value._isProvider);
    }
}
//# sourceMappingURL=index.js.map