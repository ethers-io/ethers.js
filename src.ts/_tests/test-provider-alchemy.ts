import assert from "assert";
import { setupProviders, getProvider } from "./create-provider.js";
import { AlchemyProvider } from "../index.js"; // import if needed

setupProviders();

describe("AlchemyProvider BNB support", function () {
    it("should create BNB mainnet provider", async function () {
        const provider = getProvider("AlchemyProvider", "bnb");
        //  console.log(provider);
        assert.ok(provider instanceof AlchemyProvider, "provider is AlchemyProvider");
        const chainId = await provider.send("eth_chainId", []);
        assert.equal(parseInt(chainId), 56); // BNB mainnet
    });

    it("should create BNB testnet provider", async function () {
        const provider = getProvider("AlchemyProvider", "bnbt");
        // console.log(provider);
        assert.ok(provider instanceof AlchemyProvider, "provider is AlchemyProvider");
        const chainId = await provider.send("eth_chainId", []);
        assert.equal(parseInt(chainId), 97); // BNB testnet
    });
});
