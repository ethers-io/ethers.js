"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloudflareProvider = void 0;
const logger_js_1 = require("../utils/logger.js");
const network_js_1 = require("./network.js");
const provider_jsonrpc_js_1 = require("./provider-jsonrpc.js");
class CloudflareProvider extends provider_jsonrpc_js_1.JsonRpcProvider {
    constructor(_network = "homestead") {
        const network = network_js_1.Network.from(_network);
        if (network.name !== "homestead") {
            return logger_js_1.logger.throwArgumentError("unsupported network", "network", _network);
        }
        super("https:/\/cloudflare-eth.com/", network, { staticNetwork: network });
    }
}
exports.CloudflareProvider = CloudflareProvider;
//# sourceMappingURL=provider-cloudflare.js.map