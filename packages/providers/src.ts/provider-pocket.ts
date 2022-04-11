import { defineProperties } from "@ethersproject/properties";
import { FetchRequest } from "@ethersproject/web";

import { showThrottleMessage } from "./community.js";
import { logger } from "./logger.js";
import { Network } from "./network.js";
import { StaticJsonRpcProvider } from "./provider-jsonrpc.js";

import type { ConnectionInfo, ThrottleRetryFunc } from "@ethersproject/web";

import type { CommunityResourcable } from "./community.js";
import type { Networkish } from "./network.js";



// These are load-balancer-based application IDs
const defaultAppIds: Record<string, string> = {
    homestead: "6004bcd10040261633ade990",
    ropsten: "6004bd4d0040261633ade991",
    rinkeby: "6004bda20040261633ade994",
    goerli: "6004bd860040261633ade992",
};

function getHost(name: string): string {
    switch(name) {
        case "homestead":
            return "eth-mainnet.gateway.pokt.network";
        case "ropsten":
            return "eth-ropsten.gateway.pokt.network";
        case "rinkeby":
            return "eth-rinkeby.gateway.pokt.network";
        case "goerli":
            return "eth-goerli.gateway.pokt.network";
    }

    return logger.throwArgumentError("unsupported network", "network", name);
}

function normalizeApiKey(network: Network, _appId?: null | string, applicationSecretKey?: null | string, loadBalancer?: boolean): { applicationId: string, applicationSecretKey: null | string, loadBalancer: boolean, community: boolean } {
    loadBalancer = !!loadBalancer;

    let community = false;
    let applicationId = _appId;
    if (applicationId == null) {
        applicationId = defaultAppIds[network.name];
        if (applicationId == null) {
            logger.throwArgumentError("network does not support default applicationId", "applicationId", _appId);
        }
        loadBalancer = true;
        community = true;
    } else if (applicationId === defaultAppIds[network.name]) {
        loadBalancer = true;
        community = true;
    }
    if (applicationSecretKey == null) { applicationSecretKey = null; }

    return { applicationId, applicationSecretKey, community, loadBalancer };
}

export class PocketProvider extends StaticJsonRpcProvider implements CommunityResourcable {
    readonly applicationId!: string;
    readonly applicationSecretKey!: null | string;
    readonly loadBalancer!: boolean;

    constructor(_network: Networkish = "homestead", _appId?: null | string, _secretKey?: null | string, _loadBalancer?: boolean) {
        const network = Network.from(_network);
        const { applicationId, applicationSecretKey, loadBalancer } = normalizeApiKey(network, _appId, _secretKey, _loadBalancer);

        const connection = PocketProvider.getConnection(network, applicationId, applicationSecretKey, loadBalancer);
        super(connection, network);

        defineProperties<PocketProvider>(this, { applicationId, applicationSecretKey, loadBalancer });
    }

    static getConnection(network: Network, _appId?: null | string, _secretKey?: null | string, _loadBalancer?: boolean): ConnectionInfo {
        const { applicationId, applicationSecretKey, community, loadBalancer } = normalizeApiKey(network, _appId, _secretKey, _loadBalancer);

        let url = `https:/\/${ getHost(network.name) }/v1/`;
        if (loadBalancer) { url += "lb/"; }
        url += applicationId;

        const request = new FetchRequest(url);
        request.allowGzip = true;
        if (applicationSecretKey) { request.setCredentials("", applicationSecretKey); }

        const throttleRetry: ThrottleRetryFunc = async (request, response, attempt) => {
            if (community) { showThrottleMessage("PocketProvider"); }
            return true;
        };

        return { request, throttleRetry };
    }

    isCommunityResource(): boolean {
        return (this.applicationId === defaultAppIds[this.network.name]);
    }
}
