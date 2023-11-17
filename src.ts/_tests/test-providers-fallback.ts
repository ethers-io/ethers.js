import assert from "assert";

import {
    isError, makeError,

    AbstractProvider, FallbackProvider, Network,
} from "../index.js";

import type {
    PerformActionRequest
} from "../index.js";



const network = Network.from("mainnet");

function stall(duration: number): Promise<void> {
    return  new Promise((resolve) => { setTimeout(resolve, duration); });
}


export type Performer = (req: PerformActionRequest) => Promise<any>;

export class MockProvider extends AbstractProvider {
    readonly _perform: Performer;

    constructor(perform: Performer) {
        super(network, { cacheTimeout: -1 });
        this._perform = perform;
    }

    async _detectNetwork(): Promise<Network> { return network; }

    async perform(req: PerformActionRequest): Promise<any> {
        return await this._perform(req);
    }
}

describe("Test Fallback broadcast", function() {

    const txHash = "0x33017397ef7c7943dee3b422aec52b0a210de58d73d49c1b3ce455970f01c83a";

    async function test(actions: Array<{ timeout: number, error?: Error }>): Promise<any> {
        // https://sepolia.etherscan.io/tx/0x33017397ef7c7943dee3b422aec52b0a210de58d73d49c1b3ce455970f01c83a
        const tx = "0x02f87683aa36a7048459682f00845d899ef982520894b5bdaa442bb34f27e793861c456cd5bdc527ac8c89056bc75e2d6310000080c001a07503893743e94445b2361a444343757e6f59d52e19e9b3f65eb138d802eaa972a06e4e9bc10ff55474f9aac0a4c284733b4195cb7b273de5e7465ce75a168e0c38";

        const providers: Array<MockProvider> = actions.map(({ timeout, error }) => {
            return new MockProvider(async (r) => {
                if (r.method === "getBlockNumber") { return 1; }
                if (r.method === "broadcastTransaction") {
                    await stall(timeout);
                    if (error) { throw error; }
                    return txHash;
                }
                throw new Error(`unhandled method: ${ r.method }`);
            });
        });;

        const provider = new FallbackProvider(providers);
        return await provider.broadcastTransaction(tx);
    }

    it("picks late non-failed broadcasts", async function() {
        const result = await test([
            { timeout: 200, error: makeError("already seen", "UNKNOWN_ERROR") },
            { timeout: 4000, error: makeError("already seen", "UNKNOWN_ERROR") },
            { timeout: 400 },
        ]);
        assert(result.hash === txHash, "result.hash === txHash");
    });

    it("picks late non-failed broadcasts with quorum-met red-herrings", async function() {
        const result = await test([
            { timeout: 200, error: makeError("bad nonce", "NONCE_EXPIRED") },
            { timeout: 400, error: makeError("bad nonce", "NONCE_EXPIRED") },
            { timeout: 1000 },
        ]);
        assert(result.hash === txHash, "result.hash === txHash");
    });

    it("insufficient funds short-circuit broadcast", async function() {
        await assert.rejects(async function() {
            const result = await test([
                { timeout: 200, error: makeError("is broke", "INSUFFICIENT_FUNDS") },
                { timeout: 400, error: makeError("is broke", "INSUFFICIENT_FUNDS") },
                { timeout: 800 },
                { timeout: 1000 },
            ]);
            console.log(result);
        }, function(error: unknown) {
            assert(isError(error, "INSUFFICIENT_FUNDS"));
            return true;
        });
    });
});
