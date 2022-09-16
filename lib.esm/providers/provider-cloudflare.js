import { throwArgumentError } from "../utils/index.js";
import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";
export class CloudflareProvider extends JsonRpcProvider {
    constructor(_network = "homestead") {
        const network = Network.from(_network);
        if (network.name !== "homestead") {
            return throwArgumentError("unsupported network", "network", _network);
        }
        super("https:/\/cloudflare-eth.com/", network, { staticNetwork: network });
    }
}
//# sourceMappingURL=provider-cloudflare.js.map