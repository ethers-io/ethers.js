import assert from "assert";

import { EnsResolver } from "../index.js";

import { connect, setupProviders } from "./create-provider.js";

setupProviders();

type Testcase = {
    title: string;
    name: string;
    address?: string;
    coinType?: number;
    test: {
        forward?: boolean,
        reverse?: boolean,
        text?: { key: string, expected: string },
        content?: string
    }
};

describe("Test ENSv2 migration", function() {
            this.timeout(10000);

    const provider = connect("mainnet");
    const { getCallCount, resetCallCount } = (() => {
        let calls = 0;
        provider.on("debug", (x) => {
            if (x.action === "sendRpcPayload") { calls++; }
        });

        return {
            getCallCount: () => calls,
            resetCallCount: () => { calls = 0; }
        };
    })();


    it("getUniversal", async () => {
        const addr = await EnsResolver.getUniversalResolverAddress(provider);
        assert.equal(addr, "0xeEeEEEeE14D718C2B47D9923Deab1335E144EeEe");
    });

    // Tests from Raffy

    const testsResolver = [
        [ "raffy.eth", "0x84c5AdB77dd9f362A1a3480009992d8d47325dc3" ], // TOR
        [ "apple.wiki.tog.raffy.eth", "0x7CE6Cf740075B5AF6b1681d67136B84431B43AbD"], // TOR (wildcard)
        [ "cap.eth", "0xF29100983E058B709F3D539b0c765937B804AC15" ], // PRv4
        [ "vitalik.eth", "0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63" ], // PRv3
        [ "nick.eth", "0x4976fb03C32e5B8cfe2b6cCB31c09Ba78EBaBa41" ], // PRv2
    ];

    for (const [ name, addr ] of testsResolver) {
        it(`fromName (${name})`, async () => {
            this.timeout(10000);

            resetCallCount();
            const resolver = await provider.getResolver(name);
            assert.ok(resolver);
            assert.equal(resolver.address, addr);
            assert.equal(getCallCount(), 1);
        });
    }

    const testsAddr: Array<Testcase> = [
      {
          title: "forward and reverse: raffy.eth",
          name: "raffy.eth",
          address: "0x51050ec063d393217B436747617aD1C2285Aeeee",
          coinType: undefined,
          test: { forward: true, reverse: true }
      },
      {
          title: "forward and reverse with coinType: raffy.eth",
          name: "raffy.eth",
          address: "0x51050ec063d393217B436747617aD1C2285Aeeee",
          coinType: 60,
          test: { forward: true, reverse: true }
      },

      // See: https://github.com/ensdomains/resolution-tests/blob/main/test-cases.json
      {
          title: "universal-resolver",
          name: "ur.integration-tests.eth",
          address: "0x2222222222222222222222222222222222222222",
          test: { forward: true }
      },
      {
          title: "forward-base-onchain",
          name: "coins.integration-tests.eth",
          address: "0xa66E90D515F576f49Af2dF40952476D56F72A420",
          coinType: 0x80000000 + 8453,
          test: { forward: true }
      },
      {
          title: "forward-wildcard",
          name: "moo331.nft-owner.eth",
          address: "0x51050ec063d393217B436747617aD1C2285Aeeee",
          test: { forward: true }
      },
      {
          title: "forward-eth-offchain",
          name: "test.offchaindemo.eth",
          address: "0x779981590E7Ccc0CFAe8040Ce7151324747cDb97",
          test: { forward: true }
      },
      {
          title: "forward-text-onchain",
          name: "integration-tests.eth",
          test: {
              text: {
                  key: "avatar",
                  expected: "https:/\/raw.githubusercontent.com/ensdomains/resolution-tests/refs/heads/main/assets/avatar.svg"
              }
          }
      },
      {
          title: "forward-text-offchain",
          name: "test.offchaindemo.eth",
          test: {
              text: {
                  key: "description",
                  expected: "asdflkjasdflkjasdf"
              }
          }
      },
      {
          title: "forward-contenthash",
          name: "integration-tests.eth",
          address: "",
          test: {
              // Base-32
              //content: "ipfs:/\/bafybeifx7yeb55armcsxwwitkymga5xf53dxiarykms3ygqic223w5sk3m"
              // Base-58
              content: "ipfs:/\/Qmaisz6NMhDB51cCvNWa1GMS7LU1pAxdF4Ld6Ft9kZEP2a"
          }
      },
      {
          title: "reverse-eth",
          name: "devrel.enslabs.eth",
          address: "0xeE9eeaAB0Bb7D9B969D701f6f8212609EDeA252E",
          test: { reverse: true }
      },
      /*
      {
          title: "reverse-l2",
          name: "coins.integration-tests.eth",
          address: "0xa66E90D515F576f49Af2dF40952476D56F72A420",
          coinType: 0x80000000 + 8453,
          test: { reverse: true }
      },
      */
      {
          title: "reverse-ccip",
          name: "test.antistupid.com",
          address: "0xEB4200f750335eFb67E726485445d302D64B1c8A",
          test: { reverse: true }
      },
      {
          title: "forward-dns-offchain",
          name: "pokersback.com",
          address: "0x534631Bcf33BDb069fB20A93d2fdb9e4D4dD42CF",
          test: { forward: true }
      }
    ];

    for (const { title, name, address, coinType, test } of testsAddr) {
        it(`ENS Test: ${ title }`, async () => {

            if (test.forward) {
                const addr = await provider.resolveName(name, coinType);
                assert.equal(addr, address);
            }
            if (test.reverse) {
                assert.ok(typeof(address) === "string");
                const lookupName = await provider.lookupAddress(address, coinType);
                assert.equal(lookupName, name);
            }

            if (test.text) {
                const resolver = await provider.getResolver(name);
                assert.ok(resolver);
                const value = await resolver.getText(test.text.key);
                assert.equal(value, test.text.expected);
            }

            if (test.content) {
                const resolver = await provider.getResolver(name);
                assert.ok(resolver);
                const value = await resolver.getContentHash();
                assert.equal(value, test.content);
            }
        });
    }

});
