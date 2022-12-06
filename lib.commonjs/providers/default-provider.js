"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDefaultProvider = void 0;
const index_js_1 = require("../utils/index.js");
const provider_ankr_js_1 = require("./provider-ankr.js");
const provider_alchemy_js_1 = require("./provider-alchemy.js");
const provider_cloudflare_js_1 = require("./provider-cloudflare.js");
const provider_etherscan_js_1 = require("./provider-etherscan.js");
const provider_infura_js_1 = require("./provider-infura.js");
//import { PocketProvider } from "./provider-pocket.js";
const provider_quicknode_js_1 = require("./provider-quicknode.js");
const provider_fallback_js_1 = require("./provider-fallback.js");
const provider_jsonrpc_js_1 = require("./provider-jsonrpc.js");
const provider_websocket_js_1 = require("./provider-websocket.js");
function isWebSocketLike(value) {
    return (value && typeof (value.send) === "function" &&
        typeof (value.close) === "function");
}
function getDefaultProvider(network, options) {
    if (options == null) {
        options = {};
    }
    if (typeof (network) === "string" && network.match(/^https?:/)) {
        return new provider_jsonrpc_js_1.JsonRpcProvider(network);
    }
    if (typeof (network) === "string" && network.match(/^wss?:/) || isWebSocketLike(network)) {
        return new provider_websocket_js_1.WebSocketProvider(network);
    }
    const providers = [];
    if (options.alchemy !== "-") {
        try {
            providers.push(new provider_alchemy_js_1.AlchemyProvider(network, options.alchemy));
        }
        catch (error) {
            console.log(error);
        }
    }
    if (options.ankr !== "-") {
        try {
            providers.push(new provider_ankr_js_1.AnkrProvider(network, options.ankr));
        }
        catch (error) {
            console.log(error);
        }
    }
    if (options.cloudflare !== "-") {
        try {
            providers.push(new provider_cloudflare_js_1.CloudflareProvider(network));
        }
        catch (error) {
            console.log(error);
        }
    }
    if (options.etherscan !== "-") {
        try {
            providers.push(new provider_etherscan_js_1.EtherscanProvider(network, options.etherscan));
        }
        catch (error) {
            console.log(error);
        }
    }
    if (options.infura !== "-") {
        try {
            let projectId = options.infura;
            let projectSecret = undefined;
            if (typeof (projectId) === "object") {
                projectSecret = projectId.projectSecret;
                projectId = projectId.projectId;
            }
            providers.push(new provider_infura_js_1.InfuraProvider(network, projectId, projectSecret));
        }
        catch (error) {
            console.log(error);
        }
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
            let token = options.qquicknode;
            providers.push(new provider_quicknode_js_1.QuickNodeProvider(network, token));
        }
        catch (error) {
            console.log(error);
        }
    }
    (0, index_js_1.assert)(providers.length, "unsupported default network", "UNSUPPORTED_OPERATION", {
        operation: "getDefaultProvider"
    });
    if (providers.length === 1) {
        return providers[0];
    }
    return new provider_fallback_js_1.FallbackProvider(providers);
}
exports.getDefaultProvider = getDefaultProvider;
//# sourceMappingURL=default-provider.js.map