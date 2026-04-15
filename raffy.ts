import { describe, it, expect } from "bun:test";

import { ethers } from "./lib.esm/index.js";

describe("ENSv2", () => {
	const provider = new ethers.JsonRpcProvider("https://eth.drpc.org", 1, {
		batchMaxCount: 3,
	});

	it("getUniversal", async () => {
		const UR = await ethers.EnsResolver.getUniversal(provider);
		expect(UR?.target).toStrictEqual(
			"0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe",
		);
	});

	it("fromName", async () => {
		const KNOWN = [
			["raffy.eth", "0x84c5AdB77dd9f362A1a3480009992d8d47325dc3"], // TOR
			[
				"apple.wiki.tog.raffy.eth",
				"0x7CE6Cf740075B5AF6b1681d67136B84431B43AbD",
			], // TOR (wildcard)
			["cap.eth", "0xF29100983E058B709F3D539b0c765937B804AC15"], // PRv4
			["vitalik.eth", "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63"], // PRv3
			["nick.eth", "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41"], // PRv2
		];

		await Promise.all(
			KNOWN.map(async ([name, address]) => {
				const resolver = await ethers.EnsResolver.fromName(provider, name);
				expect(resolver?.address).toStrictEqual(address);
			}),
		);
	});

	it("lookupAddress", async () => {
		const address = await ethers.EnsResolver.lookupAddress(
			provider,
			"0x51050ec063d393217B436747617aD1C2285Aeeee",
		);
		expect(address).toStrictEqual("raffy.eth");
	});

	it("lookupAddress (base)", async () => {
		const address = await ethers.EnsResolver.lookupAddress(
			provider,
			"0x51050ec063d393217B436747617aD1C2285Aeeee",
			0x80002105,
		);
		expect(address).toStrictEqual("raffy.eth");
	});

	it("lookupAddress (default)", async () => {
		const address = await ethers.EnsResolver.lookupAddress(
			provider,
			"0x51050ec063d393217B436747617aD1C2285Aeeee",
			0x80000000,
		);
		expect(address).toStrictEqual("raffy.eth");
	});
});
