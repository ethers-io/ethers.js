import { Typed } from "@ethersproject/abi";
import * as providers from "@ethersproject/providers";
import { Contract } from "../index.js";
import { log } from "./utils.js";
//import type { Addressable } from "@ethersproject/address";
//import type { BigNumberish } from "@ethersproject/logger";
/*
import type {
    ConstantContractMethod, ContractMethod, ContractEvent
} from "../index.js";
*/
// @TODO
describe("Test Contract Calls", function () {
    it("finds typed methods", async function () {
        const contract = new Contract("0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72", [
            "function foo(string s) view returns (uint)",
            "function foo(uint8) view returns (uint)",
            "function foo(uint u, bool b) view returns (uint)",
        ]);
        const value = Typed.string("42");
        await contract.foo.populateTransaction(value, Typed.overrides({ value: 100 }));
        contract["foo(string)"].fragment;
    });
});
/*
describe("Test Contract Interface", function() {
    it("builds contract interfaces", async function() {
        this.timeout(60000);

        interface Erc20Interface {
            // Constant Methods
            balanceOf: ConstantContractMethod<[ address: string | Addressable ], bigint>;
            decimals: ConstantContractMethod<[ ], bigint>;

            name: ConstantContractMethod<[ ], string>;
            symbol: ConstantContractMethod<[ ], string>;

            // Mutation Methods
            transferFrom: ContractMethod<[ address: string | Addressable,
              address: string | Addressable, amount: BigNumberish ], boolean>;

            // Events
            filters: {
                Transfer: ContractEvent<[ from: Addressable | string, to: BigNumberish ]>;
            }
        }

        const erc20Abi = [
            "function balanceOf(address owner) view returns (uint)",
            "function decimals() view returns (uint)",
            "function name() view returns (string)",
            "function symbol() view returns (string)",

            "function transferFrom(address from, address to, uint amount) returns (boolean)",

            "event Transfer(address indexed from, address indexed to, uint amount)"
        ];

        class Erc20Contract extends BaseContract.buildClass<Erc20Interface>(erc20Abi) { };

        const provider = new providers.InfuraProvider();
        // ENS
        //const addr = "0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72";
        // DAI
        const addr = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
        const contract = new Erc20Contract(addr, provider);
        console.log("SYMBOL", await contract.symbol());
        console.log("DECIMALS", await contract.decimals());
        console.log(await contract.balanceOf("0x5555763613a12D8F3e73be831DFf8598089d3dCa"));
        console.log(await contract.balanceOf("ricmoo.eth"));

        await contract.on(contract.filters.Transfer, (from, to, value, event) => {
            console.log("HELLO!", { from, to, value, event });
            event.removeListener();
        });
        const logs = await contract.queryFilter("Transfer", -10);
        console.log(logs, logs[0], logs[0].args.from);
    });
});
*/
describe("Test Contract Calls", function () {
    it("calls ERC-20 methods", async function () {
        const provider = new providers.AnkrProvider();
        const contract = new Contract("0xC18360217D8F7Ab5e7c516566761Ea12Ce7F9D72", [
            "function balanceOf(address owner) view returns (uint)",
        ], provider);
        log(this, `balance: ${await contract.balanceOf("0x5555763613a12D8F3e73be831DFf8598089d3dCa")}`);
    });
});
//# sourceMappingURL=test-contract.js.map