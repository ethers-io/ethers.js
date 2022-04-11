import { defineProperties } from "@ethersproject/properties";
import { FetchRequest } from "@ethersproject/web";
import { showThrottleMessage } from "./community.js";
import { logger } from "./logger.js";
import { Network } from "./network.js";
import { StaticJsonRpcProvider } from "./provider-jsonrpc.js";
const defaultProjectId = "84842078b09946638c03157f83405213";
function getHost(name) {
    switch (name) {
        case "homestead":
            return "mainnet.infura.io";
        case "ropsten":
            return "ropsten.infura.io";
        case "rinkeby":
            return "rinkeby.infura.io";
        case "kovan":
            return "kovan.infura.io";
        case "goerli":
            return "goerli.infura.io";
        case "matic":
            return "polygon-mainnet.infura.io";
        case "maticmum":
            return "polygon-mumbai.infura.io";
        case "optimism":
            return "optimism-mainnet.infura.io";
        case "optimism-kovan":
            return "optimism-kovan.infura.io";
        case "arbitrum":
            return "arbitrum-mainnet.infura.io";
        case "arbitrum-rinkeby":
            return "arbitrum-rinkeby.infura.io";
    }
    return logger.throwArgumentError("unsupported network", "network", name);
}
export class InfuraProvider extends StaticJsonRpcProvider {
    constructor(_network = "homestead", projectId, projectSecret) {
        const network = Network.from(_network);
        if (projectId == null) {
            projectId = defaultProjectId;
        }
        if (projectSecret == null) {
            projectSecret = null;
        }
        const connection = InfuraProvider.getConnection(network, projectId, projectSecret);
        super(connection, network);
        defineProperties(this, { projectId, projectSecret });
    }
    _getProvider(chainId) {
        try {
            return new InfuraProvider(chainId, this.projectId, this.projectSecret);
        }
        catch (error) { }
        return super._getProvider(chainId);
    }
    static getConnection(network, projectId, projectSecret) {
        if (projectId == null) {
            projectId = defaultProjectId;
        }
        if (projectSecret == null) {
            projectSecret = null;
        }
        const request = new FetchRequest(`https:/\/${getHost(network.name)}/v3/${projectId}`);
        request.allowGzip = true;
        if (projectSecret) {
            request.setCredentials("", projectSecret);
        }
        const throttleRetry = async (request, response, attempt) => {
            if (projectId === defaultProjectId) {
                showThrottleMessage("InfuraProvider");
            }
            return true;
        };
        return { request, throttleRetry };
    }
    isCommunityResource() {
        return (this.projectId === defaultProjectId);
    }
}
//# sourceMappingURL=provider-infura.js.map