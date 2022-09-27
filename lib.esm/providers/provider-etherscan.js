import { BaseEtherscanProvider } from "./provider-etherscan-base.js";
import { Contract } from "../contract/index.js";
function isPromise(value) {
    return (value && typeof (value.then) === "function");
}
export class EtherscanProvider extends BaseEtherscanProvider {
    async getContract(_address) {
        let address = this._getAddress(_address);
        if (isPromise(address)) {
            address = await address;
        }
        try {
            const resp = await this.fetch("contract", { action: "getabi", address });
            const abi = JSON.parse(resp);
            return new Contract(address, abi, this);
        }
        catch (error) {
            return null;
        }
    }
}
//# sourceMappingURL=provider-etherscan.js.map