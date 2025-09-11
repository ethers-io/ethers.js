;
export const testAddress = {
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
    goerli: [],
    sepolia: []
};
export const testBlock = {
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
            stateRoot: '0x76ab0b899e8387436ff2658e2988f83cbf1af1590b9fe9feca3714f8d1824940',
            receiptsRoot: '0x56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421',
            transactions: []
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
            stateRoot: '0xd08663f630cfcf2d7d8fe4d52f7685ad09798b7e6150cabea5eeceb1d89e11c2',
            receiptsRoot: '0x473e83ec3df279f44c4fc6da50fe1d0c5a18f1929b90de8917bdcdb88a132750',
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
    goerli: [],
    sepolia: [
        {
            test: "eip-4844-BLob-block",
            hash: "0xa76eb2ed547798d6010f599902788136f0cd289e2c6df5bbf5242e36e356124d",
            parentHash: "0x2b579cb7224abdbe7a66c76380d60329bba41d95d225feb80ca1a78cf83a5124",
            parentBeaconBlockRoot: '0xa05d27aa9c2f3d57943ca86134a08f6f7852ad5e9dbe360f86b466e2f0ed7bb5',
            number: 5198187,
            timestamp: 1706801700,
            nonce: "0x0000000000000000",
            difficulty: BigInt(0),
            gasLimit: BigInt("30000000"),
            gasUsed: BigInt("5622957"),
            baseFeePerGas: BigInt("48793932840"),
            miner: "0x008b3b2F992C0E14eDaa6E2c662Bec549CAA8df1",
            extraData: "0x",
            blobGasUsed: BigInt("524288"),
            excessBlobGas: BigInt("79691776"),
            stateRoot: '0xa78ad0e0f5d2b3383fdb13f4ad0523723816863556be3a5414536862f4d217df',
            receiptsRoot: '0xa254ed337328248b77011c70c2b85d6575f965f2fe65ed233c27e3750c0b7170',
            transactions: [
                "0xe8a096a98cd7b8d783cbb30687c3adc8e59f1e9563c0454623cc8af59f8bcab1",
                "0x5aac2d50b15e177e8edaae4819e989650a6cdb335dd8924b5a7a7ed1675d15e7",
                "0x21c94c24419f746efd2c1f470c0842df21ab8da14f7db8e30a12c53a4e7d5145",
                "0x85b40ce37262a7962487bd37bf36867b344525b425a90a25516ac3c2cb1f6535",
                "0x1a674ff3bd6bbe7bc7ada2ae3da893a7b74b4cfaadebc8c3f0fe0c9ad3c1c35b",
                "0x48cafe99a7d2284a1664e05c404dd88e4113ffb65bf49846716bd855ffc6835d",
                "0x658065003e8952782d121d9b5729845862c2a45ed24e46c634041a77c4577bed",
                "0xc5416e0a2383b1a9b3ba030803f88e45faebfb35ad5db022e44a09b15aeae385",
                "0x9030f7962f3f638f96bb703f45cdaa8778cf393ead767592aa50bce32230eae3",
                "0xce008888308a4c1d51f87a1c2a75b1d0bd15eb096c675ad091dcc9705e4d016d",
                "0xcf17c1f09a22c992a469da0023ad3c9bd2c29a8532146bcdf9ce3216609ea50c",
                "0x3933e49a215c80b35ec7d48e2741fda50c8cc7b92652e79663e4423c00e8e1e2",
                "0x82b2af4ed108880c151ee38cb3ab28e81ba86a2b0e707dd9cee9bf341f895a8a",
                "0x51ef5af42d572d6135bec154d5c754928465bad00d1ff7b769a5b65e0054a90e",
                "0x87cab3ae3a36d439a539ded7eb57e0ef07c5a1fbe1697c2e5ba8d7c03875fd22",
                "0x70371a20dfbff0ee753b52cd9445f431454b929c7375624a96f5dbc25e88afed",
                "0x57ee8a4a09875b7720f7d9e75fb93a1cc86d166ad9a1b4c2d7cf2c7c8324fbc0",
                "0xf004bd2b0119aca5f364b16421a5b2e7db811568761f5542fdcd74903cd9115d",
                "0x5b6635688362651e1cd33c668bd748d964ba93006661e53dc117d1c1e44886a5",
                "0xe5893e07bfec18dd206da279a47ee5cc9471930bbb3b85d64ee4945b98137348",
                "0x4f0f48032a77a80550f71cbcbe86f7d1b34009910f12dbe153a93cb66965393e",
                "0x5420c3f7b5118e0829df31794aa55a1a91e0009600bbff283b553d5ac7a248ff",
                "0xece2175e4b06bf6105f5be10a9ed48808a5f96f12f80b3941ee7cb1eeca99e03",
                "0x383ea6445cd183e32fbc7b846c00b34c419078fe4055cd078f8692fc02b300c8",
                "0x6c4aef4c26410b1fcbf24d0148e3d66a10cb3e9ad4ca10a71782489688cdd45a",
                "0xe7e24b8c8182832e7b1113cd07ae68e4ca8618decdc527650f57d25d0b681fde",
                "0xef5f520662c133be33209249fbc93afb7c614c06a0b45086d15c33bd7c0ca47a",
                "0x4af20dc2e952e381789065f2cd0c88730fea820bcc3db82eaddf63b36e65b3ac",
                "0xf99eef2240abc5002c9d71a90ffd463935642aaf81213f37337327c1afcb502c",
                "0xf7d1ad53e2435e6d978563e39db89660d1b4de6084a3a3cefe7025d28507017f",
                "0xfc21e64a158ac26ea9afc754460e16fefc4316a3fb92ec9a6042b792d7855788",
                "0xee60e551bcf518853ef4f5c33551ad07fa95267814940c4203934c79355b1ac0",
                "0x2a3c649caf77b942b206b9eb1be4635d950cf9a15fea2b43d3d7cbeddf700739",
                "0xbbd7b9c1434eb98d177f2ff8911b0186309534dea942c40a86517d69247cd0ac",
                "0xd86daa6d16e2aee4fc6ae831336ada63623685fb998dc5c605284a034604d751",
                "0xcfc848dfbbbe76fe0095f04ef35c931799c294eb3623e5cb8c0d81362e8bf125",
                "0x71e3ea97c91bd14388d99d69d122314a1cf0d595cbad1e45040277b470c4e67b",
                "0xa9b2e44e46d38bb67cbd7a2d47d57e60892dff018f7754b54a221ae3f1b996c4",
                "0xd1b8f9d669bd7f5072a095476e94e90510f2a18b434551fb7852b5c38c41471a",
                "0xa3858e80680997080fddde083398e857b14cd4e2cfe74629f6a1245df0447efb",
                "0x97593f663b07f8a4555202abb691cf7997210284195c24980abee02040c60618",
                "0x03387f22b01919486338fbd874dd7059f8df62d5b16052cb0ab855b6a364777e",
                "0xf2561f5f487c3d20c42b42e697a49fb5d05e0fb844ca97b2f127b210475f457e",
                "0xa67951a1309f1c7ec07ee518ecad831d12c5c78619250681068e7973243f7d9b",
                "0x7b007997da62b3ac9e5a7005066941e74f5c14d0bdaf4ac44faa8c3479b3cf45",
                "0x74379408aa3518cbbb394886c91f77ba95ccd37f6b10517834f69a8ff5120ca7",
                "0xd4843ef02a0d9802d31a89e13e60b6e71870de9124d0b472047012f7a4320f83",
                "0xaa50331afeafd8f9e913a9f78e898e299314d0825936724cc31211ebf177a9bf",
                "0xf20c83f2e5d199ad84a7b5dc6fda9611772516e07e7fc71b9f7889af4f2a16aa",
                "0x89a7c645987dc079ce1af236ed3dd445ad805cc030e5a57766324d4a0a1def9a",
                "0xe8e7d1116c2c60afd063b9c1e87624426cf6c9fd8d3fa6befe25666e68459570",
                "0x50be079e71cabf80ca27c39a27f9c0759ac272151f4608b9b75ebfac8284a601",
                "0xca24f69d47438ebd0b8f304f2f6d7a513d056905f10b164ed6a2cff6da1d4fea",
                "0x08d2521e04dfd0decc2f556b11274212e84076ff84a0135e9b4e3434de09d42a",
                "0xcc1e01932a627e9aa20d2b72480d13b4826e128efbbe03526504f7cb9facfc1f",
                "0x0a3ac907b6d1584cb3d7f9f588ddb4bdd7878db34bc47bd8baf881dd71a98f7d",
                "0x487539ee9cc6933e13e75e94935c30faffa826c28460fed6d9c3a07d15e2617f",
                "0xad251856762796acc75dc2846def1f6995fe1b5c747bcab51c10f561d22ffd57",
                "0x27ca72aa253e009e5e4497dd838986c561e7bea129fec930bc276968525456a8",
                "0xe26391de668d3eb6f5a3c2f3e14f911dc683873b7ea60d883116c205610b36ff",
                "0x691c3c5583c5f6444dc6c2f26315a127fc72ebd4f3848055cc8abb8a941d065b",
                "0x449578293a1dce8d3c147fed564a765515d090e8cd8866209648eb86cd5c1090",
                "0xb79c6f59d533663ca4fa3a70e9c8be18a3761edc43923c2ecd0904447f654f90",
                "0xc03863ffa85dd15e0d774ea20006dffd01a868dbf3ff2abe04ccdbf4f027d7ec",
                "0x28bc1a65696947beb387adbbeabb5328e5f812c435db288688041d9a8c6ab372",
                "0x6dca99c2103d3894ba83c75e0fa0d42f722e5e93fe6f7a6a55a80cf2907a1a5e",
                "0x75a7c5f00d79f1b30f82855a8b25077182f1abfd5dbccdf18fe1276e6c9e6a1e",
                "0x3fc5a320d8c16bcfe2eda847582d34731abc12a3bffbf334a238b47c0bacb90d",
                "0x47a61770f0771ba34d8e8ab883a3d588769a8d387eb5531b4befccb7ea23a6d3",
                "0xdc8d0b20e8d8b0fbce50d24eaa36bc56467f35459139dda5e42ffebb1060535c",
                "0x65bebb9628b5bf5d5e1dbedf00a7e6610fb5615c7ff9d92adaa135bc88f90648",
                "0x9d2f5b7858631ee196bc24d14d2ef1ce07af081d8fe27b2be70ab90bd8edf930",
                "0xd7724915af54b4d2c896d05c039f5ba508c878d524eb132c09c3abc22f6111ca",
                "0xfda6f72dde86c0b8f84ea7c1e157f1d207dd2e974589cc351404bd5a01fe1d9d",
                "0x3fae3676e266af80b0cc810b6b491750b64b013da78935a288b93e33215bee32"
            ]
        },
    ],
};
export const testTransaction = {
    mainnet: [
        {
            test: "legacy",
            hash: "0xccc90ab97a74c952fb3376c4a3efb566a58a10df62eb4d44a61e106fcf10ec61",
            blockHash: "0x9653f180a5720f3634816eb945a6d722adee52cc47526f6357ac10adaf368135",
            blockNumber: 4097745,
            index: 18,
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
            index: 185,
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
            accessList: []
        }
    ],
    goerli: [],
    sepolia: [
        {
            test: "EIP-4844-BLOb-tx",
            hash: "0x6c4aef4c26410b1fcbf24d0148e3d66a10cb3e9ad4ca10a71782489688cdd45a",
            blockHash: '0xa76eb2ed547798d6010f599902788136f0cd289e2c6df5bbf5242e36e356124d',
            blockNumber: 5198187,
            index: 24,
            type: 3,
            from: '0x1803c760451DC8da8935c7B7E47e1c60910E6986',
            to: '0x4f56fFC63c28b72F79b02E91F11a4707bac4043C',
            gasLimit: BigInt("21000"),
            nonce: 1635,
            data: '0x',
            value: BigInt("0"),
            gasPrice: BigInt("54793932840"),
            maxPriorityFeePerGas: BigInt("6000000000"),
            maxFeePerGas: BigInt("600000000000"),
            maxFeePerBlobGas: BigInt("60000000000"),
            chainId: BigInt(11155111),
            signature: {
                r: "0x56fc10a770e9fa39a30f71a56d13affbdc390a1bfb419ff806e59b54bfc8bab1",
                s: "0x35be8b0c774c179520dd43df46925361c4817472441d7dd5162d43efc90679f1",
                yParity: 1,
                networkV: null
            },
            creates: null,
            accessList: [],
            blobVersionedHashes: [
                "0x010264a7b018f0edbe5caa5cb309ca50d3d7c6c7c990d21bf30a7f18ffd06cd6",
                "0x017fe9ef61e3c501acec804ec15849d977433f4cf87050c098272dd1257f9c68",
                "0x019975416c9d7c70ba9cc041464a6e1c3e4f176bdab463573504b55c681364c8",
                "0x0123ae55ad7d8e8afec2202bdc6dfb931efc8990acf29afbd0c3c0ef61eae92d"
            ]
        }
    ]
};
export const testReceipt = {
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
    goerli: [],
    sepolia: [
        {
            test: "eip-4844-BLOb-receipt",
            //byzantium: true,
            blockHash: "0xa76eb2ed547798d6010f599902788136f0cd289e2c6df5bbf5242e36e356124d",
            blockNumber: 5198187,
            type: 3,
            contractAddress: null,
            cumulativeGasUsed: BigInt("930313"),
            from: "0x1803c760451DC8da8935c7B7E47e1c60910E6986",
            gasUsed: BigInt("21000"),
            gasPrice: BigInt("54793932840"),
            logs: [],
            logsBloom: "0x00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000",
            root: null,
            status: 1,
            to: "0x4f56fFC63c28b72F79b02E91F11a4707bac4043C",
            hash: "0x6c4aef4c26410b1fcbf24d0148e3d66a10cb3e9ad4ca10a71782489688cdd45a",
            index: 24,
            blobGasUsed: BigInt("524288"),
            blobGasPrice: BigInt("23276216517"),
        }
    ]
};
export const networkNames = [
    "mainnet", "goerli", "sepolia"
];
export function networkFeatureAtBlock(feature, block) {
    switch (feature) {
        case "byzantium":
            return block >= 4370000;
        default:
            break;
    }
    throw new Error(`unknown feature: ${feature}`);
}
//# sourceMappingURL=blockchain-data.js.map