"use strict";
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
let WS = WebSocket;
if (WS == null) {
    const logger = new Logger(version);
    WS = function () {
        logger.throwError("WebSockets not supported in this environment", Logger.errors.UNSUPPORTED_OPERATION, {
            operation: "new WebSocket()"
        });
    };
}
module.exports = WS;
