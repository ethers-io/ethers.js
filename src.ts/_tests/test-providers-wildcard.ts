import assert from "assert";

import { connect } from "./create-provider.js";

describe("Test EIP-2544 ENS wildcards", function() {
    const provider = connect("ropsten");

    it("Resolves recursively", async function() {
        const resolver = await provider.getResolver("ricmoose.hatch.eth");
        assert.ok(resolver, "failed to get resolver");

        assert.equal(resolver.address, "0x8fc4C380c5d539aE631daF3Ca9182b40FB21D1ae", "address");
        assert.equal(await resolver.supportsWildcard(), true, "supportsWildcard()");

        // Test pass-through avatar
        assert.equal(await resolver.getAvatar(), "https:/\/static.ricmoo.com/uploads/profile-06cb9c3031c9.jpg", "getAvatar()");

        assert.equal(await resolver.getAddress(), "0x4FaBE0A3a4DDd9968A7b4565184Ad0eFA7BE5411", "getAddress()");
    });
});
