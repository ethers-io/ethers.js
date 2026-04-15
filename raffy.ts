import { describe, it, expect } from "bun:test";

import { ethers } from "./lib.esm/index.js";

const BASE_COIN_TYPE = 0x80002105n;
const DEFAULT_COIN_TYPE = 0x80000000n;

describe("ENSv2", () => {
	const provider = new ethers.JsonRpcProvider("https://eth.drpc.org", 1, {
		batchMaxCount: 1,
		staticNetwork: true,
	});
	let calls = 0;
	provider.on("debug", (x) => {
		if (x.action === "sendRpcPayload") {
			++calls;
		}
	});

	it("getUniversal", async () => {
		const UR = await ethers.EnsResolver.getUniversal(provider);
		expect(UR?.target).toStrictEqual(
			"0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe",
		);
	});

	[
		["raffy.eth", "0x84c5AdB77dd9f362A1a3480009992d8d47325dc3"], // TOR
		["apple.wiki.tog.raffy.eth", "0x7CE6Cf740075B5AF6b1681d67136B84431B43AbD"], // TOR (wildcard)
		["cap.eth", "0xF29100983E058B709F3D539b0c765937B804AC15"], // PRv4
		["vitalik.eth", "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"], // PRv3
		["nick.eth", "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41"], // PRv2
	].forEach(([name, address]) => {
		it(`fromName (${name})`, async () => {
			calls = 0;
			const resolver = await provider.getResolver(name);
			expect(resolver?.address).toStrictEqual(address);
			expect(calls).toStrictEqual(1);
		});
	});

	it("resolveName", async () => {
		const address = await provider.resolveName("raffy.eth");
		expect(address).toStrictEqual("0x51050ec063d393217B436747617aD1C2285Aeeee");
	});

	it("resolveName (base)", async () => {
		const address = await provider.resolveName("raffy.eth", BASE_COIN_TYPE);
		expect(address).toStrictEqual("0x51050ec063d393217B436747617aD1C2285Aeeee");
	});

	it("resolveName (default)", async () => {
		const address = await provider.resolveName("raffy.eth", DEFAULT_COIN_TYPE);
		expect(address).toStrictEqual("0x51050ec063d393217B436747617aD1C2285Aeeee");
	});

	it("lookupAddress", async () => {
		const name = await provider.lookupAddress(
			"0x51050ec063d393217B436747617aD1C2285Aeeee",
		);
		expect(name).toStrictEqual("raffy.eth");
	});

	it("lookupAddress (base)", async () => {
		const name = await provider.lookupAddress(
			"0x51050ec063d393217B436747617aD1C2285Aeeee",
			BASE_COIN_TYPE,
		);
		expect(name).toStrictEqual("raffy.eth");
	});

	it("lookupAddress (default)", async () => {
		const name = await provider.lookupAddress(
			"0x51050ec063d393217B436747617aD1C2285Aeeee",
			DEFAULT_COIN_TYPE,
		);
		expect(name).toStrictEqual("raffy.eth");
	});
});
