
import { logger } from "./logger.js";
import { Network } from "./network.js";
import { StaticJsonRpcProvider } from "./provider-jsonrpc.js";

import type { Networkish } from "./network.js";


export class CloudflareProvider extends StaticJsonRpcProvider {
    constructor(_network: Networkish = "homestead") {
        const network = Network.from(_network);
        if (network.name !== "homestead") {
            return logger.throwArgumentError("unsupported network", "network", _network);
        }
        super("https:/\/cloudflare-eth.com/", network);
    }
}
