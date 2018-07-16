'use strict';
Object.defineProperty(exports, "__esModule", { value: true });
var provider_1 = require("./provider");
exports.Provider = provider_1.Provider;
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
var web3_provider_1 = require("./web3-provider");
exports.Web3Provider = web3_provider_1.Web3Provider;
function getDefaultProvider(network) {
    return new fallback_provider_1.FallbackProvider([
        new infura_provider_1.InfuraProvider(network),
        new etherscan_provider_1.EtherscanProvider(network),
    ]);
}
exports.getDefaultProvider = getDefaultProvider;
