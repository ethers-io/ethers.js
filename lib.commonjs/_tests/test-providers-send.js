"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const index_js_1 = require("../index.js");
const create_provider_js_1 = require("./create-provider.js");
describe("Sends Transactions", function () {
    const cleanup = [];
    after(function () {
        for (const func of cleanup) {
            func();
        }
    });
    const wallet = new index_js_1.Wallet((process.env.FAUCET_PRIVATEKEY));
    const networkName = "goerli";
    for (const providerName of create_provider_js_1.providerNames) {
        const provider = (0, create_provider_js_1.getProvider)(providerName, networkName);
        if (provider == null) {
            continue;
        }
        // Shutdown socket-based provider, otherwise its socket will prevent
        // this process from exiting
        if (provider.destroy) {
            cleanup.push(() => { provider.destroy(); });
        }
        it(`tests sending: ${providerName}`, async function () {
            this.timeout(60000);
            const w = wallet.connect(provider);
            const dustAddr = index_js_1.Wallet.createRandom().address;
            const tx = await w.sendTransaction({
                to: dustAddr,
                value: 42,
                type: 2
            });
            //const receipt = 
            await provider.waitForTransaction(tx.hash); //tx.wait();
            //console.log(receipt);
            const balance = await provider.getBalance(dustAddr);
            assert_1.default.equal(balance, BigInt(42), "target balance after send");
        });
    }
});
//# sourceMappingURL=test-providers-send.js.map