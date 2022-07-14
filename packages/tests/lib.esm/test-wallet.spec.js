'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import assert from "assert";
import { hethers } from "@hashgraph/hethers";
import { loadTests } from "@hethers/testcases";
import * as utils from './utils';
import { PrivateKey, PublicKey, Transaction, } from "@hashgraph/sdk";
import { readFileSync } from "fs";
const abi = JSON.parse(readFileSync('packages/tests/contracts/Token.json').toString());
const abiTokenWithArgs = JSON.parse(readFileSync('packages/tests/contracts/TokenWithArgs.json').toString());
describe('Wallet.spec', () => {
    const localProvider = utils.getProviders().local[0];
    // @ts-ignore
    const testnetWalletECDSA = utils.getWallets().testnet.ecdsa[0];
    // @ts-ignore
    const localWalletECDSA = utils.getWallets().local.ecdsa[0];
    const localWalletED25519 = utils.getWallets().local.ed25519[1];
    describe('Test JSON Wallets', function () {
        let tests = loadTests('wallets');
        tests.forEach(function (test) {
            it(('decrypts wallet - ' + test.name), function () {
                return __awaiter(this, void 0, void 0, function* () {
                    this.timeout(1200000);
                    const wallet = yield hethers.Wallet.fromEncryptedJson(test.json, test.password);
                    assert.strictEqual(wallet.privateKey, test.privateKey, 'generated correct private key - ' + wallet.privateKey);
                    if (test.hasAddress) {
                        assert.ok((hethers.utils.getJsonWalletAddress(test.json) !== null), 'detect encrypted JSON wallet');
                        assert.strictEqual(wallet.address.toLowerCase(), test.address, 'generate correct address - ' + wallet.address);
                        const walletAddress = yield wallet.getAddress();
                        assert.strictEqual(walletAddress.toLowerCase(), test.address, 'generate correct address - ' + wallet.address);
                    }
                    // Test connect
                    {
                        // const provider = hethers.providers.getDefaultProvider();
                        const walletConnected = wallet.connect(localProvider);
                        assert.strictEqual(walletConnected.provider, localProvider, "provider is connected");
                        assert.ok((wallet.provider == null), "original wallet provider is null");
                        if (test.hasAddress) {
                            assert.strictEqual(walletConnected.address.toLowerCase(), test.address, "connected correct address - " + wallet.address);
                        }
                    }
                    // Make sure it can accept a SigningKey
                    {
                        const wallet2 = new hethers.Wallet(wallet._signingKey());
                        assert.equal(wallet2.privateKey, test.privateKey, 'generated correct private key - ' + wallet2.privateKey);
                    }
                    // Test the sync decryption (this wallet is light, so it is safe)
                    if (test.name === "life") {
                        const wallet2 = hethers.Wallet.fromEncryptedJsonSync(test.json, test.password);
                        assert.equal(wallet2.privateKey, test.privateKey, 'generated correct private key - ' + wallet2.privateKey);
                    }
                    if (test.mnemonic) {
                        assert.equal(wallet.mnemonic.phrase, test.mnemonic, 'mnemonic enabled encrypted wallet has a mnemonic phrase');
                    }
                });
            });
        });
        // A few extra test cases to test encrypting/decrypting
        ['one', 'two', 'three', "ed25519"].forEach(function (i) {
            let isED25519Type = i === "ed25519";
            let password = 'foobar' + i;
            let wallet = hethers.Wallet.createRandom({ path: "m/56'/82", extraEntropy: utils.randomHexString('test-' + i, 32), isED25519Type });
            wallet = wallet.connectAccount("0.0.1001");
            it('encrypts and decrypts a random wallet - ' + i, function () {
                this.timeout(1200000);
                return wallet.encrypt(password).then((json) => {
                    return hethers.Wallet.fromEncryptedJson(json, password).then((decryptedWallet) => {
                        assert.strictEqual(decryptedWallet.address, wallet.address, 'decrypted wallet - ' + wallet.privateKey);
                        assert.strictEqual(decryptedWallet.mnemonic.phrase, wallet.mnemonic.phrase, "decrypted wallet mnemonic - " + wallet.privateKey);
                        assert.strictEqual(decryptedWallet.mnemonic.path, wallet.mnemonic.path, "decrypted wallet path - " + wallet.privateKey);
                        assert.strictEqual(decryptedWallet.isED25519Type, isED25519Type);
                        return decryptedWallet.encrypt(password).then((encryptedWallet) => {
                            let parsedWallet = JSON.parse(encryptedWallet);
                            assert.strictEqual(decryptedWallet.address.toLowerCase().substring(2), parsedWallet.address, 're-encrypted wallet - ' + wallet.privateKey);
                        });
                    });
                });
            });
        });
    });
    describe("Test wallet(ED25519) keys", function () {
        const accountEoa = {
            account: "0.0.34100425",
            alias: "0.0.QsxEYZU82YPvQqrZ8DAfOktZjmbcfjaPwVATlsaJCCM=",
            privateKey: "06bd0453347618988f1e1c60bd3e57892a4b8603969827d65b1a87d13b463d70",
            isED25519Type: true
        };
        it("Should use curve ed25519", function () {
            const wallet = new hethers.Wallet(accountEoa);
            assert.strictEqual(wallet._signingKey().curve, "ed25519");
        });
        it("Should verify alias", function () {
            const wallet = new hethers.Wallet(accountEoa);
            assert.strictEqual(wallet.alias, accountEoa.alias);
        });
        it("Should throw error for invalid alias", function () {
            let exceptionThrown = false;
            let errorCode = null;
            try {
                new hethers.Wallet(Object.assign(Object.assign({}, accountEoa), { alias: "invalid alias" }));
            }
            catch (e) {
                errorCode = e.code;
                exceptionThrown = true;
            }
            assert.strictEqual(errorCode, "INVALID_ARGUMENT");
            assert.strictEqual(exceptionThrown, true);
        });
        it("Should work with signing key", function () {
            const wallet = new hethers.Wallet(accountEoa);
            const sk = new hethers.Wallet(wallet._signingKey());
            assert.strictEqual(sk._signingKey().privateKey, "0x" + PrivateKey.fromString(accountEoa.privateKey).toStringRaw());
            assert.strictEqual(sk.isED25519Type, true);
        });
        it("Should work with DER header", function () {
            const wallet = new hethers.Wallet(Object.assign(Object.assign({}, accountEoa), { privateKey: "302e020100300506032b65700422042006bd0453347618988f1e1c60bd3e57892a4b8603969827d65b1a87d13b463d70" }));
            assert.strictEqual(wallet._signingKey().privateKey, "0x" + PrivateKey.fromString(accountEoa.privateKey).toStringRaw());
        });
        it('Should prefix non-prefixed keys(raw)', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const key = 'a1eb7d5c7ef5e47026b262c973b60fa9d6317c27854eeb25aa82b67d8abc73a2';
                const wallet = new hethers.Wallet(key);
                const privKey = wallet._signingKey().privateKey;
                assert.strictEqual('0x' + key, privKey);
            });
        });
        it("Should prefix @hashgraph/sdk generated keys", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const key = PrivateKey.generateED25519().toStringRaw();
                const wallet = new hethers.Wallet(key);
                const privKey = wallet._signingKey().privateKey;
                assert.strictEqual('0x' + key, privKey);
            });
        });
        it('Should prefix keys when given eoa in constructor', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const provider = hethers.providers.getDefaultProvider('testnet');
                const wallet = new hethers.Wallet(accountEoa, provider);
                const privKey = wallet._signingKey().privateKey;
                assert.strictEqual('0x' + accountEoa.privateKey, privKey);
            });
        });
    });
    describe("Test wallet keys", function () {
        it('Should prefix non-prefixed keys(raw)', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const key = '074cc0bd198d1bc91f668c59b46a1e74fd13215661e5a7bd42ad0d324476295d';
                const wallet = new hethers.Wallet(key);
                const privKey = wallet._signingKey().privateKey;
                assert.strictEqual('0x' + key, privKey);
            });
        });
        it("Should prefix @hashgraph/sdk generated keys", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const key = PrivateKey.generateECDSA().toStringRaw();
                const wallet = new hethers.Wallet(key);
                const privKey = wallet._signingKey().privateKey;
                assert.strictEqual('0x' + key, privKey);
            });
        });
        it('Should prefix keys when given eoa in constructor', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const eoa = {
                    account: '1.1.1',
                    privateKey: "074cc0bd198d1bc91f668c59b46a1e74fd13215661e5a7bd42ad0d324476295d"
                };
                // @ts-ignore
                const wallet = new hethers.Wallet(eoa, localProvider);
                const privKey = wallet._signingKey().privateKey;
                assert.strictEqual('0x' + eoa.privateKey, privKey);
            });
        });
    });
    describe('Test Transaction Signing and Parsing', function () {
        // FIXME
        //  unit tests for this functionality is present
        //  at branches `feat/signing-and-sending-transactions` and/or `contract-interaction`
        // function checkTransaction(parsedTransaction: any, test: TestCase.SignedTransaction): any {
        //     let transaction: any = { };
        //
        //     ['nonce', 'gasLimit', 'gasPrice', 'to', 'value', 'data'].forEach((key: (keyof TestCase.SignedTransaction)) => {
        //         let expected = test[key];
        //
        //         let value = parsedTransaction[key];
        //
        //         if ([ "gasLimit", "gasPrice", "value"].indexOf(key) >= 0) {
        //             assert.ok((hethers.BigNumber.isBigNumber(value)),
        //                 'parsed into a big number - ' + key);
        //             value = value.toHexString();
        //
        //             if (!expected || expected === '0x') { expected = '0x00'; }
        //
        //         } else if (key === 'nonce') {
        //             assert.equal(typeof(value), 'number',
        //                 'parse into a number - nonce');
        //
        //             value = hethers.utils.hexlify(value);
        //
        //             if (!expected || expected === '0x') { expected = '0x00'; }
        //
        //         } else if (key === 'data') {
        //             if (!expected) { expected = '0x'; }
        //
        //         } else if (key === 'to') {
        //             if (value) {
        //                 // Make sure the address is valid
        //                 hethers.utils.getAddress(value);
        //                 value = value.toLowerCase();
        //             }
        //         }
        //
        //         assert.equal(value, expected, 'parses ' + key + ' (legacy)');
        //
        //         transaction[key] = test[key];
        //     });
        //
        //     return transaction;
        // }
        // FIXME - separate tests with `it`
        let tests = loadTests('transactions');
        tests.forEach((test) => {
            // it(('parses and signs transaction - ' + test.name), function() {
            //     this.timeout(120000);
            //
            //     let signingKey = new hethers.utils.SigningKey(test.privateKey);
            //     let signDigest = signingKey.signDigest.bind(signingKey);
            //
            //     // Legacy parsing unsigned transaction
            //     checkTransaction(hethers.utils.parseTransaction(test.unsignedTransaction), test);
            //
            //     let parsedTransaction = hethers.utils.parseTransaction(test.signedTransaction);
            //     let transaction = checkTransaction(parsedTransaction, test);
            //
            //     // Legacy signed transaction ecrecover
            //     // assert.equal(parsedTransaction.from, hethers.utils.getAddress(test.accountAddress),
            //     //     'computed from');
            //
            //     // Legacy transaction chain ID
            //     // assert.equal(parsedTransaction.chainId, 0, 'parses chainId (legacy)');
            //
            //     // Legacy serializes unsigned transaction
            //     (function() {
            //         let unsignedTx = hethers.utils.serializeTransaction(transaction);
            //         assert.equal(unsignedTx, test.unsignedTransaction,
            //             'serializes unsigned transaction (legacy)');
            //
            //         // Legacy signed serialized transaction
            //         let signature = signDigest(hethers.utils.keccak256(unsignedTx));
            //         assert.equal(hethers.utils.serializeTransaction(transaction, signature), test.signedTransaction,
            //             'signs transaction (legacy)');
            //     })();
            //
            //
            //     // EIP155
            //
            //     // EIP-155 parsing unsigned transaction
            //     let parsedUnsignedTransactionChainId5 = hethers.utils.parseTransaction(test.unsignedTransactionChainId5);
            //     checkTransaction(parsedUnsignedTransactionChainId5, test);
            //     // assert.equal(parsedUnsignedTransactionChainId5.chainId, 5, 'parses chainId (eip155)');
            //
            //     // EIP-155 fields
            //     let parsedTransactionChainId5 = hethers.utils.parseTransaction(test.signedTransactionChainId5);
            //
            //     type TxStringKey = 'data' | 'from' | 'nonce' | 'to';
            //     ['data', 'from', 'nonce', 'to'].forEach((key: TxStringKey) => {
            //         assert.equal(parsedTransaction[key], parsedTransactionChainId5[key],
            //             'parses ' + key + ' (eip155)');
            //     });
            //
            //     type TxNumberKey = 'gasLimit' | 'gasPrice' | 'value';
            //     ['gasLimit', 'gasPrice', 'value'].forEach((key: TxNumberKey) => {
            //         assert.ok(parsedTransaction[key].eq(parsedTransactionChainId5[key]),
            //             'parses ' + key + ' (eip155)');
            //     });
            //
            //     // EIP-155 chain ID
            //     assert.equal(parsedTransactionChainId5.chainId, 5,
            //         'parses chainId (eip155)');
            //
            //     transaction.chainId = 5;
            //
            //     (function() {
            //         // EIP-155 serialized unsigned transaction
            //         let unsignedTx = hethers.utils.serializeTransaction(transaction);
            //         assert.equal(unsignedTx, test.unsignedTransactionChainId5,
            //             'serializes unsigned transaction (eip155) ');
            //
            //         // EIP-155 signed serialized transaction
            //         let signature = signDigest(hethers.utils.keccak256(unsignedTx));
            //         assert.equal(hethers.utils.serializeTransaction(transaction, signature), test.signedTransactionChainId5,
            //             'signs transaction (eip155)');
            //     })();
            // });
        });
        tests.forEach((test) => {
            it(('wallet signs transaction - ' + test.name), function () {
                return __awaiter(this, void 0, void 0, function* () {
                    this.timeout(120000);
                    // const wallet = new hethers.Wallet(test.privateKey);
                    // const transaction = {
                    //     to: test.to,
                    //     data: test.data,
                    //     gasLimit: test.gasLimit,
                    //     gasPrice: test.gasPrice,
                    //     value: test.value,
                    //     nonce: ((<any>(test.nonce)) === "0x") ? 0: test.nonce,
                    //     chainId: 5
                    // };
                    // @ts-ignore
                    // const signedTx = await wallet.signTransaction(transaction);
                    // assert.equal(signedTx, test.signedTransactionChainId5);
                });
            });
        });
    });
    describe("Test Signing Messages(ED25519)", function () {
        it("sign a message should throw unsupported operation", function () {
            return __awaiter(this, void 0, void 0, function* () {
                let exceptionThrown = false;
                let errorCode = null;
                try {
                    const wallet = new hethers.Wallet({
                        privateKey: "0xa1eb7d5c7ef5e47026b262c973b60fa9d6317c27854eeb25aa82b67d8abc73a2",
                        isED25519Type: true,
                    });
                    yield wallet.signMessage("some msg");
                }
                catch (e) {
                    errorCode = e.code;
                    exceptionThrown = true;
                }
                assert.strictEqual(errorCode, 'UNSUPPORTED_OPERATION');
                assert.strictEqual(exceptionThrown, true);
            });
        });
        it("verify a message should throw unsupported operation", function () {
            return __awaiter(this, void 0, void 0, function* () {
                let exceptionThrown = false;
                let errorCode = null;
                try {
                    hethers.utils.verifyMessage("some msg", "signature", true);
                }
                catch (e) {
                    errorCode = e.code;
                    exceptionThrown = true;
                }
                assert.strictEqual(errorCode, 'UNSUPPORTED_OPERATION');
                assert.strictEqual(exceptionThrown, true);
            });
        });
    });
    describe('Test Signing Messages', function () {
        let tests = [
            // See: https://etherscan.io/verifySig/57
            {
                address: '0x14791697260E4c9A71f18484C9f997B308e59325',
                name: 'string("hello world")',
                message: 'hello world',
                messageHash: '0xd9eba16ed0ecae432b71fe008c98cc872bb4cc214d3220a36f365326cf807d68',
                privateKey: '0x0123456789012345678901234567890123456789012345678901234567890123',
                signature: '0xddd0a7290af9526056b4e35a077b9a11b513aa0028ec6c9880948544508f3c63265e99e47ad31bb2cab9646c504576b3abc6939a1710afc08cbf3034d73214b81c'
            },
            // See: https://github.com/hethers-io/hethers.js/issues/80
            {
                address: '0xD351c7c627ad5531Edb9587f4150CaF393c33E87',
                name: 'bytes(0x47173285...4cb01fad)',
                message: hethers.utils.arrayify('0x47173285a8d7341e5e972fc677286384f802f8ef42a5ec5f03bbfa254cb01fad'),
                messageHash: '0x93100cc9477ba6522a2d7d5e83d0e075b167224ed8aa0c5860cfd47fa9f22797',
                privateKey: '0x51d1d6047622bca92272d36b297799ecc152dc2ef91b229debf84fc41e8c73ee',
                signature: '0x546f0c996fa4cfbf2b68fd413bfb477f05e44e66545d7782d87d52305831cd055fc9943e513297d0f6755ad1590a5476bf7d1761d4f9dc07dfe473824bbdec751b'
            },
            // See: https://github.com/hethers-io/hethers.js/issues/85
            {
                address: '0xe7deA7e64B62d1Ca52f1716f29cd27d4FE28e3e1',
                name: 'zero-prefixed signature',
                message: hethers.utils.arrayify(hethers.utils.id('0x7f23b5eed5bc7e89f267f339561b2697faab234a2')),
                messageHash: '0x06c9d148d268f9a13d8f94f4ce351b0beff3b9ba69f23abbf171168202b2dd67',
                privateKey: '0x09a11afa58d6014843fd2c5fd4e21e7fadf96ca2d8ce9934af6b8e204314f25c',
                signature: '0x7222038446034a0425b6e3f0cc3594f0d979c656206408f937c37a8180bb1bea047d061e4ded4aeac77fa86eb02d42ba7250964ac3eb9da1337090258ce798491c'
            }
        ];
        tests.forEach(function (test) {
            it(('signs a message "' + test.name + '"'), function () {
                this.timeout(120000);
                let wallet = new hethers.Wallet(test.privateKey);
                return wallet.signMessage(test.message).then(function (signature) {
                    assert.equal(signature, test.signature, 'computes message signature');
                });
            });
        });
        tests.forEach(function (test) {
            it(('verifies a message "' + test.name + '"'), function () {
                this.timeout(120000);
                let wallet = new hethers.Wallet(test.privateKey);
                const publicKey = hethers.utils.verifyMessage(test.message, test.signature);
                assert.strictEqual(wallet.publicKey, publicKey);
            });
        });
        tests.forEach(function (test) {
            it(('hashes a message "' + test.name + '"'), function () {
                this.timeout(120000);
                let hash = hethers.utils.hashMessage(test.message);
                assert.equal(hash, test.messageHash, 'calculates message hash');
            });
        });
    });
    describe("Wallet(ED25519) Errors", function () {
        it("fails on privateKey/address mismatch", function () {
            assert.throws(() => {
                const wallet = new hethers.Wallet({
                    account: "0.0.34100425",
                    privateKey: "06bd0453347618988f1e1c60bd3e57892a4b8603969827d65b1a87d13b463d70",
                    isED25519Type: true,
                    alias: ""
                });
                console.log(wallet);
            }, (error) => {
                return error.reason === "privateKey/alias mismatch";
            });
        });
        it("fails on mnemonic/address mismatch", function () {
            assert.throws(() => {
                const wallet = new hethers.Wallet({
                    account: "0.0.34100425",
                    privateKey: "06bd0453347618988f1e1c60bd3e57892a4b8603969827d65b1a87d13b463d70",
                    isED25519Type: true,
                    mnemonic: {
                        phrase: "pact grief smile usage kind pledge river excess garbage mixed olive receive"
                    }
                });
                console.log(wallet);
            }, (error) => {
                return error.reason === "mnemonic/privateKey mismatch";
            });
        });
    });
    describe("Wallet Errors", function () {
        it("fails on privateKey/address mismatch", function () {
            assert.throws(() => {
                const wallet = new hethers.Wallet({
                    privateKey: "0x6a73cd9b03647e83ef937888a5258a26e4c766dbf41ddd974f15e32d09cfe9c0",
                    alias: "0.0.BLZ906RnM9t5+nzS4Cq8wkLA1uWU3tvKa+7wIqznr6zvkrdJYX+bwkUOdj/yfkp5gSrjxw/Jy7Hm7NsXWs0vRsg="
                });
                console.log(wallet);
            }, (error) => {
                return error.reason === "privateKey/alias mismatch";
            });
        });
        it("fails on mnemonic/address mismatch", function () {
            assert.throws(() => {
                const wallet = new hethers.Wallet({
                    privateKey: "0x6a73cd9b03647e83ef937888a5258a26e4c766dbf41ddd974f15e32d09cfe9c0",
                    mnemonic: {
                        phrase: "pact grief smile usage kind pledge river excess garbage mixed olive receive"
                    }
                });
                console.log(wallet);
            }, (error) => {
                return error.reason === "mnemonic/privateKey mismatch";
            });
        });
        // it("fails on from mismatch", function() {
        //     const wallet = new hethers.Wallet("0x6a73cd9b03647e83ef937888a5258a26e4c766dbf41ddd974f15e32d09cfe9c0");
        //     return new Promise(async (resolve, reject) => {
        //         try {
        //             await wallet.signTransaction({
        //                 from: "0x3f4f037dfc910a3517b9a5b23cf036ffae01a5a7"
        //             });
        //         } catch (error) {
        //             if (error.code === hethers.utils.Logger.errors.INVALID_ARGUMENT && error.argument === "transaction.from") {
        //                 resolve(true);
        //                 return;
        //             }
        //         }
        //
        //         reject(new Error("assert failed; did not throw"));
        //     });
        // });
    });
    describe("Wallet(ED25519) tx signing", function () {
        it("Should transfer funds between accounts", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const localWalletECDSA2 = utils.getWallets().local.ecdsa[1];
                const edBalanceBefore = (yield localWalletED25519.getBalance());
                const ecBalanceBefore = (yield localWalletECDSA2.getBalance());
                const tx = yield localWalletED25519.sendTransaction({
                    to: localWalletECDSA2.account,
                    value: 1000,
                });
                yield tx.wait();
                const edBalanceAfter = (yield localWalletED25519.getBalance());
                const ecBalanceAfter = (yield localWalletECDSA2.getBalance());
                assert.strictEqual(edBalanceBefore.gt(edBalanceAfter), true);
                assert.strictEqual(ecBalanceBefore.lt(ecBalanceAfter), true);
                assert.strictEqual(ecBalanceAfter.sub(ecBalanceBefore).toNumber(), 1000);
            });
        }).timeout(90000);
        it("Should sign ContractCall", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const data = Buffer.from(`"abi":{},"values":{}`).toString('hex');
                const tx = {
                    to: hethers.utils.getAddressFromAccount("0.0.98"),
                    from: localWalletED25519.address,
                    data: '0x' + data,
                    gasLimit: 100000
                };
                const signed = yield localWalletED25519.signTransaction(tx);
                assert.ok(signed !== "", "Unexpected nil signed tx");
                const fromBytes = Transaction.fromBytes(hethers.utils.arrayify(signed));
                const cc = fromBytes;
                assert.ok(cc.gas.toNumber() === tx.gasLimit, "Gas mismatch");
            });
        });
        it("Should sign ContractCreate", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const tx = {
                    from: localWalletED25519.address,
                    gasLimit: 10000,
                    customData: {
                        bytecodeFileId: "0.0.122121"
                    }
                };
                const signed = yield localWalletED25519.signTransaction(tx);
                assert.ok(signed !== "", "Unexpected nil signed tx");
                const fromBytes = Transaction.fromBytes(hethers.utils.arrayify(signed));
                const cc = fromBytes;
                assert.ok(cc.gas.toNumber() === tx.gasLimit, "Gas mismatch");
            });
        });
        it("Should sign FileCreate", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const tx = {
                    from: localWalletED25519.address,
                    gasLimit: 10000,
                    customData: {
                        fileChunk: "Hello world! I will definitely break your smart contract experience",
                        fileKey: PublicKey.fromString("302a300506032b6570032100cd1c5cd43b103bc5b30dd38d421a6a32386377b99d0d1b438359a72dc525bde1")
                    }
                };
                const signed = yield localWalletED25519.signTransaction(tx);
                assert.ok(signed !== "", "Unexpected nil signed tx");
                const fromBytes = Transaction.fromBytes(hethers.utils.arrayify(signed));
                const fc = fromBytes;
                assert.ok(Buffer.from(fc.contents).toString() == tx.customData.fileChunk, "Contents mismatch");
            });
        });
        it("Should sign FileAppend", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const tx = {
                    from: localWalletED25519.address,
                    gasLimit: 10000,
                    customData: {
                        fileChunk: "Hello world! I will definitely break your smart contract experience",
                        fileId: "0.0.12212"
                    }
                };
                const signed = yield localWalletED25519.signTransaction(tx);
                assert.ok(signed !== "", "Unexpected nil signed tx");
                const fromBytes = Transaction.fromBytes(hethers.utils.arrayify(signed));
                const fa = fromBytes;
                assert.ok(Buffer.from(fa.contents).toString() == tx.customData.fileChunk, "Contents mismatch");
                assert.ok(fa.fileId.toString() == tx.customData.fileId, "FileId mismatch");
            });
        });
    });
    describe("Wallet tx signing", function () {
        it("Should sign ContractCall", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const data = Buffer.from(`"abi":{},"values":{}`).toString('hex');
                const tx = {
                    to: hethers.utils.getAddressFromAccount("0.0.98"),
                    from: localWalletECDSA.address,
                    data: '0x' + data,
                    gasLimit: 100000
                };
                const signed = yield localWalletECDSA.signTransaction(tx);
                assert.ok(signed !== "", "Unexpected nil signed tx");
                const fromBytes = Transaction.fromBytes(hethers.utils.arrayify(signed));
                const cc = fromBytes;
                assert.ok(cc.gas.toNumber() === tx.gasLimit, "Gas mismatch");
            });
        });
        it("Should sign ContractCreate", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const tx = {
                    from: localWalletECDSA.address,
                    gasLimit: 10000,
                    customData: {
                        bytecodeFileId: "0.0.122121"
                    }
                };
                const signed = yield localWalletECDSA.signTransaction(tx);
                assert.ok(signed !== "", "Unexpected nil signed tx");
                const fromBytes = Transaction.fromBytes(hethers.utils.arrayify(signed));
                const cc = fromBytes;
                assert.ok(cc.gas.toNumber() === tx.gasLimit, "Gas mismatch");
            });
        });
        it("Should sign FileCreate", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const tx = {
                    from: localWalletECDSA.address,
                    gasLimit: 10000,
                    customData: {
                        fileChunk: "Hello world! I will definitely break your smart contract experience",
                        fileKey: PublicKey.fromString("302a300506032b65700321004aed2e9e0cb6cbcd12b58476a2c39875d27e2a856444173830cc1618d32ca2f0")
                    }
                };
                const signed = yield localWalletECDSA.signTransaction(tx);
                assert.ok(signed !== "", "Unexpected nil signed tx");
                const fromBytes = Transaction.fromBytes(hethers.utils.arrayify(signed));
                const fc = fromBytes;
                assert.ok(Buffer.from(fc.contents).toString() == tx.customData.fileChunk, "Contents mismatch");
            });
        });
        it("Should sign FileAppend", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const tx = {
                    from: localWalletECDSA.address,
                    gasLimit: 10000,
                    customData: {
                        fileChunk: "Hello world! I will definitely break your smart contract experience",
                        fileId: "0.0.12212"
                    }
                };
                const signed = yield localWalletECDSA.signTransaction(tx);
                assert.ok(signed !== "", "Unexpected nil signed tx");
                const fromBytes = Transaction.fromBytes(hethers.utils.arrayify(signed));
                const fa = fromBytes;
                assert.ok(Buffer.from(fa.contents).toString() == tx.customData.fileChunk, "Contents mismatch");
                assert.ok(fa.fileId.toString() == tx.customData.fileId, "FileId mismatch");
            });
        });
    });
    describe("Wallet getters", function () {
        it("Should get proper mainnet chainId", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const provider = hethers.providers.getDefaultProvider("mainnet");
                const wallet = hethers.Wallet.createRandom().connect(provider);
                const chainId = yield wallet.getChainId();
                assert.strictEqual(chainId, 290);
            });
        });
        it("Should get proper testnet chainId", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const provider = hethers.providers.getDefaultProvider("testnet");
                const wallet = hethers.Wallet.createRandom().connect(provider);
                const chainId = yield wallet.getChainId();
                assert.strictEqual(chainId, 291);
            });
        });
        it("Should get proper previewnet chainId", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const provider = hethers.providers.getDefaultProvider("previewnet");
                const wallet = hethers.Wallet.createRandom().connect(provider);
                const chainId = yield wallet.getChainId();
                assert.strictEqual(chainId, 292);
            });
        });
        it("Should get proper local chainId", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const provider = hethers.providers.getDefaultProvider("local");
                const wallet = hethers.Wallet.createRandom().connect(provider);
                const chainId = yield wallet.getChainId();
                assert.strictEqual(chainId, 298);
            });
        });
    });
    describe("Wallet local calls", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const contractAddr = '0000000000000000000000000000000001b34cbb';
            const contract = hethers.ContractFactory.getContract(contractAddr, abi, testnetWalletECDSA);
            const balanceOfParams = contract.interface.encodeFunctionData('balanceOf', [testnetWalletECDSA.getAddress()]);
            // skipped - no balance in account
            xit("Should be able to perform local call", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const balanceOfTx = {
                        to: contractAddr,
                        gasLimit: 30000,
                        data: hethers.utils.arrayify(balanceOfParams),
                    };
                    const response = yield testnetWalletECDSA.call(balanceOfTx);
                    assert.notStrictEqual(response, null);
                });
            });
            // skipped - no balance in account
            xit('should fail on contract revert', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    this.timeout(60000);
                    const balanceOfTx = {
                        to: contractAddr,
                        gasLimit: 50000,
                        data: "0x",
                        nodeId: "0.0.3"
                    };
                    try {
                        yield testnetWalletECDSA.call(balanceOfTx);
                    }
                    catch (err) {
                        assert.strictEqual(err.code, hethers.utils.Logger.errors.UNPREDICTABLE_GAS_LIMIT);
                    }
                });
            });
            it('should fail on insufficient gas', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    this.timeout(60000);
                    const balanceOfTx = {
                        to: contractAddr,
                        gasLimit: 100,
                        data: hethers.utils.arrayify(balanceOfParams),
                        nodeId: "0.0.3"
                    };
                    try {
                        yield testnetWalletECDSA.call(balanceOfTx);
                    }
                    catch (err) {
                        assert.strictEqual(err.code, hethers.utils.Logger.errors.INSUFFICIENT_FUNDS);
                    }
                });
            });
            it('should fail on invalid contract', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    this.timeout(60000);
                    const balanceOfTx = {
                        // incorrect addr
                        to: 'z000000000000000000000000000000001b34cbb',
                        gasLimit: 30000,
                        data: hethers.utils.arrayify(balanceOfParams),
                        nodeId: "0.0.3"
                    };
                    try {
                        yield testnetWalletECDSA.call(balanceOfTx);
                    }
                    catch (err) {
                        assert.strictEqual(err.code, hethers.utils.Logger.errors.INVALID_ARGUMENT);
                    }
                });
            });
        });
    });
    describe("Wallet createAccount(ED25519)", function () {
        let newAccount, newAccountPublicKey;
        const timeout = 90000;
        beforeEach(() => __awaiter(this, void 0, void 0, function* () {
            newAccount = hethers.Wallet.createRandom({ isED25519Type: true });
            newAccountPublicKey = newAccount._signingKey().compressedPublicKey;
        }));
        it("Should create an account", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const tx = yield localWalletED25519.createAccount(newAccountPublicKey);
                assert.ok(tx, 'tx exists');
                assert.ok(tx.customData, 'tx.customData exists');
                assert.ok(tx.customData.accountId, 'accountId exists');
                assert.strictEqual(newAccount.isED25519Type, true);
            });
        }).timeout(timeout);
        it("Should add initial balance if provided", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const tx = yield localWalletED25519.createAccount(newAccountPublicKey, BigInt(123));
                assert.ok(tx, 'tx exists');
                assert.ok(tx.customData, 'tx.customData exists');
                assert.ok(tx.customData.accountId, 'accountId exists');
                const newAccountAddress = hethers.utils.getAddressFromAccount(tx.customData.accountId.toString());
                const newAccBalance = yield localProvider.getBalance(newAccountAddress);
                assert.strictEqual(BigInt(123).toString(), newAccBalance.toString(), 'The initial balance is correct');
            });
        }).timeout(timeout);
        it("Transaction receipt contains the account address", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const tx = yield localWalletED25519.createAccount(newAccountPublicKey, BigInt(123));
                assert.notStrictEqual(tx, null, 'tx exists');
                assert.notStrictEqual(tx.customData, null, 'tx.customData exists');
                assert.notStrictEqual(tx.customData.accountId, null, 'accountId exists');
                assert.strictEqual(tx.value.toString(), BigInt(123).toString(), 'InitialBalance is the same as tx.value');
                const receipt = yield tx.wait();
                assert.notStrictEqual(receipt.accountAddress, null, "accountAddress exists");
                assert.notStrictEqual(receipt.transactionId, null, "transactionId exists");
                assert.ok(receipt.accountAddress.match(new RegExp(/^0x/)), "accountAddress has the correct format");
            });
        }).timeout(timeout);
        it("Should transfer funds to new account", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const clientAccountId = (yield localWalletED25519.createAccount(newAccountPublicKey)).customData.accountId;
                const newWallet = newAccount.connect(localProvider).connectAccount(clientAccountId.toString());
                const newWalletBalanceBefore = (yield newWallet.getBalance());
                const oldWalletBalanceBefore = (yield localWalletED25519.getBalance());
                const tx = yield localWalletED25519.sendTransaction({
                    to: newWallet.account,
                    value: 1000,
                });
                yield tx.wait();
                const newWalletBalanceAfter = (yield newWallet.getBalance());
                const oldWalletBalanceAfter = (yield localWalletED25519.getBalance());
                assert.strictEqual(newWalletBalanceBefore.lt(newWalletBalanceAfter), true);
                assert.strictEqual(oldWalletBalanceBefore.gt(oldWalletBalanceAfter), true);
                assert.strictEqual(newWalletBalanceAfter.sub(newWalletBalanceBefore).toNumber(), 1000);
            });
        }).timeout(timeout);
        it("Should transfer funds from newly created account", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const clientAccountId = (yield localWalletED25519.createAccount(newAccountPublicKey)).customData.accountId;
                const newWallet = newAccount.connect(localProvider).connectAccount(clientAccountId.toString());
                const tx1 = yield localWalletED25519.sendTransaction({
                    to: newWallet.address,
                    value: 100000,
                });
                yield tx1.wait();
                // console.log(newWallet.privateKey, newWallet.account)
                const newWalletBalanceBefore = (yield newWallet.getBalance());
                const oldWalletBalanceBefore = (yield localWalletED25519.getBalance());
                const tx2 = yield newWallet.sendTransaction({
                    to: localWalletED25519.account,
                    value: 1000,
                });
                yield tx2.wait();
                const newWalletBalanceAfter = (yield newWallet.getBalance());
                const oldWalletBalanceAfter = (yield localWalletED25519.getBalance());
                assert.strictEqual(newWalletBalanceBefore.gt(newWalletBalanceAfter), true);
                assert.strictEqual(oldWalletBalanceBefore.lt(oldWalletBalanceAfter), true);
                assert.strictEqual(oldWalletBalanceAfter.sub(oldWalletBalanceBefore).toNumber(), 1000);
            });
        }).timeout(timeout);
        it("Should throw an exception if provider is not set", function () {
            return __awaiter(this, void 0, void 0, function* () {
                let exceptionThrown = false;
                let errorReason = null;
                // @ts-ignore
                const clientAccountId = (yield localWalletED25519.createAccount(newAccountPublicKey)).customData.accountId;
                const newWallet = newAccount.connectAccount(clientAccountId.toString());
                try {
                    yield newWallet.sendTransaction({
                        to: localWalletED25519.account,
                        value: 1
                    });
                }
                catch (e) {
                    errorReason = e.reason;
                    exceptionThrown = true;
                }
                assert.strictEqual(errorReason, 'missing provider');
                assert.strictEqual(exceptionThrown, true);
            });
        }).timeout(timeout);
    });
    describe("Wallet createAccount", function () {
        this.retries(3);
        let newAccount, newAccountPublicKey, acc1Wallet, acc2Wallet;
        const timeout = 120000;
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(timeout);
                acc1Wallet = utils.getWallets().local.ecdsa[1];
                acc2Wallet = utils.getWallets().local.ecdsa[2];
            });
        });
        beforeEach(() => __awaiter(this, void 0, void 0, function* () {
            newAccount = hethers.Wallet.createRandom();
            newAccountPublicKey = newAccount._signingKey().compressedPublicKey;
        }));
        it("Should create an account", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const tx = yield localWalletECDSA.createAccount(newAccountPublicKey);
                assert.ok(tx, 'tx exists');
                assert.ok(tx.customData, 'tx.customData exists');
                assert.ok(tx.customData.accountId, 'accountId exists');
            });
        }).timeout(timeout);
        it("Should add initial balance if provided", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const tx = yield localWalletECDSA.createAccount(newAccountPublicKey, BigInt(123));
                assert.ok(tx, 'tx exists');
                assert.ok(tx.customData, 'tx.customData exists');
                assert.ok(tx.customData.accountId, 'accountId exists');
                const newAccountAddress = hethers.utils.getAddressFromAccount(tx.customData.accountId.toString());
                const newAccBalance = yield localProvider.getBalance(newAccountAddress);
                assert.strictEqual(BigInt(123).toString(), newAccBalance.toString(), 'The initial balance is correct');
            });
        }).timeout(timeout);
        it("Transaction receipt contains the account address", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const tx = yield localWalletECDSA.createAccount(newAccountPublicKey, BigInt(123));
                assert.notStrictEqual(tx, null, 'tx exists');
                assert.notStrictEqual(tx.customData, null, 'tx.customData exists');
                assert.notStrictEqual(tx.customData.accountId, null, 'accountId exists');
                assert.strictEqual(tx.value.toString(), BigInt(123).toString(), 'InitialBalance is the same as tx.value');
                const receipt = yield tx.wait();
                assert.notStrictEqual(receipt.accountAddress, null, "accountAddress exists");
                assert.notStrictEqual(receipt.transactionId, null, "transactionId exists");
                assert.ok(receipt.accountAddress.match(new RegExp(/^0x/)), "accountAddress has the correct format");
            });
        }).timeout(timeout);
        it("Should transfer funds between accounts", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const acc1BalanceBefore = (yield acc1Wallet.getBalance()).toNumber();
                const acc2BalanceBefore = (yield acc2Wallet.getBalance()).toNumber();
                const tx = yield acc1Wallet.sendTransaction({
                    to: acc2Wallet.account,
                    value: 1000,
                });
                yield tx.wait();
                const acc1BalanceAfter = (yield acc1Wallet.getBalance()).toNumber();
                const acc2BalanceAfter = (yield acc2Wallet.getBalance()).toNumber();
                assert.strictEqual(acc1BalanceBefore > acc1BalanceAfter, true);
                assert.strictEqual(acc2BalanceBefore < acc2BalanceAfter, true);
                assert.strictEqual(acc2BalanceAfter - acc2BalanceBefore, 1000);
            });
        }).timeout(timeout);
        it("Should throw an error for crypto transfer with data field", function () {
            return __awaiter(this, void 0, void 0, function* () {
                let exceptionThrown = false;
                let errorReason = null;
                try {
                    yield acc1Wallet.sendTransaction({
                        to: acc2Wallet.account,
                        value: 1,
                        data: '0x'
                    });
                }
                catch (e) {
                    errorReason = e.reason;
                    exceptionThrown = true;
                }
                assert.strictEqual(errorReason, 'gasLimit is not provided. Cannot execute a Contract Call');
                assert.strictEqual(exceptionThrown, true);
            });
        }).timeout(timeout);
        it("Should throw an error for crypto transfer with gasLimit field", function () {
            return __awaiter(this, void 0, void 0, function* () {
                let exceptionThrown = false;
                let errorReason = null;
                try {
                    yield acc1Wallet.sendTransaction({
                        to: acc2Wallet.account,
                        value: 1,
                        gasLimit: 300000
                    });
                }
                catch (e) {
                    errorReason = e.reason;
                    exceptionThrown = true;
                }
                assert.strictEqual(errorReason, 'receiver is an account. Cannot execute a Contract Call');
                assert.strictEqual(exceptionThrown, true);
            });
        }).timeout(timeout);
        it("Should throw an error for crypto transfer with missing to field", function () {
            return __awaiter(this, void 0, void 0, function* () {
                let exceptionThrown = false;
                let errorCode = null;
                try {
                    yield acc1Wallet.signTransaction({
                        value: 1,
                    });
                }
                catch (e) {
                    errorCode = e.code;
                    exceptionThrown = true;
                }
                assert.strictEqual(errorCode, 'UNPREDICTABLE_GAS_LIMIT');
                assert.strictEqual(exceptionThrown, true);
            });
        }).timeout(timeout);
        it("Should make a contract call with 'to' and 'value' with provided contract address as 'to'", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const bytecodeTokenWithArgs = readFileSync('packages/tests/contracts/TokenWithArgs.bin').toString();
                const contractFactory = new hethers.ContractFactory(abiTokenWithArgs, bytecodeTokenWithArgs, acc1Wallet);
                const contract = yield contractFactory.deploy(hethers.BigNumber.from('10000'), { gasLimit: 3000000 });
                yield contract.deployed();
                let exceptionThrown = false;
                try {
                    yield acc1Wallet.sendTransaction({
                        to: contract.address,
                        value: 1,
                    });
                }
                catch (e) {
                    exceptionThrown = true;
                }
                assert.strictEqual(exceptionThrown, false);
            });
        }).timeout(180000);
        it("Should throw an exception if provider is not set", function () {
            return __awaiter(this, void 0, void 0, function* () {
                let exceptionThrown = false;
                let errorReason = null;
                // @ts-ignore
                const acc1WalletWithoutProvider = new hethers.Wallet(utils.getAccounts().local.ecdsa[0]);
                try {
                    yield acc1WalletWithoutProvider.sendTransaction({
                        to: acc2Wallet.account,
                        value: 1
                    });
                }
                catch (e) {
                    errorReason = e.reason;
                    exceptionThrown = true;
                }
                assert.strictEqual(errorReason, 'missing provider');
                assert.strictEqual(exceptionThrown, true);
            });
        }).timeout(timeout);
        it("Should be able to get a crypto transfer transaction via provider.getTransaction(tx.transactionId)", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const transaction = yield acc1Wallet.sendTransaction({
                    to: acc2Wallet.account,
                    value: 18925
                });
                yield transaction.wait();
                const tx = yield localProvider.getTransaction(transaction.transactionId);
                assert.strictEqual(tx.hasOwnProperty('chainId'), true);
                assert.strictEqual(tx.hasOwnProperty('hash'), true);
                assert.strictEqual(tx.hasOwnProperty('timestamp'), true);
                assert.strictEqual(tx.hasOwnProperty('transactionId'), true);
                assert.strictEqual(tx.hasOwnProperty('from'), true);
                assert.strictEqual(tx.hasOwnProperty('to'), true);
                assert.strictEqual(tx.hasOwnProperty('data'), true);
                assert.strictEqual(tx.hasOwnProperty('gasLimit'), true);
                assert.strictEqual(tx.hasOwnProperty('value'), true);
                assert.strictEqual(tx.hasOwnProperty('customData'), true);
                assert.strictEqual(tx.customData.hasOwnProperty('result'), true);
                assert.strictEqual(tx.customData.result, 'SUCCESS');
                assert.strictEqual(tx.from, acc1Wallet.account);
                assert.strictEqual(tx.to, acc2Wallet.account);
                assert.strictEqual(tx.value.toString(), '18925');
            });
        }).timeout(timeout);
    });
});
//# sourceMappingURL=test-wallet.spec.js.map