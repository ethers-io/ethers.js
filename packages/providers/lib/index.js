"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var abstract_provider_1 = require("@ethersproject/abstract-provider");
exports.Provider = abstract_provider_1.Provider;
var networks_1 = require("@ethersproject/networks");
exports.getNetwork = networks_1.getNetwork;
var base_provider_1 = require("./base-provider");
exports.BaseProvider = base_provider_1.BaseProvider;
var alchemy_provider_1 = require("./alchemy-provider");
exports.AlchemyProvider = alchemy_provider_1.AlchemyProvider;
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
var json_rpc_provider_1 = require("./json-rpc-provider");
exports.JsonRpcProvider = json_rpc_provider_1.JsonRpcProvider;
exports.JsonRpcSigner = json_rpc_provider_1.JsonRpcSigner;
var nodesmith_provider_1 = require("./nodesmith-provider");
exports.NodesmithProvider = nodesmith_provider_1.NodesmithProvider;
var web3_provider_1 = require("./web3-provider");
exports.Web3Provider = web3_provider_1.Web3Provider;
var websocket_provider_1 = require("./websocket-provider");
exports.WebSocketProvider = websocket_provider_1.WebSocketProvider;
var formatter_1 = require("./formatter");
exports.Formatter = formatter_1.Formatter;
var logger_1 = require("@ethersproject/logger");
var _version_1 = require("./_version");
var logger = new logger_1.Logger(_version_1.version);
////////////////////////
// Helper Functions
function getDefaultProvider(network, options) {
    if (network == null) {
        network = "homestead";
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
        Web3Provider: web3_provider_1.Web3Provider,
        IpcProvider: ipc_provider_1.IpcProvider,
    }, options);
}
exports.getDefaultProvider = getDefaultProvider;
