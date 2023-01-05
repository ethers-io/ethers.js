"use strict";

import assert from "assert";

//import Web3HttpProvider from "web3-providers-http";

import { ethers } from "ethers";

import { fundAddress, returnFunds } from "./utils";

const bnify = ethers.BigNumber.from;

type TestCases = {
    addresses: Array<any>;
    blocks: Array<any>;
    transactions: Array<any>;
    transactionReceipts: Array<any>;
};

const blockchainData: { [ network: string ]: TestCases } = {
    homestead: {
        addresses: [
            {
                address: "0xAC1639CF97a3A46D431e6d1216f576622894cBB5",
                balance: bnify("4813414100000000"),
                code: "0x"
            },
            // Splitter contract
            {
                address: "0x3474627D4F63A678266BC17171D87f8570936622",
                code: "0x606060405260e060020a60003504630b3ed5368114602e57806337b0574a14605257806356fa47f0146062575b005b602c6004356000546101009004600160a060020a03908116339091161460bb575b50565b60005460ff166060908152602090f35b602c60043560005460ff1615609657600160a060020a038116600034606082818181858883f193505050501515604f576002565b33600160a060020a0316600034606082818181858883f193505050501515604f576002565b600080546101009004600160a060020a03169082606082818181858883f193505050501515604f57600256",
                storage: {
                    "0": "0x0000000000000000000000b2682160c482eb985ec9f3e364eec0a904c44c2300"
                }
            },
            {
                address: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
                name: "ricmoo.firefly.eth"
            },
        ],
        blocks: [
            {
                hash: "0x3d6122660cc824376f11ee842f83addc3525e2dd6756b9bcf0affa6aa88cf741",
                parentHash: "0xb495a1d7e6663152ae92708da4843337b958146015a2802f4193a410044698c9",
                number: 3,
                timestamp: 1438270048,
                nonce: "0x2e9344e0cbde83ce",
                difficulty: 17154715646,
                gasLimit: bnify("0x1388"),
                gasUsed: bnify("0"),
                miner: "0x5088D623ba0fcf0131E0897a91734A4D83596AA0",
                extraData: "0x476574682f76312e302e302d66633739643332642f6c696e75782f676f312e34",
                transactions: []
            }
        ],
        transactions: [
            {
                hash: "0xccc90ab97a74c952fb3376c4a3efb566a58a10df62eb4d44a61e106fcf10ec61",
                blockHash: "0x9653f180a5720f3634816eb945a6d722adee52cc47526f6357ac10adaf368135",
                blockNumber: 4097745,
                transactionIndex: 18,
                type: 0,
                from: "0x32DEF047DeFd076DB21A2D759aff2A591c972248",
                gasPrice: bnify("0x4a817c800"),
                gasLimit: bnify("0x3d090"),
                to: "0x6fC21092DA55B392b045eD78F4732bff3C580e2c",
                value: bnify("0x186cc6acd4b0000"),
                nonce: 0,
                data: "0xf2c298be000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000067269636d6f6f0000000000000000000000000000000000000000000000000000",
                r: "0x1e5605197a03e3f0a168f14749168dfeefc44c9228312dacbffdcbbb13263265",
                s: "0x269c3e5b3558267ad91b0a887d51f9f10098771c67b82ea6cb74f29638754f54",
                v: 38,
                creates: null,
                //raw: "0xf8d2808504a817c8008303d090946fc21092da55b392b045ed78f4732bff3c580e2c880186cc6acd4b0000b864f2c298be000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000067269636d6f6f000000000000000000000000000000000000000000000000000026a01e5605197a03e3f0a168f14749168dfeefc44c9228312dacbffdcbbb13263265a0269c3e5b3558267ad91b0a887d51f9f10098771c67b82ea6cb74f29638754f54",
                chainId: 1
            }
        ],
        transactionReceipts: [
            {
                blockHash: "0x36b4af7f0538559e581c8588f16477df0f676439ea67fe8d7a2ae4abb20e2566",
                blockNumber: 0x3c92b5,
                type: 0,
                contractAddress: null,
                cumulativeGasUsed: 0x1cca2e,
                from: "0x18C6045651826824FEBBD39d8560584078d1b247",
                gasUsed:0x14bb7,
                logs: [
                    {
                        address: "0x314159265dD8dbb310642f98f50C066173C1259b",
                        blockHash: "0x36b4af7f0538559e581c8588f16477df0f676439ea67fe8d7a2ae4abb20e2566",
                        blockNumber: 0x3c92b5,
                        data: "0x00000000000000000000000018c6045651826824febbd39d8560584078d1b247",
                        logIndex: 0x1a,
                        topics: [
                            "0xce0457fe73731f824cc272376169235128c118b49d344817417c6d108d155e82",
                            "0x93cdeb708b7545dc668eb9280176169d1c33cfd8ed6f04690a0bcc88a93fc4ae",
                            "0xf0106919d12469348e14ad6a051d0656227e1aba2fefed41737fdf78421b20e1"
                        ],
                        transactionHash: "0xc6fcb7d00d536e659a4559d2de29afa9e364094438fef3e72ba80728ce1cb616",
                        transactionIndex: 0x39,
                    },
                    {
                        address: "0x6090A6e47849629b7245Dfa1Ca21D94cd15878Ef",
                        blockHash: "0x36b4af7f0538559e581c8588f16477df0f676439ea67fe8d7a2ae4abb20e2566",
                        blockNumber: 0x3c92b5,
                        data: "0x000000000000000000000000000000000000000000000000002386f26fc1000000000000000000000000000000000000000000000000000000000000595a32ce",
                        logIndex: 0x1b,
                        topics: [
                            "0x0f0c27adfd84b60b6f456b0e87cdccb1e5fb9603991588d87fa99f5b6b61e670",
                            "0xf0106919d12469348e14ad6a051d0656227e1aba2fefed41737fdf78421b20e1",
                            "0x00000000000000000000000018c6045651826824febbd39d8560584078d1b247"
                        ],
                        transactionHash: "0xc6fcb7d00d536e659a4559d2de29afa9e364094438fef3e72ba80728ce1cb616",
                        transactionIndex: 0x39,
                    }
                ],
                logsBloom: "0x00000000000000040000000000100000010000000000000040000000000000000000000000000000000000000000000000000000000010000000000000000000000000000000000000000000000000000200000010000000004000000000000000000000000000000000002000000000000000000000000400000000020000000000000000000000000000000000000004000000000000000000000000000000000000000000000000801000000000000000000000020000000000040000000040000000000000000002000000004000000000000000000000000000000000000000000000010000000000000000000000000000000000200000000000000000",
                //root: "0x9b550a9a640ce50331b64504ef87aaa7e2aaf97344acb6ff111f879b319d2590",
                status: null,
                to: "0x6090A6e47849629b7245Dfa1Ca21D94cd15878Ef",
                transactionHash: "0xc6fcb7d00d536e659a4559d2de29afa9e364094438fef3e72ba80728ce1cb616",
                transactionIndex: 0x39
            },
            // Byzantium block
            {
                byzantium: true,
                blockHash: "0x34e5a6cfbdbb84f7625df1de69d218ade4da72f4a2558064a156674e72e976c9",
                blockNumber: 0x444f76,
                type: 0,
                contractAddress: null,
                cumulativeGasUsed: 0x15bfe7,
                from: "0x18C6045651826824FEBBD39d8560584078d1b247",
                gasUsed: 0x1b968,
                logs: [
                    {
                        address: "0xb90E64082D00437e65A76d4c8187596BC213480a",
                        blockHash: "0x34e5a6cfbdbb84f7625df1de69d218ade4da72f4a2558064a156674e72e976c9",
                        blockNumber: 0x444f76,
                        data: "0x",
                        logIndex: 0x10,
                        topics: [
                            "0x748d071d1992ee1bfe7a39058114d0a50d5798fe8eb3a9bfb4687f024629a2ce",
                            "0x5574aa58f7191ccab6de6cf75fe2ea0484f010b852fdd8c6b7ae151d6c2f4b83"
                        ],
                        transactionHash: "0x7f1c6a58dc880438236d0b0a4ae166e9e9a038dbea8ec074149bd8b176332cac",
                        transactionIndex: 0x1e,
                    }
                ],
                logsBloom: "0x00000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000200000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000800000000000000000800000000000000000000000000000000000000",
                status:1,
                to: "0xb90E64082D00437e65A76d4c8187596BC213480a",
                transactionHash: "0x7f1c6a58dc880438236d0b0a4ae166e9e9a038dbea8ec074149bd8b176332cac",
                transactionIndex: 0x1e
            }
        ]
    },
    goerli: {
        addresses: [
            {
                address: "0x06B5955A67D827CDF91823E3bB8F069e6c89c1D6",
                balance: bnify("314159000000000000"),
                code: "0x"
            },
        ],
        blocks: [
            {
                hash: "0xd5daa825732729bb0d2fd187a1b888e6bfc890f1fc5333984740d9052afb2920",
                parentHash: "0xe675f1362d82cdd1ec260b16fb046c17f61d8a84808150f5d715ccce775f575e",
                number: 3,
                timestamp: 1548947483,
                difficulty: 2,
                gasLimit: bnify("10455073"),
                gasUsed: bnify("0"),
//                miner: "0xe0a2Bd4258D2768837BAa26A28fE71Dc079f84c7",
                extraData: "0x506172697479205465636820417574686f7269747900000000000000000000002822e1b202411c38084d96c84302b8361ec4840a51cd2fad9cb4bd9921cad7e64bc2e5dc7b41f3f75b33358be3aec718cf4d4317ace940e01b3581a95c9259ac01",
                transactions: []
            },
            // Blockhash with leading zero; see #629
            {
                hash: "0x0f305466552efa183a0de26b6fda26d55a872dbc02aca8b5852cc2a361ce9ee4",
                parentHash: "0x6723e880e01c15c5ac894abcae0f5b55ea809a31eaf5618998928f7d9cbc5118",
                number: 1479831,
                timestamp: 1571216171,
                difficulty: 2,
                gasLimit: bnify(0x7a1200),
                gasUsed: bnify("0x0d0ef5"),
//                miner: "0x22eA9f6b28DB76A7162054c05ed812dEb2f519Cd",
                extraData: "0x0000000000000000000000000000000000000000000000000000000000000000f4e6fc1fbd88adf57a272d98f725487f872ef0495a54c2b873a58d14e010bf517cc5650417f18cfd4ad2396272c564a7da1265ae27c397609293f488ec57d68e01",
                transactions: [
                     "0xea29f0764f03c5c67ac53a866a28ce23a4a032c2de4327e452b39f482920761a",
                     "0x0eef23ffb59ac41762fdfa55d9e47e82fa7f0b70b1e8ec486d72fe1fee15f6de",
                     "0xba1eeb67ac6e8d1aa900ff6fbd84ac46869c9e100b33f787acfb234cd9c93f9f",
                     "0x4f412ab735b29ddc8b1ff7abe4bfece7ad4684aa20e260fbc42aed75a0d387ea",
                     "0x2f1fddcc7a2c4b2b7d83c5cadec4e7b71c34cec65da99b1114bd2b044ae0636c"
                 ]
            }
        ],
        transactions: [
        ],
        transactionReceipts: [
            {
                blockHash: "0x2384e8e8bdcf6eb87ec7c138fa503ac34adb32cac817e4b35f14d4339eaa1993",
                blockNumber: 47464,
                byzantium: true,
                type: 0,
                contractAddress: null,
                cumulativeGasUsed: bnify(21000),
                from: "0x8c1e1e5b47980D214965f3bd8ea34C413E120ae4",
                gasUsed: bnify(21000),
                logsBloom: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
                to: "0x58Bb4221245461E1d4cf886f18a01E3Df40Bd359",
                transactionHash: "0xec8b1ac5d787f36c738cc7793fec606283b41f1efa69df4ae6b2a014dcd12797",
                transactionIndex: 0,
                logs: [],
                status: 1
            }
        ],
    }
}

