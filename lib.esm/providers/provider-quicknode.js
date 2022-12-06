/**
 *  About Quicknode
 *
 *  @_subsection: api/providers/thirdparty:QuickNode  [backend-quicknode]
 */
import { defineProperties, FetchRequest, assertArgument } from "../utils/index.js";
import { showThrottleMessage } from "./community.js";
import { Network } from "./network.js";
import { JsonRpcProvider } from "./provider-jsonrpc.js";
const defaultToken = "919b412a057b5e9c9b6dce193c5a60242d6efadb";
function getHost(name) {
    switch (name) {
        case "mainnet":
            return "ethers.quiknode.pro";
        case "goerli":
            return "ethers.ethereum-goerli.quiknode.pro";
        //case "sepolia":
        //    return "sepolia.infura.io";
        case "arbitrum":
            return "ethers.arbitrum-mainnet.quiknode.pro";
        case "arbitrum-goerli":
            return "ethers.arbitrum-goerli.quiknode.pro";
        case "matic":
            return "ethers.matic.quiknode.pro";
        case "maticmum":
            return "ethers.matic-testnet.quiknode.pro";
        case "optimism":
            return "ethers.optimism.quiknode.pro";
        case "optimism-goerli":
            return "ethers.optimism-goerli.quiknode.pro";
    }
    assertArgument(false, "unsupported network", "network", name);
}
/**
 *  About QuickNode
 */
export class QuickNodeProvider extends JsonRpcProvider {
    token;
    constructor(_network, token) {
        if (_network == null) {
            _network = "mainnet";
        }
        const network = Network.from(_network);
        if (token == null) {
            token = defaultToken;
        }
        const request = QuickNodeProvider.getRequest(network, token);
        super(request, network, { staticNetwork: network });
        defineProperties(this, { token });
    }
    _getProvider(chainId) {
        try {
            return new QuickNodeProvider(chainId, this.token);
        }
        catch (error) { }
        return super._getProvider(chainId);
    }
    isCommunityResource() {
        return (this.token === defaultToken);
    }
    static getRequest(network, token) {
        if (token == null) {
            token = defaultToken;
        }
        const request = new FetchRequest(`https:/\/${getHost(network.name)}/${token}`);
        request.allowGzip = true;
        //if (projectSecret) { request.setCredentials("", projectSecret); }
        if (token === defaultToken) {
            request.retryFunc = async (request, response, attempt) => {
                showThrottleMessage("QuickNodeProvider");
                return true;
            };
        }
        return request;
    }
}
//# sourceMappingURL=provider-quicknode.js.map