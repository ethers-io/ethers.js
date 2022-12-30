import assert from "assert";
import { isError, Wallet } from "../index.js";
import { getProvider, providerNames, setupProviders } from "./create-provider.js";
function stall(duration) {
    return new Promise((resolve) => { setTimeout(resolve, duration); });
}
setupProviders();
describe("Sends Transactions", function () {
    const wallet = new Wallet((process.env.FAUCET_PRIVATEKEY));
    const networkName = "goerli";
    for (const providerName of providerNames) {
        const provider = getProvider(providerName, networkName);
        if (provider == null) {
            continue;
        }
        it(`tests sending: ${providerName}`, async function () {
            this.timeout(180000);
            const w = wallet.connect(provider);
            const dustAddr = Wallet.createRandom().address;
            // Retry if another CI instance used our value
            let tx = null;
            for (let i = 0; i < 10; i++) {
                try {
                    tx = await w.sendTransaction({
                        to: dustAddr,
                        value: 42,
                        type: 2
                    });
                    break;
                }
                catch (error) {
                    if (isError(error, "REPLACEMENT_UNDERPRICED") || isError(error, "NONCE_EXPIRED")) {
                        await stall(1000);
                        continue;
                    }
                    throw error;
                }
            }
            assert.ok(!!tx, "too many retries");
            //const receipt = 
            await provider.waitForTransaction(tx.hash, null, 60000); //tx.wait();
            //console.log(receipt);
            const balance = await provider.getBalance(dustAddr);
            assert.equal(balance, BigInt(42), "target balance after send");
        });
    }
});
//# sourceMappingURL=test-providers-send.js.map