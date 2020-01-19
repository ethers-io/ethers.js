Changelog
=========

This change log is managed by `scripts/cmds/update-versions` but may be manually updated.

ethers/v5.0.0-beta.168 (2020-01-18 21:46)
-----------------------------------------

  - Much more resiliant FallbackProvider which can ignore properties that are only approximate and supports per-provider priorities. ([#635](https://github.com/ethers-io/ethers.js/issues/635), [#588](https://github.com/ethers-io/ethers.js/issues/588); [f4bcf24](https://github.com/ethers-io/ethers.js/commit/f4bcf24a257a17ec9beb98f3d0b3682de543534c))
  - Fixed some typing for receipts and logs. ([#497](https://github.com/ethers-io/ethers.js/issues/497); [ea102ef](https://github.com/ethers-io/ethers.js/commit/ea102ef7c4fa5df7b9389fbc8a2947bbbd4c471e))
  - Abstracting mnemonic phrases. ([#685](https://github.com/ethers-io/ethers.js/issues/685); [92a383f](https://github.com/ethers-io/ethers.js/commit/92a383ff0dad4587e44953efca3c6ab795a1b1bd))
  - Sync GitHub issues. ([75e1a37](https://github.com/ethers-io/ethers.js/commit/75e1a37bb5935d5d538ffcfce5b0073e1334d457))
  - Fixed 304 status for fetchJson. ([c66d81e](https://github.com/ethers-io/ethers.js/commit/c66d81e96f7c9b0808f181085ffe1c92f6219d46))

ethers/v5.0.0-beta.167 (2020-01-11 04:16)
-----------------------------------------

  - Fixed testcases for provider changes. ([90ed07c](https://github.com/ethers-io/ethers.js/commit/90ed07c74e7230ea0f02288b140d497d8b9779e0))
  - Add support for legacy flat signatures with recid instead of normalized v. ([245cd0e](https://github.com/ethers-io/ethers.js/commit/245cd0e48e07eef35f5bf45ee7fe5ed5ef31338a))
  - Fix TransactionResponse to have chainId instead of legacy networkId. ([#700](https://github.com/ethers-io/ethers.js/issues/700); [72b3bc9](https://github.com/ethers-io/ethers.js/commit/72b3bc9909074893038c768f3da1564ed96a6a20))
  - Fixed splitSignature computing wrong v for BytesLike. ([#700](https://github.com/ethers-io/ethers.js/issues/700); [4151c0e](https://github.com/ethers-io/ethers.js/commit/4151c0eacd22287e2369a8656ffa00359db6f84b))
  - Added dist files for hardware-wallets. ([c846649](https://github.com/ethers-io/ethers.js/commit/c84664953d2f50ee0d704a8aa18fe6c08668dabb))
  - Browser support (with dist files) for Ledger. ([6f7fbf3](https://github.com/ethers-io/ethers.js/commit/6f7fbf3858c82417933a5e5595a919c0ec0487c7))

ethers/v5.0.0-beta.166 (2020-01-10 03:09)
-----------------------------------------

  - Relaxed joinSignature API to allow SignauteLike. ([602e6a8](https://github.com/ethers-io/ethers.js/commit/602e6a8973480299843a0158f75451a2c6aac749))
  - Initial code drop of new hardware wallet package. ([2e8f5ca](https://github.com/ethers-io/ethers.js/commit/2e8f5ca7ed498261079da75713b18f3370dfd236))
  - Added more docs. ([381a72d](https://github.com/ethers-io/ethers.js/commit/381a72ddaa7fb59ef2ded84d228296d693df05c3))

ethers/v5.0.0-beta.165 (2020-01-09 03:31)
-----------------------------------------

  - Fixed require resolution for CLI scripts. ([c04f9a7](https://github.com/ethers-io/ethers.js/commit/c04f9a7fff727bb04a4aa3a0fa05fd5cd8e795a6))
  - Added new URLs for default ETC (and ETC testnets) providers. ([#351](https://github.com/ethers-io/ethers.js/issues/351); [3c184ac](https://github.com/ethers-io/ethers.js/commit/3c184ace21aafbb27f4d44cce1bb738af899d59f))

ethers/v5.0.0-beta.164 (2020-01-07 19:57)
-----------------------------------------

  - Use better Description typing. ([2d5492c](https://github.com/ethers-io/ethers.js/commit/2d5492cd2ee722c818c249244af7b5bea05d67b0))
  - Better property access on ABI decoded results. ([#698](https://github.com/ethers-io/ethers.js/issues/698); [13f50ab](https://github.com/ethers-io/ethers.js/commit/13f50abd847f7ddcc7e54c102da54e2d23b86fae))
  - Better typing support for Description. ([d0f4642](https://github.com/ethers-io/ethers.js/commit/d0f4642f6d2c9f5119f1910a0082894c60e81191))
  - Fixed resolveName when name is an address with an invalid checksum. ([#694](https://github.com/ethers-io/ethers.js/issues/694); [1e72fc7](https://github.com/ethers-io/ethers.js/commit/1e72fc7d6f7c3be4410dbdcfbab9a0463ceb52bd))

ethers/v5.0.0-beta.163 (2020-01-06 18:57)
-----------------------------------------

  - Added function to generate CREATE2 addresses. ([#697](https://github.com/ethers-io/ethers.js/issues/697); [eb26a6d](https://github.com/ethers-io/ethers.js/commit/eb26a6d95022a241c44f859e7b2f29646afb4914))
  - Force constructor name to be null (instead of undefined). ([a648f2b](https://github.com/ethers-io/ethers.js/commit/a648f2bd1e5e52a3662896f04fe7025884866972))
  - Added documentation uploading script. ([e593aba](https://github.com/ethers-io/ethers.js/commit/e593aba2946c98820b0c2edf9c5dab6cb30c7402))
  - Added Czech wordlist to default wordlists export. ([#691](https://github.com/ethers-io/ethers.js/issues/691); [5724fa5](https://github.com/ethers-io/ethers.js/commit/5724fa5d9c6fe73f14ec8bdea1f7226a222537ef))
  - Added Czech BIP-39 wordlist. ([#691](https://github.com/ethers-io/ethers.js/issues/691); [f54f06b](https://github.com/ethers-io/ethers.js/commit/f54f06b5c8092997fd3c9055d69a3e0796ce44f3))
  - Updated README. ([e809ead](https://github.com/ethers-io/ethers.js/commit/e809eadf8d608cd8c8a78c08a2e3547dd09156cf))
  - Updating docs. ([184c459](https://github.com/ethers-io/ethers.js/commit/184c459fab0d089a8a879584b72e5eb3560b33ce))
  - Merge branch 'yuetloo-ethers-v5-beta' into ethers-v5-beta ([06cafe3](https://github.com/ethers-io/ethers.js/commit/06cafe3437ef129b47f5f9c02f4759f2c4854d3c))
  - Add circleci and parity test files ([fdf0980](https://github.com/ethers-io/ethers.js/commit/fdf0980663ffead0faf3e9b7b233b22ca1574e21))
  - Fixed typo in package test dist scripts. ([9c78c7f](https://github.com/ethers-io/ethers.js/commit/9c78c7fee69d07733048d898d58205ae7f5c82d7))

ethers/v5.0.0-beta.162 (2019-11-25 0:02)
----------------------------------------

  - Update elliptic package to protect from Minerva timing attack. ([#666](https://github.com/ethers-io/ethers.js/issues/666); [cf036e1](https://github.com/ethers-io/ethers.js/commit/cf036e1ffad3340fcf1c7559d0032493ccc08e6e))
  - Browser and node testing works again. ([4470477](https://github.com/ethers-io/ethers.js/commit/4470477d7fd3031f2f3a1fbd9c538468c33c7350))

ethers/v5.0.0-beta.161 (2019-11-23 21:43)
-----------------------------------------

  - Updated dist files (sorted package.json to reduce package version change chatter). ([f308ba3](https://github.com/ethers-io/ethers.js/commit/f308ba3540ed0d282d099456d0369873ad9596b0))
  - Stubs for adding throttle support. ([2f0e679](https://github.com/ethers-io/ethers.js/commit/2f0e679f0bc81bf901cf60a79e50f9715cddec5a))
  - Refactor wordlists. ([abab9f6](https://github.com/ethers-io/ethers.js/commit/abab9f6aa27d1870d1053e7caa951408b86c454d))
  - Browser testcases work again. ([c11c2e2](https://github.com/ethers-io/ethers.js/commit/c11c2e2e3376a6764f07ed443245823f2792b8cc))
  - Added dist files for non-English wordlists. ([3d75c52](https://github.com/ethers-io/ethers.js/commit/3d75c52dac668af5eeede3e7764dadd3055a0707))
  - Sync GitHub issue cache. ([29f0e9d](https://github.com/ethers-io/ethers.js/commit/29f0e9dd627a7b4b7f772300497f27718c9ecc7b))

ethers/v5.0.0-beta.160 (2019-11-20 18:36)
-----------------------------------------

  - Updated API in testcases. ([3ab3733](https://github.com/ethers-io/ethers.js/commit/3ab373334c75800f2b20b6639ed8eb1b11e453ef))
  - Fixed scrypt import in ESM build. ([b72ef27](https://github.com/ethers-io/ethers.js/commit/b72ef27b2a8f9941fb9d79122ec449fed9d2464d))
  - Fixed null apiKey problem for InfuraProvider. ([e518151](https://github.com/ethers-io/ethers.js/commit/e51815150912d10e2734707986b10b37c87d6d12))
  - Added support for sighash-style tuple parsing. ([19aaade](https://github.com/ethers-io/ethers.js/commit/19aaade9c62510012cfd50ae487ebd1705a28678))
  - Fixed solc imports for cli. ([c35ddaf](https://github.com/ethers-io/ethers.js/commit/c35ddaf646efa25e738fee604585a0a7af45b206))
  - Added nonce manager to experimental index. ([8316406](https://github.com/ethers-io/ethers.js/commit/8316406977ea26ca2044d16f7b3bb6ba21ef5b43))
  - Removing NodesmithProvider from default provider as it is being discontinued. ([01ca350](https://github.com/ethers-io/ethers.js/commit/01ca35036ca11a47f60890e5cae62e46a00f3da8))
  - Moved bare ABI named functions and events from Interface into Contracts to simplify other consumers of Interface. ([da8ca2e](https://github.com/ethers-io/ethers.js/commit/da8ca2e8bc982fc3ea0343bb3c593a485ca1fef0))
  - Added support for complex API keys including support for INFURA project secrets. ([#464](https://github.com/ethers-io/ethers.js/issues/464), [#651](https://github.com/ethers-io/ethers.js/issues/651), [#652](https://github.com/ethers-io/ethers.js/issues/652); [1ec5804](https://github.com/ethers-io/ethers.js/commit/1ec5804bd460f6948d4813469fdc7bf739baa6a6))
  - Migrated to scrypt-js v3. ([75895fa](https://github.com/ethers-io/ethers.js/commit/75895fa1491e7542c755a102f4e4c190685fd2b6))
  - Moved getDefaultProvider to providers package. ([51e4ef2](https://github.com/ethers-io/ethers.js/commit/51e4ef2b45b83a8d82923600a2fac544d70b0807))
  - Migrating providers to modern syntax and scoping. ([#634](https://github.com/ethers-io/ethers.js/issues/634); [e1509a6](https://github.com/ethers-io/ethers.js/commit/e1509a6326dd2cb8bf7ed64b82dd3947b768a314))
  - Migrating to modern syntax and scoping. ([#634](https://github.com/ethers-io/ethers.js/issues/634); [394c36c](https://github.com/ethers-io/ethers.js/commit/394c36cad43f229a94c72d21f94d1c7982a887a1))
  - Added provider property to Web3Provider. ([#641](https://github.com/ethers-io/ethers.js/issues/641); [1d4f90a](https://github.com/ethers-io/ethers.js/commit/1d4f90a958da6364117353850d62535c9702abd2))
  - Updated GitHub issue cache. ([494381a](https://github.com/ethers-io/ethers.js/commit/494381a6284cc8ed90bd8002d42a6b6d94dc1200))
  - Force deploy receipt to address to be null. ([#573](https://github.com/ethers-io/ethers.js/issues/573); [d9d438a](https://github.com/ethers-io/ethers.js/commit/d9d438a119bb11f8516fc9cf02c534ab3816fcb3))
  - Updated experimental NonceManager. ([3d514c8](https://github.com/ethers-io/ethers.js/commit/3d514c8dbb94e1c4ce5754463e683dd9dbe7c0aa))
  - Fixed typo in error message. ([28339a9](https://github.com/ethers-io/ethers.js/commit/28339a9c8585392086da159a46df4afb8958915c))
  - Added GitHub issue caching. ([fea867a](https://github.com/ethers-io/ethers.js/commit/fea867a206f007a17718396e486883a5e718aa29))

ethers/v5.0.0-beta.159 (2019-10-17 01:08)
-----------------------------------------

  - Removing TypeScript build files from npm to fix excessive package diffs.
  - Fixed getBlock for blockhashes with a leading 0. ([#629](https://github.com/ethers-io/ethers.js/issues/629); [12cfc59](https://github.com/ethers-io/ethers.js/commit/12cfc599656d7e3a6d3d9aa4e468592865a711cc))

ethers/v5.0.0-beta.158 (2019-09-28 01:56)
-----------------------------------------

  - Added less-common, but useful, coding functions to Interface. ([778eb3b](https://github.com/ethers-io/ethers.js/commit/778eb3b425b5ab5b23d28e75be92feccd0fc56bc))
  - Add response handling and 304 support to fetchJson. ([3d25882](https://github.com/ethers-io/ethers.js/commit/3d25882d6bf689740506b9c569f6e0d30da6f6a5))
  - Allow numeric values in a transaction to be odd-lengthed hexstrings. ([#614](https://github.com/ethers-io/ethers.js/issues/614); [a12030a](https://github.com/ethers-io/ethers.js/commit/a12030ad29aa13c02aa75d9e0860f4986a0043b4))
  - Simpler crypt for admin tools. ([828c8cf](https://github.com/ethers-io/ethers.js/commit/828c8cfd419ac4f8d11d978c2e2ff83eba5ae909))

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

