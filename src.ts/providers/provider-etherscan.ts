/**
 *  Aboud Etherscan...
 *
 *  @_subsection api/providers/thirdparty:Etherscan  [etherscan]
 */

import { BaseEtherscanProvider } from "./provider-etherscan-base.js";
import { Contract } from "../contract/index.js";

function isPromise<T = any>(value: any): value is Promise<T> {
    return (value && typeof(value.then) === "function");
}

/**
 *  Aboud EtherscanProvider...
 */
export class EtherscanProvider extends BaseEtherscanProvider {
    async getContract(_address: string): Promise<null | Contract> {
        let address = this._getAddress(_address);
        if (isPromise(address)) { address = await address; }

        try {
            const resp = await this.fetch("contract", { action: "getabi", address });
            const abi = JSON.parse(resp);
            return new Contract(address, abi, this);
        } catch (error) {
            return null;
        }
    }
}

