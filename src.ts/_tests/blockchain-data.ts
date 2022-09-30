export type TestBlockchainNetwork =
    "mainnet" | "goerli";

export interface TestBlockchainAddress {
    test: string;
    address: string;
    code?: string;
    nonce?: number;
    name?: string;
    balance?: bigint;
    storage?: Record<string, string>
}

export interface TestBlockchainBlock {
    test: string;
    hash: string,
    parentHash: string,
    number: number,
    timestamp: number,
    nonce: string,
    difficulty: bigint,
    gasLimit: bigint,
    gasUsed: bigint,
    miner: string,
    extraData: string,
    transactions: Array<string>,

    baseFeePerGas?: bigint
}

export interface TestBlockchainTransaction {
    test: string;
    hash: string,
    blockHash: string,
    blockNumber: number,
//    index: number,
    type: number,
    from: string,
    gasPrice: bigint,
    gasLimit: bigint,
    to: string,
    value: bigint,
    nonce: number,
    data: string,
    signature: {
        r: string,
        s: string,
        yParity: 0 | 1,
        v: number,
        networkV: null | bigint,
    },
    creates: null | string,
    chainId: bigint,

    accessList?: Array<Record<string, Array<string>>>,

    maxPriorityFeePerGas?: bigint,
    maxFeePerGas?: bigint
}

export interface TestBlockchainReceipt {
    test: string,
    //byzantium: true,
    blockHash: string,
    blockNumber: number,
    type: number,
    contractAddress: null | string,
    cumulativeGasUsed: bigint,
    from: string,
    gasUsed: bigint,
    gasPrice: bigint,
    logs: Array<{
        address: string,
        blockHash: string,
        blockNumber: number,
        data: string,
        index: number,
        topics: Array<string>,
        transactionHash: string,
        transactionIndex: number,
    }>
    logsBloom: string,
    root: null | string,
    status: null | number,
    to: string,
    hash: string,
    index: number
};

export const testAddress: Record<TestBlockchainNetwork, Array<TestBlockchainAddress>> = {
    mainnet: [
        {
            test: "old-account",
            address: "0xAC1639CF97a3A46D431e6d1216f576622894cBB5",
            balance: BigInt("4813414100000000"),
            nonce: 3,
            code: "0x"
        }, {
            test: "TheDAO-splitter-contract",
            address: "0x3474627D4F63A678266BC17171D87f8570936622",
            code: "0x606060405260e060020a60003504630b3ed5368114602e57806337b0574a14605257806356fa47f0146062575b005b602c6004356000546101009004600160a060020a03908116339091161460bb575b50565b60005460ff166060908152602090f35b602c60043560005460ff1615609657600160a060020a038116600034606082818181858883f193505050501515604f576002565b33600160a060020a0316600034606082818181858883f193505050501515604f576002565b600080546101009004600160a060020a03169082606082818181858883f193505050501515604f57600256",
            storage: {
                "0": "0x0000000000000000000000b2682160c482eb985ec9f3e364eec0a904c44c2300"
            }
        }, {
            test: "ricmoo.firefly.eth",
            address: "0x8ba1f109551bD432803012645Ac136ddd64DBA72",
            name: "ricmoo.firefly.eth"
        },
    ],
    goerli: [
    ]
};

