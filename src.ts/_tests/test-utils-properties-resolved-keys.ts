import assert from "assert";

import { resolveProperties } from "../index.js";

describe("Property helpers: resolved-keys", function() {
    it("resolves an own __proto__ property without changing the output prototype", async function() {
        const value = { marker: "resolved" };
        const input = Object.defineProperty({ ordinary: Promise.resolve(42) }, "__proto__", {
            enumerable: true, value: Promise.resolve(value)
        });
        const result: any = await resolveProperties(input);
        assert.equal(Object.getPrototypeOf(result), Object.prototype);
        assert.equal(Object.prototype.hasOwnProperty.call(result, "__proto__"), true);
        assert.equal(result.__proto__, value);
        assert.equal(result.ordinary, 42);
        assert.deepEqual(Object.keys(result), [ "ordinary", "__proto__" ]);
    });

    it("preserves primitive values of prototype-named properties", async function() {
        const input = JSON.parse('{"__proto__": 42, "constructor": "value", "toString": "text"}');
        assert.deepEqual(await resolveProperties(input), input);
    });

});
