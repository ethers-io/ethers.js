
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
import { Network } from "./network.js";
import { WebSocketProvider } from "./provider-websocket.js";

import type { AbstractProvider } from "./abstract-provider.js";
import type { Networkish } from "./network.js";
import { WebSocketLike } from "./provider-websocket.js";

function isWebSocketLike(value: any): value is WebSocketLike {
    return (value && typeof(value.send) === "function" &&
        typeof(value.close) === "function");
}

const Testnets = "goerli kovan sepolia classicKotti optimism-goerli arbitrum-goerli matic-mumbai bnbt".split(" ");

export function getDefaultProvider(network: string | Networkish | WebSocketLike, options?: any): AbstractProvider {
    if (options == null) { options = { }; }

    const allowService = (name: string) => {
        if (options[name] === "-") { return false; }
        if (typeof(options.exclusive) === "string") {
            return (name === options.exclusive);
        }
        if (Array.isArray(options.exclusive)) {
            return (options.exclusive.indexOf(name) !== -1);
        }
        return true;
    };

    if (typeof(network) === "string" && network.match(/^https?:/)) {
        return new JsonRpcProvider(network);
    }

    if (typeof(network) === "string" && network.match(/^wss?:/) || isWebSocketLike(network)) {
        return new WebSocketProvider(network);
    }

    // Get the network and name, if possible
    let staticNetwork: null | Network = null;
    try {
        staticNetwork = Network.from(network);
    } catch (error) { }


    const providers: Array<AbstractProvider> = [ ];

    if (allowService("publicPolygon") && staticNetwork) {
        if (staticNetwork.name === "matic") {
            providers.push(new JsonRpcProvider("https:/\/polygon-rpc.com/", staticNetwork, { staticNetwork }));
        }
    }

    if (allowService("alchemy")) {
        try {
            providers.push(new AlchemyProvider(network, options.alchemy));
        } catch (error) { }
    }

    if (allowService("ankr") && options.ankr != null) {
        try {
            providers.push(new AnkrProvider(network, options.ankr));
        } catch (error) { }
    }

    if (allowService("cloudflare")) {
        try {
            providers.push(new CloudflareProvider(network));
        } catch (error) { }
    }

    if (allowService("etherscan")) {
        try {
            providers.push(new EtherscanProvider(network, options.etherscan));
        } catch (error) { }
    }

    if (allowService("infura")) {
        try {
            let projectId = options.infura;
            let projectSecret: undefined | string = undefined;
            if (typeof(projectId) === "object") {
                projectSecret = projectId.projectSecret;
                projectId = projectId.projectId;
            }
            providers.push(new InfuraProvider(network, projectId, projectSecret));
        } catch (error) { }
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
    if (allowService("quicknode")) {
        try {
            let token = options.quicknode;
            providers.push(new QuickNodeProvider(network, token));
        } catch (error) { }
    }

    assert(providers.length, "unsupported default network", "UNSUPPORTED_OPERATION", {
        operation: "getDefaultProvider"
    });

    // No need for a FallbackProvider
    if (providers.length === 1) { return providers[0]; }

    // We use the floor because public third-party providers can be unreliable,
    // so a low number of providers with a large quorum will fail too often
    let quorum = Math.floor(providers.length / 2);
    if (quorum > 2) { quorum = 2; }

    // Testnets don't need as strong a security gaurantee and speed is
    // more useful during testing
    if (staticNetwork && Testnets.indexOf(staticNetwork.name) !== -1) { quorum = 1; }

    // Provided override qorum takes priority
    if (options && options.quorum) { quorum = options.quorum; }

    return new FallbackProvider(providers, undefined, { quorum });
}