blockchainData["default"] = blockchainData.homestead;

function equals(name: string, actual: any, expected: any): void {
    if (expected && expected.eq) {
        if (actual == null) { assert.ok(false, name + " - actual big number null"); }
        expected = ethers.BigNumber.from(expected);
        actual = ethers.BigNumber.from(actual);
        assert.ok(expected.eq(actual), name + " matches");

    } else if (Array.isArray(expected)) {
        if (actual == null) { assert.ok(false, name + " - actual array null"); }
        assert.equal(actual.length, expected.length, name + " array lengths match");
        for (let i = 0; i < expected.length; i++) {
            equals("(" + name + " - item " + i + ")", actual[i], expected[i]);
        }

    } else if (typeof(expected) === "object") {
        if (actual == null) {
           if (expected === actual) { return; }
           assert.ok(false, name + " - actual object null");
        }

        let keys: { [ key: string ]: boolean } = {};
        Object.keys(expected).forEach((key) => { keys[key] = true; });
        Object.keys(actual).forEach((key) => { keys[key] = true; });

        Object.keys(keys).forEach((key) => {
            equals("(" + name + " - key + " + key + ")", actual[key], expected[key]);
        });

    } else {
        if (actual == null) { assert.ok(false, name + " - actual null"); }
        assert.equal(actual, expected, name + " matches");
    }
}

function waiter(duration: number): Promise<void> {
    return new Promise((resolve) => {
        const timer = setTimeout(resolve, duration);
        if (timer.unref) { timer.unref(); }
    });
}


type ProviderDescription = {
    name: string;
    networks: Array<string>;
    create: (network: string) => ethers.providers.Provider;
};

type CheckSkipFunc = (provider: string, network: string, test: TestDescription) => boolean;

type TestDescription = {
    name: string;
    networks: Array<string>;
    execute: (provider: ethers.providers.Provider) => Promise<void>;

    attempts?: number;
    timeout?: number;
    extras?: Array<"nowait" | "funding">;
    checkSkip?: CheckSkipFunc;
};


const allNetworks = [ "default", "homestead", "goerli" ];

// We use separate API keys because otherwise the testcases sometimes
// fail during CI because our default keys are pretty heavily used
const _ApiKeys: Record<string, string> = {
    alchemy: "YrPw6SWb20vJDRFkhWq8aKnTQ8JRNRHM",
    etherscan: "FPFGK6JSW2UHJJ2666FG93KP7WC999MNW7",
    infura: "49a0efa3aaee4fd99797bfa94d8ce2f1",
    pocket: "62fd9de24b068e0039c16996"
};

