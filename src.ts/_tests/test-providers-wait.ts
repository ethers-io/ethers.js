import assert from "assert";

import {
    AbstractProvider, TransactionReceipt, UnmanagedSubscriber,
    ZeroAddress, ZeroHash, isError
} from "../index.js";

import type { Subscriber, Subscription } from "../index.js";

function deferred<T>(): { promise: Promise<T>, resolve: (value: T) => void } {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((r) => { resolve = r; });
    return { promise, resolve };
}

function tick(): Promise<void> {
    return new Promise((resolve) => { setTimeout(resolve, 0); });
}

class WaitProvider extends AbstractProvider {
    blockNumber: () => Promise<number> = async () => 1;
    receipt: () => Promise<null | TransactionReceipt> = async () => null;
    receiptRequests = 0;

    constructor() {
        super("mainnet", { cacheTimeout: -1 });
    }

    async getBlockNumber(): Promise<number> { return this.blockNumber(); }

    async getTransactionReceipt(hash: string): Promise<null | TransactionReceipt> {
        assert.equal(hash, ZeroHash);
        this.receiptRequests++;
        return this.receipt();
    }

    _getSubscriber(sub: Subscription): Subscriber {
        assert.equal(sub.type, "block");
        return new UnmanagedSubscriber("block");
    }
}

function receipt(provider: AbstractProvider): TransactionReceipt {
    return new TransactionReceipt({
        to: ZeroAddress, from: ZeroAddress, contractAddress: null,
        hash: ZeroHash, index: 0, blockHash: ZeroHash, blockNumber: 1,
        logsBloom: "0x" + "00".repeat(256), logs: [], gasUsed: 21000n,
        cumulativeGasUsed: 21000n, gasPrice: 1n, type: 0, status: 1, root: null
    }, provider);
}

describe("Test waitForTransaction cleanup", function() {
    for (const phase of [ "block", "receipt", "later receipt", "unconfirmed receipt" ]) {
        it(`does not resume after timing out during ${ phase } lookup`, async function() {
            const provider = new WaitProvider();
            const pendingBlock = deferred<number>();
            const pendingReceipt = deferred<null | TransactionReceipt>();
            const requested = deferred<void>();

            if (phase === "block") {
                provider.blockNumber = async () => {
                    requested.resolve();
                    return pendingBlock.promise;
                };
            } else {
                provider.receipt = async () => {
                    if (phase === "later receipt" && provider.receiptRequests === 1) {
                        return null;
                    }
                    requested.resolve();
                    return pendingReceipt.promise;
                };
            }

            try {
                const waiting = provider.waitForTransaction(ZeroHash, 2, 50);
                const timedOut = assert.rejects(waiting, (error: unknown) => isError(error, "TIMEOUT"));
                if (phase === "later receipt") {
                    await tick();
                    assert.equal(await provider.listenerCount("block"), 1);
                    await provider.emit("block", 2);
                }
                await requested.promise;
                await timedOut;

                const requests = provider.receiptRequests;
                pendingBlock.resolve(1);
                pendingReceipt.resolve(phase === "unconfirmed receipt" ? receipt(provider): null);
                await tick();

                assert.equal(await provider.listenerCount("block"), 0, "timed out listener was reattached");
                await provider.emit("block", 3);
                await tick();
                assert.equal(provider.receiptRequests, requests, "receipt queried after timeout");
            } finally {
                pendingBlock.resolve(1);
                pendingReceipt.resolve(null);
                provider.destroy();
            }
        });
    }

    it("still waits for the requested confirmations and removes its listener", async function() {
        const provider = new WaitProvider();
        const mined = receipt(provider);
        provider.receipt = async () => mined;
        try {
            const waiting = provider.waitForTransaction(ZeroHash, 2, 1000);
            await tick();
            assert.equal(await provider.listenerCount("block"), 1);
            await provider.emit("block", 2);
            assert.equal(await waiting, mined);
            assert.equal(await provider.listenerCount("block"), 0);
        } finally {
            provider.destroy();
        }
    });

    it("returns a pending receipt immediately when no confirmations are requested", async function() {
        const provider = new WaitProvider();
        provider.blockNumber = async () => { throw new Error("unexpected block lookup"); };
        try {
            assert.equal(await provider.waitForTransaction(ZeroHash, 0), null);
            assert.equal(provider.receiptRequests, 1);
            assert.equal(await provider.listenerCount(), 0);
        } finally {
            provider.destroy();
        }
    });
});
