import assert from "assert";

import { FixedNumber } from "../index.js";

describe("Tests FixedNumber.round", function() {
    // [ value, decimals, expected ]; "rounded up on ties", nearest otherwise
    const tests: Array<[ string, number, string ]> = [
        [ "1.7", 0, "2.0" ],
        [ "1.2", 0, "1.0" ],
        [ "1.5", 0, "2.0" ],
        [ "3", 0, "3.0" ],
        [ "-3", 0, "-3.0" ],
        [ "-1.7", 0, "-2.0" ],
        [ "-1.2", 0, "-1.0" ],
        [ "-0.6", 0, "-1.0" ],
        [ "-1.5", 0, "-1.0" ],
        [ "-2.5", 0, "-2.0" ],
        [ "-0.4", 0, "0.0" ],
        [ "-1.26", 1, "-1.3" ],
        [ "-1.25", 1, "-1.2" ],
        [ "-123.456", 2, "-123.46" ],
        [ "-123.455", 2, "-123.45" ],
        [ "-0.000000000000000001", 0, "0.0" ],
    ];

    for (const [ value, decimals, expected ] of tests) {
        it(`rounds ${ value } to ${ decimals } decimals`, function() {
            assert.equal(FixedNumber.fromString(value).round(decimals).toString(), expected);
        });
    }
});
