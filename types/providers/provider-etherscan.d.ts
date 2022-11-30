/**
 *  Aboud Etherscan...
 *
 *  @_subsection api/providers/thirdparty:Etherscan  [etherscan]
 */
import { BaseEtherscanProvider } from "./provider-etherscan-base.js";
import { Contract } from "../contract/index.js";
/**
 *  Aboud EtherscanProvider...
 */
export declare class EtherscanProvider extends BaseEtherscanProvider {
    getContract(_address: string): Promise<null | Contract>;
}
//# sourceMappingURL=provider-etherscan.d.ts.map