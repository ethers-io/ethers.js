import { logger } from "./logger.js";
import { Network } from "./network.js";
import { StaticJsonRpcProvider } from "./provider-jsonrpc.js";
export class CloudflareProvider extends StaticJsonRpcProvider {
    constructor(_network = "homestead") {
        const network = Network.from(_network);
        if (network.name !== "homestead") {
            return logger.throwArgumentError("unsupported network", "network", _network);
        }
        super("https:/\/cloudflare-eth.com/", network);
    }
}
//# sourceMappingURL=provider-cloudflare.js.map