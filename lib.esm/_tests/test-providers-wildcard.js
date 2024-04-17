import assert from "assert";
import { connect, setupProviders } from "./create-provider.js";
setupProviders();
describe("Test EIP-2544 ENS wildcards", function () {
    const provider = connect("sepolia");
    it("Resolves recursively", async function () {
        this.timeout(10000);
        const resolver = await provider.getResolver("ricmoose.hatch.eth");
        assert.ok(resolver, "failed to get resolver");
        assert.equal(resolver.address, "0x657D81B1E647A56457ff035Af22898411673f7FD", "address");
        assert.equal(await resolver.supportsWildcard(), true, "supportsWildcard()");
        // Test pass-through avatar
        assert.equal(await resolver.getAvatar(), "https:/\/static.ricmoo.com/uploads/profile-06cb9c3031c9.jpg", "getAvatar()");
        assert.equal(await resolver.getAddress(), "0xF0d6e3fC0f5A23aAAA4933700438b6313Dd331bD", "getAddress()");
    });
});
describe("Test ENS-DNS gasless resolver", function () {
    it("Resolved almonit.org", async function () {
        this.timeout(10000);
        const provider = connect("mainnet");
        const addr = await provider.resolveName("almonit.org");
        assert.equal(addr, "0x0D59d0f7DcC0fBF0A3305cE0261863aAf7Ab685c", "addr");
    });
});
//# sourceMappingURL=test-providers-wildcard.js.map