type ApiKeySet = {
    alchemy: string;
    etherscan: string;
    infura: string;
    pocket: string;
};

function getApiKeys(network: string): ApiKeySet {
    if (network === "default" || network == null) { network = "homestead"; }
    const apiKeys = ethers.utils.shallowCopy(_ApiKeys);
    //apiKeys.pocket = _ApiKeysPocket[network];
    return <ApiKeySet>apiKeys;
}

const providerFunctions: Array<ProviderDescription> = [
    {
        name: "getDefaultProvider",
        networks: allNetworks,
        create: (network: string) => {
            if (network == "default") {
                return ethers.getDefaultProvider(null, getApiKeys(network));
            }
            return ethers.getDefaultProvider(network, getApiKeys(network));
        }
    },
    {
        name: "AlchemyProvider",
        networks: allNetworks,
        create: (network: string) => {
            if (network == "default") {
                return new ethers.providers.AlchemyProvider(null, getApiKeys(network).alchemy);
            }
            return new ethers.providers.AlchemyProvider(network, getApiKeys(network).alchemy);
        }
    },
    {
        name: "AnkrProvider",
        networks: [ "default", "homestead" ],
        create: (network: string) => {
            if (network == "default") {
                return new ethers.providers.AnkrProvider(null);
            }
            return new ethers.providers.AnkrProvider(network);
        }
    },
    /*
    {
        name: "CloudflareProvider",
        networks: [ "default", "homestead" ],
        create: (network: string) => {
            return new ethers.providers.CloudflareProvider(network);
        }
    },
    */
    {
        name: "InfuraProvider",
        networks: allNetworks,
        create: (network: string) => {
            if (network == "default") {
                return new ethers.providers.InfuraProvider(null, getApiKeys(network).infura);
            }
            return new ethers.providers.InfuraProvider(network, getApiKeys(network).infura);
        }
    },
    {
        name: "EtherscanProvider",
        networks: allNetworks,
        create: (network: string) => {
            if (network == "default") {
                return new ethers.providers.EtherscanProvider(null, getApiKeys(network).etherscan);
            }
            return new ethers.providers.EtherscanProvider(network, getApiKeys(network).etherscan);
        }
    },
    {
        name: "NodesmithProvider",
        networks: [ ],
        create: (network: string) => {
            throw new Error("not tested");
        }
    },
    {
        name: "PocketProvider",
        networks: [ "default", "homestead", "goerli" ],
        create: (network: string) => {
            if (network == "default") {
                return new ethers.providers.PocketProvider(null, {
                    applicationId: getApiKeys(network).pocket,
                    loadBalancer: true
                });
            }
            return new ethers.providers.PocketProvider(network, {
                applicationId: getApiKeys(network).pocket,
                loadBalancer: true
            });
        }
    },
    {
        name: "Web3Provider",
        networks: [ ],
        create: (network: string) => {
            throw new Error("not tested");
        }
    }
];

// This wallet can be funded and used for various test cases
const fundWallet = ethers.Wallet.createRandom();


const testFunctions: Array<TestDescription> = [ ];

Object.keys(blockchainData).forEach((network) => {
    function addSimpleTest(name: string, func: (provider: ethers.providers.Provider) => Promise<any>, expected: any) {
        testFunctions.push({
            name: name,
            networks: [ network ],
            execute: async (provider: ethers.providers.Provider) => {
                const value = await func(provider);
                equals(name, expected, value);
            }
        });
    }

    function addObjectTest(name: string, func: (provider: ethers.providers.Provider) => Promise<any>, expected: any, checkSkip?: CheckSkipFunc) {
        testFunctions.push({
            name,
            networks: [ network ],
            checkSkip,
            execute: async (provider: ethers.providers.Provider) => {
                const value = await func(provider);
                Object.keys(expected).forEach((key) => {
                    equals(`${ name }.${ key }`, value[key], expected[key]);
                });
            }
        });
    }

    const tests: TestCases = blockchainData[network];

    // And address test case can have any of the following:
    // - balance
    // - code
    // - storage
    // - ENS name
    tests.addresses.forEach((test) => {
        if (test.balance) {
            addSimpleTest(`fetches account balance: ${ test.address }`, (provider: ethers.providers.Provider) => {
                return provider.getBalance(test.address);
            }, test.balance);
        }

        if (test.code) {
            addSimpleTest(`fetches account code: ${ test.address }`, (provider: ethers.providers.Provider) => {
                return provider.getCode(test.address);
            }, test.code);
        }

        if (test.storage) {
            Object.keys(test.storage).forEach((position) => {
                addSimpleTest(`fetches storage: ${ test.address }:${ position }`, (provider: ethers.providers.Provider) => {
                    return provider.getStorageAt(test.address, bnify(position));
                }, test.storage[position]);
            });
        }

        if (test.name) {
            addSimpleTest(`fetches ENS name: ${ test.address }`, (provider: ethers.providers.Provider) => {
                return provider.resolveName(test.name);
            }, test.address);
        }
    });

    tests.blocks.forEach((test) => {
        addObjectTest(`fetches block (by number) #${ test.number }`, (provider: ethers.providers.Provider) => {
            return provider.getBlock(test.number);
        }, test);
    });

    tests.blocks.forEach((test) => {
        addObjectTest(`fetches block (by hash) ${ test.hash }`, (provider: ethers.providers.Provider) => {
            return provider.getBlock(test.hash);
        }, test, (provider: string, network: string, test: TestDescription) => {
            return (provider === "EtherscanProvider");
        });
    });

    tests.transactions.forEach((test) => {
        const hash = test.hash;
        addObjectTest(`fetches transaction ${ hash }`, async (provider: ethers.providers.Provider) => {
            const tx = await provider.getTransaction(hash);

            // This changes with every block
            assert.equal(typeof(tx.confirmations), "number", "confirmations is a number");
            delete tx.confirmations;

            assert.equal(typeof(tx.wait), "function", "wait is a function");
            delete tx.wait

            return tx;
        }, test, (provider: string, network: string, test: TestDescription) => {
            // Temporary; pocket is being broken again for old transactions
            return provider === "PocketProvider";
            //return false;
        });
    });

    tests.transactionReceipts.forEach((test) => {
        const hash = test.transactionHash;
        addObjectTest(`fetches transaction receipt ${ hash }`, async (provider: ethers.providers.Provider) => {
            const receipt = await provider.getTransactionReceipt(hash);
            assert.ok(!!receipt, "missing receipt");

            if (test.status === null) {
                assert.ok(receipt.status === undefined, "no status");
                receipt.status = null;
            }

            // This changes with every block; so just make sure it is a number
            assert.equal(typeof(receipt.confirmations), "number", "confirmations is a number");
            delete receipt.confirmations;

            return receipt;
        }, test, (provider: string, network: string, test: TestDescription) => {
            // Temporary; pocket is being broken again for old transactions
            return provider === "PocketProvider";
            //return false;
        });
    });
});

