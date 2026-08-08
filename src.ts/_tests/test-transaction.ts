import assert from "assert";
import { loadTests } from "./utils.js";
import type { TestCaseTransaction, TestCaseTransactionTx } from "./types.js";


import { isError, Transaction } from "../index.js";


const BN_0 = BigInt(0);

describe("Tests Unsigned Transaction Serializing", function() {
    const tests = loadTests<TestCaseTransaction>("transactions");

    for (const test of tests) {
        it(`serialized unsigned legacy transaction: ${ test.name }`, function() {
            const txData = Object.assign({ }, test.transaction, {
                type: 0,
                accessList: undefined,
                maxFeePerGas: undefined,
                maxPriorityFeePerGas: undefined
            });

            // Use the testcase sans the chainId for a legacy test
            if (txData.chainId != null && parseInt(txData.chainId) != 0) { txData.chainId = "0x00"; }

            const tx = Transaction.from(txData);
            assert.equal(tx.unsignedSerialized, test.unsignedLegacy, "unsignedLegacy");
        });
    }

    for (const test of tests) {
        // Unsupported parameters for EIP-155; i.e. unspecified chain ID
        if (!test.unsignedEip155) { continue; }
        it(`serialized unsigned EIP-155 transaction: ${ test.name }`, function() {
            const txData = Object.assign({ }, test.transaction, {
                type: 0,
                accessList: undefined,
                maxFeePerGas: undefined,
                maxPriorityFeePerGas: undefined
            });

            const tx = Transaction.from(txData);
            assert.equal(tx.unsignedSerialized, test.unsignedEip155, "unsignedEip155");
        });
    }

    for (const test of tests) {
        it(`serialized unsigned Berlin transaction: ${ test.name }`, function() {
            const txData = Object.assign({ }, test.transaction, {
                type: 1,
                maxFeePerGas: undefined,
                maxPriorityFeePerGas: undefined
            });

            const tx = Transaction.from(txData);
            assert.equal(tx.unsignedSerialized, test.unsignedBerlin, "unsignedBerlin");
        });
    }

    for (const test of tests) {
        it(`serialized unsigned London transaction: ${ test.name }`, function() {
            const txData = Object.assign({ }, test.transaction, { type: 2 });
            const tx = Transaction.from(txData);
            assert.equal(tx.unsignedSerialized, test.unsignedLondon, "unsignedLondon");
        });
    }

    for (const test of tests) {
        if (!test.unsignedCancun) { continue; }
        it(`serialized unsigned cancun transaction: ${ test.name }`, function() {
            const txData = Object.assign({ }, test.transaction, { type: 3 });
            const tx = Transaction.from(txData);
            assert.equal(tx.unsignedSerialized, test.unsignedCancun, "unsignedCancun");
        });
    }
});

describe("Tests Signed Transaction Serializing", function() {
    const tests = loadTests<TestCaseTransaction>("transactions");

    for (const test of tests) {
        it(`serialized signed legacy transaction: ${ test.name }`, function() {
            const txData = Object.assign({ }, test.transaction, {
                type: 0,
                accessList: undefined,
                maxFeePerGas: undefined,
                maxPriorityFeePerGas: undefined,
                signature: test.signatureLegacy
            });

            // Use the testcase sans the chainId for a legacy test
            if (txData.chainId != null && parseInt(txData.chainId) != 0) { txData.chainId = "0x00"; }

            const tx = Transaction.from(txData);
            assert.equal(tx.serialized, test.signedLegacy, "signedLegacy");
        });
    }

    for (const test of tests) {
        if (!test.unsignedEip155) { continue; }
        it(`serialized signed EIP-155 transaction: ${ test.name }`, function() {
            const txData = Object.assign({ }, test.transaction, {
                type: 0,
                accessList: undefined,
                maxFeePerGas: undefined,
                maxPriorityFeePerGas: undefined,
                signature: test.signatureEip155
             });

            const tx = Transaction.from(txData);
            assert.equal(tx.serialized, test.signedEip155, "signedEip155");
        });
    }

    for (const test of tests) {
        it(`serialized signed Berlin transaction: ${ test.name }`, function() {
            const txData = Object.assign({ }, test.transaction, {
                type: 1,
                maxFeePerGas: undefined,
                maxPriorityFeePerGas: undefined
            }, { signature: test.signatureBerlin });

            const tx = Transaction.from(txData);
            assert.equal(tx.serialized, test.signedBerlin, "signedBerlin");
        });
    }

    for (const test of tests) {
        it(`serialized signed London transaction: ${ test.name }`, function() {
            const txData = Object.assign({ }, test.transaction, {
                type: 2,
                signature: test.signatureLondon
            });

            const tx = Transaction.from(txData);
            assert.equal(tx.serialized, test.signedLondon, "signedLondon");
        });
    }

    for (const test of tests) {
        if (!test.signedCancun) { continue; }

        it(`serialized signed Cancun transaction: ${ test.name }`, function() {
            const txData = Object.assign({ }, test.transaction, {
                type: 3,
                signature: test.signatureCancun
            });

            const tx = Transaction.from(txData);
            assert.equal(tx.serialized, test.signedCancun, "signedCancun");
        });
    }
});

