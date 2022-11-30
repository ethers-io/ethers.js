import assert from "assert";
import { loadTests } from "./utils.js";
import { isError, decryptCrowdsaleJson, decryptKeystoreJson, decryptKeystoreJsonSync, encryptKeystoreJson, encryptKeystoreJsonSync, isCrowdsaleJson, HDNodeWallet, Wallet } from "../index.js";
describe("Tests JSON Wallet Formats", function () {
    const tests = loadTests("wallets");
    tests.forEach((test) => {
        if (test.type !== "crowdsale") {
            return;
        }
        it(`tests decrypting Crowdsale JSON: ${test.name}`, async function () {
            const password = Buffer.from(test.password.substring(2), "hex");
            const account = decryptCrowdsaleJson(test.content, password);
            assert.equal(account.address, test.address, "address");
        });
    });
    tests.forEach((test) => {
        if (test.type !== "keystore") {
            return;
        }
        it(`tests decrypting Keystore JSON (sync): ${test.name}`, function () {
            this.timeout(20000);
            const password = Buffer.from(test.password.substring(2), "hex");
            const account = decryptKeystoreJsonSync(test.content, password);
            //console.log(account);
            assert.equal(account.address, test.address, "address");
        });
    });
    tests.forEach((test) => {
        if (test.type !== "keystore") {
            return;
        }
        it(`tests decrypting Keystore JSON (async): ${test.name}`, async function () {
            this.timeout(20000);
            const password = Buffer.from(test.password.substring(2), "hex");
            const account = await decryptKeystoreJson(test.content, password);
            //console.log(account);
            assert.equal(account.address, test.address, "address");
        });
    });
    tests.forEach((test) => {
        it(`tests decrypting JSON (sync): ${test.name}`, function () {
            this.timeout(20000);
            const password = Buffer.from(test.password.substring(2), "hex");
            const wallet = Wallet.fromEncryptedJsonSync(test.content, password);
            //console.log(wallet);
            assert.equal(wallet.address, test.address, "address");
        });
    });
    tests.forEach((test) => {
        it(`tests decrypting JSON (async): ${test.name}`, async function () {
            this.timeout(20000);
            const password = Buffer.from(test.password.substring(2), "hex");
            const wallet = await Wallet.fromEncryptedJson(test.content, password);
            //console.log(wallet);
            assert.equal(wallet.address, test.address, "address");
        });
    });
    it("tests encrypting wallet with mnemonic", function () {
        this.timeout(20000);
        const wallet = HDNodeWallet.createRandom();
        assert.ok(wallet.mnemonic, "mnemonic");
        const phrase = wallet.mnemonic.phrase;
        const json = wallet.encryptSync("foobar");
        const wallet2 = Wallet.fromEncryptedJsonSync(json, "foobar");
        assert.ok(wallet2 instanceof HDNodeWallet && wallet2.mnemonic);
        assert.equal(wallet2.mnemonic.phrase, phrase, "phrase");
        assert.equal(wallet2.address, wallet.address, "address");
    });
});
describe("Tests Extra JSON Wallet Functions", function () {
    const badCrowdsales = [
        {
            name: "undefined",
            value: undefined
        },
        {
            name: "junk string",
            value: "junk!"
        },
        {
            name: "non-string",
            value: 42
        },
        {
            name: "JSON without encseed",
            value: JSON.stringify({ foo: "bar" })
        },
    ];
    for (const { name, value } of badCrowdsales) {
        it(`tests the invalid isCrowdsale wallet: ${name}`, function () {
            assert.equal(isCrowdsaleJson(value), false);
        });
    }
    const badKeystoreOptions = [
        {
            name: "invalid salt type",
            options: { salt: 42 },
            error: "invalid BytesLike value"
        },
        {
            name: "invalid uuid type",
            options: { uuid: 42 },
            error: "invalid BytesLike value"
        },
        {
            name: "invalid uuid length",
            options: { uuid: "0x1234" },
            error: "invalid options.uuid"
        },
        {
            name: "invalid iv type",
            options: { iv: 42 },
            error: "invalid BytesLike value"
        },
        {
            name: "invalid iv length",
            options: { iv: "0x1234" },
            error: "invalid options.iv"
        },
        {
            name: "invalid scrypt N (non-one-hot-encoded)",
            options: { scrypt: { N: 1023 } },
            error: "invalid scrypt N parameter"
        },
        {
            name: "invalid scrypt N (non-integer)",
            options: { scrypt: { N: 1.5 } },
            error: "invalid scrypt N parameter"
        },
        {
            name: "invalid scrypt r",
            options: { scrypt: { r: 1.5 } },
            error: "invalid scrypt r parameter"
        },
        {
            name: "invalid scrypt p",
            options: { scrypt: { p: 1.5 } },
            error: "invalid scrypt p parameter"
        },
    ];
    const wallet = Wallet.createRandom();
    const account = { address: wallet.address, privateKey: wallet.privateKey };
    const password = "foobar";
    for (const { name, options, error } of badKeystoreOptions) {
        it(`tests bad keystore options: ${name}`, function () {
            assert.throws(() => {
                const result = encryptKeystoreJsonSync(account, password, options);
                console.log(result);
            }, (e) => {
                return (isError(e, "INVALID_ARGUMENT") &&
                    e.message.startsWith(error));
            });
        });
    }
    // Mainly to round out weird edge cases in coverage
    it("tests encryption with options (sync)", function () {
        assert.ok(encryptKeystoreJsonSync(account, password));
    });
    // Mainly to round out weird edge cases in coverage
    it("tests encryption with options (async)", async function () {
        assert.ok(await encryptKeystoreJson(account, password));
    });
});
//# sourceMappingURL=test-wallet-json.js.map