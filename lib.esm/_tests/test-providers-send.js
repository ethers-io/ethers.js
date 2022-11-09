import assert from "assert";
import { Wallet } from "../index.js";
import { getProvider, providerNames } from "./create-provider.js";
describe("Sends Transactions", function () {
    const cleanup = [];
    after(function () {
        for (const func of cleanup) {
            func();
        }
    });
    const wallet = new Wallet((process.env.FAUCET_PRIVATEKEY));
    const networkName = "goerli";
    for (const providerName of providerNames) {
        const provider = getProvider(providerName, networkName);
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
            const dustAddr = Wallet.createRandom().address;
            const tx = await w.sendTransaction({
                to: dustAddr,
                value: 42,
                type: 2
            });
            //const receipt = 
            await provider.waitForTransaction(tx.hash); //tx.wait();
            //console.log(receipt);
            const balance = await provider.getBalance(dustAddr);
            assert.equal(balance, BigInt(42), "target balance after send");
        });
    }
});
//# sourceMappingURL=test-providers-send.js.map