(function() {
    function addErrorTest(code: string, func: (provider: ethers.providers.Provider) => Promise<any>) {
        testFunctions.push({
            name: `throws correct ${ code } error`,
            networks: [ "goerli" ],
            checkSkip: (provider: string, network: string, test: TestDescription) => {
                return false;
            },
            execute: async (provider: ethers.providers.Provider) => {
                try {
                    const value = await func(provider);
                    console.log(value);
                    assert.ok(false, "did not throw");
                } catch (error) {
                    assert.equal(error.code, code, `incorrect error thrown: actual:${ error.code } != expected:${ code }`);
                }
            }
        });
    }

    /*
    @TODO: Use this for testing pre-EIP-155 transactions on specific networks
    addErrorTest(ethers.utils.Logger.errors.NONCE_EXPIRED, async (provider: ethers.providers.Provider) => {
        return provider.sendTransaction("0xf86480850218711a0082520894000000000000000000000000000000000000000002801ba038aaddcaaae7d3fa066dfd6f196c8348e1bb210f2c121d36cb2c24ef20cea1fba008ae378075d3cd75aae99ab75a70da82161dffb2c8263dabc5d8adecfa9447fa");
    });
    */

    // Wallet(id("foobar1234"))
    addErrorTest(ethers.utils.Logger.errors.NONCE_EXPIRED, async (provider: ethers.providers.Provider) => {
        return provider.sendTransaction("0x02f86e05808459682f008459682f14830186a09475544911a6f2e69ceea374f3f7e5ea9c987ece098304cb2f80c001a0d9585a780dde9e7d8c855aacec0564054b49114931fd7e320e4e983009d864f7a050bee916f2770ef17367256d8bccfbc49885467a6ba27cf5cc57e8553c73a191");
    });

    addErrorTest(ethers.utils.Logger.errors.INSUFFICIENT_FUNDS, async (provider: ethers.providers.Provider) => {
        const txProps = {
            to: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
            gasPrice: 9000000000,
            gasLimit: 21000,
            chainId: 5,
            value: 1,
        };

        const wallet = ethers.Wallet.createRandom();
        const tx = await wallet.signTransaction(txProps);
        return provider.sendTransaction(tx);
    });

    addErrorTest(ethers.utils.Logger.errors.INSUFFICIENT_FUNDS, async (provider: ethers.providers.Provider) => {
        const txProps = {
            to: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
            gasPrice: 9000000000,
            gasLimit: 21000,
            value: 1,
        };

        const wallet = ethers.Wallet.createRandom().connect(provider);
        return wallet.sendTransaction(txProps);
    });

    addErrorTest(ethers.utils.Logger.errors.UNPREDICTABLE_GAS_LIMIT, async (provider: ethers.providers.Provider) => {
        return provider.estimateGas({
            to: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e" // ENS contract
        });
    });
})();

/*
testFunctions.push({
    name: "sends a legacy transaction",
    extras: [ "funding" ],         // We need funding to the fundWallet
    timeout: 900,                  // 15 minutes
    networks: [ "goerli" ],       // Only test on Goerli
    checkSkip: (provider: string, network: string, test: TestDescription) => {
        // This isn't working right now on Ankr
        return (provider === "AnkrProvider");
    },
    execute: async (provider: ethers.providers.Provider) => {
        const gasPrice = (await provider.getGasPrice()).mul(10);

        const wallet = fundWallet.connect(provider);

        const addr = "0x8210357f377E901f18E45294e86a2A32215Cc3C9";

        await waiter(3000);

        const b0 = await provider.getBalance(wallet.address);
        assert.ok(b0.gt(ethers.constants.Zero), "balance is non-zero");

        const tx = await wallet.sendTransaction({
            type: 0,
            to: addr,
            value: 123,
            gasPrice: gasPrice
        });

        await tx.wait();

        await waiter(3000);

        const b1 = await provider.getBalance(wallet.address);
        assert.ok(b0.gt(b1), "balance is decreased");
    }
});
*/

testFunctions.push({
    name: "sends an EIP-2930 transaction",
    extras: [ "funding" ],         // We need funding to the funWallet
    timeout: 900,                  // 15 minutes
    networks: [ "goerli" ],       // Only test on Goerli
    checkSkip: (provider: string, network: string, test: TestDescription) => {
        // This isn't working right now on Ankr
        return (provider === "AnkrProvider");
    },
    execute: async (provider: ethers.providers.Provider) => {
        const gasPrice = (await provider.getGasPrice()).mul(10);

        const wallet = fundWallet.connect(provider);

        const addr = "0x8210357f377E901f18E45294e86a2A32215Cc3C9";

        await waiter(3000);

        const b0 = await provider.getBalance(wallet.address);
        assert.ok(b0.gt(ethers.constants.Zero), "balance is non-zero");

        const tx = await wallet.sendTransaction({
            type: 1,
            //chainId: (await provider.getNetwork()).chainId,
            accessList: {
                "0x8ba1f109551bD432803012645Ac136ddd64DBA72": [
                    "0x0000000000000000000000000000000000000000000000000000000000000000",
                    "0x0000000000000000000000000000000000000000000000000000000000000042",
                ]
            },
            to: addr,
            value: 123,
            gasPrice: gasPrice
        });

        await tx.wait();

        await waiter(3000);

        const b1 = await provider.getBalance(wallet.address);
        assert.ok(b0.gt(b1), "balance is decreased");
    }
});

testFunctions.push({
    name: "sends an EIP-1559 transaction",
    extras: [ "funding" ],         // We need funding to the funWallet
    timeout: 900,                  // 15 minutes
    networks: [ "goerli" ],       // Only test on Goerli
    checkSkip: (provider: string, network: string, test: TestDescription) => {
        // These don't support EIP-1559 yet for sending
        //return (provider === "AlchemyProvider" );
        return (provider === "AnkrProvider" );
    },
    execute: async (provider: ethers.providers.Provider) => {
        const wallet = fundWallet.connect(provider);

        const addr = "0x8210357f377E901f18E45294e86a2A32215Cc3C9";

        await waiter(3000);

        const b0 = await provider.getBalance(wallet.address);
        assert.ok(b0.gt(ethers.constants.Zero), "balance is non-zero");

        const tx = await wallet.sendTransaction({
            type: 2,
            accessList: {
                "0x8ba1f109551bD432803012645Ac136ddd64DBA72": [
                    "0x0000000000000000000000000000000000000000000000000000000000000000",
                    "0x0000000000000000000000000000000000000000000000000000000000000042",
                ]
            },
            to: addr,
            value: 123,
        });

        await tx.wait();

        await waiter(3000);

        const b1 = await provider.getBalance(wallet.address);
        assert.ok(b0.gt(b1), "balance is decreased");
    }
});

