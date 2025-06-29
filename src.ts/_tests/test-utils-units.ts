import assert from "assert";

import { loadTests } from "./utils.js";

import { formatEther, formatUnits, parseEther, parseUnits } from "../index.js";

import type { TestCaseUnit } from "./types.js";
import { UnitNameType } from "../utils/units.js";


describe("Tests unit conversion", function() {
    const tests = loadTests<TestCaseUnit>("units");

    const units:{unit:UnitNameType,format:string,decimals:number}[] = [
        { unit: "ether", format: "ether_format", decimals: 18 },
        { unit: "kwei", format: "kwei_format", decimals: 3 },
        { unit: "mwei", format: "mwei_format", decimals: 6 },
        { unit: "gwei", format: "gwei_format", decimals: 9 },
        { unit: "szabo", format: "szabo_format", decimals: 12 },
        { unit: "finney", format: "finney_format", decimals: 15 },
    ];

    for (const { unit, format, decimals } of units) {

        for (const test of tests) {
            const str = <string | null>((<any>test)[format]);
            if (str == null) { continue; }

            it(`converts wei to ${ unit } string: ${ test.name }`, function() {
                const wei = BigInt(test.wei);
                if (decimals === 18) {
                    assert.equal(formatEther(wei), str, "formatEther");
                    assert.equal(formatUnits(wei), str, "formatUnits");
                }
                assert.equal(formatUnits(wei, unit), str, `formatUnits(${ unit })`);
                assert.equal(formatUnits(wei, decimals), str, `formatUnits(${ decimals })`);
            });
        }

        for (const test of tests) {
            const str = <string | null>((<any>test)[format]);
            if (str == null) { continue; }

            it(`converts ${ format } string to wei: ${ test.name }`, function() {
                const wei = BigInt(test.wei);
                if (decimals === 18) {
                    assert.equal(parseEther(str), wei, "parseEther");
                    assert.equal(parseUnits(str), wei, "parseUnits");
                }
                assert.equal(parseUnits(str, unit), wei, `parseUnits(${ unit })`);
                assert.equal(parseUnits(str, decimals), wei, `parseUnits(${ decimals })`);
            });
        }

    }
});

describe("Tests bad unit conversion", function() {
    it("correctly fails to convert non-string value", function() {
        assert.throws(() => {
            parseUnits(<any>3, "ether");
        }, (error: any) => {
            return error.message.startsWith("value must be a string");
        });
    });

    it("correctly fails to convert unknown unit", function() {
        assert.throws(() => {
            // @ts-ignore
            parseUnits("3", "foobar");
        }, (error: any) => {
            return error.message.startsWith("invalid unit");
        });
    });
});
