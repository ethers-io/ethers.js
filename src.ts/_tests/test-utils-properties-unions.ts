import assert from "assert";

import { defineProperties, isError } from "../index.js";

describe("Property helpers: unions", function() {
    it("accepts each member of a union type in defineProperties", function() {
        for (const value of [ "text", 42 ]) {
            const item: { value?: string | number } = { };
            defineProperties(item, { value }, { value: " string | number " });
            assert.equal(item.value, value);
            assert.equal(Object.getOwnPropertyDescriptor(item, "value")?.writable, false);
        }
    });

    it("rejects values outside a union type in defineProperties", function() {
        assert.throws(() => {
            defineProperties({ }, { value: true }, { value: "string | number" });
        }, (error) => isError(error, "INVALID_ARGUMENT") &&
            error.argument === "value.value" && error.value === true);
    });

});
