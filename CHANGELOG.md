Changelog
=========

This change log is managed by `scripts/cmds/update-versions` but may be manually updated.

ethers/v5.0.0-beta.140 (2019-06-12 1:25)
----------------------------------------

  - Move from node-fetch to cross-fetch; better browser fallback implementation. ([826ffbc](https://github.com/ethers-io/ethers.js/commit/826ffbc7c4ed1c301f30e6f264eedeaf3c243ca8))
  - Added getStatic with support for inheritance of static methods. ([5e4535e](https://github.com/ethers-io/ethers.js/commit/5e4535e939fdb9d9d23bd14b3e2590873d3eb508))
  - Fixed node-fetch for Safari (todo: push this fix upstream to node-fetch). ([7164e51](https://github.com/ethers-io/ethers.js/commit/7164e51131215ae3201b49f8c7f5ade8cbd8a420))
  - Migrated XMLHttpRequest to fetch API. ([#506](https://github.com/ethers-io/ethers.js/issues/506); [62201c5](https://github.com/ethers-io/ethers.js/commit/62201c5eebc52e9723dbbb2cc64823155ce1e0f9))

ethers/v5.0.0-beta.139 (2019-06-11 17:55)
-----------------------------------------

  - Removed freeze option from deepCopy; all properties are read-only and only objects may have new properties added. ([1bc792d](https://github.com/ethers-io/ethers.js/commit/1bc792d9dcc6a06a1be4fc5e5b9a538a3f6b7ada))
  - Moved away from isNamedInstance which breaks after Browserify name mangling. ([257d67c](https://github.com/ethers-io/ethers.js/commit/257d67c9625fa237bcfb3d651c49aa3b79175cae))
  - Expose poll function in utils. ([#512](https://github.com/ethers-io/ethers.js/issues/512); [e6f6383](https://github.com/ethers-io/ethers.js/commit/e6f6383346818fa67423f1f20450e011242eb554))
  - Make TransactionResponse hash required. ([#537](https://github.com/ethers-io/ethers.js/issues/537); [095c1fe](https://github.com/ethers-io/ethers.js/commit/095c1fe579068a3204ea0d1bc1893f293f61e719))

ethers/v5.0.0-beta.138 (2019-06-04 16:05)
-----------------------------------------

  - Fixed INFURA project ID checking. ([#534](https://github.com/ethers-io/ethers.js/issues/534); [5bf763f](https://github.com/ethers-io/ethers.js/commit/5bf763fe2307e8570ab5e91e30c43e2e5731fc39))

ethers/v5.0.0-beta.137 (2019-06-01 14:06)
-----------------------------------------

  - Fixed invalid arrayify value in browser for SHA2-HMAC. ([#530](https://github.com/ethers-io/ethers.js/issues/530); [c4a494b](https://github.com/ethers-io/ethers.js/commit/c4a494b528f2e5f706c159d916d8ff0ffd96a211))
  - Fix event and function fragment formatting. ([a2d4b29](https://github.com/ethers-io/ethers.js/commit/a2d4b2907184d9480a72fe6f67652489074af86e))
  - Fixed default JsonRpcSigner. ([#532](https://github.com/ethers-io/ethers.js/issues/532); [5ba6a61](https://github.com/ethers-io/ethers.js/commit/5ba6a616a6f969b1f28f8c6367c21488f497a7ae))
  - Added changelog management to update-versions. ([4a3f719](https://github.com/ethers-io/ethers.js/commit/4a3f7190dc04275030d313289e1ba6a2b31407ec))

ethers/v5.0.0-beta.136
----------------------

  - Added queryFilter to Contracts. ([#463](https://github.com/ethers-io/ethers.js/issues/463); [eea53bb](https://github.com/ethers-io/ethers.js/commit/eea53bb1be29ad2bd1b229a13c85b12be264b019))
  - Allow storage class in Human-Readable ABI. ([#476](https://github.com/ethers-io/ethers.js/issues/476); [cf39adb](https://github.com/ethers-io/ethers.js/commit/cf39adb09020ca0393e028b330bfd07fb4869236))
  - Track per-provider JSON-RPC ID in JsonRpcProvider. ([#337](https://github.com/ethers-io/ethers.js/issues/337), [#489](https://github.com/ethers-io/ethers.js/issues/489); [044554b](https://github.com/ethers-io/ethers.js/commit/044554b58525d1677646a74119f86ea867a06d1e))
  - Fixed typo in error message. ([#470](https://github.com/ethers-io/ethers.js/issues/470); [47d92ae](https://github.com/ethers-io/ethers.js/commit/47d92aeff02cacfb26793850c7faef7cb21ce4cf))

ethers/v5.0.0-beta.135
----------------------

  - Better error message for unconfigured ENS names. ([#504](https://github.com/ethers-io/ethers.js/issues/504); [3cbc4b4](https://github.com/ethers-io/ethers.js/commit/3cbc4b462262ba61fa7d99a7a12e7bbf8049afb1))
  - Fixed contract events. ([#404](https://github.com/ethers-io/ethers.js/issues/404); [8cdda37](https://github.com/ethers-io/ethers.js/commit/8cdda37095df28f828ccd2ac5437ccb6541b16cc))
  - Updated license for BaseX to include original authors; was only included in the source. ([03c9725](https://github.com/ethers-io/ethers.js/commit/03c97259c46de10dbe6ce62921de2f32ffff0522))

