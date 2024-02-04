"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const assert_1 = tslib_1.__importDefault(require("assert"));
const create_provider_js_1 = require("./create-provider.js");
(0, create_provider_js_1.setupProviders)();
describe("Test EIP-2544 ENS wildcards", function () {
    const provider = (0, create_provider_js_1.connect)("goerli");
    it("Resolves recursively", async function () {
        this.timeout(10000);
        const resolver = await provider.getResolver("ricmoose.hatch.eth");
        assert_1.default.ok(resolver, "failed to get resolver");
        assert_1.default.equal(resolver.address, "0x15abA1fa74Bfdecd63A71218DC632d4328Db8168", "address");
        assert_1.default.equal(await resolver.supportsWildcard(), true, "supportsWildcard()");
        // Test pass-through avatar
        assert_1.default.equal(await resolver.getAvatar(), "https:/\/static.ricmoo.com/uploads/profile-06cb9c3031c9.jpg", "getAvatar()");
        assert_1.default.equal(await resolver.getAddress(), "0x4B711A377B1b3534749FBe5e59Bcf7F94d92EA98", "getAddress()");
    });
});
describe("Test ENS-DNS gasless resolver", function () {
    it("Resolved almonit.org", async function () {
        this.timeout(10000);
        const provider = (0, create_provider_js_1.connect)("mainnet");
        const addr = await provider.resolveName("almonit.org");
        assert_1.default.equal(addr, "0x0D59d0f7DcC0fBF0A3305cE0261863aAf7Ab685c", "addr");
    });
});
//# sourceMappingURL=test-providers-wildcard.js.map