function assertTxUint(actual: null | bigint, _expected: undefined | string, name: string): void {
    const expected = (_expected != null ? BigInt(_expected): null);
    assert.equal(actual, expected, name);
}

function assertTxEqual(actual: Transaction, expected: TestCaseTransactionTx): void {
    assert.equal(actual.to, expected.to, "to");
    assert.equal(actual.nonce, expected.nonce, "nonce");

    assertTxUint(actual.gasLimit, expected.gasLimit, "gasLimit");

    assertTxUint(actual.gasPrice, expected.gasPrice, "gasPrice");
    assertTxUint(actual.maxFeePerGas, expected.maxFeePerGas, "maxFeePerGas");
    assertTxUint(actual.maxPriorityFeePerGas, expected.maxPriorityFeePerGas, "maxPriorityFeePerGas");

    assert.equal(actual.data, expected.data, "data");
    assertTxUint(actual.value, expected.value, "value");

    if (expected.accessList) {
        assert.equal(JSON.stringify(actual.accessList), JSON.stringify(expected.accessList), "accessList");
    } else {
        assert.equal(actual.accessList, null, "accessList:!null");
    }

    assertTxUint(actual.chainId, expected.chainId, "chainId");
}

function addDefault(tx: any, key: string, defaultValue: any): void {
    if (tx[key] == null) { tx[key] = defaultValue; }
}

function addDefaults(tx: any): any {
    tx = Object.assign({ }, tx);
    addDefault(tx, "nonce", 0);
    addDefault(tx, "gasLimit", BN_0);
    addDefault(tx, "gasPrice", BN_0);
    addDefault(tx, "maxFeePerGas", BN_0);
    addDefault(tx, "maxPriorityFeePerGas", BN_0);
    addDefault(tx, "value", BN_0);
    addDefault(tx, "data", "0x");
    addDefault(tx, "accessList", [ ]);
    addDefault(tx, "chainId", BN_0);
    return tx;
}

describe("Tests Unsigned Transaction Parsing", function() {
    const tests = loadTests<TestCaseTransaction>("transactions");

    for (const test of tests) {
        it(`parses unsigned legacy transaction: ${ test.name }`, function() {
            const tx = Transaction.from(test.unsignedLegacy);

            const expected = addDefaults(test.transaction);
            expected.maxFeePerGas = null;
            expected.maxPriorityFeePerGas = null;
            expected.accessList = null;
            expected.chainId = BN_0;

            assertTxEqual(tx, expected);
        });
    }

    for (const test of tests) {
        if (!test.unsignedEip155) { continue; }
        it(`parses unsigned EIP-155 transaction: ${ test.name }`, function() {
            const tx = Transaction.from(test.unsignedEip155);

            const expected = addDefaults(test.transaction);
            expected.maxFeePerGas = null;
            expected.maxPriorityFeePerGas = null;
            expected.accessList = null;

            assertTxEqual(tx, expected);
        });
    }

    for (const test of tests) {
        it(`parses unsigned Berlin transaction: ${ test.name }`, function() {
            const tx = Transaction.from(test.unsignedBerlin);

            const expected = addDefaults(test.transaction);
            expected.maxFeePerGas = null;
            expected.maxPriorityFeePerGas = null;

            assertTxEqual(tx, expected);
        });
    }

    for (const test of tests) {
        it(`parses unsigned London transaction: ${ test.name }`, function() {
            const tx = Transaction.from(test.unsignedLondon);

            const expected = addDefaults(test.transaction);
            expected.gasPrice = null;

            assertTxEqual(tx, expected);
        });
    }

    for (const test of tests) {
        if (!test.unsignedCancun) { continue; }
        it(`parses unsigned Cancun transaction: ${ test.name }`, function() {
            const tx = Transaction.from(test.unsignedCancun);

            const expected = addDefaults(test.transaction);
            expected.gasPrice = null;

            assertTxEqual(tx, expected);
        });
    }
});