describe("Test Provider Methods", function() {
    let fundReceipt: Promise<string> = null;

    before(async function() {
        this.timeout(300000);

        // Get some ether from the faucet
        //const funder = await ethers.utils.fetchJson(`https:/\/api.ethers.io/api/v1/?action=fundAccount&address=${ fundWallet.address.toLowerCase() }`);
        fundReceipt = fundAddress(fundWallet.address).then((hash) => {
            console.log(`*** Funded: ${ fundWallet.address }`);
            return hash;
        });
    });

    after(async function() {
        this.timeout(300000);

        // Wait until the funding is complete
        await fundReceipt;

        // Refund all unused ether to the faucet
        const hash = await returnFunds(fundWallet);

        console.log(`*** Sweep Transaction:`, hash);
    });

    providerFunctions.forEach(({ name, networks, create}) => {

        networks.forEach((network) => {
            const provider = create(network);

            testFunctions.forEach((test) => {

                // Skip tests not supported on this network
                if (test.networks.indexOf(network) === -1) { return; }
                if (test.checkSkip && test.checkSkip(name, network, test)) {
                    return;
                }

                // How many attempts to try?
                const attempts = (test.attempts != null) ? test.attempts: 3;
                const timeout = (test.timeout != null) ? test.timeout: 60;
                const extras = (test.extras || []).reduce((accum, key) => {
                    accum[key] = true;
                    return accum;
                }, <Record<string, boolean>>{ });

                it(`${ name }.${ network ? network: "default" } ${ test.name}`, async function() {
                    // Multiply by 2 to make sure this never happens; we want our
                    // timeout logic to success, not allow a done() called multiple
                    // times because our logic returns after the timeout has occurred.
                    this.timeout(2 * (1000 + timeout * 1000 * attempts));

                    // Wait for the funding transaction to be mined
                    if (extras.funding) { await fundReceipt; }

                    // We wait at least 1 seconds between tests
                    if (!extras.nowait) { await waiter(1000); }

                    let error: Error = null;
                    for (let attempt = 0; attempt < attempts; attempt++) {
                        try {
                            const result = await Promise.race([
                                test.execute(provider),
                                waiter(timeout * 1000).then((result) => { throw new Error("timeout"); })
                            ]);
                            return result;
                        } catch (attemptError) {
                            console.log(`*** Failed attempt ${ attempt + 1 }: ${ attemptError.message }`);
                            error = attemptError;

                            // On failure, wait 5s
                            await waiter(5000);
                        }
                    }
                    throw error;
                });
            });
        });
    });

});

describe("Extra tests", function() {
    it("etherscan long-request #1093", async function() {
        this.timeout(60000);
        await waiter(2000);
        const provider = new ethers.providers.EtherscanProvider(null, getApiKeys(null).etherscan);
        const value = await provider.call({
            to: "0xbf320b8336b131e0270295c15478d91741f9fc11",
            data: "0x3ad206cc000000000000000000000000f6e914d07d12636759868a61e52973d17ed7111b0000000000000000000000000000000000000000000000000000000000000040000000000000000000000000000000000000000000000000000000000000006400000000000000000000000022b3faaa8df978f6bafe18aade18dc2e3dfa0e0c000000000000000000000000998b3b82bc9dba173990be7afb772788b5acb8bd000000000000000000000000ba11d00c5f74255f56a5e366f4f77f5a186d7f55000000000000000000000000c7579bb99af590ec71c316e1ac4436c5350395940000000000000000000000002a05d22db079bc40c2f77a1d1ff703a56e631cc10000000000000000000000000d8775f648430679a709e98d2b0cb6250d2887ef0000000000000000000000009a0242b7a33dacbe40edb927834f96eb39f8fbcb000000000000000000000000c78593c17482ea5de44fdd84896ffd903972878e000000000000000000000000e7d3e4413e29ae35b0893140f4500965c74365e500000000000000000000000037d40510a2f5bc98aa7a0f7bf4b3453bcfb90ac10000000000000000000000004a6058666cf1057eac3cd3a5a614620547559fc900000000000000000000000035a69642857083ba2f30bfab735dacc7f0bac96900000000000000000000000084f7c44b6fed1080f647e354d552595be2cc602f0000000000000000000000001500205f50bf3fd976466d0662905c9ff254fc9c000000000000000000000000660b612ec57754d949ac1a09d0c2937a010dee05000000000000000000000000acfa209fb73bf3dd5bbfb1101b9bc999c49062a5000000000000000000000000865d176351f287fe1b0010805b110d08699c200a000000000000000000000000633a8f8e557702039463f9f2eb20b7936fff8c050000000000000000000000001961b3331969ed52770751fc718ef530838b6dee0000000000000000000000002fb12bccf6f5dd338b76be784a93ade0724256900000000000000000000000004d8fc1453a0f359e99c9675954e656d80d996fbf0000000000000000000000006aeb95f06cda84ca345c2de0f3b7f96923a44f4c0000000000000000000000008aa33a7899fcc8ea5fbe6a608a109c3893a1b8b200000000000000000000000014c926f2290044b647e1bf2072e67b495eff1905000000000000000000000000763186eb8d4856d536ed4478302971214febc6a90000000000000000000000008a1e3930fde1f151471c368fdbb39f3f63a65b55000000000000000000000000a8daa52ded91f7c82b4bb02b4b87c6a841db1fd500000000000000000000000033803edf44a71b9579f54cd429b53b06c0eeab83000000000000000000000000026e62dded1a6ad07d93d39f96b9eabd59665e0d00000000000000000000000047da42696a866cdc61a4c809a515500a242909c100000000000000000000000008b4c866ae9d1be56a06e0c302054b4ffe067b43000000000000000000000000420335d3deef2d5b87524ff9d0fb441f71ea621f000000000000000000000000983f7cc12d0b5d512b0f91f51a4aa478ac4def46000000000000000000000000b2bfeb70b903f1baac7f2ba2c62934c7e5b974c40000000000000000000000009b11b1b271a224a271619f3419b1b080fdec5b4a0000000000000000000000007b1309c1522afd4e66c31e1e6d0ec1319e1eba5e000000000000000000000000959529102cfde07b1196bd27adedc196d75f84f6000000000000000000000000107c4504cd79c5d2696ea0030a8dd4e92601b82e000000000000000000000000539efe69bcdd21a83efd9122571a64cc25e0282b000000000000000000000000e5a7c12972f3bbfe70ed29521c8949b8af6a0970000000000000000000000000f8ad7dfe656188a23e89da09506adf7ad9290d5d0000000000000000000000005732046a883704404f284ce41ffadd5b007fd668000000000000000000000000df6ef343350780bf8c3410bf062e0c015b1dd671000000000000000000000000f028adee51533b1b47beaa890feb54a457f51e89000000000000000000000000dd6bf56ca2ada24c683fac50e37783e55b57af9f000000000000000000000000ef51c9377feb29856e61625caf9390bd0b67ea18000000000000000000000000c80c5e40220172b36adee2c951f26f2a577810c50000000000000000000000001f573d6fb3f13d689ff844b4ce37794d79a7ff1c000000000000000000000000d2d6158683aee4cc838067727209a0aaf4359de30000000000000000000000007cdec53fe4770729dac314756c10e2f37b8d2b2f000000000000000000000000cc34366e3842ca1bd36c1f324d15257960fcc8010000000000000000000000006b01c3170ae1efebee1a3159172cb3f7a5ecf9e5000000000000000000000000139d9397274bb9e2c29a9aa8aa0b5874d30d62e300000000000000000000000063f584fa56e60e4d0fe8802b27c7e6e3b33e007f000000000000000000000000780116d91e5592e58a3b3c76a351571b39abcec60000000000000000000000000e511aa1a137aad267dfe3a6bfca0b856c1a3682000000000000000000000000327682779bab2bf4d1337e8974ab9de8275a7ca80000000000000000000000001b80eeeadcc590f305945bcc258cfa770bbe18900000000000000000000000005af2be193a6abca9c8817001f45744777db307560000000000000000000000009e77d5a1251b6f7d456722a6eac6d2d5980bd891000000000000000000000000e25f0974fea47682f6a7386e4217da70512ec997000000000000000000000000558ec3152e2eb2174905cd19aea4e34a23de9ad6000000000000000000000000b736ba66aad83adb2322d1f199bfa32b3962f13c000000000000000000000000509a38b7a1cc0dcd83aa9d06214663d9ec7c7f4a0000000000000000000000000327112423f3a68efdf1fcf402f6c5cb9f7c33fd0000000000000000000000005acd19b9c91e596b1f062f18e3d02da7ed8d1e5000000000000000000000000003df4c372a29376d2c8df33a1b5f001cd8d68b0e0000000000000000000000006aac8cb9861e42bf8259f5abdc6ae3ae89909e11000000000000000000000000d96b9fd7586d9ea24c950d24399be4fb65372fdd00000000000000000000000073dd069c299a5d691e9836243bcaec9c8c1d87340000000000000000000000005ecd84482176db90bb741ddc8c2f9ccc290e29ce000000000000000000000000fa456cf55250a839088b27ee32a424d7dacb54ff000000000000000000000000b683d83a532e2cb7dfa5275eed3698436371cc9f000000000000000000000000ccbf21ba6ef00802ab06637896b799f7101f54a20000000000000000000000007b123f53421b1bf8533339bfbdc7c98aa94163db0000000000000000000000006ecccf7ebc3497a9334f4fe957a7d5fa933c5bcc0000000000000000000000004fabb145d64652a948d72533023f6e7a623c7c53000000000000000000000000e1aee98495365fc179699c1bb3e761fa716bee6200000000000000000000000056d811088235f11c8920698a204a5010a788f4b300000000000000000000000026e75307fc0c021472feb8f727839531f112f3170000000000000000000000007d4b8cce0591c9044a22ee543533b72e976e36c30000000000000000000000003c6a7ab47b5f058be0e7c7fe1a4b7925b8aca40e0000000000000000000000001d462414fe14cf489c7a21cac78509f4bf8cd7c000000000000000000000000043044f861ec040db59a7e324c40507addb67314200000000000000000000000004f2e7221fdb1b52a68169b25793e51478ff0329000000000000000000000000954b890704693af242613edef1b603825afcd708000000000000000000000000a8f93faee440644f89059a2c88bdc9bf3be5e2ea0000000000000000000000001234567461d3f8db7496581774bd869c83d51c9300000000000000000000000056ba2ee7890461f463f7be02aac3099f6d5811a80000000000000000000000006c8c6b02e7b2be14d4fa6022dfd6d75921d90e4e000000000000000000000000f444cd92e09cc8b2a23cd2eecb3c1e4cc8da6958000000000000000000000000cf8f9555d55ce45a3a33a81d6ef99a2a2e71dee2000000000000000000000000076c97e1c869072ee22f8c91978c99b4bcb0259100000000000000000000000017b26400621695c2d8c2d8869f6259e82d7544c4000000000000000000000000679badc551626e01b23ceecefbc9b877ea18fc46000000000000000000000000336f646f87d9f6bc6ed42dd46e8b3fd9dbd15c220000000000000000000000005d3a536e4d6dbd6114cc1ead35777bab948e3643000000000000000000000000f5dce57282a584d2746faf1593d3121fcac444dc0000000000000000000000001d9e20e581a5468644fe74ccb6a46278ef377f9e000000000000000000000000177d39ac676ed1c67a2b268ad7f1e58826e5b0af"
        });
        assert.ok(!!value);
    });
});

