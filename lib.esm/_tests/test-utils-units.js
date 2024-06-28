import assert from "assert";
import { loadTests } from "./utils.js";
import { formatEther, formatUnits, parseEther, parseUnits } from "../index.js";
describe("Tests unit conversion", function () {
    const tests = loadTests("units");
    const units = [
        { unit: "ether", format: "ether_format", decimals: 18 },
        { unit: "kwei", format: "kwei_format", decimals: 3 },
        { unit: "mwei", format: "mwei_format", decimals: 6 },
        { unit: "gwei", format: "gwei_format", decimals: 9 },
        { unit: "szabo", format: "szabo_format", decimals: 12 },
        { unit: "finney", format: "finney_format", decimals: 15 },
    ];
    for (const { unit, format, decimals } of units) {
        for (const test of tests) {
            const str = (test[format]);
            if (str == null) {
                continue;
            }
            it(`converts wei to ${unit} string: ${test.name}`, function () {
                const wei = BigInt(test.wei);
                if (decimals === 18) {
                    assert.equal(formatEther(wei), str, "formatEther");
                    assert.equal(formatUnits(wei), str, "formatUnits");
                }
                assert.equal(formatUnits(wei, unit), str, `formatUnits(${unit})`);
                assert.equal(formatUnits(wei, decimals), str, `formatUnits(${decimals})`);
            });
        }
        for (const test of tests) {
            const str = (test[format]);
            if (str == null) {
                continue;
            }
            it(`converts ${format} string to wei: ${test.name}`, function () {
                const wei = BigInt(test.wei);
                if (decimals === 18) {
                    assert.equal(parseEther(str), wei, "parseEther");
                    assert.equal(parseUnits(str), wei, "parseUnits");
                }
                assert.equal(parseUnits(str, unit), wei, `parseUnits(${unit})`);
                assert.equal(parseUnits(str, decimals), wei, `parseUnits(${decimals})`);
            });
        }
    }
});
describe("Tests bad unit conversion", function () {
    it("correctly fails to convert non-string value", function () {
        assert.throws(() => {
            parseUnits(3, "ether");
        }, (error) => {
            return error.message.startsWith("value must be a string");
        });
    });
    it("correctly fails to convert unknown unit", function () {
        assert.throws(() => {
            parseUnits("3", "foobar");
        }, (error) => {
            return error.message.startsWith("invalid unit");
        });
    });
});
//# sourceMappingURL=test-utils-units.js.map