describe("Tests Signed Transaction Parsing", function() {
    const tests = loadTests<TestCaseTransaction>("transactions");

    for (const test of tests) {
        it(`parses signed legacy transaction: ${ test.name }`, function() {
            let tx = Transaction.from(test.signedLegacy);

            const expected = addDefaults(test.transaction);
            expected.maxFeePerGas = null;
            expected.maxPriorityFeePerGas = null;
            expected.accessList = null;
            expected.chainId = BN_0;

            for (let i = 0; i < 2; i++) {
                assertTxEqual(tx, expected);

                assert.equal(tx.typeName, "legacy", "typeName");
                assert.equal(tx.isLegacy(), true, "isLegacy");
                assert.equal(tx.isBerlin(), false, "isBerlin");
                assert.equal(tx.isLondon(), false, "isLondon");

                assert.ok(!!tx.signature, "signature:!null")
                assert.equal(tx.signature.r, test.signatureLegacy.r, "signature.r");
                assert.equal(tx.signature.s, test.signatureLegacy.s, "signature.s");
                assert.equal(BigInt(tx.signature.v), BigInt(test.signatureLegacy.v), "signature.v");

                tx = tx.clone();
            }
        });
    }

    for (const test of tests) {
        if (!test.unsignedEip155) { continue; }
        it(`parses signed EIP-155 transaction: ${ test.name }`, function() {
            let tx = Transaction.from(test.signedEip155);

            const expected = addDefaults(test.transaction);
            expected.maxFeePerGas = null;
            expected.maxPriorityFeePerGas = null;
            expected.accessList = null;

            for (let i = 0; i < 2; i++) {
                assertTxEqual(tx, expected);

                assert.equal(tx.typeName, "legacy", "typeName");
                assert.equal(tx.isLegacy(), true, "isLegacy");
                assert.equal(tx.isBerlin(), false, "isBerlin");
                assert.equal(tx.isLondon(), false, "isLondon");
                assert.equal(tx.isCancun(), false, "isCancun");

                assert.ok(!!tx.signature, "signature:!null")
                assert.equal(tx.signature.r, test.signatureEip155.r, "signature.r");
                assert.equal(tx.signature.s, test.signatureEip155.s, "signature.s");
                assert.equal(tx.signature.networkV, BigInt(test.signatureEip155.v), "signature.v");

                tx = tx.clone();
            }
        });
    }

    for (const test of tests) {
        it(`parses signed Berlin transaction: ${ test.name }`, function() {
            let tx = Transaction.from(test.signedBerlin);

            const expected = addDefaults(test.transaction);
            expected.maxFeePerGas = null;
            expected.maxPriorityFeePerGas = null;

            for (let i = 0; i < 2; i++) {
                assertTxEqual(tx, expected);

                assert.equal(tx.typeName, "eip-2930", "typeName");
                assert.equal(tx.isLegacy(), false, "isLegacy");
                assert.equal(tx.isBerlin(), true, "isBerlin");
                assert.equal(tx.isLondon(), false, "isLondon");
                assert.equal(tx.isCancun(), false, "isCancun");

                assert.ok(!!tx.signature, "signature:!null")
                assert.equal(tx.signature.r, test.signatureBerlin.r, "signature.r");
                assert.equal(tx.signature.s, test.signatureBerlin.s, "signature.s");
                assert.equal(tx.signature.yParity, parseInt(test.signatureBerlin.v), "signature.v");

                tx = tx.clone();
            }
        });
    }

    for (const test of tests) {
        it(`parses signed London transaction: ${ test.name }`, function() {
            let tx = Transaction.from(test.signedLondon);

            const expected = addDefaults(test.transaction);
            expected.gasPrice = null;

            for (let i = 0; i < 2; i++) {
                assertTxEqual(tx, expected);

                assert.equal(tx.typeName, "eip-1559", "typeName");
                assert.equal(tx.isLegacy(), false, "isLegacy");
                assert.equal(tx.isBerlin(), false, "isBerlin");
                assert.equal(tx.isLondon(), true, "isLondon");
                assert.equal(tx.isCancun(), false, "isCancun");

                assert.ok(!!tx.signature, "signature:!null")
                assert.equal(tx.signature.r, test.signatureLondon.r, "signature.r");
                assert.equal(tx.signature.s, test.signatureLondon.s, "signature.s");
                assert.equal(tx.signature.yParity, parseInt(test.signatureLondon.v), "signature.v");

                // Test cloning
                tx = tx.clone();
            }
        });
    }

    for (const test of tests) {
        if (!test.signedCancun) { continue; }
        it(`parses signed Cancun transaction: ${ test.name }`, function() {
            let tx = Transaction.from(test.signedCancun);

            const expected = addDefaults(test.transaction);
            expected.gasPrice = null;

            for (let i = 0; i < 2; i++) {
                assertTxEqual(tx, expected);

                assert.equal(tx.typeName, "eip-4844", "typeName");
                assert.equal(tx.isLegacy(), false, "isLegacy");
                assert.equal(tx.isBerlin(), false, "isBerlin");
                assert.equal(tx.isLondon(), false, "isLondon");
                assert.equal(tx.isCancun(), true, "isCancun");

                assert.ok(!!tx.signature, "signature:!null")
                assert.equal(tx.signature.r, test.signatureCancun.r, "signature.r");
                assert.equal(tx.signature.s, test.signatureCancun.s, "signature.s");
                assert.equal(tx.signature.yParity, parseInt(test.signatureCancun.v), "signature.v");

                // Test cloning
                tx = tx.clone();
            }
        });
    }
});

