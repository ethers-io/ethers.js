import assert from "assert";

import { FixedNumber } from "../index.js";

describe("Tests FixedNumber floor", function() {
    const tests: Array<{ value: string, expected: string }> = [
        { value: "0.0", expected: "0.0" },
        { value: "1.0", expected: "1.0" },
        { value: "1.5", expected: "1.0" },
        { value: "1.9", expected: "1.0" },
        { value: "-1.0", expected: "-1.0" },
        { value: "-1.5", expected: "-2.0" },
        { value: "-1.1", expected: "-2.0" },
        { value: "-0.5", expected: "-1.0" },
    ];

    for (const { value, expected } of tests) {
        it(`floors ${ value } to ${ expected }`, function() {
            const actual = FixedNumber.fromString(value).floor().toString();
            assert.equal(actual, expected, `floor(${ value })`);
        });
    }
});

describe("Tests FixedNumber ceiling", function() {
    const tests: Array<{ value: string, expected: string }> = [
        { value: "0.0", expected: "0.0" },
        { value: "1.0", expected: "1.0" },
        { value: "1.5", expected: "2.0" },
        { value: "1.1", expected: "2.0" },
        { value: "0.5", expected: "1.0" },
        { value: "-1.0", expected: "-1.0" },
        { value: "-1.5", expected: "-1.0" },
        { value: "-1.9", expected: "-1.0" },
    ];

    for (const { value, expected } of tests) {
        it(`ceilings ${ value } to ${ expected }`, function() {
            const actual = FixedNumber.fromString(value).ceiling().toString();
            assert.equal(actual, expected, `ceiling(${ value })`);
        });
    }
});
