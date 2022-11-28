import {
    defineProperties, FetchRequest, assert, assertArgument
} from "../utils/index.js";

import { showThrottleMessage } from "./community.js";
import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";
import { WebSocketProvider } from "./provider-websocket.js";

import type { AbstractProvider } from "./abstract-provider.js";
import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";


const defaultProjectId = "84842078b09946638c03157f83405213";

function getHost(name: string): string {
    switch(name) {
        case "mainnet":
            return "mainnet.infura.io";
        case "goerli":
            return "goerli.infura.io";
        case "sepolia":
            return "sepolia.infura.io";

        case "arbitrum":
            return "arbitrum-mainnet.infura.io";
        case "arbitrum-goerli":
            return "arbitrum-goerli.infura.io";
        case "matic":
            return "polygon-mainnet.infura.io";
        case "maticmum":
            return "polygon-mumbai.infura.io";
        case "optimism":
            return "optimism-mainnet.infura.io";
        case "optimism-goerli":
            return "optimism-goerli.infura.io";
    }

    assertArgument(false, "unsupported network", "network", name);
}

export class InfuraWebSocketProvider extends WebSocketProvider implements CommunityResourcable {
    readonly projectId!: string;
    readonly projectSecret!: null | string;

    constructor(network?: Networkish, projectId?: string) {
        const provider = new InfuraProvider(network, projectId);

        const req = provider._getConnection();
        assert(!req.credentials, "INFURA WebSocket project secrets unsupported",
            "UNSUPPORTED_OPERATION", { operation: "InfuraProvider.getWebSocketProvider()" });

        const url = req.url.replace(/^http/i, "ws").replace("/v3/", "/ws/v3/");
        super(url, network);

        defineProperties<InfuraWebSocketProvider>(this, {
            projectId: provider.projectId,
            projectSecret: provider.projectSecret
        });
    }

    isCommunityResource(): boolean {
        return (this.projectId === defaultProjectId);
    }
}

export class InfuraProvider extends JsonRpcProvider implements CommunityResourcable {
    readonly projectId!: string;
    readonly projectSecret!: null | string;

    constructor(_network?: Networkish, projectId?: null | string, projectSecret?: null | string) {
        if (_network == null) { _network = "mainnet"; }
        const network = Network.from(_network);
        if (projectId == null) { projectId = defaultProjectId; }
        if (projectSecret == null) { projectSecret = null; }

        const request = InfuraProvider.getRequest(network, projectId, projectSecret);
        super(request, network, { staticNetwork: network });

        defineProperties<InfuraProvider>(this, { projectId, projectSecret });
    }

    _getProvider(chainId: number): AbstractProvider {
        try {
            return new InfuraProvider(chainId, this.projectId, this.projectSecret);
        } catch (error) { }
        return super._getProvider(chainId);
    }

    isCommunityResource(): boolean {
        return (this.projectId === defaultProjectId);
    }

    static getWebSocketProvider(network?: Networkish, projectId?: string): InfuraWebSocketProvider {
        return new InfuraWebSocketProvider(network, projectId);
    }

    static getRequest(network: Network, projectId?: null | string, projectSecret?: null | string): FetchRequest {
        if (projectId == null) { projectId = defaultProjectId; }
        if (projectSecret == null) { projectSecret = null; }

        const request = new FetchRequest(`https:/\/${ getHost(network.name) }/v3/${ projectId }`);
        request.allowGzip = true;
        if (projectSecret) { request.setCredentials("", projectSecret); }

        if (projectId === defaultProjectId) {
            request.retryFunc = async (request, response, attempt) => {
                showThrottleMessage("InfuraProvider");
                return true;
            };
        }

        return request;
    }
}
