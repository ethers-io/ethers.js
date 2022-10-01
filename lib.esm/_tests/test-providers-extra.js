import assert from "assert";
import { EtherscanProvider } from "../index.js";
import { retryIt } from "./utils.js";
describe("Test Etherscan extra APIs", function () {
    retryIt("test etherscanProvider.getContract", async function () {
        const provider = new EtherscanProvider("mainnet", "FPFGK6JSW2UHJJ2666FG93KP7WC999MNW7");
        const contract = await provider.getContract("dai.tokens.ethers.eth");
        assert.ok(contract != null, "contract == null");
        assert.equal(await contract.symbol(), "DAI", "contract.symbol");
    });
});
//# sourceMappingURL=test-providers-extra.js.map