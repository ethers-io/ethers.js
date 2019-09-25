Changelog
=========

This change log is managed by `scripts/cmds/update-versions` but may be manually updated.

ethers/v5.0.0-beta.157 (2019-09-08 02:43)
-----------------------------------------

  - Fixed getContractAddress for odd-length hex values. ([#572](https://github.com/ethers-io/ethers.js/issues/572); [751793e](https://github.com/ethers-io/ethers.js/commit/751793ea25183d54d7fc4c610a789608f91c062e))
  - Fixed typo in error message. ([#592](https://github.com/ethers-io/ethers.js/issues/592); [6f4291f](https://github.com/ethers-io/ethers.js/commit/6f4291f65f0ea20c65fef7fd7b09b4d5bf5f0dcd))
  - Fixed typo in error message. ([#580](https://github.com/ethers-io/ethers.js/issues/580); [9c63b4a](https://github.com/ethers-io/ethers.js/commit/9c63b4a7535f423a802bb1c17c325ce968987349))
  - Fixed typo in error message. ([#574](https://github.com/ethers-io/ethers.js/issues/574); [22a2673](https://github.com/ethers-io/ethers.js/commit/22a26736cc332fe6e896c9d2707cc99ceee2fb10))

ethers/v5.0.0-beta.156 (2019-09-06 17:56)
-----------------------------------------

  - Removed export star to fix UMD dist file. ([4c17c4d](https://github.com/ethers-io/ethers.js/commit/4c17c4db0455e1b89fd597c4c929cdc36aa3d90d))
  - Updated TypeScript version. ([e8028d0](https://github.com/ethers-io/ethers.js/commit/e8028d0e73368257b76b394bb8e2bf63f8aecd71))
  - Fixed test suites and reporter. ([1e0ed4e](https://github.com/ethers-io/ethers.js/commit/1e0ed4e99a22a27fe5057336f8cb320809768f3e))
  - Added lock-versions admin tool. ([2187604](https://github.com/ethers-io/ethers.js/commit/21876049137644af2b3afa31120ee95d032843a8))
  - Updated packages with version lock and moved types. ([85b4db7](https://github.com/ethers-io/ethers.js/commit/85b4db7d6db37b853f11a90cf4648c34404edcf9))
  - Fixed typo in error message. ([#592](https://github.com/ethers-io/ethers.js/issues/592); [019c1fc](https://github.com/ethers-io/ethers.js/commit/019c1fc7089b3da2d7bd41c933b6c6bc35c8dade))
  - Fixed build process to re-target browser field to ES version. ([3a91e91](https://github.com/ethers-io/ethers.js/commit/3a91e91df56c1ef6cf096c0322f74fd5060891e0))
  - Major overhaul in compilation to enable ES6 module generation. ([73a0077](https://github.com/ethers-io/ethers.js/commit/73a0077fd38c6ae79f33a9d4d3cc128a904b4a6c))
  - Updated some of the flatworm docs. ([81fd942](https://github.com/ethers-io/ethers.js/commit/81fd9428cab4be7eee7ddeb564bf91f282cae475))
  - Fixed package descriptions. ([#561](https://github.com/ethers-io/ethers.js/issues/561); [ebfca98](https://github.com/ethers-io/ethers.js/commit/ebfca98dc276d6f6ca6961632635e8203bb17645))

ethers/v5.0.0-beta.155 (2019-08-22 17:11)
-----------------------------------------

  - Added Wrapped Ether and Token transfers to CLI. ([c031a13](https://github.com/ethers-io/ethers.js/commit/c031a1336815923bae85d9982dba0985a79cfaed))
  - Fixed sendTransaction and use median gas price in FallbackProvider. ([07e1599](https://github.com/ethers-io/ethers.js/commit/07e15993ba181cfbff987778d158dbde6bb84de2))
  - Port optional Secret Storage wallet address to v5. ([#582](https://github.com/ethers-io/ethers.js/issues/582); [a12d60d](https://github.com/ethers-io/ethers.js/commit/a12d60d722dfcf998a2e06eba5e46390d7d442e5))
  - Updated flatworm docs output. ([8745a81](https://github.com/ethers-io/ethers.js/commit/8745a81b11b710036ddb546308c13958be1affb9))
  - Added initial flatworm documentation stubs. ([0333a76](https://github.com/ethers-io/ethers.js/commit/0333a76f4ff382b5b59b24c672b702721e7a386a))

ethers/v5.0.0-beta.154 (2019-08-21 01:51)
-----------------------------------------

  - Use safe transfer for ENS in CLI. ([b7494d8](https://github.com/ethers-io/ethers.js/commit/b7494d8618001797a4e856f3d1886273897e6ba4))
  - Fixed quorum-matching logic for FallbackProvider. ([b304ec1](https://github.com/ethers-io/ethers.js/commit/b304ec1f008ec5301c0dbd1a493d790fe3528512))
  - Added CloudflareProvider. ([#587](https://github.com/ethers-io/ethers.js/issues/587); [621313d](https://github.com/ethers-io/ethers.js/commit/621313d2a697bc6e1dd25eb5b08d67e832a28d05))
  - Added receipt to CALL_EXCEPTION errors. ([724c32e](https://github.com/ethers-io/ethers.js/commit/724c32e8c08b55404594f263e52babb0550a15b8))

ethers/v5.0.0-beta.153 (2019-08-06 19:15)
-----------------------------------------

  - Updated gas estimate failure messaging to include that the tx may simple be causing a revert. ([edb26b1](https://github.com/ethers-io/ethers.js/commit/edb26b16354afd707e5d03e174c4cc809b951c4f))
  - Additional sanity checks in ethers-ens. ([de4b2a4](https://github.com/ethers-io/ethers.js/commit/de4b2a449ca3a49807c8bedb3e21e8e8d71e63fc))
  - Fix bug in --wait for CLI. ([9977c9f](https://github.com/ethers-io/ethers.js/commit/9977c9f66a7007dcc1963128c88c584b6b6c064b))
  - Added content-hash support to ENS CLI. ([7dfef46](https://github.com/ethers-io/ethers.js/commit/7dfef463f83a9190d1b89cf81e0fb692da3dd813))

ethers/v5.0.0-beta.152 (2019-08-05 14:37)
-----------------------------------------

  - Using CLI --wait instead of custom Plugin flag for ethers-ens. ([19ee2b5](https://github.com/ethers-io/ethers.js/commit/19ee2b516005b2c35b846f19457ec9bbfa0c283b))
  - Added --wait as a general flag to CLI. ([7640292](https://github.com/ethers-io/ethers.js/commit/7640292ac8b7b9e6de3ad6699d23e2debf26cc1b))
  - Added migrate-registrar and transfer to ENS CLI. ([31e8e1b](https://github.com/ethers-io/ethers.js/commit/31e8e1b0520bc8be390fbf7e2b473c36a8649eb3))
  - Include data in the CLI transaction dump. ([53bd96a](https://github.com/ethers-io/ethers.js/commit/53bd96a9f675233906033290f1e0c71ca4e9d389))
  - Better errors on gas estimation failure. ([0e6b810](https://github.com/ethers-io/ethers.js/commit/0e6b810def390309240508a99b2cf0736848dedd))

ethers/v5.0.0-beta.151 (2019-08-05 14:29)
-----------------------------------------

  - Added package name prefix to all _version for Logger. ([692589d](https://github.com/ethers-io/ethers.js/commit/692589db54cbca10a2a453e9a1801a8612056559))

ethers/v5.0.0-beta.150 (2019-08-03 01:07)
-----------------------------------------

  - Fixed old references to errors package. ([1cabce7](https://github.com/ethers-io/ethers.js/commit/1cabce7e1c23b15cc2b630c0b403dd72d815a5ba))
  - Added generation scripts for Table A.1 for stringprep. ([#42](https://github.com/ethers-io/ethers.js/issues/42); [b21681a](https://github.com/ethers-io/ethers.js/commit/b21681a7f4292b0e77315caad3a59fe814e9292b))

ethers/v5.0.0-beta.149 (2019-08-03 00:45)
-----------------------------------------

  - Fixed some case-folding and added Table A.1 for IDNA. ([#42](https://github.com/ethers-io/ethers.js/issues/42); [f955dca](https://github.com/ethers-io/ethers.js/commit/f955dca417a6f86690cf33a81b08baa99e1b1a5c))
  - Removed references to legacy errors pacakge and updated umbrella pacakge. ([c09de16](https://github.com/ethers-io/ethers.js/commit/c09de163473c361cac11ddef9ec852f4cbb7d8e3))
  - Updated admin module to use new fetchJson. ([226c100](https://github.com/ethers-io/ethers.js/commit/226c100c72c3fcb0c0e3b62be5f579fd9cc4c904))
  - Updated dist files. ([8354c3f](https://github.com/ethers-io/ethers.js/commit/8354c3f9fe5487f21acaaeccd4450d9a5d495bc1))
  - Full case-folding for IDNA in namehash. ([0af95f4](https://github.com/ethers-io/ethers.js/commit/0af95f4a655106e67c2ba8f445af88c9e9e24339))
  - Deprecating errors for logger. ([0b224e8](https://github.com/ethers-io/ethers.js/commit/0b224e8fb5811cd06727063c909ca1e1e5cde57e))
  - More consistent debug events for Providers. ([e8f28b5](https://github.com/ethers-io/ethers.js/commit/e8f28b55d7dd62e29f03628232ffe7c75dc811b5))

ethers/v5.0.0-beta.148 (2019-07-27 18:56)
-----------------------------------------

  - Initial drop of new ENS CLI tool. ([c3c65b2](https://github.com/ethers-io/ethers.js/commit/c3c65b2fa19e117d6433c2e0b3d20decfe506c74))
  - Added TypeScript tool support for functions with multiple outputs. ([6de4a5d](https://github.com/ethers-io/ethers.js/commit/6de4a5d8a9d114c4c33c58f8a304b60e7370eeff))
  - Added CLI support for stand-alone (no sub-command) tools. ([b67b121](https://github.com/ethers-io/ethers.js/commit/b67b12123996f1aaf7cbe3c8648fd85a22d6674e))
  - Make utils.resolveProperties preserve object parameter order. ([74dbc28](https://github.com/ethers-io/ethers.js/commit/74dbc281ede042c5eeaa7b45150b215dea860a88))
  - Added initial IDNA support for full UTF-8 support in namehash. ([#42](https://github.com/ethers-io/ethers.js/issues/42); [28eb38e](https://github.com/ethers-io/ethers.js/commit/28eb38ee703288aaad9f730b2d93fe3aeea7ada6))

ethers/v5.0.0-beta.147 (2019-07-23 01:04)
-----------------------------------------

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

