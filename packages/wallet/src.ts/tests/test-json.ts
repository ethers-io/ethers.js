import assert from "assert";

import { loadTests } from "./utils.js";

import type { TestCaseWallet } from "./types.js";

import {
    decryptCrowdsaleJson,
    decryptKeystoreJson, decryptKeystoreJsonSync,
    Wallet
} from "../index.js";

describe("Tests JSON Wallet Formats", function() {
     const tests = loadTests<TestCaseWallet>("wallets");
     tests.forEach((test) => {
         if (test.type === "crowdsale") {
             it(`tests decrypting Crowdsale JSON: ${ test.name }`, async function() {
                 const password = Buffer.from(test.password.substring(2), "hex");
                 const account = decryptCrowdsaleJson(test.content, password);
                 assert.equal(account.address, test.address, "address");
             });

         } else if (test.type === "keystore") {
             it(`tests decrypting Keystore JSON (sync): ${ test.name }`, function() {
                 this.timeout(20000);
                 const password = Buffer.from(test.password.substring(2), "hex");
                 const account = decryptKeystoreJsonSync(test.content, password);
                 //console.log(account);
                 assert.equal(account.address, test.address, "address");
             });

             it(`tests decrypting Keystore JSON (async): ${ test.name }`, async function() {
                 this.timeout(20000);
                 const password = Buffer.from(test.password.substring(2), "hex");
                 const account = await decryptKeystoreJson(test.content, password);
                 //console.log(account);
                 assert.equal(account.address, test.address, "address");
             });
         }

         it(`tests decrypting JSON (sync): ${ test.name }`, function() {
             this.timeout(20000);
             const password = Buffer.from(test.password.substring(2), "hex");
             const wallet = Wallet.fromEncryptedJsonSync(test.content, password);
             //console.log(wallet);
             assert.equal(wallet.address, test.address, "address");
         });

         it(`tests decrypting JSON (async): ${ test.name }`, async function() {
             this.timeout(20000);
             const password = Buffer.from(test.password.substring(2), "hex");
             const wallet = await Wallet.fromEncryptedJson(test.content, password);
             //console.log(wallet);
             assert.equal(wallet.address, test.address, "address");
         });
         
     });
});
