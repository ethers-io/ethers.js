import assert from "assert";

import { getProvider } from "./create-provider.js";

import type {
    AbstractProvider
} from "../index.js";


async function testBlockEvent(provider: AbstractProvider, startBlock: number): Promise<void> {
    const blockEvents: Array<number> = await new Promise((resolve, reject) => {
        const result: Array<number> = [ ];
        const callback = (blockNumber: number) => {
            result.push(blockNumber);
            if (result.length >= 2) {
                provider.off("block", callback);
                resolve(result);
            }
        };
        provider.on("block", callback);
    });

    assert.ok(blockEvents.length >= 2, "blockEvents.length >= 2");

    for (let i = 0; i < blockEvents.length; i++) {
        assert.equal(blockEvents[i], startBlock + i + 1, `blockNumber + ${ i }`);
    }

    assert.equal(await provider.listenerCount("block"), 0, "listenerCount");
}

//async function testFilterEvent(provider: AbstractProvider): Promise<void> {
//}

describe("Tests Events", function() {
    // These providers cover all possible 
    const Providers = [ "EtherscanProvider", "InfuraProvider" ];

    for (const providerName of Providers) {
        it(`responds to block events: ${ providerName }`, async function() {
            this.timeout(120000);
            const provider = getProvider(providerName, "goerli");
            if (provider == null) { throw new Error("internal; should not happen"); }
            await testBlockEvent(provider, await provider.getBlockNumber());
        });
    }

    for (const providerName of Providers) {
        it(`responds to filter events: ${ providerName }`, async function() {
            this.skip();
/*
            this.timeout(120000);
            const provider = getProvider(providerName, "goerli");
            if (provider == null) { throw new Error("internal; should not happen"); }
            await testFilterEvent(provider);
*/
        });
    }
});
