import { defineProperties } from "@ethersproject/properties";
import { FetchRequest } from "@ethersproject/web";
import { showThrottleMessage } from "./community.js";
import { logger } from "./logger.js";
import { Network } from "./network.js";
import { StaticJsonRpcProvider } from "./provider-jsonrpc.js";
// These are load-balancer-based application IDs
const defaultAppIds = {
    homestead: "6004bcd10040261633ade990",
    ropsten: "6004bd4d0040261633ade991",
    rinkeby: "6004bda20040261633ade994",
    goerli: "6004bd860040261633ade992",
};
function getHost(name) {
    switch (name) {
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
function normalizeApiKey(network, _appId, applicationSecretKey, loadBalancer) {
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
    }
    else if (applicationId === defaultAppIds[network.name]) {
        loadBalancer = true;
        community = true;
    }
    if (applicationSecretKey == null) {
        applicationSecretKey = null;
    }
    return { applicationId, applicationSecretKey, community, loadBalancer };
}
export class PocketProvider extends StaticJsonRpcProvider {
    constructor(_network = "homestead", _appId, _secretKey, _loadBalancer) {
        const network = Network.from(_network);
        const { applicationId, applicationSecretKey, loadBalancer } = normalizeApiKey(network, _appId, _secretKey, _loadBalancer);
        const connection = PocketProvider.getConnection(network, applicationId, applicationSecretKey, loadBalancer);
        super(connection, network);
        defineProperties(this, { applicationId, applicationSecretKey, loadBalancer });
    }
    static getConnection(network, _appId, _secretKey, _loadBalancer) {
        const { applicationId, applicationSecretKey, community, loadBalancer } = normalizeApiKey(network, _appId, _secretKey, _loadBalancer);
        let url = `https:/\/${getHost(network.name)}/v1/`;
        if (loadBalancer) {
            url += "lb/";
        }
        url += applicationId;
        const request = new FetchRequest(url);
        request.allowGzip = true;
        if (applicationSecretKey) {
            request.setCredentials("", applicationSecretKey);
        }
        const throttleRetry = async (request, response, attempt) => {
            if (community) {
                showThrottleMessage("PocketProvider");
            }
            return true;
        };
        return { request, throttleRetry };
    }
    isCommunityResource() {
        return (this.applicationId === defaultAppIds[this.network.name]);
    }
}
//# sourceMappingURL=provider-pocket.js.map