import { assert } from "../utils/index.js";
import { AnkrProvider } from "./provider-ankr.js";
import { AlchemyProvider } from "./provider-alchemy.js";
import { CloudflareProvider } from "./provider-cloudflare.js";
import { EtherscanProvider } from "./provider-etherscan.js";
import { InfuraProvider } from "./provider-infura.js";
//import { PocketProvider } from "./provider-pocket.js";
import { QuickNodeProvider } from "./provider-quicknode.js";
import { FallbackProvider } from "./provider-fallback.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";
import { WebSocketProvider } from "./provider-websocket.js";
function isWebSocketLike(value) {
    return (value && typeof (value.send) === "function" &&
        typeof (value.close) === "function");
}
export function getDefaultProvider(network, options) {
    if (options == null) {
        options = {};
    }
    if (typeof (network) === "string" && network.match(/^https?:/)) {
        return new JsonRpcProvider(network);
    }
    if (typeof (network) === "string" && network.match(/^wss?:/) || isWebSocketLike(network)) {
        return new WebSocketProvider(network);
    }
    const providers = [];
    if (options.alchemy !== "-") {
        try {
            providers.push(new AlchemyProvider(network, options.alchemy));
        }
        catch (error) { }
    }
    if (options.ankr !== "-" && options.ankr != null) {
        try {
            providers.push(new AnkrProvider(network, options.ankr));
        }
        catch (error) { }
    }
    if (options.cloudflare !== "-") {
        try {
            providers.push(new CloudflareProvider(network));
        }
        catch (error) { }
    }
    if (options.etherscan !== "-") {
        try {
            providers.push(new EtherscanProvider(network, options.etherscan));
        }
        catch (error) { }
    }
    if (options.infura !== "-") {
        try {
            let projectId = options.infura;
            let projectSecret = undefined;
            if (typeof (projectId) === "object") {
                projectSecret = projectId.projectSecret;
                projectId = projectId.projectId;
            }
            providers.push(new InfuraProvider(network, projectId, projectSecret));
        }
        catch (error) { }
    }
    /*
        if (options.pocket !== "-") {
            try {
                let appId = options.pocket;
                let secretKey: undefined | string = undefined;
                let loadBalancer: undefined | boolean = undefined;
                if (typeof(appId) === "object") {
                    loadBalancer = !!appId.loadBalancer;
                    secretKey = appId.secretKey;
                    appId = appId.appId;
                }
                providers.push(new PocketProvider(network, appId, secretKey, loadBalancer));
            } catch (error) { console.log(error); }
        }
    */
    if (options.quicknode !== "-") {
        try {
            let token = options.quicknode;
            providers.push(new QuickNodeProvider(network, token));
        }
        catch (error) { }
    }
    assert(providers.length, "unsupported default network", "UNSUPPORTED_OPERATION", {
        operation: "getDefaultProvider"
    });
    if (providers.length === 1) {
        return providers[0];
    }
    return new FallbackProvider(providers);
}
//# sourceMappingURL=default-provider.js.map