/*
describe("Test extra Etherscan operations", function() {
    let provider = new providers.EtherscanProvider();
    it("fethces the current price of ether", function() {
        this.timeout(20000);
        return provider.getEtherPrice().then(function(price) {
            assert.ok(typeof(price) === "number", "Etherscan price returns a number");
            assert.ok(price > 0.0, "Etherscan price returns non-zero");
        });
    });
    it("fetches the history", function() {
        this.timeout(100000);
        return provider.getHistory("ricmoo.firefly.eth").then(function(history) {
            assert.ok(history.length > 40, "Etherscan history returns results");
            assert.equal(history[0].hash, "0xd25f550cfdff90c086a6496a84dbb2c4577df15b1416e5b3319a3e4ebb5b25d8", "Etherscan history returns correct transaction");
        });
    });
});
*/

describe("Test Basic Authentication", function() {
    //this.retries(3);

    // https://stackoverflow.com/questions/6509278/authentication-test-servers#16756383

    type TestCase = {
        url: string;
        user: string;
        password: string;
        allowInsecureAuthentication?: boolean;
    };

    function test(name: string, url: TestCase): void {
        it("tests " + name, function() {
            this.timeout(60000);
            return ethers.utils.fetchJson(url).then((data) => {
                assert.equal(data.authenticated, true, "authenticates user");
            });
        });
    }

    let secure: TestCase = {
        url: "https://httpbin.org/basic-auth/user/passwd",
        user: "user",
        password: "passwd"
    };

    let insecure: TestCase = {
        url: "http://httpbin.org/basic-auth/user/passwd",
        user: "user",
        password: "passwd"
    };

    let insecureForced: TestCase = {
        url: "http://httpbin.org/basic-auth/user/passwd",
        user: "user",
        password: "passwd",
        allowInsecureAuthentication: true
    };

    test("secure url", secure);
    test("insecure url", insecureForced);

    it("tests insecure connections fail", function() {
        this.timeout(60000);
        assert.throws(() => {
            return ethers.utils.fetchJson(insecure);
        }, (error: Error) => {
            return ((<any>error).reason === "basic authentication requires a secure https url");
        }, "throws an exception for insecure connections");
    })
});

