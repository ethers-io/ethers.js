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
import { BigNumber, hethers } from "hethers";
import fs, { readFileSync } from "fs";
// @ts-ignore
import * as abi from '../../../examples/assets/abi/GLDToken_abi.json';
// @ts-ignore
import * as abiWithArgs from '../../../examples/assets/abi/GLDTokenWithConstructorArgs_abi.json';
// @ts-ignore
abi = abi.default;
// @ts-ignore
abiWithArgs = abiWithArgs.default;
import { arrayify } from "hethers/lib/utils";
import { Logger } from "@hethers/logger";
// const provider = new hethers.providers.InfuraProvider("rinkeby", "49a0efa3aaee4fd99797bfa94d8ce2f1");
// @ts-ignore
const provider = hethers.getDefaultProvider("testnet");
const TIMEOUT_PERIOD = 120000;
const hederaEoa = {
    account: '0.0.29562194',
    privateKey: '0x3b6cd41ded6986add931390d5d3efa0bb2b311a8415cfe66716cac0234de035d'
};
// @ts-ignore
function waitForEvent(contract, eventName, expected) {
    return new Promise(function (resolve, reject) {
        let done = false;
        contract.on(eventName, function () {
            if (done) {
                return;
            }
            done = true;
            let args = Array.prototype.slice.call(arguments);
            let event = args[args.length - 1];
            event.removeListener();
            // equals(event.event, args.slice(0, args.length - 1), expected);
            resolve();
        });
        const timer = setTimeout(() => {
            if (done) {
                return;
            }
            done = true;
            contract.removeAllListeners();
            reject(new Error("timeout"));
        }, TIMEOUT_PERIOD);
        if (timer.unref) {
            timer.unref();
        }
    });
}
describe("Test Contract Transaction Population", function () {
    const testAddress = "0xdeadbeef00deadbeef01deadbeef02deadbeef03";
    const testAddressCheck = "0xDEAdbeeF00deAdbeEF01DeAdBEEF02DeADBEEF03";
    const fireflyAddress = "0x8ba1f109551bD432803012645Ac136ddd64DBA72";
    const contract = new hethers.Contract(null, abi);
    xit("standard population", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = yield contract.populateTransaction.balanceOf(testAddress);
            //console.log(tx);
            assert.equal(Object.keys(tx).length, 2, "correct number of keys");
            assert.equal(tx.data, "0x70a08231000000000000000000000000deadbeef00deadbeef01deadbeef02deadbeef03", "data matches");
            assert.equal(tx.to, testAddressCheck, "to address matches");
        });
    });
    xit("allows 'from' overrides", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = yield contract.populateTransaction.balanceOf(testAddress, {
                from: testAddress
            });
            //console.log(tx);
            assert.equal(Object.keys(tx).length, 3, "correct number of keys");
            assert.equal(tx.data, "0x70a08231000000000000000000000000deadbeef00deadbeef01deadbeef02deadbeef03", "data matches");
            assert.equal(tx.to, testAddressCheck, "to address matches");
            assert.equal(tx.from, testAddressCheck, "from address matches");
        });
    });
    xit("allows send overrides", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = yield contract.populateTransaction.mint({
                gasLimit: 150000,
                value: 1234,
                from: testAddress
            });
            //console.log(tx);
            assert.equal(Object.keys(tx).length, 7, "correct number of keys");
            assert.equal(tx.data, "0x1249c58b", "data matches");
            assert.equal(tx.to, testAddressCheck, "to address matches");
            assert.equal(tx.gasLimit.toString(), "150000", "gasLimit matches");
            assert.equal(tx.value.toString(), "1234", "value matches");
            assert.equal(tx.from, testAddressCheck, "from address matches");
        });
    });
    xit("allows zero 'value' to non-payable", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const tx = yield contract.populateTransaction.unstake({
                from: testAddress,
                value: 0
            });
            //console.log(tx);
            assert.equal(Object.keys(tx).length, 3, "correct number of keys");
            assert.equal(tx.data, "0x2def6620", "data matches");
            assert.equal(tx.to, testAddressCheck, "to address matches");
            assert.equal(tx.from, testAddressCheck, "from address matches");
        });
    });
    // @TODO: Add test cases to check for fault cases
    // - cannot send non-zero value to non-payable
    // - using the wrong from for a Signer-connected contract
    xit("forbids non-zero 'value' to non-payable", function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tx = yield contract.populateTransaction.unstake({
                    value: 1
                });
                console.log("Tx", tx);
                assert.ok(false, "throws on non-zero value to non-payable");
            }
            catch (error) {
                assert.ok(error.operation === "overrides.value");
            }
        });
    });
    xit("allows overriding same 'from' with a Signer", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const contractSigner = contract.connect(testAddress);
            const tx = yield contractSigner.populateTransaction.unstake({
                from: testAddress
            });
            //console.log(tx);
            assert.equal(Object.keys(tx).length, 3, "correct number of keys");
            assert.equal(tx.data, "0x2def6620", "data matches");
            assert.equal(tx.to, testAddressCheck, "to address matches");
            assert.equal(tx.from, testAddressCheck, "from address matches");
        });
    });
    xit("forbids overriding 'from' with a Signer", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const contractSigner = contract.connect(testAddress);
            try {
                const tx = yield contractSigner.populateTransaction.unstake({
                    from: fireflyAddress
                });
                console.log("Tx", tx);
                assert.ok(false, "throws on non-zero value to non-payable");
            }
            catch (error) {
                assert.ok(error.operation === "overrides.from");
            }
        });
    });
    xit("allows overriding with invalid, but nullish values", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const contractSigner = contract.connect(testAddress);
            const tx = yield contractSigner.populateTransaction.unstake({
                from: null
            });
            //console.log("Tx", tx);
            assert.equal(Object.keys(tx).length, 3, "correct number of keys");
            assert.equal(tx.data, "0x2def6620", "data matches");
            assert.equal(tx.to, testAddressCheck, "to address matches");
            assert.equal(tx.from, testAddressCheck.toLowerCase(), "from address matches");
        });
    });
    it("should return an array of transactions on getDeployTransaction call", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = hethers.providers.getDefaultProvider('testnet');
            // @ts-ignore
            const wallet = new hethers.Wallet(hederaEoa, provider);
            const contractBytecode = fs.readFileSync('examples/assets/bytecode/GLDTokenWithConstructorArgs.bin').toString();
            const contractFactory = new hethers.ContractFactory(abiWithArgs, contractBytecode, wallet);
            const transaction = contractFactory.getDeployTransaction(hethers.BigNumber.from("1000000"), {
                gasLimit: 300000
            });
            assert('data' in transaction);
            assert('customData' in transaction);
            assert('gasLimit' in transaction);
            assert.strictEqual(300000, transaction.gasLimit);
        });
    });
    it("should be able to deploy a contract", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = hethers.providers.getDefaultProvider('testnet');
            // @ts-ignore
            const wallet = new hethers.Wallet(hederaEoa, provider);
            const bytecode = fs.readFileSync('examples/assets/bytecode/GLDToken.bin').toString();
            const contractFactory = new hethers.ContractFactory(abi, bytecode, wallet);
            const contract = yield contractFactory.deploy({ gasLimit: 300000 });
            assert.notStrictEqual(contract, null, "nullified contract");
            assert.notStrictEqual(contract.deployTransaction, "missing deploy transaction");
            assert.notStrictEqual(contract.address, null, 'missing address');
            const params = contract.interface.encodeFunctionData('balanceOf', [
                wallet.address
            ]);
            const balance = yield wallet.call({
                from: wallet.address,
                to: contract.address,
                data: arrayify(params),
                gasLimit: 300000
            });
            assert.strictEqual(BigNumber.from(balance).toNumber(), 10000, 'balance mismatch');
        });
    }).timeout(60000);
    it("should be able to call contract methods", function () {
        return __awaiter(this, void 0, void 0, function* () {
            // configs
            const providerTestnet = hethers.providers.getDefaultProvider('testnet');
            // contract init
            // @ts-ignore
            const contractWallet = new hethers.Wallet(hederaEoa, providerTestnet);
            const abiGLDTokenWithConstructorArgs = JSON.parse(readFileSync('examples/assets/abi/GLDTokenWithConstructorArgs_abi.json').toString());
            const contractByteCodeGLDTokenWithConstructorArgs = readFileSync('examples/assets/bytecode/GLDTokenWithConstructorArgs.bin').toString();
            const contractFactory = new hethers.ContractFactory(abiGLDTokenWithConstructorArgs, contractByteCodeGLDTokenWithConstructorArgs, contractWallet);
            const contract = yield contractFactory.deploy(hethers.BigNumber.from('10000'), { gasLimit: 3000000 });
            yield contract.deployed();
            // client wallet init
            let clientWallet = hethers.Wallet.createRandom();
            const clientAccountId = (yield contractWallet.createAccount(clientWallet._signingKey().compressedPublicKey)).customData.accountId;
            clientWallet = clientWallet.connect(providerTestnet).connectAccount(clientAccountId.toString());
            // test sending hbars to the contract
            yield contractWallet.sendTransaction({
                to: contract.address,
                from: contractWallet.address,
                value: 30,
                gasLimit: 300000
            });
            // test if initial balance of the client is zero
            assert.strictEqual((yield contract.balanceOf(clientWallet.address, { gasLimit: 300000 })).toString(), '0');
            // test calling a contract view method
            const viewMethodCall = yield contract.getInternalCounter({ gasLimit: 300000 });
            assert.strictEqual(viewMethodCall.toString(), '29');
            // test sending hbars via populateTransaction.transfer
            const populatedTx = yield contract.populateTransaction.transfer(clientWallet.address, 10, { gasLimit: 300000 });
            const signedTransaction = yield contractWallet.signTransaction(populatedTx);
            const tx = yield contractWallet.provider.sendTransaction(signedTransaction);
            yield tx.wait();
            assert.strictEqual((yield contract.balanceOf(clientWallet.address, { gasLimit: 300000 })).toString(), '10');
            // test sending hbars via contract.transfer
            const transferMethodCall = yield contract.transfer(clientWallet.address, 10, { gasLimit: 300000 });
            yield transferMethodCall.wait();
            assert.strictEqual((yield contract.balanceOf(clientWallet.address, { gasLimit: 300000 })).toString(), '20');
        });
    }).timeout(300000);
    it('should have a .wait function', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const provider = hethers.providers.getDefaultProvider('testnet');
            // @ts-ignore
            const wallet = new hethers.Wallet(hederaEoa, provider);
            const bytecode = fs.readFileSync('examples/assets/bytecode/GLDToken.bin').toString();
            const contractFactory = new hethers.ContractFactory(abi, bytecode, wallet);
            const contract = yield contractFactory.deploy({ gasLimit: 300000 });
            try {
                yield contract.deployTransaction.wait(10);
                assert.notStrictEqual(true, false, "It should go in the catch block");
            }
            catch (err) {
                assert.notStrictEqual(err, null, "An error is thrown when the specified timeout is exceeded");
                assert.strictEqual(err.code, 'TIMEOUT');
            }
            const deployTx = contract.deployTransaction;
            const receipt = yield deployTx.wait();
            assert.notStrictEqual(receipt, null, "wait returns a receipt");
            assert.strictEqual(receipt.transactionId, deployTx.transactionId, "receipt.transactionId is correct");
            assert.strictEqual(receipt.transactionHash, deployTx.hash, "receipt.transactionHash is correct");
            assert.notStrictEqual(receipt.logs, null, "receipt.logs exists");
            assert.strictEqual(receipt.logs.length, 2);
            // @ts-ignore
            const events = receipt.events;
            assert.notStrictEqual(events, null, "receipt.events exists");
            assert.strictEqual(events.length, 2);
            assert.strictEqual(events[0].event, 'Mint');
            assert.strictEqual(events[0].eventSignature, 'Mint(address,uint256)');
            assert.strictEqual(events[1].event, 'Transfer');
            assert.strictEqual(events[1].eventSignature, 'Transfer(address,address,uint256)');
            for (let i = 0; i < events.length; i++) {
                const log = receipt.logs[i];
                const event = events[i];
                assert.strictEqual(log.timestamp, receipt.timestamp, 'timestamp is correct');
                assert.strictEqual(log.address, receipt.contractAddress, 'address is correct');
                assert.notStrictEqual(log.data, null, 'data exists');
                assert.strictEqual(log.logIndex, i, 'logIndex is correct');
                assert.strictEqual(log.transactionHash, receipt.transactionHash, 'transactionHash is correct');
                assert.strictEqual(event.timestamp, receipt.timestamp, 'event.timestamp is correct');
                assert.strictEqual(event.address, receipt.contractAddress, 'event.address is correct');
                assert.notStrictEqual(event.data, 'event.data exists');
                assert.strictEqual(event.logIndex, i, 'event.logIndex is correct');
                assert.strictEqual(event.transactionHash, receipt.transactionHash, 'event.transactionHash is correct');
                assert.notStrictEqual(event.getTransaction, null, 'events have a method `getTransaction`');
                assert.notStrictEqual(event.getTransactionReceipt, null, 'events have a method `getTransactionReceipt`');
                const eventTx = yield event.getTransaction();
                assert.notStrictEqual(eventTx, null, 'event.getTransaction() returns a result');
                assert.notStrictEqual(eventTx.chainId, null, 'eventTx.chainId is correct');
                assert.strictEqual(eventTx.hash, receipt.transactionHash, 'eventTx.hash is correct');
                assert.strictEqual(eventTx.timestamp, receipt.timestamp, 'eventTx.timestamp is correct');
                assert.strictEqual(eventTx.transactionId, receipt.transactionId, 'eventTx.transactionId is correct');
                assert.strictEqual(eventTx.from, receipt.from, 'eventTx.from is correct');
                assert.strictEqual(eventTx.to, receipt.contractAddress, 'eventTx.contractAddress is correct');
                assert.strictEqual(eventTx.value.toString(), BigNumber.from(0).toString(), 'eventTx.value is correct');
                const eventRc = yield event.getTransactionReceipt();
                assert.strictEqual(eventRc, receipt, "getTransactionReceipt returns the same receipt");
            }
        });
    }).timeout(60000);
});
describe('Contract Events', function () {
    const provider = hethers.providers.getDefaultProvider('testnet');
    // @ts-ignore
    const wallet = new hethers.Wallet(hederaEoa, provider);
    const abiGLDTokenWithConstructorArgs = JSON.parse(readFileSync('examples/assets/abi/GLDTokenWithConstructorArgs_abi.json').toString());
    const contract = hethers.ContractFactory.getContract('0x0000000000000000000000000000000001c42805', abiGLDTokenWithConstructorArgs, wallet);
    const sleep = (timeout) => __awaiter(this, void 0, void 0, function* () {
        yield new Promise(resolve => {
            setTimeout(resolve, timeout);
        });
    });
    const enoughEventsCaptured = (n, expectedN) => n >= expectedN;
    it("should be able to capture events via contract", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const capturedMints = [];
            contract.on('Mint', (...args) => {
                assert.strictEqual(args.length, 3, "expected 3 arguments - [address, unit256, log].");
                capturedMints.push([...args]);
            });
            const mint = yield contract.mint(BigNumber.from(`1`), { gasLimit: 300000 });
            yield mint.wait();
            yield sleep(15000);
            contract.removeAllListeners();
            assert.strictEqual(enoughEventsCaptured(capturedMints.length, 1), true, "expected 5 captured events (Mint).");
            for (let mint of capturedMints) {
                assert.strictEqual(mint[0].toLowerCase(), wallet.address.toLowerCase(), "address mismatch - mint");
            }
        });
    }).timeout(TIMEOUT_PERIOD * 2);
    it('should be able to capture events via provider', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const capturedMints = [];
            provider.on({ address: contract.address, topics: [
                    '0x0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d4121396885'
                ] }, (args) => {
                assert.notStrictEqual(args, null, "expected 1 argument - log");
                capturedMints.push([args]);
            });
            const mint = yield contract.mint(BigNumber.from(`1`), { gasLimit: 300000 });
            yield mint.wait();
            yield sleep(15000);
            provider.removeAllListeners();
            assert.strictEqual(enoughEventsCaptured(capturedMints.length, 1), true, "expected 5 captured events (Mint).");
        });
    }).timeout(TIMEOUT_PERIOD * 2);
    it('should throw on OR topics filter', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const filter = {
                address: contract.address,
                topics: [
                    '0x0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d4121396885',
                    null,
                    ['0x0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d4121396885', '0x0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d4121396885'],
                ]
            };
            const noop = () => { };
            provider.on(filter, noop);
            provider.on('error', (error) => {
                assert.notStrictEqual(error, null);
                assert.strictEqual(error.code, Logger.errors.INVALID_ARGUMENT);
            });
            yield sleep(10000);
            provider.removeAllListeners();
        });
    }).timeout(TIMEOUT_PERIOD);
});
describe("contract.deployed", function () {
    const hederaEoa = {
        account: '0.0.29562194',
        privateKey: '0x3b6cd41ded6986add931390d5d3efa0bb2b311a8415cfe66716cac0234de035d'
    };
    const provider = hethers.providers.getDefaultProvider('testnet');
    // @ts-ignore
    const wallet = new hethers.Wallet(hederaEoa, provider);
    const bytecode = fs.readFileSync('examples/assets/bytecode/GLDToken.bin').toString();
    it("should work for already deployed contracts", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const contract = hethers.ContractFactory.getContract('0000000000000000000000000000000001c3903b', abi, wallet);
            const contractDeployed = yield contract.deployed();
            assert.notStrictEqual(contractDeployed, null, "deployed returns the contract");
            assert.strictEqual(contractDeployed.address, contract.address, "deployed returns the same contract instance");
        });
    }).timeout(60000);
    it("should work if contract is just now deployed", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const contractFactory = new hethers.ContractFactory(abi, bytecode, wallet);
            const contract = yield contractFactory.deploy({ gasLimit: 300000 });
            assert.notStrictEqual(contract, null, "nullified contract");
            assert.notStrictEqual(contract.deployTransaction, "missing deploy transaction");
            assert.notStrictEqual(contract.address, null, 'missing address');
            const contractDeployed = yield contract.deployed();
            assert.notStrictEqual(contractDeployed, null, "deployed returns the contract");
            assert.strictEqual(contractDeployed.address, contract.address, "deployed returns the same contract instance");
        });
    }).timeout(60000);
});
describe("Test Contract Query Filter", function () {
    const hederaEoa = {
        account: '0.0.29562194',
        privateKey: '0x3b6cd41ded6986add931390d5d3efa0bb2b311a8415cfe66716cac0234de035d'
    };
    const provider = hethers.providers.getDefaultProvider('testnet');
    // @ts-ignore
    const wallet = new hethers.Wallet(hederaEoa, provider);
    it("should filter contract events by timestamp string", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const contractAddress = '0x000000000000000000000000000000000186fb1a';
            const fromTimestamp = '1642065156.264170833';
            const toTimestamp = '1642080642.176149864';
            const contract = hethers.ContractFactory.getContract(contractAddress, abi, wallet);
            const filter = {
                address: contractAddress,
            };
            const events = yield contract.queryFilter(filter, fromTimestamp, toTimestamp);
            assert.strictEqual(events.length, 2, "queryFilter returns the contract events");
            assert.strictEqual(events[0].address.toLowerCase(), contractAddress.toLowerCase(), "result address matches contract address");
            assert.notStrictEqual(events[0].data, null, "result data exists");
            assert.strict(events[0].topics.length > 0, "result topics not empty");
            assert.strict(events[0].timestamp >= fromTimestamp, "result timestamp is greater or equal fromTimestamp");
            assert.strict(events[0].timestamp <= toTimestamp, "result is less or equal toTimestamp");
            assert.strictEqual(events[1].address.toLowerCase(), contractAddress.toLowerCase(), "result address matches contract address");
            assert.notStrictEqual(events[1].data, null, "result data exists");
            assert.strict(events[1].topics.length > 0, "result topics not empty");
            assert.strict(events[1].timestamp >= fromTimestamp, "result timestamp is greater or equal fromTimestamp");
            assert.strict(events[1].timestamp <= toTimestamp, "result is less or equal toTimestamp");
        });
    }).timeout(60000);
    it("should filter contract events by timestamp number", function () {
        return __awaiter(this, void 0, void 0, function* () {
            const contractAddress = '0x000000000000000000000000000000000186fb1a';
            const fromTimestamp = 1642065156264170;
            const toTimestamp = 1642080642176150;
            const contract = hethers.ContractFactory.getContract(contractAddress, abi, wallet);
            const filter = {
                address: contractAddress,
            };
            const events = yield contract.queryFilter(filter, fromTimestamp, toTimestamp);
            assert.strictEqual(events.length, 2, "queryFilter returns the contract events");
            assert.strictEqual(events[0].address.toLowerCase(), contractAddress.toLowerCase(), "result address matches contract address");
            assert.notStrictEqual(events[0].data, null, "result data exists");
            assert.strict(events[0].topics.length > 0, "result topics not empty");
            assert.strictEqual(events[1].address.toLowerCase(), contractAddress.toLowerCase(), "result address matches contract address");
            assert.notStrictEqual(events[1].data, null, "result data exists");
            assert.strict(events[1].topics.length > 0, "result topics not empty");
        });
    }).timeout(60000);
});
//# sourceMappingURL=test-contract.spec.js.map