describe("Tests Transaction Parameters", function() {
    const badData: Array<{ name: string, data: string, argument: string, message?: string }> = [
        {
            name: "accessList=0x09",
            data: "0x02c9010203040580070809",
            message: "invalid access list",
            argument: "accessList"
        },
        {
            name: "accessList=[0x09]",
            data: "0x02ca0102030405800708c109",
            message: "invalid address-slot set",
            argument: "accessList"
        },
        {
            name: "accessList=[0x09,0x10]",
            data: "0x02cb0102030405800708c20910",
            message: "invalid address-slot set",
            argument: "accessList"
        },
        {
            name: "accessList=[0x09,[HASH]] (bad address)",
            data: "0x02ed0102030405800708e4e309e1a024412927c99a717115f5308c0ebd11136659b3cb6291abb4a8f87e9856a12538",
            message: "invalid address",
            argument: "accessList"
        },
        {
            name: "accessList=[ADDR,[0x09]] (bad slot)",
            data: "0x02e10102030405800708d8d794939d33ff01840e9eeeb67525ec2f7035af41a4b1c109",
            message: "invalid slot",
            argument: "accessList"
        }
    ];

    for (const { name, data, argument, message } of badData) {
        it (`correctly fails on bad accessList: ${ name }`, function() {
            assert.throws(() => {
                // The access list is a single value: 0x09 instead of
                // structured data
                const result = Transaction.from(data);
                console.log(result);
            }, (error: any) => {
                return (isError(error, "INVALID_ARGUMENT") &&
                    error.argument === argument &&
                    (message == null || error.message.startsWith(message)));
            });
        });

    }
});

