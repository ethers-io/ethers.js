import assert from "assert";
import { concat, dataLength } from "@ethersproject/bytes";
import { keccak256 } from "@ethersproject/crypto";
import { toArray } from "@ethersproject/math";
import { isCallException, isError } from "@ethersproject/logger";
import { connect } from "./create-provider.js";
describe("Test CCIP execution", function () {
    // This matches the verify method in the Solidity contract against the
    // processed data from the endpoint
    const verify = function (sender, data, result) {
        const check = concat([
            toArray(dataLength(sender)), sender,
            toArray(dataLength(data)), data
        ]);
        assert.equal(result, keccak256(check), "response is equal");
    };
    const address = "0xAe375B05A08204C809b3cA67C680765661998886";
    const calldata = "0x1234";
    it("testGet passes under normal operation", async function () {
        this.timeout(60000);
        const provider = connect("ropsten");
        // testGet(bytes callData = "0x1234")
        const tx = {
            to: address, enableCcipRead: true,
            data: "0xa5f3271e000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000"
        };
        const result = await provider.call(tx);
        verify(address, calldata, result);
    });
    it("testGet should fail with CCIP not explicitly enabled by overrides", async function () {
        this.timeout(60000);
        const provider = connect("ropsten");
        // testGet(bytes callData = "0x1234")
        const tx = {
            to: address,
            data: "0xa5f3271e000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000"
        };
        await assert.rejects(async function () {
            const result = await provider.call(tx);
            console.log(result);
        }, (error) => {
            const offchainErrorData = "0x556f1830000000000000000000000000ae375b05a08204c809b3ca67c68076566199888600000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000140b1494be100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004068747470733a2f2f6574686572732e7269636d6f6f2e776f726b6572732e6465762f746573742d636369702d726561642f7b73656e6465727d2f7b646174617d00000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d4d79206578747261206461746100000000000000000000000000000000000000";
            return (isCallException(error) && error.data === offchainErrorData);
        });
    });
    it("testGet should fail with CCIP explicitly disabled on provider", async function () {
        this.timeout(60000);
        const provider = connect("ropsten");
        provider.disableCcipRead = true;
        // testGetFail(bytes callData = "0x1234")
        const tx = {
            to: address, enableCcipRead: true,
            data: "0xa5f3271e000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000"
        };
        await assert.rejects(async function () {
            const result = await provider.call(tx);
            console.log(result);
        }, (error) => {
            const offchainErrorData = "0x556f1830000000000000000000000000ae375b05a08204c809b3ca67c68076566199888600000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000140b1494be100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004068747470733a2f2f6574686572732e7269636d6f6f2e776f726b6572732e6465762f746573742d636369702d726561642f7b73656e6465727d2f7b646174617d00000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d4d79206578747261206461746100000000000000000000000000000000000000";
            return (isCallException(error) && error.data === offchainErrorData);
        });
    });
    it("testGetFail should fail if all URLs 5xx", async function () {
        this.timeout(60000);
        const provider = connect("ropsten");
        // testGetFail(bytes callData = "0x1234")
        const tx = {
            to: address, enableCcipRead: true,
            data: "0x36f9cea6000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000"
        };
        await assert.rejects(async function () {
            const result = await provider.call(tx);
            console.log(result);
        }, (error) => {
            const infoJson = '{"urls":["https:/\/ethers.ricmoo.workers.dev/status/500/{sender}/{data}"],"errorMessages":["hello world"]}';
            return (isError(error, "OFFCHAIN_FAULT") && error.reason === "500_SERVER_ERROR" &&
                JSON.stringify(error.info) === infoJson);
        });
    });
    it("testGetSenderFail should fail if sender does not match", async function () {
        this.timeout(60000);
        const provider = connect("ropsten");
        // testGetSenderFail(bytes callData = "0x1234")
        const tx = {
            to: address, enableCcipRead: true,
            data: "0x64bff6d1000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000",
        };
        await assert.rejects(async function () {
            const result = await provider.call(tx);
            console.log(result);
        }, (error) => {
            const errorArgsJson = '["0x0000000000000000000000000000000000000000",["https://ethers.ricmoo.workers.dev/test-ccip-read/{sender}/{data}"],"0x1234","0xb1494be1","0x4d792065787472612064617461"]';
            const offchainErrorData = "0x556f1830000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000140b1494be100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000018000000000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000004068747470733a2f2f6574686572732e7269636d6f6f2e776f726b6572732e6465762f746573742d636369702d726561642f7b73656e6465727d2f7b646174617d00000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000d4d79206578747261206461746100000000000000000000000000000000000000";
            return (isCallException(error) && error.data === offchainErrorData &&
                error.errorSignature === "OffchainLookup(address,string[],bytes,bytes4,bytes)" &&
                JSON.stringify(error.errorArgs) === errorArgsJson);
        });
    });
    it("testGetMissing should fail if early URL 4xx", async function () {
        this.timeout(60000);
        const provider = connect("ropsten");
        // testGetMissing(bytes callData = "0x1234")
        const tx = {
            to: address, enableCcipRead: true,
            data: "0x4ece8d7d000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000"
        };
        await assert.rejects(async function () {
            const result = await provider.call(tx);
            console.log(result);
        }, (error) => {
            const infoJson = '{"url":"https:/\/ethers.ricmoo.workers.dev/status/404/{sender}/{data}","errorMessage":"hello world"}';
            return (isError(error, "OFFCHAIN_FAULT") && error.reason === "404_MISSING_RESOURCE" &&
                JSON.stringify(error.info || "") === infoJson);
        });
    });
    it("testGetFallback passes if any URL returns correctly", async function () {
        this.timeout(60000);
        const provider = connect("ropsten");
        // testGetFallback(bytes callData = "0x1234")
        const tx = {
            to: address, enableCcipRead: true,
            data: "0xedf4a021000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000"
        };
        const result = await provider.call(tx);
        verify(address, calldata, result);
    });
    it("testPost passes under normal operation", async function () {
        this.timeout(60000);
        const provider = connect("ropsten");
        // testPost(bytes callData = "0x1234")
        const tx = {
            to: address, enableCcipRead: true,
            data: "0x66cab49d000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000021234000000000000000000000000000000000000000000000000000000000000"
        };
        const result = await provider.call(tx);
        verify(address, calldata, result);
    });
});
//# sourceMappingURL=test-ccip-read.js.map