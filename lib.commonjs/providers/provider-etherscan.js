"use strict";
/**
 *  Aboud Etherscan...
 *
 *  @_subsection api/providers/thirdparty:Etherscan  [etherscan]
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EtherscanProvider = void 0;
const provider_etherscan_base_js_1 = require("./provider-etherscan-base.js");
const index_js_1 = require("../contract/index.js");
function isPromise(value) {
    return (value && typeof (value.then) === "function");
}
/**
 *  Aboud EtherscanProvider...
 */
class EtherscanProvider extends provider_etherscan_base_js_1.BaseEtherscanProvider {
    async getContract(_address) {
        let address = this._getAddress(_address);
        if (isPromise(address)) {
            address = await address;
        }
        try {
            const resp = await this.fetch("contract", { action: "getabi", address });
            const abi = JSON.parse(resp);
            return new index_js_1.Contract(address, abi, this);
        }
        catch (error) {
            return null;
        }
    }
}
exports.EtherscanProvider = EtherscanProvider;
//# sourceMappingURL=provider-etherscan.js.map