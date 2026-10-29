import assert from "assert";

import { AbstractProvider } from "../index.js";

function tick(): Promise<void> {
    return new Promise((resolve) => { setTimeout(resolve, 0); });
}

function deferred<T>(): { promise: Promise<T>, resolve: (value: T) => void } {
    let resolve!: (value: T) => void;
    const promise = new Promise<T>((r) => { resolve = r; });
    return { promise, resolve };
}

class PollingProvider extends AbstractProvider {
    block = 100;
    requests = 0;
    nextTimer = 1;
    timers = new Map<number, () => void>();
    lookup: () => Promise<number> = async () => this.block;

    constructor() {
        super("mainnet", { cacheTimeout: -1 });
    }

    async getBlockNumber(): Promise<number> {
        this.requests++;
        return this.lookup();
    }

    _setTimeout(func: () => void, timeout?: number): number {
        const id = this.nextTimer++;
        this.timers.set(id, func);
        return id;
    }

    _clearTimeout(id: number): void {
        this.timers.delete(id);
    }

    async poll(): Promise<void> {
        for (const [ id, func ] of Array.from(this.timers)) {
            this.timers.delete(id);
            func();
        }
        await tick();
    }
}

async function withProvider(func: (provider: PollingProvider) => Promise<void>): Promise<void> {
    const provider = new PollingProvider();
    try {
        await func(provider);
    } finally {
        await provider.removeAllListeners();
        provider.destroy();
    }
}

describe("Test block polling lifecycle", function() {
    for (const count of [ 1, 10, 100 ]) {
        it(`polls and emits once after ${ count } pause/resume cycles`, async function() {
            await withProvider(async (provider) => {
                const blocks: Array<number> = [ ];
                await provider.on("block", (block) => { blocks.push(block); });
                await tick();

                for (let i = 0; i < count; i++) {
                    provider.pause(false);
                    provider.resume();
                    await tick();
                }

                assert.equal(provider.timers.size, 1, "multiple polling timers");
                const requests = provider.requests;
                provider.block++;
                await provider.poll();
                assert.equal(provider.requests, requests + 1);
                assert.deepEqual(blocks, [ 101 ]);

                await provider.removeAllListeners("block");
                assert.equal(provider.timers.size, 0);
                await provider.poll();
                assert.equal(provider.requests, requests + 1);
            });
        });
    }

    it("waits for the initial request before scheduling another poll", async function() {
        await withProvider(async (provider) => {
            const pending = deferred<number>();
            provider.lookup = () => pending.promise;
            try {
                await provider.on("block", () => { });
                await provider.poll();
                assert.equal(provider.requests, 1, "overlapping initial requests");
                assert.equal(provider.timers.size, 0);
                pending.resolve(100);
                await tick();
                assert.equal(provider.timers.size, 1);
            } finally {
                pending.resolve(100);
                await tick();
            }
        });
    });

    it("ignores a stale request after polling has restarted", async function() {
        await withProvider(async (provider) => {
            const blocks: Array<number> = [ ];
            await provider.on("block", (block) => { blocks.push(block); });
            await tick();
            const pending = deferred<number>();
            provider.lookup = () => pending.promise;
            await provider.poll();
            provider.pause(false);
            provider.lookup = async () => 101;
            provider.resume();
            await tick();
            pending.resolve(103);
            await tick();
            assert.deepEqual(blocks, [ 101 ], "stale request emitted blocks");
            assert.equal(provider.timers.size, 1);
            provider.lookup = async () => 102;
            await provider.poll();
            assert.deepEqual(blocks, [ 101, 102 ]);
        });
    });

    for (const drop of [ false, true ]) {
        it(`preserves pause(${ drop }) while a request is pending`, async function() {
            await withProvider(async (provider) => {
                const blocks: Array<number> = [ ];
                await provider.on("block", (block) => { blocks.push(block); });
                await tick();
                const pending = deferred<number>();
                provider.lookup = () => pending.promise;
                await provider.poll();
                provider.pause(drop);
                pending.resolve(105);
                await tick();
                assert.deepEqual(blocks, [ ]);
                assert.equal(provider.timers.size, 0);

                provider.lookup = async () => provider.block;
                provider.block = 110;
                provider.resume();
                await tick();
                const expected = drop ? [ ]: Array.from({ length: 10 }, (_, i) => i + 101);
                assert.deepEqual(blocks, expected);
                provider.block = 111;
                await provider.poll();
                assert.deepEqual(blocks, expected.concat(111));
            });
        });

        it(`preserves pause(${ drop }) from a block listener`, async function() {
            await withProvider(async (provider) => {
                const blocks: Array<number> = [ ];
                await provider.on("block", (block) => {
                    blocks.push(block);
                    if (block === 101) { provider.pause(drop); }
                });
                await tick();
                provider.block = 103;
                await provider.poll();
                assert.deepEqual(blocks, [ 101 ]);
                assert.equal(provider.timers.size, 0);
                provider.resume();
                await tick();
                const expected = drop ? [ 101 ]: [ 101, 102, 103 ];
                assert.deepEqual(blocks, expected);
                provider.block = 104;
                await provider.poll();
                assert.deepEqual(blocks, expected.concat(104));
            });
        });
    }

    it("does not use an initial request completed while paused", async function() {
        await withProvider(async (provider) => {
            const pending = deferred<number>();
            const blocks: Array<number> = [ ];
            provider.lookup = () => pending.promise;
            await provider.on("block", (block) => { blocks.push(block); });
            provider.pause(true);
            pending.resolve(100);
            await tick();
            provider.lookup = async () => provider.block;
            provider.block = 110;
            provider.resume();
            await tick();
            assert.deepEqual(blocks, [ ]);
            provider.block = 111;
            await provider.poll();
            assert.deepEqual(blocks, [ 111 ]);
        });
    });

    it("retries a failed initial request with one timer", async function() {
        await withProvider(async (provider) => {
            provider.lookup = async () => { throw new Error("offline"); };
            await provider.on("block", () => { });
            await tick();
            assert.equal(provider.timers.size, 1);
            const requests = provider.requests;
            provider.lookup = async () => 100;
            await provider.poll();
            assert.equal(provider.requests, requests + 1);
            assert.equal(provider.timers.size, 1);
        });
    });

    it("stops a pending poll when its last listener is removed", async function() {
        await withProvider(async (provider) => {
            const blocks: Array<number> = [ ];
            await provider.on("block", (block) => { blocks.push(block); });
            await tick();
            const pending = deferred<number>();
            provider.lookup = () => pending.promise;
            await provider.poll();
            await provider.removeAllListeners("block");
            pending.resolve(102);
            await tick();
            assert.deepEqual(blocks, [ ]);
            assert.equal(provider.timers.size, 0);
        });
    });

    it("continues polling after the reported block height decreases", async function() {
        await withProvider(async (provider) => {
            const blocks: Array<number> = [ ];
            await provider.on("block", (block) => { blocks.push(block); });
            await tick();
            provider.block = 98;
            await provider.poll();
            provider.block = 99;
            await provider.poll();
            assert.deepEqual(blocks, [ 99 ]);
            assert.equal(provider.timers.size, 1);
        });
    });
});