describe("Tests Transaction JSON Round-Trip", function() {
    const tests = loadTests<TestCaseTransaction>("transactions");

    // Each test walks the entire testcase set, so the default 2s is tight
    this.timeout(60000);

    // Real, on-chain transactions. The shared testcases contain no EIP-7702
    // transaction at all, and these additionally pin the round-trip against
    // bytes a node actually produced.

    // https://etherscan.io/tx/0x57482e4115a77b3250c0bb79f56e86f1fdd15ad188f562984312794c5810bb23
    const mainnetEip7702 = "0x04f8c901808477359400847c6ee93683010fc5947ec7bf1d9ac17969bc44e1aef9e803f7e310ded38080c0f85cf85a019463c0c19a282a1b52b07dd5a65b58948a07dae32b0101a0aeec31d7cb51ebfbf70564e17d75f52c9aeeceb423df65289dd911a1447b7b92a06aa24b1501b99ce094238aae9addf76827d560f916092ad5e099b3eeaaab4ae401a07a5e3a20811f8c5d784d45bb84069353df5cedc1d8ac772ca9c99afb5972818ba044fa7428939114b3fda67e54af5d8cd781c1a8278f43f69c4f5dc54fac42fb1c";

    // https://etherscan.io/tx/0x8bfd1c44ac1795fcaa7cccf717975f99de6ead5a9f9c73ae6040348cb4b2f1be
    const mainnetEip4844 = "0x03f904a40183015976843b9aca0085027a69ce6483061a8094bd0d173eeb87d57a09521c24388a12789f33ba9680b901a4917cf8ac0000000000000000000000000000000000000000000000000000000000015977000000000000000000000000000000000000000000000000000000000001a3f100000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001d643b80000000000000000000000000000000000000000000000000000000001d645a10140c3b797253331a501a7b41c8aff79c6ac17b31c5b21299e643a1552425844000000000000000000000000000000000000000000000000000000000000000d000000000000000000000000daa526086787d9debe1d7f3ffdb1fe50cf8687f40000000000000000000000000000000000000000000000000000000001884628000000000000000000000000000000000000000000000000000000006a76ba7b000000000000000000000000000000000000000000000000000000000001a3e60000000000000000000000000000000000000000000000000000000003c33b678a68eb1f5a927f70bf0ecae1178262936789b6e8c763697a5e6ab3ba09490083f90223f8dd94bd0d173eeb87d57a09521c24388a12789f33ba96f8c6a00000000000000000000000000000000000000000000000000000000000000000a00000000000000000000000000000000000000000000000000000000000000001a0000000000000000000000000000000000000000000000000000000000000000aa0b53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103a0360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbca0d89986db8de948a4d23da9fd6fa217aa05166251f666d5d2bb345eefd323354bf9014194df8755334ce7a73ccf6b581c02ea649ae3e864b3f90129a00000000000000000000000000000000000000000000000000000000000000006a00000000000000000000000000000000000000000000000000000000000000007a00000000000000000000000000000000000000000000000000000000000000009a0000000000000000000000000000000000000000000000000000000000000000aa0b53127684a568b3173ae13b9f8a6016e243e63b6e8ee1178d6a717850b5d6103a0360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbca0a66cc928b5edb82af9bd49922954155ab7b0942694bea4ce44661d9a87381ffea0a66cc928b5edb82af9bd49922954155ab7b0942694bea4ce44661d9a87381fffa0f652222313e28459528d920b65115c16c04f3efc82aaedc97be59f3f377db12f84020482aef863a001f2c94526a287a157ca575cba4fb2b8feef24693a1912435a973252d9833f3ca001987a408e5718d9d3a438f170b4fdb3b8761e05a762e5e8422b2963a0279ee9a001f0432958fcd89f6b84f3082c29460505eb8f59381098a19150501e5f762d2580a0d11595017fbcc0781d6c3856cc4e93419531d76f614a2ca258c1a73e9f603bffa041579bad5aa8c2f108c64bb38c6ad1fb8f98a9e1db30512c3b846057671c5145";

    // A toJSON result must survive an actual JSON encode; i.e. no bigints
    function roundTrip(tx: Transaction): Transaction {
        return Transaction.from(JSON.parse(JSON.stringify(tx.toJSON())));
    }

    // A byte-identical serialized re-encoding implies a matching hash and
    // recovered sender, so those are only asserted on the mainnet cases
    // below, where they can be pinned against real on-chain values.
    function assertSignedRoundTrip(raw: string, name: string): Transaction {
        const tx = Transaction.from(raw);
        const copy = roundTrip(tx);

        assert.equal(copy.type, tx.type, `${ name }: type`);
        assert.equal(copy.unsignedSerialized, tx.unsignedSerialized, `${ name }: unsignedSerialized`);
        assert.equal(copy.serialized, raw, `${ name }: serialized`);

        return copy;
    }

    it("round-trips signed legacy transactions", function() {
        for (const test of tests) {
            assertSignedRoundTrip(test.signedLegacy, `legacy ${ test.name }`);
        }
    });

    it("round-trips signed EIP-155 transactions", function() {
        for (const test of tests) {
            if (!test.unsignedEip155) { continue; }
            assertSignedRoundTrip(test.signedEip155, `eip-155 ${ test.name }`);
        }
    });

    it("round-trips signed Berlin transactions", function() {
        for (const test of tests) {
            assertSignedRoundTrip(test.signedBerlin, `berlin ${ test.name }`);
        }
    });

    it("round-trips signed London transactions", function() {
        for (const test of tests) {
            assertSignedRoundTrip(test.signedLondon, `london ${ test.name }`);
        }
    });

    it("round-trips signed Cancun transactions", function() {
        for (const test of tests) {
            if (!test.signedCancun) { continue; }
            const copy = assertSignedRoundTrip(test.signedCancun, `cancun ${ test.name }`);
            const tx = Transaction.from(test.signedCancun);
            assert.equal(copy.maxFeePerBlobGas, tx.maxFeePerBlobGas, `cancun ${ test.name }: maxFeePerBlobGas`);
            assert.deepEqual(copy.blobVersionedHashes, tx.blobVersionedHashes, `cancun ${ test.name }: blobVersionedHashes`);
        }
    });

    it("round-trips unsigned transactions", function() {
        for (const test of tests) {
            for (const raw of [ test.unsignedLegacy, test.unsignedBerlin, test.unsignedLondon, test.unsignedCancun ]) {
                if (!raw) { continue; }
                const tx = Transaction.from(raw);
                const copy = roundTrip(tx);
                assert.equal(copy.signature, null, `${ test.name }: signature`);
                assert.equal(copy.unsignedSerialized, raw, `${ test.name }: unsignedSerialized`);
                assert.equal(copy.unsignedHash, tx.unsignedHash, `${ test.name }: unsignedHash`);
            }
        }
    });

    it("round-trips an EIP-4844 transaction with BLObs (mainnet)", function() {
        const tx = Transaction.from(mainnetEip4844);
        const copy = assertSignedRoundTrip(mainnetEip4844, "eip-4844");

        assert.equal(copy.hash, "0x8bfd1c44ac1795fcaa7cccf717975f99de6ead5a9f9c73ae6040348cb4b2f1be", "hash");
        assert.equal(copy.from, "0xDaa526086787d9DEbE1D7F3FFdb1fE50cf8687F4", "from");

        assert.equal(copy.maxFeePerBlobGas, tx.maxFeePerBlobGas, "maxFeePerBlobGas");
        assert.equal((copy.blobVersionedHashes || [ ]).length, 3, "blobVersionedHashes.length");
        assert.deepEqual(copy.blobVersionedHashes, tx.blobVersionedHashes, "blobVersionedHashes");
    });

    it("round-trips an EIP-7702 transaction with authorizations (mainnet)", function() {
        const tx = Transaction.from(mainnetEip7702);
        const copy = assertSignedRoundTrip(mainnetEip7702, "eip-7702");

        assert.equal(copy.hash, "0x57482e4115a77b3250c0bb79f56e86f1fdd15ad188f562984312794c5810bb23", "hash");
        assert.equal(copy.from, "0x7eC7BF1d9ac17969bC44E1AEF9E803f7E310deD3", "from");

        const auths = copy.authorizationList;
        const expected = tx.authorizationList;
        assert.ok(auths != null && expected != null, "authorizationList:!null");
        assert.equal(auths.length, 1, "authorizationList.length");

        for (let i = 0; i < expected.length; i++) {
            assert.equal(auths[i].address, expected[i].address, `auth[${ i }].address`);
            assert.equal(auths[i].chainId, expected[i].chainId, `auth[${ i }].chainId`);
            assert.equal(auths[i].nonce, expected[i].nonce, `auth[${ i }].nonce`);
            assert.equal(auths[i].signature.r, expected[i].signature.r, `auth[${ i }].signature.r`);
            assert.equal(auths[i].signature.s, expected[i].signature.s, `auth[${ i }].signature.s`);
            assert.equal(auths[i].signature.yParity, expected[i].signature.yParity, `auth[${ i }].signature.yParity`);
        }
    });
});