describe("Test API Key Formatting", function() {
    it("Infura API Key", function() {
        const projectId = "someProjectId";
        const projectSecret = "someSecretKey";

        // Test simple projectId
        const apiKeyString = ethers.providers.InfuraProvider.getApiKey(projectId);
        assert.equal(apiKeyString.apiKey, projectId);
        assert.equal(apiKeyString.projectId, projectId);
        assert.ok(apiKeyString.secretKey == null);

        // Test complex API key with projectId
        const apiKeyObject = ethers.providers.InfuraProvider.getApiKey({
            projectId
        });
        assert.equal(apiKeyObject.apiKey, projectId);
        assert.equal(apiKeyObject.projectId, projectId);
        assert.ok(apiKeyObject.projectSecret == null);

        // Test complex API key with projectId and projectSecret
        const apiKeyObject2 = ethers.providers.InfuraProvider.getApiKey({
            projectId: projectId,
            projectSecret: projectSecret
        });
        assert.equal(apiKeyObject2.apiKey, projectId);
        assert.equal(apiKeyObject2.projectId, projectId);
        assert.equal(apiKeyObject2.projectSecret, projectSecret);

        // Fails on invalid projectId type
        assert.throws(() => {
            const apiKey = ethers.providers.InfuraProvider.getApiKey({
                projectId: 1234,
                projectSecret: projectSecret
            });
            console.log(apiKey);
        }, (error: any) => {
            return (error.argument === "projectId" && error.reason === "projectSecret requires a projectId");
        });

        // Fails on invalid projectSecret type
        assert.throws(() => {
            const apiKey = ethers.providers.InfuraProvider.getApiKey({
                projectId: projectId,
                projectSecret: 1234
            });
            console.log(apiKey);
        }, (error: any) => {
            return (error.argument === "projectSecret" && error.reason === "invalid projectSecret");
        });

        {
            const provider = new ethers.providers.InfuraProvider("homestead", {
                projectId: projectId,
                projectSecret: projectSecret
            });
            assert.equal(provider.network.name, "homestead");
            assert.equal(provider.apiKey, projectId);
            assert.equal(provider.projectId, projectId);
            assert.equal(provider.projectSecret, projectSecret);
        }

        // Attempt an unsupported network
        assert.throws(() => {
            const provider = new ethers.providers.InfuraProvider("imaginary");
            console.log(provider);
        }, (error: any) => {
            return (error.argument === "network" && error.reason === "unsupported network");
        });

    });

    it("Pocket API key", function() {
        const applicationId = "someApplicationId";
        const applicationSecretKey = "someApplicationSecret";

        // Test simple applicationId
        const apiKeyString = ethers.providers.PocketProvider.getApiKey(applicationId);
        assert.equal(apiKeyString.applicationId, applicationId);
        assert.ok(apiKeyString.applicationSecretKey == null);

        // Test complex API key with applicationId
        const apiKeyObject = ethers.providers.PocketProvider.getApiKey({
            applicationId
        });
        assert.equal(apiKeyObject.applicationId, applicationId);
        assert.ok(apiKeyObject.applicationSecretKey == null);

        // Test complex API key with applicationId and applicationSecretKey
        const apiKeyObject2 = ethers.providers.PocketProvider.getApiKey({
            applicationId: applicationId,
            applicationSecretKey: applicationSecretKey
        });
        assert.equal(apiKeyObject2.applicationId, applicationId);
        assert.equal(apiKeyObject2.applicationSecretKey, applicationSecretKey);

        // Test complex API key with loadBalancer
        {
            const loadBalancer = true;

            const apiKeyObject = ethers.providers.PocketProvider.getApiKey({
                applicationId, loadBalancer
            });
            assert.equal(apiKeyObject.applicationId, applicationId);
            assert.equal(apiKeyObject.loadBalancer, loadBalancer);
            assert.ok(apiKeyObject.applicationSecretKey == null);

            const apiKeyObject2 = ethers.providers.PocketProvider.getApiKey({
                applicationId, applicationSecretKey, loadBalancer
            });
            assert.equal(apiKeyObject2.applicationId, applicationId);
            assert.equal(apiKeyObject2.applicationSecretKey, applicationSecretKey);
            assert.equal(apiKeyObject2.loadBalancer, loadBalancer);
        }

        {
            const provider = new ethers.providers.PocketProvider("homestead", {
                applicationId: applicationId,
                applicationSecretKey: applicationSecretKey
            });
            assert.equal(provider.network.name, "homestead");
            assert.equal(provider.applicationId, applicationId);
            assert.equal(provider.applicationSecretKey, applicationSecretKey);
        }

        // Attempt an unsupported network
        assert.throws(() => {
            const provider = new ethers.providers.PocketProvider("imaginary");
            console.log(provider);
        }, (error: any) => {
            return (error.argument === "network" && error.reason === "unsupported network");
        });
    });

});

describe("Test WebSocketProvider", function() {
    this.retries(3);

    async function testWebSocketProvider(provider: ethers.providers.WebSocketProvider): Promise<void> {
        await provider.destroy();
    }

    it("InfuraProvider.getWebSocketProvider", async function() {
        const provider = ethers.providers.InfuraProvider.getWebSocketProvider();
        await testWebSocketProvider(provider);
    });
});

describe("Test Events", function() {
    this.retries(3);

    async function testBlockEvent(provider: ethers.providers.Provider) {
        return new Promise((resolve, reject) => {
            let firstBlockNumber: number = null;
            const handler = (blockNumber: number) => {
                if (firstBlockNumber == null) {
                    firstBlockNumber = blockNumber;
                    return;
                }
                provider.removeListener("block", handler);
                if (firstBlockNumber + 1 === blockNumber) {
                    resolve(true);
                } else {
                    reject(new Error("blockNumber fail"));
                }
            };
            provider.on("block", handler);
        });
    }

    it("InfuraProvider", async function() {
        this.timeout(60000);
        const provider = new ethers.providers.InfuraProvider("goerli");
        await testBlockEvent(provider);
    });
});

describe("Bad ENS resolution", function() {
    const provider = providerFunctions[0].create("goerli");

    it("signer has a bad ENS name", async function() {
        this.timeout(300000);

        const wallet = new ethers.Wallet(ethers.utils.id("random-wallet"), provider);

        // If "to" is specified as an ENS name, it cannot resolve to null
        try {
            const tx = await wallet.sendTransaction({ to: "junk", value: 1 });
            console.log("TX", tx);
            assert.ok(false, "failed to throw an exception");
        } catch (error) {
            assert.ok(error.argument === "tx.to" && error.value === "junk");
        }

        // But promises that resolve to null are ok
        const tos = [ null, Promise.resolve(null) ];
        for (let i = 0; i < tos.length; i++) {
            const to = tos[i];
            try {
                const tx = await wallet.sendTransaction({ to, value: 1 });
                console.log("TX", tx);
            } catch (error) {
                assert.ok(error.code === "INSUFFICIENT_FUNDS");
            }
        }
    });

});

