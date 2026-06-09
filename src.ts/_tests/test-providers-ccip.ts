import assert from "assert";

import {
    concat, dataLength,
    keccak256,
    toBeArray,
    isCallException, isError, makeError,
    AbstractProvider, Network,
} from "../index.js";

import type { PerformActionRequest } from "../index.js";

import { connect, setupProviders } from "./create-provider.js";

// Minimal mock provider for unit tests that avoids network calls.
class MockCallProvider extends AbstractProvider {
    #response: () => Promise<any>;

    constructor(response: () => Promise<any>) {
        super(Network.from("mainnet"), { cacheTimeout: -1 });
        this.#response = response;
    }

    async _detectNetwork(): Promise<Network> { return Network.from("mainnet"); }

    async _perform(req: PerformActionRequest): Promise<any> {
        if (req.method === "getBlockNumber") { return 1; }
        if (req.method === "call") { return await this.#response(); }
        throw new Error(`unhandled method: ${ req.method }`);
    }
}

describe("Test CCIP short error.data (issue #4982)", function() {

    // These error.data values are shorter than 4 bytes; previously they caused
    // a BUFFER_OVERRUN because dataSlice(data, 0, 4) was called unconditionally.
    const shortDataCases: Array<{ label: string, data: string }> = [
        { label: "empty (0x)", data: "0x" },
        { label: "1-byte",     data: "0x55" },
        { label: "2-byte",     data: "0x556f" },
        { label: "3-byte",     data: "0x556f18" },
    ];

    for (const { label, data } of shortDataCases) {
        it(`re-throws original CALL_EXCEPTION without BUFFER_OVERRUN for ${ label } error.data`, async function() {
            const provider = new MockCallProvider(async () => {
                throw makeError("execution reverted", "CALL_EXCEPTION", {
                    action: "call",
                    data,
                    reason: null,
                    transaction: { to: "0x0000000000000000000000000000000000000001", data: "0x" },
                    invocation: null,
                    revert: null,
                });
            });
            provider.disableCcipRead = false;

            await assert.rejects(
                () => provider.call({ to: "0x0000000000000000000000000000000000000001", data: "0x", enableCcipRead: true }),
                (error: unknown) => {
                    // Must be the original CALL_EXCEPTION, not a BUFFER_OVERRUN
                    assert.ok(isCallException(error), "expected a CALL_EXCEPTION, not a BUFFER_OVERRUN");
                    return true;
                }
            );
        });
    }
});

setupProviders();

describe("Test CCIP execution", function() {

    // This matches the verify method in the Solidity contract against the
    // processed data from the endpoint
    const verify = function(sender: string, data: string, result: string): void {
        const check = concat([
            toBeArray(dataLength(sender)), sender,
            toBeArray(dataLength(data)), data
        ]);
        assert.equal(result, keccak256(check), "response is equal");
    }

    const address = "0xb66e9b20258712bfb9fd40acb13d7712ef149d6e";
    const networkName = "sepolia";

    const calldata = "0x1234";

    it("testGet passes under normal operation", async function() {
        this.timeout(60000);

        const provider = connect(networkName);

        // testGet(bytes callData = "0x1234")
        const tx = {
            to: address, enableCcipRead: true,
            data: "0xa5f3271e000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000"
        }

        const result = await provider.call(tx);
        verify(address, calldata, result);
    });

    it("testGet should fail with CCIP not explicitly enabled by overrides", async function() {
        this.timeout(60000);

        const provider = connect(networkName);

        // testGet(bytes callData = "0x1234")
        const tx = {
            to: address,
            data: "0xa5f3271e000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000"
        }

        await assert.rejects(async function() {
            const result = await provider.call(tx);
            console.log(result);
        }, (error: unknown) => {
            const offchainErrorData = concat([
                "0x556f1830000000000000000000000000",
                address,
                "0x00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000140b1494be100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004068747470733a2f2f6574686572732e7269636d6f6f2e776f726b6572732e6465762f746573742d636369702d726561642f7b73656e6465727d2f7b646174617d00000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d4d79206578747261206461746100000000000000000000000000000000000000"
            ]);
            return (isCallException(error) && error.data === offchainErrorData);
        });
    });

    it("testGet should fail with CCIP explicitly disabled on provider", async function() {
        this.timeout(60000);

        const provider = connect(networkName);
        provider.disableCcipRead = true;

        // testGetFail(bytes callData = "0x1234")
        const tx = {
            to: address, enableCcipRead: true,
            data: "0xa5f3271e000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000"
        }

        await assert.rejects(async function() {
            const result = await provider.call(tx);
            console.log(result);
        }, (error: unknown) => {
            const offchainErrorData = concat([
                "0x556f1830000000000000000000000000",
                address,
                "0x00000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000140b1494be100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004068747470733a2f2f6574686572732e7269636d6f6f2e776f726b6572732e6465762f746573742d636369702d726561642f7b73656e6465727d2f7b646174617d00000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d4d79206578747261206461746100000000000000000000000000000000000000"
            ]);

            return (isCallException(error) && error.data === offchainErrorData);
        });
    });

    it("testGetFail should fail if all URLs 5xx", async function() {
        this.timeout(60000);

        const provider = connect(networkName);

        // testGetFail(bytes callData = "0x1234")
        const tx = {
            to: address, enableCcipRead: true,
            data: "0x36f9cea6000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000"
        }

        await assert.rejects(async function() {
            const result = await provider.call(tx);
            console.log(result);
        }, (error: unknown) => {
            const infoJson = '{"urls":["https:/\/ethers.ricmoo.workers.dev/status/500/{sender}/{data}"],"errorMessages":["hello world"]}';
            return (isError(error, "OFFCHAIN_FAULT") && error.reason === "500_SERVER_ERROR" &&
                JSON.stringify(error.info) === infoJson);
        });
    });

    it("testGetSenderFail should fail if sender does not match", async function() {
        this.timeout(60000);

        const provider = connect(networkName);

        // testGetSenderFail(bytes callData = "0x1234")
        const tx = {
            to: address, enableCcipRead: true,
            data: "0x64bff6d1000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000",
        }

        await assert.rejects(async function() {
            const result = await provider.call(tx);
            console.log(result);
        }, (error: unknown) => {
            const errorArgsJson = '["0x0000000000000000000000000000000000000000",["https://ethers.ricmoo.workers.dev/test-ccip-read/{sender}/{data}"],"0x1234","0xb1494be1","0x4d792065787472612064617461"]';
            const offchainErrorData = "0x556f1830000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000140b1494be100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004068747470733a2f2f6574686572732e7269636d6f6f2e776f726b6572732e6465762f746573742d636369702d726561642f7b73656e6465727d2f7b646174617d00000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d4d79206578747261206461746100000000000000000000000000000000000000";
            return (isCallException(error) && error.data === offchainErrorData &&
                error.revert &&
                error.revert.signature === "OffchainLookup(address,string[],bytes,bytes4,bytes)" &&
                JSON.stringify(error.revert.args) === errorArgsJson);
        });
    });


    it("testGetMissing should fail if early URL 4xx", async function() {
        this.timeout(60000);

        const provider = connect(networkName);

        // testGetMissing(bytes callData = "0x1234")
        const tx = {
            to: address, enableCcipRead: true,
            data: "0x4ece8d7d000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000"
        }

        await assert.rejects(async function() {
            const result = await provider.call(tx);
            console.log(result);
        }, (error: unknown) => {
            const infoJson = '{"url":"https:/\/ethers.ricmoo.workers.dev/status/404/{sender}/{data}","errorMessage":"hello world"}';
            return (isError(error, "OFFCHAIN_FAULT") && error.reason === "404_MISSING_RESOURCE" &&
                JSON.stringify(error.info || "") === infoJson);
        });
    });


    it("testGetFallback passes if any URL returns correctly", async function() {
        this.timeout(60000);

        const provider = connect(networkName);

        // testGetFallback(bytes callData = "0x1234")
        const tx = {
            to: address, enableCcipRead: true,
            data: "0xedf4a021000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000"
        }

        const result = await provider.call(tx);
        verify(address, calldata, result);
    });

    it("testGetDeadHostFallback passes if any URL returns correctly", async function() {
        this.timeout(60000);

        const provider = connect(networkName);

        // testGetDeadHostFallback(bytes callData = "0x1234")
        const tx = {
            to: address, enableCcipRead: true,
            data: "0x0324be5a000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000"
        }

        const result = await provider.call(tx);
        verify(address, calldata, result);
    });

    it("testPost passes under normal operation", async function() {
        this.timeout(60000);

        const provider = connect(networkName);

        // testPost(bytes callData = "0x1234")
        const tx = {
            to: address, enableCcipRead: true,
            data: "0x66cab49d000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000"
        }

        const result = await provider.call(tx);
        verify(address, calldata, result);
    });
})
