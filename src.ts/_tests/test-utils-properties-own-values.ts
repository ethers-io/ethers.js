import assert from "assert";

import { defineProperties } from "../index.js";

describe("Property helpers: own-values", function() {
    it("ignores inherited entries in the type map", function() {
        const item: { own?: number } = { };
        defineProperties(item, { own: 42 }, Object.create({ own: "string" }));
        assert.equal(item.own, 42);
    });

    it("defines only own values from objects with inherited properties", function() {
        const values = Object.assign(Object.create({ inherited: "ignored" }), { own: 42 });
        const item: any = { };
        defineProperties(item, values);
        assert.deepEqual(Object.keys(item), [ "own" ]);
        assert.equal(item.own, 42);
        assert.equal(Object.prototype.hasOwnProperty.call(item, "inherited"), false);
    });

    it("supports values with a null prototype", function() {
        const values = Object.assign(Object.create(null), { own: 42 });
        const item: any = { };
        defineProperties(item, values);
        assert.equal(item.own, 42);
    });

});