export const testBlock: Record<TestBlockchainNetwork, Array<TestBlockchainBlock>> = {
    mainnet: [
        {
            test: "old-homestead-block",
            hash: "0x3d6122660cc824376f11ee842f83addc3525e2dd6756b9bcf0affa6aa88cf741",
            parentHash: "0xb495a1d7e6663152ae92708da4843337b958146015a2802f4193a410044698c9",
            number: 3,
            timestamp: 1438270048,
            nonce: "0x2e9344e0cbde83ce",
            difficulty: BigInt(17154715646),
            gasLimit: BigInt("0x1388"),
            gasUsed: BigInt("0"),
            miner: "0x5088D623ba0fcf0131E0897a91734A4D83596AA0",
            extraData: "0x476574682f76312e302e302d66633739643332642f6c696e75782f676f312e34",
            transactions: [ ]
        },
        {
            test: "london-block",
            number: 14413999,
            hash: "0x6c79356d40ebb6ed63dc19f5d407f8f1c876047b59dc1a4598cce0e64dcabec5",
            parentHash: "0xbf09b0e215f247a5066d19ece5b4c66960771d45fae62985e8d751fb1adcfe2f",
            timestamp: 1647654576,
            nonce: "0xb4bc9979af5369fe",
            difficulty: BigInt("12841513359509721"),
            gasLimit: BigInt("30087914"),
            gasUsed: BigInt("2008910"),
            miner: "0x2A20380DcA5bC24D052acfbf79ba23e988ad0050",
            extraData: "0x706f6f6c696e2e636f6d21f7092f019bb92a76",
            baseFeePerGas: BigInt("40911884304"),
            transactions: [
                "0x1c3a398933db10634631f54b435c40c8805c13f12bbac7c3dab858ca44213fa2",
                "0xd98947cbdd892cc7f679c903903e6d18a5c5afb19e94437beba79372ad71c347",
                "0x4d66190deb55b5820cb0ce9adb972f646fa0f3e64eaeee674bbf3d054bf3d883",
                "0x9db7bd5f4c91d6103c714bcbc35df3dc708daa668aaef7449b589dbd3be24dac",
                "0x126a43ae4ade4b7fc5c8ac9ebd3dbcf7314f63c60f2804fb49aa25b5c7d80bb1",
                "0x82a90aa4b3b1b7873b117c3ff1ca7165ae34b2fc0788cc0cbfd41805d588590d",
                "0x7f694a6a9972457753ed3dec164f17272b1c8b1da4eab149df95e31a3e72f606",
                "0xdce1cba1ff33f0c23881087d49de3b34fe84c8a6883f3edd75b04fc23e458aac",
                "0xbe1c69f825279cebef42d1f0e07397dcddef7fb278b0195e295ede3e156836c4",
                "0x1d2f007b3c0f894403973a30e5ffaa78589f873d963e9554c6bb1bd7a3127245",
                "0x9c8c78191cf4ae9ae8eee1165153eabe24dbd8b9509b83d5f0caeea85251bb2f",
                "0x42e956f4b3dd6535359b272a0d2dab995c364cb48baaf8d0a1981995f3f8c808",
                "0xdc2c2e99393e24d5dc66e38665fa1d1ff007d92088ef3fd2549545fdbe862ef6",
                "0xaad7be28fffd2e77e8e40bf57f2ac140aa8283ec93c7f3f61a82c79405602f53",
                "0x4735f1421b7b30283e87e0799e82e54307d3e5ba14cd54ad8420b57577489a71",
                "0x0b9d6aa23aa439b41e86595f2ad91f498adffa3e6e7cb26ac7d73252e59fd3de",
                "0xcd93e19bd5d5c5a834fec613116fa01f46eddfd2faa20ef302271b874b9d812a",
                "0x5bf1976574a637f5ac0b8bda1a792fa16cc7ce9624d32e9bd6bd9aa6a8f19d2f",
                "0x2e778da4f66f10f7b681b605635c6599cdbeea167fc1c4396a097aef5d06de61",
                "0xd5fd68eebc4c870ccda081786a74c75c250e9e2d8269b8935edb3adb11b80bb2",
                "0x2aec42a11c1d8c1e5198d54aacbc6bebb09bcd5e78f6af81ea09d65c9064734a",
                "0xbea2e364ea4959ec438d9ccc2d2f7120c7eaba3b177cc0d7df8ff65d866ef89f",
                "0xf48bbb0f838353060da4126a555ce532abf497a9d1108001afffaac513a59ddf",
                "0xf5664e4372cce62733a6610efb7701a4a0e552d81f8caa764d8474b3070c6617",
                "0x9d3732ddbd20610008ff737da2f61120734a1cbfa864374bcbcf10051e6048cb",
                "0xc4d0df5bc6fa51b34ac3c898866d779d4e51a6be4d13be1ec3084b7229b03b47",
                "0x90c86ec98b8ad98049b4ee54cb3aa72c5ae743077b830e8a294aa5dc47a1fb18"
            ]
        }
    ],
    goerli: [
    ],
};

export const testTransaction: Record<TestBlockchainNetwork, Array<TestBlockchainTransaction>> = {
    mainnet: [
        {
            test: "legacy",
            hash: "0xccc90ab97a74c952fb3376c4a3efb566a58a10df62eb4d44a61e106fcf10ec61",
            blockHash: "0x9653f180a5720f3634816eb945a6d722adee52cc47526f6357ac10adaf368135",
            blockNumber: 4097745,
//            index: 18,
            type: 0,
            from: "0x32DEF047DeFd076DB21A2D759aff2A591c972248",
            gasPrice: BigInt("0x4a817c800"),
            gasLimit: BigInt("0x3d090"),
            to: "0x6fC21092DA55B392b045eD78F4732bff3C580e2c",
            value: BigInt("0x186cc6acd4b0000"),
            nonce: 0,
            data: "0xf2c298be000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000067269636d6f6f0000000000000000000000000000000000000000000000000000",
            signature: {
                r: "0x1e5605197a03e3f0a168f14749168dfeefc44c9228312dacbffdcbbb13263265",
                s: "0x269c3e5b3558267ad91b0a887d51f9f10098771c67b82ea6cb74f29638754f54",
                yParity: 1,
                v: 28,
                networkV: BigInt(38),
            },
            creates: null,
            chainId: BigInt(1)
        },
        {
            test: "EIP-1559",
            hash: "0x8ff41d0ba5d239acc8c123ff12451a2c15721c838f657e583d355999af4a4349",
            blockHash: '0x9d4c3bef68e119841281105da96beb1c7252f357340d7a3355236b3332b197b0',
            blockNumber: 12966000,
//            index: 185,
            type: 2,
            from: '0x5afFBa12E9332bbc0E221c8E7BEf7CB7cfB3F281',
            to: '0x2258CcD34ae29E6B199b6CD64eb2aEF157df7CdE',
            gasLimit: BigInt("21000"),
            nonce: 2,
            data: '0x',
            value: BigInt("1100000000000000"),
            gasPrice: BigInt("70578812137"),
            maxPriorityFeePerGas: BigInt("1000000000"),
            maxFeePerGas: BigInt("131115411100"),
            chainId: BigInt(1),
            signature: {
                r: "0xdd26e5478d0aa84e334a0393d335ab24b83de8ecae9290305f15ab884ded246c",
                s: "0x6494b4f61b0d9a5a82ecb86d72b301f859f404f0bec9682bbfff619903ecfbe2",
                yParity: 1,
                v: 28,
                networkV: null
            },
            creates: null,
            accessList: [ ]
        }
    ],
    goerli: [
    ]
};

