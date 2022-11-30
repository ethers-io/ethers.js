import assert from "assert";
import { loadTests } from "./utils.js";
import { getAddress, getIcapAddress, getCreateAddress, getCreate2Address } from "../index.js";
describe("computes checksum address", function () {
    const tests = loadTests("accounts");
    for (const test of tests) {
        it(`computes the checksum address: ${test.name}`, function () {
            assert.equal(getAddress(test.address), test.address);
            assert.equal(getAddress(test.icap), test.address);
            assert.equal(getAddress(test.address.substring(2)), test.address);
            assert.equal(getAddress(test.address.toLowerCase()), test.address);
            assert.equal(getAddress("0x" + test.address.substring(2).toUpperCase()), test.address);
        });
    }
    const invalidAddresses = [
        { name: "null", value: null },
        { name: "number", value: 1234 },
        { name: "emtpy bytes", value: "0x" },
        { name: "too short", value: "0x8ba1f109551bd432803012645ac136ddd64dba" },
        { name: "too long", value: "0x8ba1f109551bd432803012645ac136ddd64dba7200" },
    ];
    invalidAddresses.forEach(({ name, value }) => {
        it(`correctly fails on invalid address: ${name}`, function () {
            assert.throws(function () {
                getAddress(value);
            }, function (error) {
                return (error.code === "INVALID_ARGUMENT" &&
                    error.message.match(/^invalid address/) &&
                    error.argument === "address" &&
                    error.value === value);
            });
        });
    });
    it("correctly fails on invalid checksum", function () {
        const value = "0x8ba1f109551bD432803012645Ac136ddd64DBa72";
        assert.throws(function () {
            getAddress(value);
        }, function (error) {
            return (error.code === "INVALID_ARGUMENT" &&
                error.message.match(/^bad address checksum/) &&
                error.argument === "address" &&
                error.value === value);
        });
    });
    it("correctly fails on invalid IBAN checksum", function () {
        const value = "XE65GB6LDNXYOFTX0NSV3FUWKOWIXAMJK37";
        assert.throws(function () {
            getAddress(value);
        }, function (error) {
            return (error.code === "INVALID_ARGUMENT" &&
                error.message.match(/^bad icap checksum/) &&
                error.argument === "address" &&
                error.value === value);
        });
    });
});
describe("computes ICAP address", function () {
    const tests = loadTests("accounts");
    for (const test of tests) {
        it(`computes the ICAP address: ${test.name}`, function () {
            assert.equal(getIcapAddress(test.address), test.icap);
            assert.equal(getAddress(test.address.toLowerCase()), test.address);
            assert.equal(getAddress("0x" + test.address.substring(2).toUpperCase()), test.address);
        });
    }
});
describe("computes create address", function () {
    const tests = loadTests("create");
    for (const { sender, creates } of tests) {
        for (const { name, nonce, address } of creates) {
            it(`computes the create address: ${name}`, function () {
                assert.equal(getCreateAddress({ from: sender, nonce }), address);
            });
        }
    }
});
describe("computes create2 address", function () {
    const tests = loadTests("create2");
    for (const { sender, creates } of tests) {
        for (const { name, salt, initCodeHash, address } of creates) {
            it(`computes the create2 address: ${name}`, function () {
                assert.equal(getCreate2Address(sender, salt, initCodeHash), address);
            });
        }
    }
    const sender = "0x8ba1f109551bD432803012645Ac136ddd64DBA72";
    const salt = "0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36deac8";
    const initCodeHash = "0x8452c9b9140222b08593a26daa782707297be9f7b3e8281d7b4974769f19afd0";
    it("correctly fails on invalid salt", function () {
        const badSalt = "0x1c8aff950685c2ed4bc3174f3472287b56d9517b9c948127319a09a7a36dea";
        assert.throws(function () {
            getCreate2Address(sender, badSalt, initCodeHash);
        }, function (error) {
            return (error.code === "INVALID_ARGUMENT" &&
                error.argument === "salt" &&
                error.value === badSalt);
        });
    });
    it("correctly fails on invalid initCodeHash", function () {
        const badInitCodeHash = "0x8452c9b9140222b08593a26daa782707297be9f7b3e8281d7b4974769f19af";
        assert.throws(function () {
            getCreate2Address(sender, salt, badInitCodeHash);
        }, function (error) {
            return (error.code === "INVALID_ARGUMENT" &&
                error.argument === "initCodeHash" &&
                error.value === badInitCodeHash);
        });
    });
});
//# sourceMappingURL=test-address.js.map