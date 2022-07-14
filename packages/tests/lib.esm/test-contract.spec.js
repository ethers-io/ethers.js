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
import { BigNumber, hethers } from "@hashgraph/hethers";
import fs, { readFileSync } from "fs";
import { Logger } from "@hethers/logger";
import { hexlify } from "@ethersproject/bytes";
import * as utils from './utils';
const abiToken = JSON.parse(readFileSync('packages/tests/contracts/Token.json').toString());
const abiTokenWithArgs = JSON.parse(readFileSync('packages/tests/contracts/TokenWithArgs.json').toString());
const bytecodeToken = fs.readFileSync('packages/tests/contracts/Token.bin').toString();
const bytecodeTokenWithArgs = readFileSync('packages/tests/contracts/TokenWithArgs.bin').toString();
const iUniswapV2PairAbi = JSON.parse(fs.readFileSync('packages/tests/contracts/IUniswapV2Pair.abi.json').toString());
const TIMEOUT_PERIOD = 120000;
describe('Contract.spec', () => {
    const localProvider = utils.getProviders().local[0];
    // @ts-ignore
    const testnetWalletECDSA = utils.getWallets().testnet.ecdsa[0];
    // @ts-ignore
    const localWalletECDSA = utils.getWallets().local.ecdsa[0];
    // @ts-ignore
    const localWalletED25519 = utils.getWallets().local.ed25519[1];
    describe("Test Contract Transaction Population", function () {
        it("should return an array of transactions on getDeployTransaction call", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const contractFactory = new hethers.ContractFactory(abiTokenWithArgs, bytecodeTokenWithArgs, localWalletECDSA);
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
                const contractFactory = new hethers.ContractFactory(abiTokenWithArgs, bytecodeTokenWithArgs, localWalletECDSA);
                const contract = yield contractFactory.deploy(hethers.BigNumber.from("10000"), { gasLimit: 300000 });
                assert.notStrictEqual(contract, null, "nullified contract");
                assert.notStrictEqual(contract.deployTransaction, "missing deploy transaction");
                assert.notStrictEqual(contract.address, null, 'missing address');
                const balance = yield contract.balanceOf(localWalletECDSA.address, { gasLimit: 300000 });
                assert.strictEqual(BigNumber.from(balance).toNumber(), 10000, 'balance mismatch');
            });
        }).timeout(300000);
        it("should be able to call contract methods", function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.timeout(3000000);
                const contractFactory = new hethers.ContractFactory(abiTokenWithArgs, bytecodeTokenWithArgs, localWalletECDSA);
                const contract = yield contractFactory.deploy(hethers.BigNumber.from('10000'), { gasLimit: 3000000 });
                yield contract.deployed();
                // client wallet init
                let clientWallet = hethers.Wallet.createRandom();
                const clientAccountId = (yield localWalletECDSA.createAccount(clientWallet._signingKey().compressedPublicKey)).customData.accountId;
                clientWallet = clientWallet.connect(localProvider).connectAccount(clientAccountId.toString());
                // test sending hbars to the contract
                yield localWalletECDSA.sendTransaction({
                    to: contract.address,
                    from: localWalletECDSA.address,
                    value: 30,
                    gasLimit: 300000
                });
                // test if initial balance of the client is zero
                assert.strictEqual((yield contract.balanceOf(clientWallet.address, { gasLimit: 3000000 })).toString(), '0');
                // test calling a contract view method
                const viewMethodCall = yield contract.getInternalCounter({ gasLimit: 3000000 });
                assert.strictEqual(viewMethodCall.toString(), '29');
                // test sending hbars via populateTransaction.transfer
                const populatedTx = yield contract.populateTransaction.transfer(clientWallet.address, 10, { gasLimit: 3000000 });
                const signedTransaction = yield localWalletECDSA.signTransaction(populatedTx);
                const tx = yield localWalletECDSA.provider.sendTransaction(signedTransaction);
                yield tx.wait();
                assert.strictEqual((yield contract.balanceOf(clientWallet.address, { gasLimit: 3000000 })).toString(), '10');
                // test sending hbars via contract.transfer
                const transferMethodCall = yield contract.transfer(clientWallet.address, 10, { gasLimit: 3000000 });
                yield transferMethodCall.wait();
                assert.strictEqual((yield contract.balanceOf(clientWallet.address, { gasLimit: 3000000 })).toString(), '20');
            });
        });
        it('should have a .wait function', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const contractFactory = new hethers.ContractFactory(abiToken, bytecodeToken, localWalletECDSA);
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
        }).timeout(300000);
    });
    describe('Contract Events', function () {
        return __awaiter(this, void 0, void 0, function* () {
            this.retries(3);
            this.timeout(60000);
            // const contract = hethers.ContractFactory.getContract(, abiTokenWithArgs, localWalletECDSA);
            const sleep = (timeout) => __awaiter(this, void 0, void 0, function* () {
                yield new Promise(resolve => {
                    setTimeout(resolve, timeout);
                });
            });
            const enoughEventsCaptured = (n, expectedN) => n >= expectedN;
            const mintCount = 5;
            let contract;
            this.beforeAll(() => __awaiter(this, void 0, void 0, function* () {
                const contractFactory = new hethers.ContractFactory(abiTokenWithArgs, bytecodeTokenWithArgs, localWalletECDSA);
                const factory = yield contractFactory.deploy(hethers.BigNumber.from('10000'), { gasLimit: 3000000 });
                contract = yield factory.deployed();
            })).timeout(60000);
            it("should be able to capture events via contract", function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const capturedMints = [];
                    contract.on('Mint', (...args) => {
                        assert.strictEqual(args.length, 3, "expected 3 arguments - [address, unit256, log].");
                        capturedMints.push([...args]);
                    });
                    for (let i = 0; i <= mintCount; i++) {
                        const mint = yield contract.mint(BigNumber.from(`1`), { gasLimit: 300000 });
                        yield mint.wait();
                    }
                    yield sleep(mintCount * 5000);
                    contract.removeAllListeners();
                    assert.strictEqual(enoughEventsCaptured(capturedMints.length, mintCount), true, `expected ${mintCount} captured events (Mint). Got ${capturedMints.length}`);
                    for (let mint of capturedMints) {
                        assert.strictEqual(mint[0].toLowerCase(), localWalletECDSA.address.toLowerCase(), "address mismatch - mint");
                    }
                });
            }).timeout(TIMEOUT_PERIOD * 3);
            it('should be able to capture events via provider', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const capturedMints = [];
                    localProvider.on({
                        address: contract.address, topics: [
                            '0x0f6798a560793a54c3bcfe86a93cde1e73087d944c0ea20544137d4121396885'
                        ]
                    }, (args) => {
                        assert.notStrictEqual(args, null, "expected 1 argument - log");
                        capturedMints.push([args]);
                    });
                    for (let i = 0; i <= mintCount; i++) {
                        const mint = yield contract.mint(BigNumber.from(`1`), { gasLimit: 300000 });
                        yield mint.wait();
                    }
                    yield sleep(mintCount * 5000);
                    localProvider.removeAllListeners();
                    assert.strictEqual(enoughEventsCaptured(capturedMints.length, mintCount), true, `expected ${mintCount} captured events (Mint). Got ${capturedMints.length}`);
                });
            }).timeout(TIMEOUT_PERIOD * 3);
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
                    const capturedErrors = [];
                    localProvider.on(filter, noop);
                    localProvider.on('error', (error) => {
                        assert.notStrictEqual(error, null);
                        capturedErrors.push(error);
                    });
                    yield sleep(20000);
                    const filtered = capturedErrors.filter(e => e.code === Logger.errors.INVALID_ARGUMENT);
                    assert.strictEqual(filtered.length > 0, true, "expected atleast 1 INVALID_AGRUMENT error");
                    localProvider.removeAllListeners();
                });
            }).timeout(TIMEOUT_PERIOD);
        });
    });
    describe('Contract Aliases', function () {
        return __awaiter(this, void 0, void 0, function* () {
            const gasLimit = 3000000;
            it('Should detect contract aliases', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    // TODO: deploy and use local contract address
                    const contractAlias = '0xbd438E8416b13e962781eBAfE344d45DC0DBBc0c';
                    const c1 = hethers.ContractFactory.getContract(contractAlias, iUniswapV2PairAbi.abi, testnetWalletECDSA);
                    const token0 = yield c1.token0({ gasLimit });
                    assert.notStrictEqual(token0, "");
                    assert.notStrictEqual(token0, null);
                    const token1 = yield c1.token1({ gasLimit });
                    assert.notStrictEqual(token1, "");
                    assert.notStrictEqual(token1, null);
                    const symbol = yield c1.symbol({ gasLimit });
                    assert.notStrictEqual(symbol, "");
                    assert.notStrictEqual(symbol, null);
                });
            }).timeout(300000);
            it('create2 tests', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    this.timeout(300000);
                    const factoryBytecode = fs.readFileSync('packages/tests/contracts/Factory.bin').toString();
                    const accBytecode = fs.readFileSync('packages/tests/contracts/Account.bin').toString();
                    const factoryAbi = JSON.parse(fs.readFileSync('packages/tests/contracts/Factory.abi.json').toString());
                    const accAbi = JSON.parse(fs.readFileSync('packages/tests/contracts/Account.abi.json').toString());
                    const salt = 1111;
                    const factoryCFactory = new hethers.ContractFactory(factoryAbi, factoryBytecode, localWalletECDSA);
                    const _factory = yield factoryCFactory.deploy({ gasLimit: 3000000 });
                    const factory = hethers.ContractFactory.getContract(_factory.address, factoryAbi, localWalletECDSA);
                    // the second argument is the salt we have used, and we can skip it as we defined it above
                    factory.on('Deployed', (addr, _) => __awaiter(this, void 0, void 0, function* () {
                        const account = hethers.ContractFactory.getContract(addr, accAbi, localWalletECDSA);
                        let owner = yield account.getOwner({ gasLimit: 3000000 });
                        assert.strictEqual(owner, hethers.constants.AddressZero);
                        const resp = yield account.setOwner(localWalletECDSA.address, { gasLimit: 3000000 });
                        assert.notStrictEqual(resp, null, 'expected a defined tx response');
                        owner = yield account.getOwner({ gasLimit: 3000000 });
                        assert.strictEqual(owner, localWalletECDSA.address, "expected owner to be changed after `setOwner` call");
                        factory.removeAllListeners();
                    }));
                    const deployArgs = hexlify(`0x${accBytecode}`);
                    const deployTx = yield factory.deploy(deployArgs, salt, { gasLimit: 3000000 });
                    yield deployTx.wait();
                    yield new Promise((resolve => setTimeout(resolve, 10000)));
                });
            });
        });
    });
    describe("contract.deployed with ED25519 keys", function () {
        it("should deploy a contract", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const contractFactory = new hethers.ContractFactory(abiToken, bytecodeToken, localWalletED25519);
                const contract = yield contractFactory.deploy({ gasLimit: 300000 });
                assert.notStrictEqual(contract, null, "nullified contract");
                assert.notStrictEqual(contract.deployTransaction, "missing deploy transaction");
                assert.notStrictEqual(contract.address, null, 'missing address');
                const contractDeployed = yield contract.deployed();
                assert.notStrictEqual(contractDeployed, null, "deployed returns the contract");
                assert.strictEqual(contractDeployed.address, contract.address, "deployed returns the same contract instance");
            });
        }).timeout(60000);
        it("should deploy a contract from newly created account", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const newAccount = hethers.Wallet.createRandom({ isED25519Type: true });
                const clientAccountId = (yield localWalletED25519.createAccount(newAccount._signingKey().compressedPublicKey, BigInt("10000000000"))).customData.accountId;
                const newWallet = newAccount.connect(localProvider).connectAccount(clientAccountId.toString());
                const newAccountAddress = hethers.utils.getAddressFromAccount(clientAccountId.toString());
                const newAccBalance = yield localProvider.getBalance(newAccountAddress);
                assert.strictEqual(newAccBalance.toNumber(), 10000000000);
                const contractFactory = new hethers.ContractFactory(abiToken, bytecodeToken, newWallet);
                const contract = yield contractFactory.deploy({ gasLimit: 300000 });
                assert.notStrictEqual(contract, null, "nullified contract");
                assert.notStrictEqual(contract.deployTransaction, "missing deploy transaction");
                assert.notStrictEqual(contract.address, null, 'missing address');
                const contractDeployed = yield contract.deployed();
                assert.notStrictEqual(contractDeployed, null, "deployed returns the contract");
                assert.strictEqual(contractDeployed.address, contract.address, "deployed returns the same contract instance");
            });
        }).timeout(60000);
        it("should throw error for unsufficient balance on newly created account", function () {
            return __awaiter(this, void 0, void 0, function* () {
                let exceptionThrown = false;
                let errorCode = null;
                const newAccount = hethers.Wallet.createRandom({ isED25519Type: true });
                const clientAccountId = (yield localWalletED25519.createAccount(newAccount._signingKey().compressedPublicKey)).customData.accountId;
                const newWallet = newAccount.connect(localProvider).connectAccount(clientAccountId.toString());
                try {
                    const contractFactory = new hethers.ContractFactory(abiToken, bytecodeToken, newWallet);
                    yield contractFactory.deploy({ gasLimit: 300000 });
                }
                catch (e) {
                    errorCode = e.code;
                    exceptionThrown = true;
                }
                assert.strictEqual(errorCode, 'INSUFFICIENT_PAYER_BALANCE');
                assert.strictEqual(exceptionThrown, true);
            });
        }).timeout(60000);
        it("should be able to call contract methods", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const contractFactory = new hethers.ContractFactory(abiTokenWithArgs, bytecodeTokenWithArgs, localWalletED25519);
                const contract = yield contractFactory.deploy(hethers.BigNumber.from('10000'), { gasLimit: 3000000 });
                yield contract.deployed();
                // client wallet init
                let clientWallet = hethers.Wallet.createRandom({ isED25519Type: true });
                const clientAccountId = (yield localWalletED25519.createAccount(clientWallet._signingKey().compressedPublicKey)).customData.accountId;
                clientWallet = clientWallet.connect(localProvider).connectAccount(clientAccountId.toString());
                // test sending hbars to the contract
                yield localWalletED25519.sendTransaction({
                    to: contract.address,
                    from: localWalletED25519.address,
                    value: 30,
                    gasLimit: 300000
                });
                // test if initial balance of the client is zero
                assert.strictEqual((yield contract.balanceOf(clientWallet.address, { gasLimit: 3000000 })).toString(), '0');
                // test calling a contract view method
                const viewMethodCall = yield contract.getInternalCounter({ gasLimit: 300000 });
                assert.strictEqual(viewMethodCall.toString(), '29');
                // test sending hbars via populateTransaction.transfer
                const populatedTx = yield contract.populateTransaction.transfer(clientWallet.address, 10, { gasLimit: 300000 });
                const signedTransaction = yield localWalletED25519.signTransaction(populatedTx);
                const tx = yield localWalletED25519.provider.sendTransaction(signedTransaction);
                yield tx.wait();
                assert.strictEqual((yield contract.balanceOf(clientWallet.address, { gasLimit: 300000 })).toString(), '10');
                // test sending hbars via contract.transfer
                const transferMethodCall = yield contract.transfer(clientWallet.address, 10, { gasLimit: 300000 });
                yield transferMethodCall.wait();
                assert.strictEqual((yield contract.balanceOf(clientWallet.address, { gasLimit: 300000 })).toString(), '20');
            });
        }).timeout(300000);
    });
    describe("contract.deployed", function () {
        it("should work for already deployed contracts", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const factory = new hethers.ContractFactory(abiToken, bytecodeToken, localWalletECDSA);
                const contract = yield factory.deploy({ gasLimit: 300000 });
                yield contract.deployed();
                const retrievedContract = hethers.ContractFactory.getContract(contract.address, abiToken, localWalletECDSA);
                const retrievedContractDeployed = yield retrievedContract.deployed();
                assert.notStrictEqual(retrievedContractDeployed, null, "deployed returns the contract");
                assert.strictEqual(retrievedContractDeployed.address, contract.address, "deployed returns the same contract instance");
            });
        }).timeout(60000);
        it("should work if contract is just now deployed", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const contractFactory = new hethers.ContractFactory(abiToken, bytecodeToken, localWalletECDSA);
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
        it("should filter contract events by timestamp string", function () {
            return __awaiter(this, void 0, void 0, function* () {
                const contractAddress = '0x000000000000000000000000000000000186fb1a';
                const fromTimestamp = '1642065156.264170833';
                const toTimestamp = '1642080642.176149864';
                const contract = hethers.ContractFactory.getContract(contractAddress, abiToken, testnetWalletECDSA);
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
                const contract = hethers.ContractFactory.getContract(contractAddress, abiToken, testnetWalletECDSA);
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
});
//# sourceMappingURL=test-contract.spec.js.map