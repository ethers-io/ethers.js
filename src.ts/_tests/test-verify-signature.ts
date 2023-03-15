import assert from "assert";
import { JsonRpcProvider } from "../index.js";
import { loadTests } from "./utils.js";
import { Wallet } from "../index.js";
import { isMessageSignatureCorrect, isTypedDataSignatureCorrect } from "../utils/index.js"

import type {
    TestCaseTypedData, TestCaseAccount
} from "./types.js";

const provider = new JsonRpcProvider("https://polygon-rpc.com");

describe("Verify message signed with an EOA", function() {
        const testsAcounts = loadTests<TestCaseAccount>("accounts");
        const wallet = new Wallet(testsAcounts[0].privateKey);
        const wallet1 = new Wallet(testsAcounts[1].privateKey);
        const humanMessage = "Hello World";

        it(`sign and verify message`, async function () {
            const signature = await wallet.signMessage(humanMessage);
            const result = await isMessageSignatureCorrect(provider, wallet.address, humanMessage, signature);
            assert.equal(result, true, "failed to verify message with EOA");
        })

        it(`sign and verify message with wrong signer`, async function () {
            const signature = await wallet1.signMessage(humanMessage);
            const result = await isMessageSignatureCorrect(provider, wallet.address, humanMessage, signature);
            assert.equal(result, false, "failed to verify message with EOA");
        })
});


describe("Verify message signed with a smart contract wallet", function() {
    const humanMessage = "Hello World";
    const signer = "0x63c159F17a6B9788902AD749678d94a25fA4e6Be";
    const signature = "0x000000000000000000000000000000000000000000000000000000000003f480000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e0000000000000000000000000000000000000000000000000000000000000004250f4e8cc703d7f87b36439e1d7a7457f1918392ca6ddff7c42e407805de2774b1a63f2232ffd08de9bfd89472412780e847d78ed656f36eb75fe580d5dd5214b1b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000004242bb9d19897b38ce2a1a2a729ab745819d2d68812636324446898e11c9b1aab509108f8a77e8e49793738f247342c1f32e2977f128278848a29ff7f403118b3f1b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000ff3f6d14df43c112ab98834ee1f82083e07c26bf02";
    const signatureWithWrongSigner = "0xa49cbf529399c40a5d5caa3b2b4895664ba3fccdb5a2ff7dbbc3ff7ad2f9fc2b2e4439621254e853152a848374619243d3e94d0545d2b26dbc0b476db97fb9551b00";
    it(`verify message`, async function () {
        const result = await isMessageSignatureCorrect(provider, signer, humanMessage, signature);
        assert.equal(result, true, "failed to verify message with contract wallet");
    })

    it(`verify message with wrong signer`, async function () {
        const result = await isMessageSignatureCorrect(provider, signer, humanMessage, signatureWithWrongSigner);
        assert.equal(result, false, "failed to verify message with contract wallet");
    })
});


describe("Verify message signed with typed data by an EOA (EIP-712)", function() {
    const tests = loadTests<TestCaseTypedData>("typed-data");

    it(`sign and verify typed-data`, async function() {
        const test = tests.filter(t => t.privateKey)[0];
        if (test?.privateKey && test?.signature) {
            const wallet = new Wallet( test?.privateKey );
            const sig = await wallet.signTypedData(tests[0].domain, tests[0].types, tests[0].data);
            const result = await isTypedDataSignatureCorrect(provider, wallet.address, tests[0].domain, tests[0].types, tests[0].data, sig);
            assert.equal(result, true, `failed to verify Typed-Data with EOA`);
        }

    });

    it(`sign and verify typed-data with the wrong key`, async function() {
        const test = tests.filter(t => t.privateKey)[0];
        const test1 = tests.filter(t => t.privateKey)[1];
        if (test?.privateKey && test1?.privateKey ) {
            const wallet = new Wallet(test?.privateKey);
            const wrangWallet = new Wallet(test1?.privateKey);
            const wrangsig = await wrangWallet.signTypedData(tests[0].domain, tests[0].types, tests[0].data);
            const result = await isTypedDataSignatureCorrect(provider, wallet.address, tests[0].domain, tests[0].types, tests[0].data, wrangsig);
            assert.equal(result, false, `failed to verify Typed-Data with EOA`);
        }
    });
});


describe("Verify message signed with typed data by a smart contract wallet (EIP-712 + EIP-1271)", function() {
    const typedDataSmartWallet = {
        "name": "random-0",
        "domain": {
            "name": "Moo é🚀ooéééMooooM🚀 o🚀🚀o  M  oM🚀éo 🚀🚀🚀🚀éoMoéo🚀o",
            "version": "28.44.13"
        },
        "primaryType": "Struct3",
        "types": {
            "Struct3": [{
                "name": "param2",
                "type": "bytes"
            }]
        },
        "message": {
            "param2": "0xdce44ca98616ee629199215ae5401c97040664637c48"
        },
        "encoded": "0xcdf7d44b9a42bfc5a90b1624215e30c70425b44f1c62f94244b32551826d2dd995cff8fcf943ffa581b017b61b02703628c843642652c382dd15c9a471fe28d9",
        "digest": "0xf1a2769507736a9aa306204169e6862f4416e055035d7d2cc9ab6f1921604905"
    }
    const typedDataSmartWalletSignature = "0x000000000000000000000000000000000000000000000000000000000003f480000000000000000000000000000000000000000000000000000000000000006000000000000000000000000000000000000000000000000000000000000000e000000000000000000000000000000000000000000000000000000000000000426c16fc09c9031e7c28ee99c27da3de6ce02967b0d76d820c5e0792ee4154f4711f9f6410ec3dd8e35372161fd92ca91e190fabf46044ae66ee0f921d7906cfe01c000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000042517b11c905757f1fd3117fcb5a34a2130e20d0d7ec2fc08300fc1f4d2070f10b05443f20065fb50c4ab1d4d680c5218f37b409e07bb4c7674466486974131ca61b00000000000000000000000000000000000000000000000000000000000000000000000000000000000000ff3f6d14df43c112ab98834ee1f82083e07c26bf02";
    const typedDataSmartWalletSignatureDiffSigner = "0x318330fd6534393788ade518dbab131010a8c32ac0eab30db429d5bf1b55dccd6c9875a77205ccb3836569265d41ba5be299931af7f6f3646dbde2b739d23f001c00";
    const smartWalletAddr = "0x63c159F17a6B9788902AD749678d94a25fA4e6Be";

    it(`verify typed-data`, async function() {
        const result = await isTypedDataSignatureCorrect(provider, smartWalletAddr, typedDataSmartWallet.domain, typedDataSmartWallet.types, typedDataSmartWallet.message, typedDataSmartWalletSignature);
        assert.equal(result, true, `failed to verify Typed-Data with contract wallet (EIP-1271)`);
    });

    it(`verify typed-data with wrong signer`, async function() {
        const result = await isTypedDataSignatureCorrect(provider, smartWalletAddr, typedDataSmartWallet.domain, typedDataSmartWallet.types, typedDataSmartWallet.message, typedDataSmartWalletSignatureDiffSigner);
        assert.equal(result, false, `failed to verify Typed-Data with contract wallet (EIP-1271)`);
    });
});
