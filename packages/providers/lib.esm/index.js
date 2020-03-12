"use strict";
import { Provider } from "@ethersproject/abstract-provider";
import { getNetwork } from "@ethersproject/networks";
import { BaseProvider } from "./base-provider";
import { AlchemyProvider } from "./alchemy-provider";
import { CloudflareProvider } from "./cloudflare-provider";
import { EtherscanProvider } from "./etherscan-provider";
import { FallbackProvider } from "./fallback-provider";
import { IpcProvider } from "./ipc-provider";
import { InfuraProvider } from "./infura-provider";
import { JsonRpcProvider, JsonRpcSigner } from "./json-rpc-provider";
import { NodesmithProvider } from "./nodesmith-provider";
import { Web3Provider } from "./web3-provider";
import { WebSocketProvider } from "./websocket-provider";
import { Formatter } from "./formatter";
import { Logger } from "@ethersproject/logger";
import { version } from "./_version";
const logger = new Logger(version);
////////////////////////
// Helper Functions
function getDefaultProvider(network, options) {
    if (network == null) {
        network = "homestead";
    }
    const n = getNetwork(network);
    if (!n || !n._defaultProvider) {
        logger.throwError("unsupported getDefaultProvider network", Logger.errors.NETWORK_ERROR, {
            operation: "getDefaultProvider",
            network: network
        });
    }
    return n._defaultProvider({
        FallbackProvider,
        AlchemyProvider,
        CloudflareProvider,
        EtherscanProvider,
        InfuraProvider,
        JsonRpcProvider,
        NodesmithProvider,
        Web3Provider,
        IpcProvider,
    }, options);
}
////////////////////////
// Exports
export { 
// Abstract Providers (or Abstract-ish)
Provider, BaseProvider, 
///////////////////////
// Concreate Providers
FallbackProvider, AlchemyProvider, CloudflareProvider, EtherscanProvider, InfuraProvider, JsonRpcProvider, NodesmithProvider, Web3Provider, WebSocketProvider, IpcProvider, 
///////////////////////
// Signer
JsonRpcSigner, 
///////////////////////
// Functions
getDefaultProvider, getNetwork, 
///////////////////////
// Objects
Formatter };
