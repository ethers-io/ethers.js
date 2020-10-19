"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var abstract_provider_1 = require("@ethersproject/abstract-provider");
exports.Provider = abstract_provider_1.Provider;
var networks_1 = require("@ethersproject/networks");
exports.getNetwork = networks_1.getNetwork;
var base_provider_1 = require("./base-provider");
exports.BaseProvider = base_provider_1.BaseProvider;
exports.Resolver = base_provider_1.Resolver;
var alchemy_provider_1 = require("./alchemy-provider");
exports.AlchemyProvider = alchemy_provider_1.AlchemyProvider;
exports.AlchemyWebSocketProvider = alchemy_provider_1.AlchemyWebSocketProvider;
var cloudflare_provider_1 = require("./cloudflare-provider");
exports.CloudflareProvider = cloudflare_provider_1.CloudflareProvider;
var etherscan_provider_1 = require("./etherscan-provider");
exports.EtherscanProvider = etherscan_provider_1.EtherscanProvider;
var fallback_provider_1 = require("./fallback-provider");
exports.FallbackProvider = fallback_provider_1.FallbackProvider;
var ipc_provider_1 = require("./ipc-provider");
exports.IpcProvider = ipc_provider_1.IpcProvider;
var infura_provider_1 = require("./infura-provider");
exports.InfuraProvider = infura_provider_1.InfuraProvider;
exports.InfuraWebSocketProvider = infura_provider_1.InfuraWebSocketProvider;
var json_rpc_provider_1 = require("./json-rpc-provider");
exports.JsonRpcProvider = json_rpc_provider_1.JsonRpcProvider;
exports.JsonRpcSigner = json_rpc_provider_1.JsonRpcSigner;
var nodesmith_provider_1 = require("./nodesmith-provider");
exports.NodesmithProvider = nodesmith_provider_1.NodesmithProvider;
var pocket_provider_1 = require("./pocket-provider");
exports.PocketProvider = pocket_provider_1.PocketProvider;
var url_json_rpc_provider_1 = require("./url-json-rpc-provider");
exports.StaticJsonRpcProvider = url_json_rpc_provider_1.StaticJsonRpcProvider;
exports.UrlJsonRpcProvider = url_json_rpc_provider_1.UrlJsonRpcProvider;
var web3_provider_1 = require("./web3-provider");
exports.Web3Provider = web3_provider_1.Web3Provider;
var websocket_provider_1 = require("./websocket-provider");
exports.WebSocketProvider = websocket_provider_1.WebSocketProvider;
var formatter_1 = require("./formatter");
exports.Formatter = formatter_1.Formatter;
exports.isCommunityResourcable = formatter_1.isCommunityResourcable;
exports.isCommunityResource = formatter_1.isCommunityResource;
exports.showThrottleMessage = formatter_1.showThrottleMessage;
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
////////////////////////
// Helper Functions
function getDefaultProvider(network, options) {
    if (network == null) {
        network = "homestead";
    }
    // If passed a URL, figure out the right type of provider based on the scheme
    if (typeof (network) === "string") {
        // @TODO: Add support for IpcProvider; maybe if it ends in ".ipc"?
        // Handle http and ws (and their secure variants)
        var match = network.match(/^(ws|http)s?:/i);
        if (match) {
            switch (match[1]) {
                case "http":
                    return new json_rpc_provider_1.JsonRpcProvider(network);
                case "ws":
                    return new websocket_provider_1.WebSocketProvider(network);
                default:
                    logger.throwArgumentError("unsupported URL scheme", "network", network);
            }
        }
    }
    var n = networks_1.getNetwork(network);
    if (!n || !n._defaultProvider) {
        logger.throwError("unsupported getDefaultProvider network", logger_1.Logger.errors.NETWORK_ERROR, {
            operation: "getDefaultProvider",
            network: network
        });
    }
    return n._defaultProvider({
        FallbackProvider: fallback_provider_1.FallbackProvider,
        AlchemyProvider: alchemy_provider_1.AlchemyProvider,
        CloudflareProvider: cloudflare_provider_1.CloudflareProvider,
        EtherscanProvider: etherscan_provider_1.EtherscanProvider,
        InfuraProvider: infura_provider_1.InfuraProvider,
        JsonRpcProvider: json_rpc_provider_1.JsonRpcProvider,
        NodesmithProvider: nodesmith_provider_1.NodesmithProvider,
        PocketProvider: pocket_provider_1.PocketProvider,
        Web3Provider: web3_provider_1.Web3Provider,
        IpcProvider: ipc_provider_1.IpcProvider,
    }, options);
}
exports.getDefaultProvider = getDefaultProvider;
//# sourceMappingURL=index.js.map