describe("Resolve ENS avatar", function() {
    [
        { title: "data", name: "data-avatar.tests.ethers.eth", value: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAQAAAAECAMAAACeL25MAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyVpVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDYuMC1jMDAyIDc5LjE2NDQ4OCwgMjAyMC8wNy8xMC0yMjowNjo1MyAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIDIyLjAgKE1hY2ludG9zaCkiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NUQ4NTEyNUIyOEIwMTFFQzg0NTBDNTU2RDk1NTA5NzgiIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NUQ4NTEyNUMyOEIwMTFFQzg0NTBDNTU2RDk1NTA5NzgiPiA8eG1wTU06RGVyaXZlZEZyb20gc3RSZWY6aW5zdGFuY2VJRD0ieG1wLmlpZDo1RDg1MTI1OTI4QjAxMUVDODQ1MEM1NTZEOTU1MDk3OCIgc3RSZWY6ZG9jdW1lbnRJRD0ieG1wLmRpZDo1RDg1MTI1QTI4QjAxMUVDODQ1MEM1NTZEOTU1MDk3OCIvPiA8L3JkZjpEZXNjcmlwdGlvbj4gPC9yZGY6UkRGPiA8L3g6eG1wbWV0YT4gPD94cGFja2V0IGVuZD0iciI/PkbM0uMAAAAGUExURQAA/wAAAHtivz4AAAAOSURBVHjaYmDABAABBgAAFAABaEkyYwAAAABJRU5ErkJggg==" },
        { title: "ipfs", name: "ipfs-avatar.tests.ethers.eth", value: "https:/\/gateway.ipfs.io/ipfs/QmQsQgpda6JAYkFoeVcj5iPbwV3xRcvaiXv3bhp1VuYUqw" },
        { title: "url", name: "url-avatar.tests.ethers.eth", value: "https:/\/ethers.org/static/logo.png" },
    ].forEach((test) => {
        it(`Resolves avatar for ${ test.title }`, async function() {
            this.timeout(60000);
            const provider = ethers.getDefaultProvider("goerli", getApiKeys("goerli"));
            const avatar = await provider.getAvatar(test.name);
            assert.equal(test.value, avatar, "avatar url");
        });
    });

    [
        { title: "ERC-1155", name: "nick.eth", value: "https:/\/lh3.googleusercontent.com/hKHZTZSTmcznonu8I6xcVZio1IF76fq0XmcxnvUykC-FGuVJ75UPdLDlKJsfgVXH9wOSmkyHw0C39VAYtsGyxT7WNybjQ6s3fM3macE" },
//        { title: "ERC-721", name: "brantly.eth", value: "https:/\/api.wrappedpunks.com/images/punks/2430.png" }
    ].forEach((test) => {
        it(`Resolves avatar for ${ test.title }`, async function() {
            this.timeout(60000);
            const provider = ethers.getDefaultProvider("homestead", getApiKeys("homestead"));
            const avatar = await provider.getAvatar(test.name);
            assert.equal(avatar, test.value, "avatar url");
        });
    });
});

describe("Resolve ENS content hash", function() {
    [
        { title: "skynet", name: "skynet-ens.eth", value: "sia:/\/AQCRuTdTPzCyyU6I82eV7VDFVLPW82LJS9mH-chmjDlKUQ" },
        { title: "ipns", name: "stderr.eth", value: "ipns://12D3KooWB8Z5zTNUJM1U98SjAwuCSaEwx65cHkFcMu1SJSvGmMJT" },
        { title: "ipfs", name: "ricmoo.eth", value: "ipfs://QmdTPkMMBWQvL8t7yXogo7jq5pAcWg8J7RkLrDsWZHT82y" },
    ].forEach((test) => {
        it(`Resolves avatar for ${ test.title }`, async function() {
            this.timeout(60000);
            const provider = ethers.getDefaultProvider("homestead", getApiKeys("homestead"));
            const resolver = await provider.getResolver(test.name);
            const contentHash = await resolver.getContentHash();
            assert.equal(contentHash, test.value, "content hash");
        });
    });
});

describe("Test EIP-2544 ENS wildcards", function() {
    const provider = <ethers.providers.BaseProvider>(providerFunctions[0].create("goerli"));

    it("Resolves recursively", async function() {
        const resolver = await provider.getResolver("ricmoose.hatch.eth");
        assert.equal(resolver.address, "0x15abA1fa74Bfdecd63A71218DC632d4328Db8168", "found the correct resolver");
        assert.equal(await resolver.supportsWildcard(), true, "supportsWildcard");
        assert.equal((await resolver.getAvatar()).url, "https://static.ricmoo.com/uploads/profile-06cb9c3031c9.jpg", "gets passed-through avatar");
        assert.equal(await resolver.getAddress(), "0x4B711A377B1b3534749FBe5e59Bcf7F94d92EA98", "gets resolved address");
    });
});

describe("Test CCIP execution", function() {
    const address = "0x6C5ed35574a9b4d163f75bBf0595F7540D8FCc2d";
    const ABI = [
      //'error OffchainLookup(address sender, string[] urls, bytes callData, bytes4 callbackFunction, bytes extraData)',
      'function testGet(bytes callData) view returns (bytes32)',
      'function testGetFail(bytes callData) view returns (bytes32)',
      'function testGetSenderFail(bytes callData) view returns (bytes32)',
      'function testGetFallback(bytes callData) view returns (bytes32)',
      'function testGetMissing(bytes callData) view returns (bytes32)',
      'function testPost(bytes callData) view returns (bytes32)',
      'function verifyTest(bytes result, bytes extraData) pure returns (bytes32)'
    ];

    const provider = providerFunctions[0].create("goerli");
    const contract = new ethers.Contract(address, ABI, provider);

    // This matches the verify method in the Solidity contract against the
    // processed data from the endpoint
    const verify = function(sender: string, data: string, result: string): void {
        const check = ethers.utils.concat([
            ethers.utils.arrayify(ethers.utils.arrayify(sender).length),
            sender,
            ethers.utils.arrayify(ethers.utils.arrayify(data).length),
            data
        ]);
        assert.equal(result, ethers.utils.keccak256(check), "response is equal");
    }

    it("testGet passes under normal operation", async function() {
        this.timeout(60000);
        const data = "0x1234";
        const result = await contract.testGet(data, { ccipReadEnabled: true });
        verify(address, data, result);
    });

    it("testGet should fail with CCIP not explicitly enabled by overrides", async function() {
        this.timeout(60000);

        try {
            const data = "0x1234";
            const result = await contract.testGet(data);
            console.log(result);
            assert.fail("throw-failed");
        } catch (error: any) {
            if (error.message === "throw-failed") { throw error; }
            if (error.code !== "CALL_EXCEPTION") {
                console.log(error);
                assert.fail("failed");
            }
        }
    });

    it("testGet should fail with CCIP explicitly disabled on provider", async function() {
        this.timeout(60000);

        const provider = providerFunctions[0].create("goerli");
        (<ethers.providers.BaseProvider>provider).disableCcipRead = true;
        const contract = new ethers.Contract(address, ABI, provider);

        try {
            const data = "0x1234";
            const result = await contract.testGet(data, { ccipReadEnabled: true });
            console.log(result);
            assert.fail("throw-failed");
        } catch (error: any) {
            if (error.message === "throw-failed") { throw error; }
            if (error.code !== "CALL_EXCEPTION") {
                console.log(error);
                assert.fail("failed");
            }
        }
    });

    it("testGetFail should fail if all URLs 5xx", async function() {
        this.timeout(60000);

        try {
            const data = "0x1234";
            const result = await contract.testGetFail(data, { ccipReadEnabled: true });
            console.log(result);
            assert.fail("throw-failed");
        } catch (error: any) {
            if (error.message === "throw-failed") { throw error; }
            if (error.code !== "SERVER_ERROR" || (error.errorMessages || []).pop() !== "hello world") {
                console.log(error);
                assert.fail("failed");
            }
        }
    });

    it("testGetSenderFail should fail if sender does not match", async function() {
        this.timeout(60000);

        try {
            const data = "0x1234";
            const result = await contract.testGetSenderFail(data, { ccipReadEnabled: true });
            console.log(result);
            assert.fail("throw-failed");
        } catch (error: any) {
            if (error.message === "throw-failed") { throw error; }
            if (error.code !== "CALL_EXCEPTION") {
                console.log(error);
                assert.fail("failed");
            }
        }
    });

    it("testGetMissing should fail if early URL 4xx", async function() {
        this.timeout(60000);

        try {
            const data = "0x1234";
            const result = await contract.testGetMissing(data, { ccipReadEnabled: true });
            console.log(result);
            assert.fail("throw-failed");
        } catch (error: any) {
            if (error.message === "throw-failed") { throw error; }
            if (error.code !== "SERVER_ERROR" || error.errorMessage !== "hello world") {
                console.log(error);
                assert.fail("failed");
            }
        }
    });

    it("testGetFallback passes if any URL returns correctly", async function() {
        this.timeout(60000);
        const data = "0x123456";
        const result = await contract.testGetFallback(data, { ccipReadEnabled: true });
        verify(address, data, result);
    });

    it("testPost passes under normal operation", async function() {
        this.timeout(60000);
        const data = "0x1234";
        const result = await contract.testPost(data, { ccipReadEnabled: true });
        verify(address, data, result);
    });

})
