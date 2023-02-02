import assert from "assert";

import { connect, setupProviders } from "./create-provider.js";

setupProviders();

describe("Test EIP-2544 ENS wildcards", function() {
    const provider = connect("goerli");

    it("Resolves recursively", async function() {
        const resolver = await provider.getResolver("ricmoose.hatch.eth");
        assert.ok(resolver, "failed to get resolver");

        assert.equal(resolver.address, "0x15abA1fa74Bfdecd63A71218DC632d4328Db8168", "address");
        assert.equal(await resolver.supportsWildcard(), true, "supportsWildcard()");

        // Test pass-through avatar
        assert.equal(await resolver.getAvatar(), "https:/\/static.ricmoo.com/uploads/profile-06cb9c3031c9.jpg", "getAvatar()");

        assert.equal(await resolver.getAddress(), "0x4B711A377B1b3534749FBe5e59Bcf7F94d92EA98", "getAddress()");
    });
});
