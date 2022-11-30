"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const utils_js_1 = require("./utils.js");
const index_js_1 = require("../index.js");
describe("Tests unit conversion", function () {
    const tests = (0, utils_js_1.loadTests)("units");
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
                    assert_1.default.equal((0, index_js_1.formatEther)(wei), str, "formatEther");
                    assert_1.default.equal((0, index_js_1.formatUnits)(wei), str, "formatUnits");
                }
                assert_1.default.equal((0, index_js_1.formatUnits)(wei, unit), str, `formatUnits(${unit})`);
                assert_1.default.equal((0, index_js_1.formatUnits)(wei, decimals), str, `formatUnits(${decimals})`);
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
                    assert_1.default.equal((0, index_js_1.parseEther)(str), wei, "parseEther");
                    assert_1.default.equal((0, index_js_1.parseUnits)(str), wei, "parseUnits");
                }
                assert_1.default.equal((0, index_js_1.parseUnits)(str, unit), wei, `parseUnits(${unit})`);
                assert_1.default.equal((0, index_js_1.parseUnits)(str, decimals), wei, `parseUnits(${decimals})`);
            });
        }
    }
});
describe("Tests bad unit conversion", function () {
    it("correctly fails to convert non-string value", function () {
        assert_1.default.throws(() => {
            (0, index_js_1.parseUnits)(3, "ether");
        }, (error) => {
            return error.message.startsWith("value must be a string");
        });
    });
    it("correctly fails to convert unknown unit", function () {
        assert_1.default.throws(() => {
            (0, index_js_1.parseUnits)("3", "foobar");
        }, (error) => {
            return error.message.startsWith("invalid unit");
        });
    });
});
//# sourceMappingURL=test-utils-units.js.map