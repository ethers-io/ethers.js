"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const index_js_1 = require("../index.js");
const utils_js_1 = require("./utils.js");
describe("Test Etherscan extra APIs", function () {
    (0, utils_js_1.retryIt)("test etherscanProvider.getContract", async function () {
        const provider = new index_js_1.EtherscanProvider("mainnet", "FPFGK6JSW2UHJJ2666FG93KP7WC999MNW7");
        const contract = await provider.getContract("dai.tokens.ethers.eth");
        assert_1.default.ok(contract != null, "contract == null");
        assert_1.default.equal(await contract.symbol(), "DAI", "contract.symbol");
    });
});
//# sourceMappingURL=test-providers-extra.js.map