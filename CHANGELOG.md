Change Log
==========

This change log is maintained by `src.ts/_admin/update-changelog.ts` but may also be manually updated.

ethers/v6.3.0 (2023-04-06 04:35)
--------------------------------

  - Added support for legacy ABI JSON fragments ([#3932](https://github.com/ethers-io/ethers.js/issues/3932); [8c5973e](https://github.com/ethers-io/ethers.js/commit/8c5973e3a9b8d4d4ed80bdf209d8a0b6cc6b8d6d)).
  - Add _in_ operator support for contract and contract.filters ([#3901](https://github.com/ethers-io/ethers.js/issues/3901); [c58ab3a](https://github.com/ethers-io/ethers.js/commit/c58ab3a97687e15a3ffe30b038089c5f4b570bb9)).
  - Fixed TypedData unsigned value range ([#3873](https://github.com/ethers-io/ethers.js/issues/3873); [a851b24](https://github.com/ethers-io/ethers.js/commit/a851b24d0af009ecf277766d2a5f81f9b3e7f9f8)).
  - Added missing export for getIndexedAccountPath ([#3875](https://github.com/ethers-io/ethers.js/issues/3875); [356ff2b](https://github.com/ethers-io/ethers.js/commit/356ff2becb4f4d3622b281d3825770af5caf71ca)).
  - Fixed TypedData payloads for JSON-restricted chainId field ([#3868](https://github.com/ethers-io/ethers.js/issues/3868); [50b74b8](https://github.com/ethers-io/ethers.js/commit/50b74b8806ef2064f2764b09f89c7ac75fda3a3c)).

ethers/v6.2.3 (2023-03-27 21:22)
--------------------------------

  - Fixed events when emitted in WebSocketProvider ([#3767](https://github.com/ethers-io/ethers.js/issues/3767), [#3922](https://github.com/ethers-io/ethers.js/issues/3922); [ffaafc0](https://github.com/ethers-io/ethers.js/commit/ffaafc0ce1cf40d1d76d8d814c9c445057bf6989)).

ethers/v6.2.2 (2023-03-24 00:49)
--------------------------------

  - Fixed FetchRequest when using credentials ([#3897](https://github.com/ethers-io/ethers.js/issues/3897); [88e8124](https://github.com/ethers-io/ethers.js/commit/88e8124c37d377628f9b8abdf140fc07ad06259f)).

ethers/v6.2.1 (2023-03-23 17:33)
--------------------------------

  - Stall block polling bootstrap when the network is down ([#3924](https://github.com/ethers-io/ethers.js/issues/3924); [603d474](https://github.com/ethers-io/ethers.js/commit/603d47496e2b667c15b72f315261d6e299381848)).

ethers/v6.2.0 (2023-03-20 15:53)
--------------------------------

  - Added extra details in the error info field for RPC errors ([30ffa78](https://github.com/ethers-io/ethers.js/commit/30ffa78d1441fa033677fa09237fc135a314f373)).
  - Remove Ankr as a deafult for now as the provided API key is failing ([6e01e54](https://github.com/ethers-io/ethers.js/commit/6e01e5448f4a3e2d30288d4c8447db295c3a2e7a)).
  - Fixed deferred filters after unsafe-eval changes ([#3749](https://github.com/ethers-io/ethers.js/issues/3749), [#3763](https://github.com/ethers-io/ethers.js/issues/3763); [2e3802a](https://github.com/ethers-io/ethers.js/commit/2e3802a83b8ad2f5a6269d79fbd1c83c9f2d1047)).
  - Remove use of Function sub-class to address unsafe-eval issues ([#3749](https://github.com/ethers-io/ethers.js/issues/3749), [#3763](https://github.com/ethers-io/ethers.js/issues/3763); [7d3af51](https://github.com/ethers-io/ethers.js/commit/7d3af512c75b4c24027ec2daef1e9f4c1064194a)).
  - Added verifyTypedData utility (reported on Farcaster) ([f06a445](https://github.com/ethers-io/ethers.js/commit/f06a445247f3b294f9fc805cc8fe0752accb8edc)).
  - Removed stray logging in IpcProvider ([#3908](https://github.com/ethers-io/ethers.js/issues/3908), [#3909](https://github.com/ethers-io/ethers.js/issues/3909); [e11d4c1](https://github.com/ethers-io/ethers.js/commit/e11d4c1c20cc5b6fd5803cf9636c4f5bc082dab7)).
  - Fixed legacy serialization for implicit chainId transactions ([#3898](https://github.com/ethers-io/ethers.js/issues/3898), [#3899](https://github.com/ethers-io/ethers.js/issues/3899); [fcf6c8f](https://github.com/ethers-io/ethers.js/commit/fcf6c8fcee95ec412aaafba8ec84d5049b077a4e)).
  - Fix Webpack issue (reported on discord) ([3ad4273](https://github.com/ethers-io/ethers.js/commit/3ad4273b8b714bff344ccbfb1eb71ed8a8b7cfa4)).
  - Fix some bundlers which cannot handle recursive pkg.exports ([#3848](https://github.com/ethers-io/ethers.js/issues/3848); [6315e78](https://github.com/ethers-io/ethers.js/commit/6315e78ea32147653b72ca06f6800f3e2df6ffbf)).
  - Fixed typo in signature.s error ([#3891](https://github.com/ethers-io/ethers.js/issues/3891); [47ef3eb](https://github.com/ethers-io/ethers.js/commit/47ef3ebde37bfa0c015c258c3d8a6800d751e147)).
  - Fixed stray unreachable code ([#3890](https://github.com/ethers-io/ethers.js/issues/3890); [c220fe2](https://github.com/ethers-io/ethers.js/commit/c220fe2ea747ccc80cd3c4020e0278e3daf3c4fc)).
  - Move all wrapping to proper _wrap functions ([#3818](https://github.com/ethers-io/ethers.js/issues/3818); [02a0aad](https://github.com/ethers-io/ethers.js/commit/02a0aad61212c35e8d2723a8ae589989b97dae3e)).

ethers/v6.1.0 (2023-03-07 02:10)
--------------------------------

  - Fixed ethers imported in web workers ([#3856](https://github.com/ethers-io/ethers.js/issues/3856); [5f2678f](https://github.com/ethers-io/ethers.js/commit/5f2678fb059d643638b9cc1dc59cbfc61ce7a7b8)).
  - Added Sepolia support ([#3863](https://github.com/ethers-io/ethers.js/issues/3863); [abeaa74](https://github.com/ethers-io/ethers.js/commit/abeaa74da04fbe25e837a2ffa7d1e9c1257a5da5)).
  - Added missing exports ([#3734](https://github.com/ethers-io/ethers.js/issues/3734); [06aa303](https://github.com/ethers-io/ethers.js/commit/06aa30363f88144db672376d39012d7fe3f86c33)).
  - Allow null values for TypedData domain ([#3623](https://github.com/ethers-io/ethers.js/issues/3623); [a32af3a](https://github.com/ethers-io/ethers.js/commit/a32af3adc104c4b07a45097a4a3725a4ce9e0be6)).
  - Added listAccounts to JsonRpcProvider ([#3778](https://github.com/ethers-io/ethers.js/issues/3778); [287d94f](https://github.com/ethers-io/ethers.js/commit/287d94fc454d03f1b3086ea98745131cdf40129a)).
  - Allow BigInt for blockTag ([#3780](https://github.com/ethers-io/ethers.js/issues/3780); [fe1f04c](https://github.com/ethers-io/ethers.js/commit/fe1f04c6e5fb4254a100f492d7dcbdc3cf19a446)).
  - Fixed typo in error messages ([#3822](https://github.com/ethers-io/ethers.js/issues/3822), [#3824](https://github.com/ethers-io/ethers.js/issues/3824); [f1a810d](https://github.com/ethers-io/ethers.js/commit/f1a810dcb56df54b1e1567f2a59c73500619472f)).
  - Re-adding definition files to require exports ([#3703](https://github.com/ethers-io/ethers.js/issues/3703); [76fab92](https://github.com/ethers-io/ethers.js/commit/76fab923da33e71e6bb751bb0b5e3ba3faa27ab2)).

ethers/v6.0.8 (2023-02-23 06:30)
--------------------------------

  - Fix matic-mumbai network and include aliases to legacy names ([#3811](https://github.com/ethers-io/ethers.js/issues/3811); [20bbd12](https://github.com/ethers-io/ethers.js/commit/20bbd1281911d31b360f6f5032251c9257943541)).
  - Fixed getSigner bug ([#3821](https://github.com/ethers-io/ethers.js/issues/3821); [388edf6](https://github.com/ethers-io/ethers.js/commit/388edf6abc168f89f1ca609e9e5b025dc9205add)).

ethers/v6.0.7 (2023-02-23 01:41)
--------------------------------

  - Fixed getContentHash ([#3819](https://github.com/ethers-io/ethers.js/issues/3819); [b993f7c](https://github.com/ethers-io/ethers.js/commit/b993f7c3b6c0e135c460c8b8dc5943215628231a)).

ethers/v6.0.6 (2023-02-22 21:53)
--------------------------------

  - Added chain parameters for Arbitrum and Optimism ([#3811](https://github.com/ethers-io/ethers.js/issues/3811); [77a7323](https://github.com/ethers-io/ethers.js/commit/77a7323119923e596f4def4f1bc90beae5447320)).
  - Fix NonceManager race condition ([#3812](https://github.com/ethers-io/ethers.js/issues/3812), [#3813](https://github.com/ethers-io/ethers.js/issues/3813); [5a3c10a](https://github.com/ethers-io/ethers.js/commit/5a3c10a29c047609a50828adb620d88aa8cf0014)).
  - Add UMD output to dist builds ([#3814](https://github.com/ethers-io/ethers.js/issues/3814); [f9eed4c](https://github.com/ethers-io/ethers.js/commit/f9eed4cdb190b06dd4ddaa2382c1de42e8e98de6)).

ethers/v6.0.5 (2023-02-18 22:36)
--------------------------------

  - Fixed Result to behave correctly like an array using slice and toArray ([#3787](https://github.com/ethers-io/ethers.js/issues/3787); [399356b](https://github.com/ethers-io/ethers.js/commit/399356b91227db04e496628af60c4b8e38207760)).
  - Replaced substring from 0 index with startsWith ([#3691](https://github.com/ethers-io/ethers.js/issues/3691); [4512e97](https://github.com/ethers-io/ethers.js/commit/4512e97f9b55607ce388aa6eb63a37fc196a5d9d)).
  - Fixed inverted assert in duplicate name detection for ABI encoding ([#3792](https://github.com/ethers-io/ethers.js/issues/3792); [762c2f3](https://github.com/ethers-io/ethers.js/commit/762c2f34eac848c5464389f11d1697dcd8ebcbb5)).
  - Fixed missing property during transaction copy ([#3793](https://github.com/ethers-io/ethers.js/issues/3793); [48bbef7](https://github.com/ethers-io/ethers.js/commit/48bbef7ade69bcfe86542f752f15049cc62f4141)).
  - Add support for Wallet private keys without 0x prefix ([#3768](https://github.com/ethers-io/ethers.js/issues/3768); [4665fb4](https://github.com/ethers-io/ethers.js/commit/4665fb4c6886c8b344dee316ba9f4fde57ce7557)).
  - Fixed quicknode property for defaultProvider ([#3741](https://github.com/ethers-io/ethers.js/issues/3741); [a8afb72](https://github.com/ethers-io/ethers.js/commit/a8afb72fbbceb6a5024c1edb85badb72099787ea)).
  - Fixed exports field order ([#3703](https://github.com/ethers-io/ethers.js/issues/3703), [#3755](https://github.com/ethers-io/ethers.js/issues/3755); [085a905](https://github.com/ethers-io/ethers.js/commit/085a9054f349afb816ca1a123737293ec9bd2532)).

ethers/v6.0.4 (2023-02-16 08:55)
--------------------------------

  - Fixed custom error decoding ([#3785](https://github.com/ethers-io/ethers.js/issues/3785); [4d9b29d](https://github.com/ethers-io/ethers.js/commit/4d9b29de751e2387c143e474bb96d271da892ea6)).
  - Removed stray debug logging ([e1e0929](https://github.com/ethers-io/ethers.js/commit/e1e09293483a9d07fd8e8f96552aa958b5ec45ed)).
  - Fixed lookupAddress when bad resolver is present ([#3782](https://github.com/ethers-io/ethers.js/issues/3782); [92def9c](https://github.com/ethers-io/ethers.js/commit/92def9c1489bb35ad13fe58a1cd107ee3a05a112)).
  - Fixed FallbackProvider median calculation ([#3746](https://github.com/ethers-io/ethers.js/issues/3746); [83957dc](https://github.com/ethers-io/ethers.js/commit/83957dc283043b9af8f6e89920faac3e09ca69fc)).
  - Move the xnf normalize variant to pkg.browser instead of import ([#3724](https://github.com/ethers-io/ethers.js/issues/3724); [179e6ca](https://github.com/ethers-io/ethers.js/commit/179e6ca520392177c7dea5e477b29930952ed637)).

ethers/v6.0.3 (2023-02-12 22:45)
--------------------------------

  - Allow null type in transaction receipt for legacy type 0 networks ([#3459](https://github.com/ethers-io/ethers.js/issues/3459); [6372a46](https://github.com/ethers-io/ethers.js/commit/6372a46b1b273db3e4c1189daebb4b888bd588bc)).
  - Fixed events when slicing immutable Result ([#3765](https://github.com/ethers-io/ethers.js/issues/3765); [2ba4a17](https://github.com/ethers-io/ethers.js/commit/2ba4a172555b7e17ac01fedfc944549defab61bc)).
  - More robust support on networks which throw when filters are not supported ([#3767](https://github.com/ethers-io/ethers.js/issues/3767); [37bf4fb](https://github.com/ethers-io/ethers.js/commit/37bf4fb55563d7ff66edee15c7515c8a0d6a2266)).
  - Fixed ignored polling override for JsonRpcApiProvider ([400d576](https://github.com/ethers-io/ethers.js/commit/400d57621b3e9a33679a528b5072449699f0a068)).

ethers/v6.0.2 (2023-02-04 08:50)
--------------------------------

  - Fixed crossed assert in Fetch ([#3733](https://github.com/ethers-io/ethers.js/issues/3733); [6c338c1](https://github.com/ethers-io/ethers.js/commit/6c338c1c5b4013db9754c9d1a33dcbf54330e5c7)).

ethers/v6.0.1 (2023-02-04 04:06)
--------------------------------

  - Fix Subscriber model when removed within emit callback ([d0ed918](https://github.com/ethers-io/ethers.js/commit/d0ed91840c9f51c7ce9061ebb1d36727dbdd51a4)).
  - Fixed human-readable parser when identifier begins with valid type prefix ([#3728](https://github.com/ethers-io/ethers.js/issues/3728); [522fd16](https://github.com/ethers-io/ethers.js/commit/522fd16f68aabc53e4dc8745d4128e0d61260ed5)).
  - Update to latest secp256k1 library ([#3719](https://github.com/ethers-io/ethers.js/issues/3719); [803e8f9](https://github.com/ethers-io/ethers.js/commit/803e8f9821950b83efa876d64b1cfb35f6bccc38)).

ethers/v6.0.0 (2023-02-02 22:48)
--------------------------------

  - Initial release ([90afd9b](https://github.com/ethers-io/ethers.js/commit/90afd9bd81ed1408421a0247fa0845a74c9eb319)).