export const testReceipt: Record<TestBlockchainNetwork, Array<TestBlockchainReceipt>> = {
    mainnet: [
        {
            test: "legacy",
            //byzantium: false,
            blockHash: "0x36b4af7f0538559e581c8588f16477df0f676439ea67fe8d7a2ae4abb20e2566",
            blockNumber: 0x3c92b5,
            type: 0,
            contractAddress: null,
            cumulativeGasUsed: BigInt(0x1cca2e),
            from: "0x18C6045651826824FEBBD39d8560584078d1b247",
            gasUsed: BigInt(0x14bb7),
            gasPrice: BigInt(4100000000),
            logs: [
                {
                    address: "0x314159265dD8dbb310642f98f50C066173C1259b",
                    blockHash: "0x36b4af7f0538559e581c8588f16477df0f676439ea67fe8d7a2ae4abb20e2566",
                    blockNumber: 0x3c92b5,
                    data: "0x00000000000000000000000018c6045651826824febbd39d8560584078d1b247",
                    index: 0x1a,
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
                    index: 0x1b,
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
            root: "0x9b550a9a640ce50331b64504ef87aaa7e2aaf97344acb6ff111f879b319d2590",
            // Should be null for pre-byzantium, but some nodes have backfilled it
            status: 1,
            to: "0x6090A6e47849629b7245Dfa1Ca21D94cd15878Ef",
            hash: "0xc6fcb7d00d536e659a4559d2de29afa9e364094438fef3e72ba80728ce1cb616",
            index: 0x39
        }, {
            test: "byzantium",
            //byzantium: true,
            blockHash: "0x34e5a6cfbdbb84f7625df1de69d218ade4da72f4a2558064a156674e72e976c9",
            blockNumber: 0x444f76,
            type: 0,
            contractAddress: null,
            cumulativeGasUsed: BigInt(0x15bfe7),
            from: "0x18C6045651826824FEBBD39d8560584078d1b247",
            gasUsed: BigInt(0x1b968),
            gasPrice: BigInt(1000000000),
            logs: [
                {
                    address: "0xb90E64082D00437e65A76d4c8187596BC213480a",
                    blockHash: "0x34e5a6cfbdbb84f7625df1de69d218ade4da72f4a2558064a156674e72e976c9",
                    blockNumber: 0x444f76,
                    data: "0x",
                    index: 0x10,
                    topics: [
                        "0x748d071d1992ee1bfe7a39058114d0a50d5798fe8eb3a9bfb4687f024629a2ce",
                        "0x5574aa58f7191ccab6de6cf75fe2ea0484f010b852fdd8c6b7ae151d6c2f4b83"
                    ],
                    transactionHash: "0x7f1c6a58dc880438236d0b0a4ae166e9e9a038dbea8ec074149bd8b176332cac",
                    transactionIndex: 0x1e,
                }
            ],
            logsBloom: "0x00000000000000000000000000000000000000000000000000008000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001000000000000000200000000000000008000000000000000000000000000000000000000000000000000000000000000010000000000000000000800000000000000000000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000800000000000000000800000000000000000000000000000000000000",
            root: null,
            status: 1,
            to: "0xb90E64082D00437e65A76d4c8187596BC213480a",
            hash: "0x7f1c6a58dc880438236d0b0a4ae166e9e9a038dbea8ec074149bd8b176332cac",
            index: 0x1e
        }
    ],
    goerli: [
    ]
};

export const networkNames: Array<TestBlockchainNetwork> = [
    "mainnet", "goerli"
];
export function networkFeatureAtBlock(feature: string, block: number): boolean {
    switch (feature) {
        case "byzantium":
            return block >= 4370000;
        default:
            break;
    }
    throw new Error(`unknown feature: ${ feature }`);
}
