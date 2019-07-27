Changelog
=========

This change log is managed by `scripts/cmds/update-versions` but may be manually updated.

ethers/v5.0.0-beta.148 (2019-07-27 18:56)
-----------------------------------------

  - Initial drop of new ENS CLI tool. ([c3c65b2](https://github.com/ethers-io/ethers.js/commit/c3c65b2fa19e117d6433c2e0b3d20decfe506c74))
  - Added TypeScript tool support for functions with multiple outputs. ([6de4a5d](https://github.com/ethers-io/ethers.js/commit/6de4a5d8a9d114c4c33c58f8a304b60e7370eeff))
  - Added CLI support for stand-alone (no sub-command) tools. ([b67b121](https://github.com/ethers-io/ethers.js/commit/b67b12123996f1aaf7cbe3c8648fd85a22d6674e))
  - Make utils.resolveProperties preserve object parameter order. ([74dbc28](https://github.com/ethers-io/ethers.js/commit/74dbc281ede042c5eeaa7b45150b215dea860a88))
  - Added initial IDNA support for full UTF-8 support in namehash. ([#42](https://github.com/ethers-io/ethers.js/issues/42); [28eb38e](https://github.com/ethers-io/ethers.js/commit/28eb38ee703288aaad9f730b2d93fe3aeea7ada6))

ethers/v5.0.0-beta.147 (2019-07-23 1:04)
----------------------------------------

  - Use the CLI solc instead of solc directly for ABI testcase generation. ([99c7b1c](https://github.com/ethers-io/ethers.js/commit/99c7b1ca94382490b9757fd51375a7ad4259b831))
  - Added experimental UTF-8 functions for escaping non-ascii strings. ([b132e32](https://github.com/ethers-io/ethers.js/commit/b132e32172c9d63e59209628dadd5796dd6291c8))
  - Bump Solidity version in CLI to 0.5.10. ([6005248](https://github.com/ethers-io/ethers.js/commit/600524842e1a4b857e8428a45c0c7d1baa0624ee))

ethers/v5.0.0-beta.146 (2019-07-20 21:06)
-----------------------------------------

  - Keep extra filter topics when using Frgment filters in Contracts. ([efaafb2](https://github.com/ethers-io/ethers.js/commit/efaafb203feaf703de803df7e346652372e9fb75))
  - Updated package.json description for Contract package. ([#561](https://github.com/ethers-io/ethers.js/issues/561); [d88ee45](https://github.com/ethers-io/ethers.js/commit/d88ee45937b3484b68f72e3f72ad6c29556c984b))

ethers/v5.0.0-beta.145 (2019-07-20 20:12)
-----------------------------------------

  - Export provider.Formatter. ([#562](https://github.com/ethers-io/ethers.js/issues/562); [083fd76](https://github.com/ethers-io/ethers.js/commit/083fd76a3a638ec16d5f9bf652101e5a150c7347))
  - Update CLI to use new Fragment.format style. ([9a41199](https://github.com/ethers-io/ethers.js/commit/9a4119910b07d1ad61bafafb38ac18a9dae1d9ed))
  - Added FormatTypes to utils. ([a05027c](https://github.com/ethers-io/ethers.js/commit/a05027c744102bbe1be5e13dd89b9c1e64b3b526))
  - Added experimental memory-hard password scheme for password-protected mnemonics to the CLI. ([5877418](https://github.com/ethers-io/ethers.js/commit/5877418de94256a69fdf2ad466ba579309b9dee8))
  - Added more flexible output options to fragment.format (JSON and minimal) and better JSON object parsing. ([e9558c8](https://github.com/ethers-io/ethers.js/commit/e9558c8d4fe6df889f4d7ba6ac6448aa543ef99d))

ethers/v5.0.0-beta.144 (2019-07-09 17:28)
-----------------------------------------

  - Make mnemonic phrases case agnostic. ([#557](https://github.com/ethers-io/ethers.js/issues/557); [e4423b7](https://github.com/ethers-io/ethers.js/commit/e4423b7a277e7e1be1c02d345d4ab1eab484c9b8))

ethers/v5.0.0-beta.143 (2019-07-02 16:12)
-----------------------------------------

  - Adding more support for offline signing in the CLI. ([9cc269c](https://github.com/ethers-io/ethers.js/commit/9cc269ceb5d33b2d88542d4bc6771279f729e733))
  - Allow providers to prepare their Network object. ([6484908](https://github.com/ethers-io/ethers.js/commit/6484908cb25dd35e5d98b2672dca72ed3f30cbe1))
  - Export BIP-44 default path in ethers.utils. ([04bdf45](https://github.com/ethers-io/ethers.js/commit/04bdf456eb07aa72872265e0ee01e3231d2b6cf1))

ethers/v5.0.0-beta.142 (2019-06-28 16:13)
-----------------------------------------

  - Do not require a Signer for contract.populateTransaction. ([0e78386](https://github.com/ethers-io/ethers.js/commit/0e78386a08d3d3a0a98c8d03cd665b8992ab3ea2))
  - Bumping version of solc to 0.5.9. ([e2da447](https://github.com/ethers-io/ethers.js/commit/e2da447c7bc05937966bc4909c47291e4819d2a9))

ethers/v5.0.0-beta.141 (2019-06-24 21:25)
-----------------------------------------

  - Fix non-ES6 import in keccak256. ([5eb393d](https://github.com/ethers-io/ethers.js/commit/5eb393d828328b34567566d3c0d622b4aef1e202))
  - Refactored wordlist exports to export Wordlist directly. ([746d255](https://github.com/ethers-io/ethers.js/commit/746d255b741844b615583b2de3ffd07631b4e872))

ethers/v5.0.0-beta.140 (2019-06-12 01:25)
-----------------------------------------

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

