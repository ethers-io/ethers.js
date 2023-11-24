import assert from "assert";

import {
    isError, makeError,

    AbstractProvider, FallbackProvider, Network,
    ZeroAddress
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

describe("Test Inflight Quorum", function() {
    // Fires the %%actions%% as providers which will delay before returning,
    // and returns an array of arrays, where each sub-array indicates which
    // providers were inflight at once.
    async function test(actions: Array<{ delay: number, stallTimeout: number, priority: number, weight: number }>, quorum: number): Promise<Array<Array<number>>> {
        const inflights: Array<Array<number>> = [ [ ] ];

        const configs = actions.map(({ delay, stallTimeout, priority, weight }, index) => ({
            provider: new MockProvider(async (r) => {
                if (r.method === "getBlockNumber") { return 1; }
                if (r.method === "getBalance") {
                    // Add this as inflight
                    let last = inflights.pop();
                    if (last == null) { throw new Error("no elements"); }
                    inflights.push(last);
                    last = last.slice();
                    last.push(index);
                    inflights.push(last);

                    // Do the thing
                    await stall(delay);

                    // Remove as inflight
                    last = inflights.pop();
                    if (last == null) { throw new Error("no elements"); }
                    inflights.push(last);
                    last = last.filter((v) => (v !== index));
                    inflights.push(last);

                    return 0;
                }
                console.log(r);
                throw new Error(`unhandled method: ${ r.method }`);
            }),
            stallTimeout, priority, weight
        }));

        const provider = new FallbackProvider(configs, network, {
            cacheTimeout: -1, pollingInterval: 100,
            quorum
        });
        await provider.getBalance(ZeroAddress);

        return inflights;
    }

    // See: #4298
    it("applies weights against inflight requests", async function() {
        this.timeout(2000);

        const inflights = await test([
            { delay: 50, stallTimeout: 1000, priority: 1, weight: 2 },
            { delay: 50, stallTimeout: 1000, priority: 1, weight: 2 },
        ], 2);

        // Make sure there is never more than 1 inflight provider at once
        for (const running of inflights) {
            assert.ok(running.length <= 1, `too many inflight requests: ${ JSON.stringify(inflights) }`);
        }
    });

    // @TODO: add lots more tests, checking on priority, weight and stall
    //        configurations
});
