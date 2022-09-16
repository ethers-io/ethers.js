"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const assert_1 = __importDefault(require("assert"));
const create_provider_js_1 = require("./create-provider.js");
describe("Test EIP-2544 ENS wildcards", function () {
    const provider = (0, create_provider_js_1.connect)("ropsten");
    it("Resolves recursively", async function () {
        const resolver = await provider.getResolver("ricmoose.hatch.eth");
        assert_1.default.ok(resolver, "failed to get resolver");
        assert_1.default.equal(resolver.address, "0x8fc4C380c5d539aE631daF3Ca9182b40FB21D1ae", "address");
        assert_1.default.equal(await resolver.supportsWildcard(), true, "supportsWildcard()");
        // Test pass-through avatar
        assert_1.default.equal(await resolver.getAvatar(), "https:/\/static.ricmoo.com/uploads/profile-06cb9c3031c9.jpg", "getAvatar()");
        assert_1.default.equal(await resolver.getAddress(), "0x4FaBE0A3a4DDd9968A7b4565184Ad0eFA7BE5411", "getAddress()");
    });
});
//# sourceMappingURL=test-providers-wildcard.js.map